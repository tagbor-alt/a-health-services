import React, { useState } from "react";
import { X, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSuccess(email);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[var(--primary)] rounded-2xl mx-auto flex items-center justify-center text-white font-serif text-2xl font-normal italic shadow-md mb-2">
            A+
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase opacity-60">A+ HEALTH SERVICES</p>
        </div>

        {/* Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[var(--primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary)] text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 cursor-pointer shadow-md mt-2"
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Secure account connection</span>
        </p>
      </div>
    </div>
  );
};
