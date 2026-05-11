"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import UserModal from "./UserModal";

export default function AddUserButton({ branches }: { branches: any[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-primary"
      >
        <Plus className="w-4 h-4" /> Add New User
      </button>

      {showModal && <UserModal branches={branches} onClose={() => setShowModal(false)} />}
    </>
  );
}
