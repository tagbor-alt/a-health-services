import React, { useState, useEffect } from "react";
import { TopBar } from "./TopBar";
import { DiaryEntry, MoodType } from "../types";
import { subscribeToDiaryEntries, saveDiaryEntryToFirestore } from "../lib/firebase";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { TrendingUp, Activity, Smile } from "lucide-react";

interface DiaryViewProps {
  onBack?: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("diaryEntries") || "[]");
    } catch {
      return [];
    }
  });

  const [pain, setPain] = useState<number>(0);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [exercise, setExercise] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    const unsubscribe = subscribeToDiaryEntries((firestoreEntries) => {
      if (firestoreEntries.length > 0) {
        setEntries(firestoreEntries);
        localStorage.setItem("diaryEntries", JSON.stringify(firestoreEntries));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveEntry = () => {
    const newEntry: DiaryEntry = {
      id: "d_" + Date.now(),
      pain,
      mood,
      exercise: exercise.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toLocaleString()
    };

    setEntries((prev) => [newEntry, ...prev]);
    saveDiaryEntryToFirestore(newEntry);
    setPain(0);
    setMood(null);
    setExercise("");
    setNotes("");
  };

  const moodButtons: { type: MoodType; emoji: string }[] = [
    { type: "Great", emoji: "🙂" },
    { type: "Okay", emoji: "😐" },
    { type: "Low", emoji: "🙁" },
    { type: "Stressed", emoji: "😣" }
  ];

  // Map entries for Recharts trend analysis
  const moodScoreMap: Record<string, number> = {
    Great: 4,
    Okay: 3,
    Low: 2,
    Stressed: 1,
  };

  const chartData = React.useMemo(() => {
    const sorted = [...entries].reverse();
    if (sorted.length === 0) {
      return [
        { label: "Mon", pain: 6, moodScore: 2 },
        { label: "Tue", pain: 5, moodScore: 3 },
        { label: "Wed", pain: 4, moodScore: 3 },
        { label: "Thu", pain: 3, moodScore: 4 },
        { label: "Fri", pain: 2, moodScore: 4 },
      ];
    }

    return sorted.map((e, idx) => {
      let label = `Day ${idx + 1}`;
      if (e.createdAt) {
        const parts = e.createdAt.split(",");
        label = parts[0] || label;
      }
      return {
        label,
        pain: Number(e.pain) || 0,
        moodScore: e.mood ? moodScoreMap[e.mood] || 2 : 2,
      };
    });
  }, [entries]);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20">
      <TopBar title="Health Diary" subtitle="Track pain, mood, and exercise" onBack={onBack} />

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {/* Recharts Health Trends Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--primary)]" />
              <h3 className="font-serif text-base font-normal text-slate-900">Health Trends</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {entries.length > 0 ? `${entries.length} Logs` : "Sample Preview"}
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Pain score (0-10) and Mood rating (1-4) tracked over time
          </p>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="pain" name="Pain Level (0-10)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPain)" />
                <Area type="monotone" dataKey="moodScore" name="Mood Rating (1-4)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
          {/* Pain Range */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="font-mono text-[10px] tracking-widest uppercase opacity-60">PAIN LEVEL (0–10)</p>
              <span className="font-serif text-2xl text-[var(--primary)] font-bold">{pain}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={pain}
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
          </div>

          {/* Mood Buttons */}
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">MOOD</p>
            <div className="grid grid-cols-4 gap-2">
              {moodButtons.map((m) => {
                const isSelected = mood === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => setMood(m.type)}
                    className={`py-3 rounded-xl border text-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="text-[10px] font-medium">{m.type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise Today */}
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-1">EXERCISE TODAY</p>
            <input
              type="text"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="e.g. 20 min walk, stretching, yoga"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-1">NOTES (OPTIONAL)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything else worth noting today?"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none min-h-[80px]"
            />
          </div>

          <button
            onClick={handleSaveEntry}
            className="w-full bg-[var(--primary)] text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
          >
            Save Entry
          </button>
        </div>

        {/* Entry History */}
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-3">PAST ENTRIES</p>

          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 bg-white p-4 rounded-xl text-center border border-slate-200">
              No entries yet. Save your first entry above.
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div key={e.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">{e.createdAt}</span>
                    <span className="font-bold text-[var(--primary)]">Pain {e.pain}/10</span>
                  </div>

                  {e.mood && <p className="text-xs text-slate-700"><strong>Mood:</strong> {e.mood}</p>}
                  {e.exercise && <p className="text-xs text-slate-700"><strong>Exercise:</strong> {e.exercise}</p>}
                  {e.notes && <p className="text-xs text-slate-500 italic">"{e.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
