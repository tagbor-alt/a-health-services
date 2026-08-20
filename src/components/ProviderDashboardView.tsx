import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Users,
  ClipboardList,
  FileText,
  Clock,
  Camera,
  MessageSquare,
  Send,
  Plus,
  ShieldCheck,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Award,
  Sparkles,
  CheckCircle2,
  Trash2,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { Assessment, TreatmentNote, DirectMessage, Provider, HealthcareService } from "../types";
import {
  subscribeToChats,
  sendChatMessage,
  subscribeToProviders,
  saveProviderToFirestore,
  deleteProviderFromFirestore,
  clearAllDemoProviders,
  restoreDemoProviders,
  subscribeToBookings
} from "../lib/firebase";
import { INITIAL_PROVIDERS } from "../data/mockData";
import { AddProviderModal } from "./AddProviderModal";

interface ProviderDashboardViewProps {
  onBack: () => void;
}

export const ProviderDashboardView: React.FC<ProviderDashboardViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<
    "appointments" | "clients" | "messages" | "assessments" | "notes" | "availability" | "profile"
  >("appointments");

  const [allProviders, setAllProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [activeProviderId, setActiveProviderId] = useState<string>("1");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [realBookings, setRealBookings] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingDemo, setIsClearingDemo] = useState(false);

  // Subscribe to live providers from Firestore
  useEffect(() => {
    const unsub = subscribeToProviders((liveList) => {
      setAllProviders(liveList || []);
      if (liveList && liveList.length > 0) {
        if (!liveList.some((p) => p.id === activeProviderId)) {
          setActiveProviderId(liveList[0].id);
        }
      }
    });
    return () => unsub();
  }, [activeProviderId]);

  // Subscribe to live bookings from Firestore
  useEffect(() => {
    const unsub = subscribeToBookings((list) => {
      setRealBookings(list);
    });
    return () => unsub();
  }, []);

  // Selected Active Provider
  const currentProvider = allProviders.find((p) => p.id === activeProviderId) || allProviders[0] || INITIAL_PROVIDERS[0];

  // Editable Profile Form State
  const [profileForm, setProfileForm] = useState<Provider>(currentProvider);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(currentProvider.photo || null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    if (currentProvider) {
      setProfileForm(currentProvider);
      setPendingPhoto(currentProvider.photo || null);
    }
  }, [activeProviderId, allProviders]);

  const clients = ["Kojo Owusu", "Adwoa Mensima", "Samuel Tetteh", "Efua Asante", "Abena Mensah"];

  // Provider Messages State
  const [providerReplyInput, setProviderReplyInput] = useState("");
  const [chatMessages, setChatMessages] = useState<DirectMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToChats(activeProviderId, (firestoreMsgs) => {
      if (firestoreMsgs.length > 0) {
        setChatMessages(
          firestoreMsgs.map((m) => ({
            id: m.id || `msg_${Date.now()}`,
            providerId: m.providerId,
            providerName: m.providerName,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
          }))
        );
      }
    });

    return () => unsubscribe();
  }, [activeProviderId]);

  const handleProviderSendReply = () => {
    const text = providerReplyInput.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    sendChatMessage({
      providerId: currentProvider.id,
      providerName: currentProvider.name,
      sender: "provider",
      text,
      timestamp: timeStr,
      createdAt: Date.now(),
    });

    setProviderReplyInput("");
  };

  // Notes State
  const [notesList, setNotesList] = useState<TreatmentNote[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("providerNotes") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedClientForNote, setSelectedClientForNote] = useState(clients[0]);
  const [noteText, setNoteText] = useState("");

  // Assessments State
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("providerAssessments") || "[]");
    } catch {
      return [];
    }
  });
  const [selectedClientForAssess, setSelectedClientForAssess] = useState(clients[0]);
  const [assessType, setAssessType] = useState<"initial" | "pain" | "rom" | "mobility">("initial");
  const [assessFormData, setAssessFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem("providerNotes", JSON.stringify(notesList));
  }, [notesList]);

  useEffect(() => {
    localStorage.setItem("providerAssessments", JSON.stringify(assessmentsList));
  }, [assessmentsList]);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingPhoto(dataUrl);
      setProfileForm((prev) => ({ ...prev, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const updated: Provider = {
      ...profileForm,
      id: currentProvider.id,
      photo: pendingPhoto || undefined,
      rating: currentProvider.rating || 5.0,
      reviewCount: currentProvider.reviewCount || 1,
      isVerified: true,
    };

    try {
      await saveProviderToFirestore(updated);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
    } catch (err) {
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;

    const newNote: TreatmentNote = {
      id: "note_" + Date.now(),
      client: selectedClientForNote,
      date: new Date().toLocaleString(),
      text: noteText.trim(),
    };

    setNotesList((prev) => [newNote, ...prev]);
    setNoteText("");
  };

  const handleSaveAssessment = () => {
    const hasValues = Object.values(assessFormData).some((v) => typeof v === "string" && v.trim() !== "");
    if (!hasValues) {
      alert("Please fill in at least one field.");
      return;
    }

    const newAssess: Assessment = {
      id: "assess_" + Date.now(),
      client: selectedClientForAssess,
      type: assessType,
      date: new Date().toLocaleString(),
      data: assessFormData,
    };

    setAssessmentsList((prev) => [newAssess, ...prev]);
    setAssessFormData({});
  };

  const assessTemplates = {
    initial: [
      { id: "complaint", label: "Chief Complaint", isTextarea: true },
      { id: "history", label: "Medical History", isTextarea: true },
      { id: "observations", label: "Clinical Observations", isTextarea: true },
      { id: "plan", label: "Initial Treatment Plan", isTextarea: true },
    ],
    pain: [
      { id: "location", label: "Pain Location", isTextarea: false },
      { id: "scale", label: "Pain Scale (0-10)", isTextarea: false },
      { id: "aggravating", label: "Aggravating Factors", isTextarea: false },
      { id: "relieving", label: "Relieving Factors", isTextarea: false },
    ],
    rom: [
      { id: "joint", label: "Joint Tested", isTextarea: false },
      { id: "movement", label: "Movement Tested", isTextarea: false },
      { id: "measured", label: "Measured Degrees (°)", isTextarea: false },
      { id: "normal", label: "Normal Range (°)", isTextarea: false },
    ],
    mobility: [
      { id: "level", label: "Mobility Level", isTextarea: false },
      { id: "device", label: "Assistive Device Used", isTextarea: false },
      { id: "distance", label: "Distance Walked", isTextarea: false },
      { id: "fallRisk", label: "Fall Risk Notes", isTextarea: true },
    ],
  };

  // Filter bookings for this provider or show all
  const providerBookings = realBookings.filter(
    (b) => b.professional === currentProvider.name || b.service === currentProvider.service
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer text-slate-300 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base leading-tight">Healthcare Portal</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Verified Doctor View
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Practicing as <strong className="text-white">{currentProvider.name}</strong> ({currentProvider.service})
              </p>
            </div>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Specialist</span>
          </button>
        </div>

            {/* Practitioner Switcher Bar */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
                Practitioner:
              </span>
              {allProviders.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No specialists registered</span>
              ) : (
                allProviders.map((p) => {
                  const isCurrent = p.id === currentProvider?.id;
                  const isDemo = p.isDemo || ["1", "2", "3", "4", "5", "6", "7", "8"].includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveProviderId(p.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-[var(--primary)] text-white shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <span>{p.name}</span>
                      {isDemo && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-normal">
                          Demo
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Demo Data Actions */}
            <div className="shrink-0 flex items-center gap-2">
              {allProviders.some((p) => p.isDemo || ["1", "2", "3", "4", "5", "6", "7", "8"].includes(p.id)) ? (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to remove all 8 demo / fake placeholder doctors? Only real healthcare professionals you add will remain.")) {
                      setIsClearingDemo(true);
                      try {
                        await clearAllDemoProviders();
                      } finally {
                        setIsClearingDemo(false);
                      }
                    }
                  }}
                  disabled={isClearingDemo}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={12} />
                  <span>{isClearingDemo ? "Clearing..." : "Delete All Demo Doctors"}</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    setIsClearingDemo(true);
                    try {
                      await restoreDemoProviders();
                    } finally {
                      setIsClearingDemo(false);
                    }
                  }}
                  disabled={isClearingDemo}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>{isClearingDemo ? "Restoring..." : "Load Demo Templates"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {allProviders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Users size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">No Specialists in Directory</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All sample/fake doctors have been removed. You can now register real healthcare professionals, or restore the demo templates if needed.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={14} />
                <span>Register Real Healthcare Professional</span>
              </button>
              <button
                onClick={async () => {
                  await restoreDemoProviders();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer inline-flex items-center gap-1.5 border border-slate-200"
              >
                <RotateCcw size={14} />
                <span>Restore 8 Demo Profiles</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
          {[
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "messages", label: "Direct Messages", icon: MessageSquare },
            { id: "clients", label: "Patients", icon: Users },
            { id: "notes", label: "Clinical Notes", icon: FileText },
            { id: "assessments", label: "Assessments", icon: ClipboardList },
            { id: "availability", label: "Schedule", icon: Clock },
            { id: "profile", label: "Edit Credentials", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Appointments Panel */}
        {activeTab === "appointments" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upcoming Patient Appointments</h2>
                <p className="text-xs text-slate-500">Live synced from Firestore booking requests</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                {providerBookings.length} Booked
              </span>
            </div>

            {providerBookings.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No appointments scheduled for {currentProvider.name} yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">When patients book on the patient app, they will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {providerBookings.map((appt, i) => (
                  <div
                    key={appt.id || i}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{appt.date} at {appt.time}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {appt.visitType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Service: <strong>{appt.service}</strong> · Assigned: {appt.professional}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("messages")}
                      className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs hover:opacity-90 cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. Direct Messages Panel */}
        {activeTab === "messages" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Direct Patient Chat Inbox</h2>
                <p className="text-xs text-slate-500">Live thread for {currentProvider.name}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Live Active Thread
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-64 overflow-y-auto space-y-2.5">
              {chatMessages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No messages in this practitioner thread yet.</p>
              ) : (
                chatMessages.map((m) => {
                  const isProv = m.sender === "provider";
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl max-w-[85%] text-xs space-y-1 ${
                        isProv
                          ? "bg-[var(--primary)] text-white ml-auto"
                          : "bg-white border border-slate-200 text-slate-800 mr-auto shadow-xs"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] opacity-75">
                        <span>{isProv ? "You (Doctor)" : "Patient"}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={providerReplyInput}
                onChange={(e) => setProviderReplyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleProviderSendReply();
                  }
                }}
                placeholder={`Reply to patient as ${currentProvider.name}...`}
                className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
              />
              <button
                onClick={handleProviderSendReply}
                disabled={!providerReplyInput.trim()}
                className="bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Send size={14} />
                <span>Reply</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Patients Panel */}
        {activeTab === "clients" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Registered Patient Records</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clients.map((c) => (
                <div key={c} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">
                      {c.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{c}</p>
                      <p className="text-[10px] text-slate-500">Active Patient Plan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClientForNote(c);
                      setActiveTab("notes");
                    }}
                    className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Clinical Notes Panel */}
        {activeTab === "notes" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Treatment & Clinical Notes</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Patient</label>
              <select
                value={selectedClientForNote}
                onChange={(e) => setSelectedClientForNote(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white text-slate-800"
              >
                {clients.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Clinical Documentation</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Document patient progress, exercise adherence, pain scale changes, or next steps..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveNote}
              disabled={!noteText.trim()}
              className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              Save Treatment Note
            </button>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700">Previous Notes</h3>
              {notesList.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No notes recorded yet.</p>
              ) : (
                notesList.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center text-slate-500 font-semibold text-[10px]">
                      <span>{n.client}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-slate-800">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. Assessments Panel */}
        {activeTab === "assessments" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Clinical Assessment Forms</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Patient</label>
                <select
                  value={selectedClientForAssess}
                  onChange={(e) => setSelectedClientForAssess(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                >
                  {clients.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Assessment Protocol</label>
                <select
                  value={assessType}
                  onChange={(e) => setAssessType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white"
                >
                  <option value="initial">Initial Clinical Assessment</option>
                  <option value="pain">Pain & Function Scale</option>
                  <option value="rom">Range of Motion (ROM)</option>
                  <option value="mobility">Mobility & Gait Test</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {assessTemplates[assessType].map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{field.label}</label>
                  {field.isTextarea ? (
                    <textarea
                      value={assessFormData[field.id] || ""}
                      onChange={(e) => setAssessFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                      rows={2}
                    />
                  ) : (
                    <input
                      type="text"
                      value={assessFormData[field.id] || ""}
                      onChange={(e) => setAssessFormData((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAssessment}
              className="bg-[var(--primary)] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 cursor-pointer shadow-xs"
            >
              Save Assessment Protocol
            </button>
          </div>
        )}

        {/* 6. Availability Panel */}
        {activeTab === "availability" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Working Days & Schedule for {currentProvider.name}</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const daysList = profileForm.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri"];
                  const isSel = daysList.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const next = isSel ? daysList.filter((d) => d !== day) : [...daysList, day];
                        setProfileForm((prev) => ({ ...prev, availableDays: next }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSel
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Working Hours Text</label>
              <input
                type="text"
                value={profileForm.workingHours || "08:30 AM - 05:00 PM"}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, workingHours: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-[var(--primary)] text-white text-xs font-bold py-3.5 rounded-xl hover:opacity-95 shadow-sm cursor-pointer"
            >
              Update Availability in Firestore
            </button>
          </div>
        )}

        {/* 7. Profile Credentials Panel */}
        {activeTab === "profile" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Healthcare Practitioner Credentials</h2>
                <p className="text-xs text-slate-500">Changes update the live patient directory instantly</p>
              </div>
              {saveSuccessNotice && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Saved to Database!</span>
                </div>
              )}
            </div>

            {/* Profile Photo */}
            <div className="flex items-center gap-4 pt-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {pendingPhoto ? (
                  <img src={pendingPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400">No Photo</span>
                )}
              </div>

              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                <Camera size={14} />
                <span>Upload Profile Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Doctor / Practitioner Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Healthcare Discipline</label>
                <select
                  value={profileForm.service}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, service: e.target.value as HealthcareService }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium bg-white"
                >
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                  <option value="Dietetics">Dietetics</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Respiratory Therapy">Respiratory Therapy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={profileForm.title || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Senior Consultant Physiotherapist"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">License / Registration ID</label>
                <input
                  type="text"
                  value={profileForm.licenseNumber || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="e.g. AHPC/PT/00481"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Qualifications & Degrees</label>
                <input
                  type="text"
                  value={profileForm.qualification || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, qualification: e.target.value }))}
                  placeholder="e.g. BSc Physiotherapy, MSc Orthopedic Rehab"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Consultation Fee (GH₵)</label>
                <input
                  type="number"
                  value={profileForm.consultationFee || 180}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, consultationFee: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Practice Area / City</label>
                <input
                  type="text"
                  value={profileForm.area}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, area: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.phone || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+233 24 123 4567"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Clinical Bio & Practice Summary</label>
              <textarea
                value={profileForm.bio || ""}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 resize-none"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-[var(--primary)] text-white text-xs font-bold py-3.5 rounded-xl hover:opacity-95 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Save & Publish Live to Patient App</span>
            </button>

            {/* Danger Zone: Delete Profile */}
            <div className="pt-4 mt-6 border-t border-red-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Delete Practitioner Profile</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Permanently remove <strong className="text-slate-700">{currentProvider.name}</strong> from the database and directory.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        `Are you sure you want to permanently delete "${currentProvider.name}" from the system?`
                      )
                    ) {
                      setIsDeleting(true);
                      try {
                        await deleteProviderFromFirestore(currentProvider.id);
                      } catch (err) {
                        alert("Failed to delete provider.");
                      } finally {
                        setIsDeleting(false);
                      }
                    }
                  }}
                  disabled={isDeleting}
                  className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>{isDeleting ? "Deleting..." : "Delete Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Modal to register new provider */}
      {addModalOpen && (
        <AddProviderModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={(newProv) => {
            setActiveProviderId(newProv.id);
            setActiveTab("profile");
          }}
        />
      )}
    </div>
  );
};
