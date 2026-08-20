import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { HealthcareService } from "../types";

interface SymptomCheckerModalProps {
  onClose: () => void;
  onBookService: (service: HealthcareService) => void;
}

export const SymptomCheckerModal: React.FC<SymptomCheckerModalProps> = ({ onClose, onBookService }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [answers, setAnswers] = useState<{
    q1: string | null;
    q2: string | null;
    q3: string | null;
  }>({ q1: null, q2: null, q3: null });

  const serviceMap: Record<string, HealthcareService> = {
    pain: "Physiotherapy",
    breathing: "Respiratory Therapy",
    mood: "Psychology",
    diet: "Dietetics",
    daily: "Occupational Therapy"
  };

  const serviceLabels: Record<HealthcareService, string> = {
    Physiotherapy: "physiotherapist",
    "Respiratory Therapy": "respiratory therapist",
    Psychology: "psychologist",
    Dietetics: "dietitian",
    "Occupational Therapy": "occupational therapist"
  };

  const handleSelectQ1 = (val: string) => {
    setAnswers((prev) => ({ ...prev, q1: val }));
    setStep(2);
  };

  const handleSelectQ2 = (val: string) => {
    setAnswers((prev) => ({ ...prev, q2: val }));
    setStep(3);
  };

  const handleSelectQ3 = (val: string) => {
    setAnswers((prev) => ({ ...prev, q3: val }));
    setStep(4);
  };

  const restart = () => {
    setAnswers({ q1: null, q2: null, q3: null });
    setStep(1);
  };

  const service = answers.q1 ? serviceMap[answers.q1] : "Physiotherapy";
  const label = serviceLabels[service];
  const isUrgent = answers.q3 === "severe" || (answers.q1 === "breathing" && answers.q3 !== "mild");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <h1 className="font-serif text-2xl font-normal text-[var(--primary)] mb-1">Symptom Checker</h1>
        <p className="text-xs text-[var(--muted)] mb-6">A few quick questions to guide you to the right care</p>

        {step === 1 && (
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">STEP 1 OF 3</p>
            <h2 className="font-serif text-xl mb-4 text-[var(--primary)]">What's mainly bothering you?</h2>
            <div className="space-y-2.5">
              {[
                { key: "pain", label: "Pain, stiffness, or an injury" },
                { key: "breathing", label: "Breathing or chest discomfort" },
                { key: "mood", label: "Stress, low mood, or anxiety" },
                { key: "diet", label: "Weight, diet, or eating habits" },
                { key: "daily", label: "Difficulty with daily tasks or activities" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelectQ1(opt.key)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-[var(--bg)] hover:border-[var(--primary)] font-semibold text-xs text-[var(--primary)] transition-all cursor-pointer shadow-2xs"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">STEP 2 OF 3</p>
            <h2 className="font-serif text-xl mb-4 text-[var(--primary)]">How long has this been going on?</h2>
            <div className="space-y-2.5">
              {[
                { key: "new", label: "Just started (today or this week)" },
                { key: "weeks", label: "A few weeks" },
                { key: "months", label: "Months or longer" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelectQ2(opt.key)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-[var(--bg)] hover:border-[var(--primary)] font-semibold text-xs text-[var(--primary)] transition-all cursor-pointer shadow-2xs"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60 mb-2">STEP 3 OF 3</p>
            <h2 className="font-serif text-xl mb-4 text-[var(--primary)]">How much is it affecting your daily life?</h2>
            <div className="space-y-2.5">
              {[
                { key: "mild", label: "Mild — barely noticeable" },
                { key: "moderate", label: "Moderate — I notice it often" },
                { key: "severe", label: "Severe — it's hard to function" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleSelectQ3(opt.key)}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-[var(--bg)] hover:border-[var(--primary)] font-semibold text-xs text-[var(--primary)] transition-all cursor-pointer shadow-2xs"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-[var(--bg)] p-5 rounded-2xl border border-slate-200 space-y-4">
            <p className="font-mono text-[10px] tracking-widest uppercase opacity-60">SUGGESTED NEXT STEP</p>
            <h3 className="font-serif text-xl text-[var(--primary)]">We'd suggest: {service}</h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Based on your answers, a <strong className="text-[var(--primary)] font-bold">{label}</strong> is best placed to help with this.
            </p>

            {isUrgent && (
              <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200 text-xs font-medium flex gap-2 items-start">
                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <span>
                  If symptoms are sudden or severe, please seek immediate emergency medical care rather than waiting for an appointment.
                </span>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                onBookService(service);
              }}
              className="w-full bg-[var(--primary)] text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 cursor-pointer shadow-md"
            >
              Book with a {label}
            </button>

            <button
              onClick={restart}
              className="w-full text-center text-xs text-[var(--muted)] font-semibold underline cursor-pointer mt-2"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
