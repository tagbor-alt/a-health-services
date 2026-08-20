import React from "react";
import { ArrowRight, ChevronRight, Activity, HeartHandshake, Utensils, Brain, Wind } from "lucide-react";
import { LanguageCode } from "../types";
import { getTranslation } from "../lib/i18n";

interface LandingViewProps {
  onStartUser: () => void;
  onStartProvider: () => void;
  lang: LanguageCode;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartUser, onStartProvider, lang }) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--primary)] flex flex-col transition-colors duration-300">
      {/* Hero Section */}
      <section className="px-6 pt-12 pb-10 max-w-2xl mx-auto w-full">
        <svg className="w-full h-10 mb-6 text-[var(--primary)]" viewBox="0 0 400 50" preserveAspectRatio="none">
          <path
            d="M0 25 H140 L155 5 L170 45 L185 15 L200 25 H400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>

        <p className="font-mono text-xs tracking-widest uppercase opacity-60 mb-3">A+ HEALTH SERVICES</p>
        
        <h1 className="font-serif text-4xl sm:text-5xl font-normal leading-tight mb-4 text-[var(--primary)]">
          Care that finds <em className="italic font-serif">you.</em>
        </h1>

        <p className="text-[var(--muted)] text-base leading-relaxed mb-8 max-w-lg">
          {getTranslation(lang, "heroSub")}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onStartUser}
            className="bg-[var(--primary)] text-white font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>{getTranslation(lang, "findCare")}</span>
            <ArrowRight size={16} />
          </button>
          
          <button
            onClick={onStartProvider}
            className="text-[var(--primary)] font-semibold text-sm hover:underline flex items-center gap-1 cursor-pointer py-3.5"
          >
            {getTranslation(lang, "imProvider")}
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-6 py-12 border-y border-slate-200">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-xs tracking-widest uppercase opacity-60 mb-6">
            {getTranslation(lang, "howItWorks")}
          </p>

          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--primary)] before:opacity-20">
            <div className="relative">
              <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--primary)]">
                01
              </span>
              <h3 className="font-serif text-xl font-normal mb-1">{getTranslation(lang, "step1Title")}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{getTranslation(lang, "step1Body")}</p>
            </div>

            <div className="relative">
              <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--primary)]">
                02
              </span>
              <h3 className="font-serif text-xl font-normal mb-1">{getTranslation(lang, "step2Title")}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{getTranslation(lang, "step2Body")}</p>
            </div>

            <div className="relative">
              <span className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-white border-2 border-[var(--primary)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--primary)]">
                03
              </span>
              <h3 className="font-serif text-xl font-normal mb-1">{getTranslation(lang, "step3Title")}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{getTranslation(lang, "step3Body")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Areas */}
      <section className="px-6 py-12 max-w-2xl mx-auto w-full">
        <p className="font-mono text-xs tracking-widest uppercase opacity-60 mb-4">
          {getTranslation(lang, "careAreas")}
        </p>

        <div className="divide-y divide-slate-200/60">
          {[
            { name: "Physiotherapy", icon: <Activity size={20} /> },
            { name: "Occupational Therapy", icon: <HeartHandshake size={20} /> },
            { name: "Dietetics", icon: <Utensils size={20} /> },
            { name: "Psychology", icon: <Brain size={20} /> },
            { name: "Respiratory Therapy", icon: <Wind size={20} /> },
          ].map((area) => (
            <div
              key={area.name}
              onClick={onStartUser}
              className="py-4 flex items-center gap-4 hover:bg-black/5 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <span className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center text-[var(--primary)] shrink-0 border border-slate-200/60 shadow-xs">
                {area.icon}
              </span>
              <span className="font-semibold text-base flex-1 text-[var(--primary)]">{area.name}</span>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[var(--primary)] text-white text-center py-12 px-6 mt-auto">
        <div className="max-w-md mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal mb-6 leading-snug">
            Feeling better starts <em className="italic text-white underline underline-offset-4 decoration-white/40">with one step.</em>
          </h2>
          <button
            onClick={onStartUser}
            className="bg-white text-[var(--primary)] font-bold text-sm px-8 py-3.5 rounded-full hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
          >
            Get started
          </button>
        </div>
      </section>

      <footer className="text-center py-4 text-xs text-[var(--faint)] border-t border-slate-200">
        <p>A+ Health Services — Connecting you to the right care, anytime.</p>
      </footer>
    </div>
  );
};

