"use server";

import db from "@/lib/db";

export async function searchCustomer(query: string) {
  try {
    const [customers] = await db.query(
      "SELECT * FROM Customer WHERE aadhaarNumber = ? OR mobile = ?", 
      [query, query]
    );
    if ((customers as any[]).length === 0) return { success: false, message: "No customer found with this number." };
    
    const customer = (customers as any[])[0];
    if (customer.isFraud) {
      return { 
        success: false, 
        message: "This customer is flagged for fraudulent activity and cannot proceed with any transactions.",
        reason: customer.fraudReason,
        isFraud: true
      };
    }
    
    return { success: true, data: customer };
  } catch (error) {
    console.error("Error searching customer:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function getDraftTransaction(aadhaar: string, isNewMode: boolean = false, txnId?: string) {
  try {
    const [customers] = await db.query("SELECT * FROM Customer WHERE aadhaarNumber = ?", [aadhaar]);
    if ((customers as any[]).length === 0) return { success: false, message: "Customer not found" };
    
    const customer = (customers as any[])[0];
    
    let transactions: any[] = [];
    if (txnId) {
      const [txns] = await db.query(
        "SELECT * FROM `Transaction` WHERE id = ?",
        [txnId]
      );
      transactions = txns as any[];
    } else if (!isNewMode) {
      const [txns] = await db.query(
        "SELECT * FROM `Transaction` WHERE customerId = ? AND status = 'PENDING' ORDER BY createdAt DESC LIMIT 1",
        [customer.id]
      );
      transactions = txns as any[];
    }
    
    let draftData: any = {
      customerId: customer.id,
      aadhaarNumber: customer.aadhaarNumber,
      fullName: customer.fullName,
      dob: customer.dob ? new Date(customer.dob).toISOString().split('T')[0] : "",
      gender: customer.gender,
      mobile: customer.mobile,
      address: customer.address,
      currentAddress: customer.currentAddress,
      refName: customer.refName || "",
      refMobile: customer.refMobile || "",
      refRelation: customer.refRelation || "",
      transactionId: null,
      goldItems: [],
      photo: null,
      goldPhoto: null,
      invoicePhoto: null,
      signature: null,
    };

    // Get documents (Customer Photo usually saved even without transaction)
    const [docs] = await db.query("SELECT documentType, fileUrl FROM CustomerDocument WHERE customerId = ?", [customer.id]);
    draftData.goldPhotos = [];
    draftData.invoicePhotos = [];
    for (const doc of (docs as any[])) {
      if (doc.documentType === "CUSTOMER_PHOTO") draftData.photo = doc.fileUrl;
      // If it's a new transaction, ignore previous gold/invoice photos
      if (!isNewMode) {
        if (doc.documentType === "GOLD_IMAGE") {
          draftData.goldPhoto = doc.fileUrl;
          draftData.goldPhotos.push(doc.fileUrl);
        }
        if (doc.documentType === "INVOICE") {
          draftData.invoicePhoto = doc.fileUrl;
          draftData.invoicePhotos.push(doc.fileUrl);
        }
        if (doc.documentType === "SIGNATURE") draftData.signature = doc.fileUrl;
      }
    }

    if (!isNewMode && transactions.length > 0) {
      const txn = (transactions as any[])[0];
      draftData.transactionId = txn.id;
      draftData.transactionNumber = txn.transactionNumber;
      draftData.totalPayout = txn.finalAmount;
      draftData.status = txn.status;
      draftData.paymentMethod = txn.paymentMethod || "CASH";
      draftData.lessPercent = txn.lessPercent || 0;
      draftData.addAmount = txn.addAmount || 0;
      
      const [items] = await db.query("SELECT * FROM GoldItem WHERE transactionId = ?", [txn.id]);
      draftData.goldItems = (items as any[]).map((item: any) => ({
        id: item.id,
        type: item.ornamentName,
        gross: item.grossWeight.toString(),
        stone: item.stoneWeight.toString(),
        purity: item.purity.toString(),
        rate: item.ratePerGram.toString(),
        less: "0",
        add: "0"
      }));
    }

    return { success: true, data: draftData };
  } catch (error) {
    console.error("Error fetching draft:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function saveCustomer(data: any) {
  try {
    const { aadhaarNumber, fullName, dob, gender, mobile, address, currentAddress, refName, refMobile, refRelation } = data;
    const branchId = data.branchId || "DEFAULT_BRANCH";
    const createdBy = data.createdBy || "SYSTEM";

    // Find or Create Customer
    const [existingCustomers] = await db.query(
      "SELECT id FROM Customer WHERE aadhaarNumber = ?",
      [aadhaarNumber]
    );

    let customerId;
    if ((existingCustomers as any[]).length > 0) {
      customerId = (existingCustomers as any[])[0].id;
      // Update existing customer info
      await db.query(
        "UPDATE Customer SET fullName = ?, dob = ?, gender = ?, mobile = ?, address = ?, currentAddress = ?, refName = ?, refMobile = ?, refRelation = ?, updatedAt = NOW(3) WHERE id = ?",
        [fullName, dob ? new Date(dob) : null, gender, mobile, address, currentAddress, refName || null, refMobile || null, refRelation || null, customerId]
      );
    } else {
      customerId = crypto.randomUUID();
      const customerCode = `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      await db.query(
        "INSERT INTO Customer (id, customerCode, aadhaarNumber, aadhaarVerified, fullName, dob, gender, mobile, address, currentAddress, refName, refMobile, refRelation, createdBy, branchId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))",
        [customerId, customerCode, aadhaarNumber, true, fullName, dob ? new Date(dob) : null, gender, mobile, address, currentAddress, refName || null, refMobile || null, refRelation || null, createdBy, branchId]
      );
    }

    return { success: true, customerId };
  } catch (error) {
    console.error("Error saving customer:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function saveTransactionDraft(data: any) {
  try {
    const { customerId, transactionId: existingTxnId } = data;
    const branchId = data.branchId || "DEFAULT_BRANCH";
    const createdBy = data.createdBy || "SYSTEM";
    
    let transactionId = existingTxnId;
    let transactionNumber;

    if (transactionId) {
      // Update existing draft if needed (usually just checking if it exists)
      const [rows] = await db.query("SELECT transactionNumber FROM `Transaction` WHERE id = ?", [transactionId]);
      if ((rows as any[]).length > 0) {
        transactionNumber = (rows as any[])[0].transactionNumber;
      }
    } else {
      transactionId = crypto.randomUUID();
      transactionNumber = `GPC/BR001/2026/${Math.floor(10000 + Math.random() * 90000)}`;
      await db.query(
        "INSERT INTO `Transaction` (id, transactionNumber, customerId, branchId, createdBy, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(3))",
        [transactionId, transactionNumber, customerId, branchId, createdBy, "PENDING"]
      );
    }

    return { success: true, transactionId, transactionNumber };
  } catch (error) {
    console.error("Error saving transaction draft:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function saveTransactionPhotos(transactionId: string, customerId: string, photos: { customerPhoto?: string, goldPhoto?: string, invoicePhoto?: string, goldPhotos?: string[], invoicePhotos?: string[] }) {
  try {
    if (photos.customerPhoto) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "CUSTOMER_PHOTO"]);
      await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "CUSTOMER_PHOTO", photos.customerPhoto]);
      await db.query("UPDATE Customer SET photoUrl = ? WHERE id = ?", [photos.customerPhoto, customerId]);
    }
    if (photos.goldPhotos) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "GOLD_IMAGE"]);
      for (const photo of photos.goldPhotos) {
        if (photo) {
          await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "GOLD_IMAGE", photo]);
        }
      }
    } else if (photos.goldPhoto) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "GOLD_IMAGE"]);
      await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "GOLD_IMAGE", photos.goldPhoto]);
    }
    
    if (photos.invoicePhotos) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "INVOICE"]);
      for (const photo of photos.invoicePhotos) {
        if (photo) {
          await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "INVOICE", photo]);
        }
      }
    } else if (photos.invoicePhoto) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "INVOICE"]);
      await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "INVOICE", photos.invoicePhoto]);
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving photos:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function saveTransactionValuation(transactionId: string, goldItems: any[], totalPayout: number, paymentMethod: string = "CASH", lessPercent: number = 0, addAmount: number = 0) {
  try {
    // Calculate summaries
    const totalWeight = goldItems.reduce((sum: number, item: any) => sum + (parseFloat(item.gross) || 0), 0);
    const avgPurity = goldItems.length > 0 
      ? goldItems.reduce((sum: number, item: any) => sum + (parseFloat(item.purity) || 0), 0) / goldItems.length 
      : 0;

    await db.query(
      "UPDATE `Transaction` SET totalWeight = ?, purity = ?, finalAmount = ?, paymentMethod = ?, lessPercent = ?, addAmount = ?, updatedAt = NOW(3) WHERE id = ?",
      [totalWeight, avgPurity, totalPayout, paymentMethod, lessPercent, addAmount, transactionId]
    );

    // Delete old items if any (re-saving draft)
    await db.query("DELETE FROM GoldItem WHERE transactionId = ?", [transactionId]);

    // Insert new items
    for (const item of goldItems) {
      const netWeight = (parseFloat(item.gross) || 0) - (parseFloat(item.stone) || 0);
      const baseValue = netWeight * (parseFloat(item.rate) || 0) * ((parseFloat(item.purity) || 0) / 100);
      const finalValue = baseValue;

      await db.query(
        "INSERT INTO GoldItem (id, transactionId, goldType, ornamentName, grossWeight, stoneWeight, netWeight, purity, ratePerGram, lessPercent, addAmount, finalValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), transactionId, "GOLD", item.type, parseFloat(item.gross), parseFloat(item.stone), netWeight, parseFloat(item.purity), parseFloat(item.rate), 0, 0, finalValue]
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving valuation:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function saveTransactionSignature(transactionId: string, customerId: string, signature: string) {
  try {
    if (signature) {
      await db.query("DELETE FROM CustomerDocument WHERE customerId = ? AND documentType = ?", [customerId, "SIGNATURE"]);
      await db.query("INSERT INTO CustomerDocument (id, customerId, documentType, fileUrl) VALUES (?, ?, ?, ?)", [crypto.randomUUID(), customerId, "SIGNATURE", signature]);
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving signature:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function completeTransaction(transactionId: string) {
  try {
    await db.query("UPDATE `Transaction` SET status = 'COMPLETED', updatedAt = NOW(3) WHERE id = ?", [transactionId]);
    return { success: true };
  } catch (error) {
    console.error("Error completing transaction:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function markAsFraud(customerId: string, reason: string) {
  try {
    await db.query(
      "UPDATE Customer SET isFraud = 1, fraudReason = ?, updatedAt = NOW(3) WHERE id = ?",
      [reason, customerId]
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking as fraud:", error);
    return { success: false, error: (error as any).message };
  }
}
