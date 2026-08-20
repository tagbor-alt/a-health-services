import React, { useState, useEffect, useRef } from "react";
import { X, Send, User, Bot, Volume2, VolumeX, Phone, MessageSquare, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { Provider, DirectMessage } from "../types";
import { INITIAL_PROVIDERS } from "../data/mockData";
import { subscribeToChats, sendChatMessage, subscribeToProviders } from "../lib/firebase";

interface ProfessionalChatModalProps {
  initialProvider?: Provider | null;
  onClose: () => void;
}

export const ProfessionalChatModal: React.FC<ProfessionalChatModalProps> = ({
  initialProvider,
  onClose,
}) => {
  const [allProviders, setAllProviders] = useState<Provider[]>(INITIAL_PROVIDERS);

  // Subscribe to real-time providers list
  useEffect(() => {
    const unsub = subscribeToProviders((liveList) => {
      if (liveList && liveList.length > 0) {
        setAllProviders(liveList);
      }
    });
    return () => unsub();
  }, []);

  const [selectedProvider, setSelectedProvider] = useState<Provider>(
    initialProvider || INITIAL_PROVIDERS[0]
  );

  useEffect(() => {
    if (initialProvider) {
      setSelectedProvider(initialProvider);
    }
  }, [initialProvider]);

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time Firestore chat messages for selected provider
  useEffect(() => {
    // Initial local storage fallback
    try {
      const stored = localStorage.getItem(`professional_chats_${selectedProvider.id}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    const unsubscribe = subscribeToChats(selectedProvider.id, (firestoreMsgs) => {
      if (firestoreMsgs.length > 0) {
        const formatted: DirectMessage[] = firestoreMsgs.map((m) => ({
          id: m.id || `msg_${Date.now()}`,
          providerId: m.providerId,
          providerName: m.providerName,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
        }));
        setMessages(formatted);
        try {
          localStorage.setItem(`professional_chats_${selectedProvider.id}`, JSON.stringify(formatted));
        } catch {
          // ignore
        }
      } else {
        // Default welcome message if empty database
        const initialMsg: DirectMessage = {
          id: `msg_init_${Date.now()}`,
          providerId: selectedProvider.id,
          providerName: selectedProvider.name,
          sender: "provider",
          text: `Hello! I am ${selectedProvider.name}, your ${selectedProvider.service} specialist. How can I assist you today regarding your treatment, exercises, or appointment?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMsg]);
      }
    });

    return () => unsubscribe();
  }, [selectedProvider]);

  // Save local copy
  const saveMessages = (updatedMsgs: DirectMessage[]) => {
    setMessages(updatedMsgs);
    try {
      localStorage.setItem(`professional_chats_${selectedProvider.id}`, JSON.stringify(updatedMsgs));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      sender: "patient",
      text,
      timestamp: timeStr,
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setInputMessage("");

    // Send to Firestore database
    sendChatMessage({
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      sender: "patient",
      text,
      timestamp: timeStr,
      createdAt: Date.now(),
    });

    // Auto response simulation for fast demonstration
    setTimeout(() => {
      let replyText = `Thank you for reaching out! ${selectedProvider.name} has received your inquiry: "${text.slice(0, 35)}..." and will get back to you shortly during office hours.`;

      const lower = text.toLowerCase();
      if (lower.includes("exercise") || lower.includes("pain") || lower.includes("stiff")) {
        replyText = `Thank you for checking in! For ${selectedProvider.service.toLowerCase()} concerns, gentle movement without forcing through sharp pain is recommended. ${selectedProvider.name} will review your notes and reply.`;
      } else if (lower.includes("appointment") || lower.includes("book") || lower.includes("time")) {
        replyText = `I have received your scheduling message. You can also use our instant booking tool to secure a direct consultation slot with ${selectedProvider.name}.`;
      } else if (lower.includes("hello") || lower.includes("hi")) {
        replyText = `Hello! Thank you for messaging ${selectedProvider.name} (${selectedProvider.service}). How can I assist with your care today?`;
      }

      const autoReplyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      sendChatMessage({
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        sender: "provider",
        text: replyText,
        timestamp: autoReplyTime,
        createdAt: Date.now(),
      });
    }, 1200);
  };

  const speakText = (text: string, msgId: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg h-[92vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <header className="bg-[var(--primary)] text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {selectedProvider.photo ? (
              <img
                src={selectedProvider.photo}
                alt={selectedProvider.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white text-[var(--primary)] font-bold flex items-center justify-center text-sm shadow-xs border-2 border-white/20">
                {selectedProvider.name.replace("Dr. ", "").charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm leading-tight">{selectedProvider.name}</h2>
                <ShieldCheck size={14} className="text-emerald-300" title="Verified Professional" />
              </div>
              <p className="text-[11px] text-slate-200 flex items-center gap-1">
                <span>{selectedProvider.title || selectedProvider.service}</span> · <span className="text-amber-300 font-semibold">★ {selectedProvider.rating.toFixed(1)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </header>

        {/* Provider Switcher Selector */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold shrink-0">Specialist:</span>
          {allProviders.map((p) => {
            const isSel = p.id === selectedProvider.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          {messages.map((m) => {
            const isMe = m.sender === "patient";
            const isSpeaking = speakingMsgId === m.id;

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isMe
                      ? "bg-[var(--primary)] text-white"
                      : "bg-emerald-600 text-white shadow-xs"
                  }`}
                >
                  {isMe ? "You" : selectedProvider.name.charAt(4) || "Dr"}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1.5 shadow-xs leading-relaxed ${
                    isMe
                      ? "bg-[var(--primary)] text-white rounded-tr-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`flex items-center justify-between gap-2 text-[10px] pt-1 ${
                      isMe ? "text-white/70" : "text-slate-400"
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    <button
                      onClick={() => speakText(m.text, m.id)}
                      className={`hover:opacity-100 opacity-70 transition-opacity cursor-pointer p-0.5`}
                      title="Read aloud"
                    >
                      {isSpeaking ? (
                        <VolumeX size={12} className="text-amber-300" />
                      ) : (
                        <Volume2 size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {[
            "How soon can we schedule?",
            "Can we do an online session?",
            "Do you offer home visits?",
            "What exercises help my back?",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold whitespace-nowrap hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={`Message ${selectedProvider.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] bg-slate-50 text-slate-800"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
