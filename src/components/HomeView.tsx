import React, { useState } from "react";
import { Search, ChevronRight, Activity, HeartHandshake, Utensils, Brain, Wind, Stethoscope, MapPin, Pill, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { HealthcareService, LanguageCode } from "../types";
import { HEALTHCARE_SERVICES, ServiceDefinition } from "../data/mockData";
import { getTranslation } from "../lib/i18n";

interface HomeViewProps {
  onSelectService: (service: HealthcareService) => void;
  onOpenSymptomChecker: () => void;
  onOpenNearby: () => void;
  onOpenMedication: () => void;
  onOpenProfessionalChat?: () => void;
  lang: LanguageCode;
}

const SERVICE_ICONS: Record<HealthcareService, React.ReactNode> = {
  "Physiotherapy": <Activity size={24} />,
  "Occupational Therapy": <HeartHandshake size={24} />,
  "Dietetics": <Utensils size={24} />,
  "Psychology": <Brain size={24} />,
  "Respiratory Therapy": <Wind size={24} />
};

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectService,
  onOpenSymptomChecker,
  onOpenNearby,
  onOpenMedication,
  onOpenProfessionalChat,
  lang
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const scoreService = (service: ServiceDefinition, queryWords: string[]) => {
    let score = 0;
    const nameWords = service.name.toLowerCase().split(" ");

    queryWords.forEach((qWord) => {
      if (qWord.length < 2) return;

      nameWords.forEach((nWord) => {
        if (nWord.includes(qWord) || qWord.includes(nWord)) score += 2;
      });

      service.keywords.forEach((keyword) => {
        const kWords = keyword.split(" ");
        if (keyword.includes(qWord)) score += 3;
        kWords.forEach((kWord) => {
          if (kWord.startsWith(qWord) || qWord.startsWith(kWord)) score += 1;
        });
      });
    });

    return score;
  };

  const getFilteredServices = () => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return HEALTHCARE_SERVICES;

    const queryWords = trimmed.split(/\s+/);
    return HEALTHCARE_SERVICES.map((s) => ({
      service: s,
      score: scoreService(s, queryWords)
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.service);
  };

  const filteredServices = getFilteredServices();

  return (
    <div className="pb-24 bg-slate-50/60 min-h-screen font-sans">
      {/* Hero Header */}
      <header className="bg-[var(--primary)] text-white pt-7 pb-8 px-5 rounded-b-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-6 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase text-white">
              A+ HEALTHCARE
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <h1 className="font-serif text-2xl font-normal tracking-tight text-white pt-1">
            Care Services & Telehealth
          </h1>
          <p className="text-xs text-slate-200/90 max-w-sm">
            {getTranslation(lang, "tagline")}
          </p>

          {/* Search Box */}
          <div className="pt-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation(lang, "searchPlaceholder")}
                className="w-full bg-white text-slate-900 pl-10 pr-4 py-3 border border-slate-100 rounded-2xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg shadow-black/5"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5 space-y-6">
        {/* Quick Access Tools Grid */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              Quick Medical Tools
            </h2>
            <span className="text-[10px] text-slate-400">24/7 Available</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Symptom Checker */}
            <button
              onClick={onOpenSymptomChecker}
              className="bg-gradient-to-br from-[var(--primary)] to-slate-900 text-white p-3.5 rounded-2xl text-left flex flex-col justify-between hover:opacity-95 transition-all shadow-sm group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/10 rounded-xl text-white">
                  <Stethoscope size={18} />
                </div>
                <Sparkles size={14} className="text-amber-300" />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold block leading-snug">AI Symptom Checker</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Instant triage guidance</span>
              </div>
            </button>

            {/* Direct Professional Message */}
            {onOpenProfessionalChat && (
              <button
                onClick={onOpenProfessionalChat}
                className="bg-emerald-900 text-white p-3.5 rounded-2xl text-left flex flex-col justify-between hover:bg-emerald-850 transition-all shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-200">
                    <MessageSquare size={18} />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold block leading-snug">Message Specialist</span>
                  <span className="text-[10px] text-emerald-200 block mt-0.5">Direct care consultation</span>
                </div>
              </button>
            )}

            {/* Nearby Clinics */}
            <button
              onClick={onOpenNearby}
              className="bg-white border border-slate-200/80 p-3.5 rounded-2xl text-left flex flex-col justify-between hover:bg-slate-50 transition-all shadow-2xs group cursor-pointer"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <MapPin size={18} />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-900 block leading-snug">Providers Near Me</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Geolocated clinic map</span>
              </div>
            </button>

            {/* Medication Tracker */}
            <button
              onClick={onOpenMedication}
              className="bg-white border border-slate-200/80 p-3.5 rounded-2xl text-left flex flex-col justify-between hover:bg-slate-50 transition-all shadow-2xs group cursor-pointer"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl w-fit">
                <Pill size={18} />
              </div>
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-900 block leading-snug">Rx Reminders</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Medication schedules</span>
              </div>
            </button>
          </div>
        </section>

        {/* Specialized Health Services */}
        <section className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <div>
              <h2 className="font-serif text-lg font-normal text-slate-900">
                {getTranslation(lang, "chooseService")}
              </h2>
              <p className="text-[11px] text-slate-500">Certified healthcare professionals in Ghana</p>
            </div>
            <span className="text-[11px] font-mono text-[var(--primary)] font-bold">
              {filteredServices.length} AVAILABLE
            </span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
              <p className="text-xs font-medium text-[var(--muted)] mb-3">No matching service found for your search query.</p>
              <button
                onClick={onOpenSymptomChecker}
                className="text-xs font-bold text-[var(--primary)] underline cursor-pointer"
              >
                Try the Symptom Checker instead →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServices.map((service) => (
                <div
                  key={service.name}
                  onClick={() => onSelectService(service.name)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 text-left flex items-start gap-3.5 cursor-pointer hover:border-[var(--primary)] hover:shadow-md transition-all group"
                >
                  <div className="p-3 bg-slate-100 rounded-xl text-[var(--primary)] shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    {SERVICE_ICONS[service.name]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-[var(--primary)] transition-colors">
                        {service.name}
                      </h3>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        Virtual & In-person
                      </span>
                      <span className="font-bold text-emerald-700">From GH₵ 150</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security & Sync Banner */}
        <section className="bg-slate-100/80 border border-slate-200/60 rounded-2xl p-3.5 flex items-center gap-3 text-slate-600">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div className="text-[11px]">
            <span className="font-bold text-slate-800 block">Encrypted & Real-time Cloud Sync</span>
            <span className="text-slate-500">Your appointments, messages, and health logs are stored securely on Firestore.</span>
          </div>
        </section>
      </main>
    </div>
  );
};

