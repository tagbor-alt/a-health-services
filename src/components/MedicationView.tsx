import React, { useState, useEffect } from "react";
import { Pill, Plus, Trash2, Bell } from "lucide-react";
import { TopBar } from "./TopBar";
import { Medication } from "../types";

interface MedicationViewProps {
  onBack?: () => void;
}

export const MedicationView: React.FC<MedicationViewProps> = ({ onBack }) => {
  const [meds, setMeds] = useState<Medication[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("medications") || "[]");
    } catch {
      return [];
    }
  });

  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  useEffect(() => {
    localStorage.setItem("medications", JSON.stringify(meds));
  }, [meds]);

  const requestNotifPermission = async () => {
    if (typeof Notification !== "undefined") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  const handleAddTimeRow = () => {
    setTimes((prev) => [...prev, "12:00"]);
  };

  const handleRemoveTimeRow = (index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    setTimes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSaveMed = () => {
    if (!medName.trim() || times.length === 0) {
      alert("Please enter a medication name and at least one time.");
      return;
    }

    const newMed: Medication = {
      id: "m_" + Date.now(),
      name: medName.trim(),
      dosage: medDosage.trim() || undefined,
      times: times.filter(Boolean),
    };

    setMeds((prev) => [...prev, newMed]);
    setMedName("");
    setMedDosage("");
    setTimes(["08:00"]);
  };

  const handleDeleteMed = (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <TopBar title="Medication Reminders" subtitle="Never miss a dose" onBack={onBack} />

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Permission Banner */}
        {notifPermission !== "granted" && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[var(--primary)]" />
              <div>
                <p className="font-bold text-xs text-[var(--primary)]">Enable Notifications</p>
                <p className="text-[11px] text-slate-500">Get time alerts directly on your browser</p>
              </div>
            </div>
            <button
              onClick={requestNotifPermission}
              className="bg-[var(--primary)] text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Enable
            </button>
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-1">MEDICATION NAME</p>
            <input
              type="text"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Amlodipine, Metformin"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-1">DOSAGE (OPTIONAL)</p>
            <input
              type="text"
              value={medDosage}
              onChange={(e) => setMedDosage(e.target.value)}
              placeholder="e.g. 5mg, 1 tablet"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">TIME(S) PER DAY</p>
            <div className="space-y-2">
              {times.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeRow(idx)}
                      className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddTimeRow}
              className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 mt-2 cursor-pointer hover:underline"
            >
              <Plus size={14} /> Add another time
            </button>
          </div>

          <button
            onClick={handleSaveMed}
            className="w-full bg-[var(--primary)] text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
          >
            Save Medication
          </button>
        </div>

        {/* List */}
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-3">YOUR MEDICATIONS</p>

          {meds.length === 0 ? (
            <p className="text-xs text-slate-400 bg-white p-4 rounded-xl text-center border border-slate-200">
              No medications added yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {meds.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-[var(--primary)] flex items-center gap-1.5">
                      <Pill size={14} />
                      {m.name}
                    </p>
                    {m.dosage && <p className="text-[11px] text-slate-500">{m.dosage}</p>}
                    <p className="text-[11px] text-[var(--primary)] font-semibold">
                      Scheduled: {m.times.join(", ")}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteMed(m.id)}
                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
