"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BranchModal from "./BranchModal";

export default function AddBranchButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        <Plus className="w-4 h-4" /> Add New Branch
      </button>

      {showModal && <BranchModal onClose={() => setShowModal(false)} />}
    </>
  );
}
