"use client";

import { useState, useEffect } from "react";

interface NameInputProps {
  onNameSet: (name: string) => void;
}

export default function NameInput({ onNameSet }: NameInputProps) {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("guestName");
    if (stored) {
      setSavedName(stored);
      onNameSet(stored);
    }
  }, [onNameSet]);

  const handleSubmit = () => {
    if (name.trim()) {
      localStorage.setItem("guestName", name.trim());
      onNameSet(name.trim());
    }
  };

  const handleSkip = () => {
    onNameSet("Anonymous");
  };

  if (savedName) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">
          Halo, <span className="font-medium text-foreground">{savedName}</span>!
          <button
            onClick={() => {
              localStorage.removeItem("guestName");
              setSavedName(null);
            }}
            className="ml-2 text-primary hover:text-primary/80 text-sm"
          >
            Ganti nama
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <label className="block text-sm font-medium text-foreground mb-2">
        Siapa kamu? (opsional)
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Masukkan namamu"
        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3"
      />
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3 border border-border rounded-lg text-muted-foreground hover:bg-muted"
        >
          Lewati
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
