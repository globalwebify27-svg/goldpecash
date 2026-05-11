const BASE_URL = "https://api.sandbox.co.in";
const API_KEY = process.env.SANDBOX_API_KEY;
const API_SECRET = process.env.SANDBOX_API_SECRET;

async function getAccessToken() {
  const response = await fetch(`${BASE_URL}/authenticate`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY!,
      "x-api-secret": API_SECRET!,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to authenticate with Sandbox");
  }

  const data = await response.json();
  return data.access_token;
}

export async function sendAadhaarOtp(aadhaarNumber: string) {
  try {
    const token = await getAccessToken();
    // Correct Endpoint: /kyc/aadhaar/okyc/otp/request
    const response = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp`, {
      method: "POST",
      headers: {
        "Authorization": token, // Raw token, no Bearer prefix
        "x-api-key": API_KEY!,
        "x-api-version": "1.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
        aadhaar_number: aadhaarNumber,
        consent: "y",
        reason: "For KYC",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send Aadhaar OTP");
    }

    return {
      success: true,
      referenceId: data.data.reference_id,
      message: data.message, // Contains "OTP sent to XXXXXX1234"
    };
  } catch (error: any) {
    console.error("Aadhaar OTP Error:", error);
    return { success: false, message: error.message };
  }
}

export async function verifyAadhaarOtp(otp: string, referenceId: string) {
  try {
    const token = await getAccessToken();
    // Correct Endpoint: /kyc/aadhaar/okyc/otp/verify
    const response = await fetch(`${BASE_URL}/kyc/aadhaar/okyc/otp/verify`, {
      method: "POST",
      headers: {
        "Authorization": token, // Raw token, no Bearer prefix
        "x-api-key": API_KEY!,
        "x-api-version": "1.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
        otp: otp,
        reference_id: referenceId.toString(), // Ensure reference_id is a string
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to verify Aadhaar OTP");
    }

    return {
      success: true,
      data: data.data, // Contains name, dob, gender, address, photo, etc.
    };
  } catch (error: any) {
    console.error("Aadhaar Verify Error:", error);
    return { success: false, message: error.message };
  }
}
