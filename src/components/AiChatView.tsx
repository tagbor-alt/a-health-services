import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle, Sparkles, Mic, MicOff, Volume2, VolumeX, AlertCircle, UserCheck, MessageSquarePlus } from "lucide-react";
import { TopBar } from "./TopBar";
import { ProfessionalChatModal } from "./ProfessionalChatModal";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

interface AiChatViewProps {
  onBack?: () => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hi! I'm your AI Health Hub assistant. Tell me what's going on — pain, posture, stress, breathing, or diet — and I'll point you in the right direction."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profChatOpen, setProfChatOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech recognition and speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, msgId: string) => {
    if (!("speechSynthesis" in window)) {
      setErrorMessage("Text-to-speech audio playback is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setErrorMessage(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = async () => {
    setErrorMessage(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }

    // Request audio stream permission explicitly to prompt browser if blocked in iframe
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permErr: any) {
      console.warn("Microphone permission check warning:", permErr);
      if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
        setErrorMessage("Microphone access was denied. Please allow microphone access in your browser settings.");
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      let baseText = input;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((baseText ? baseText.trim() + " " : "") + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMessage("Microphone access denied. Click the lock/site settings icon in your address bar to allow microphone.");
        } else if (event.error === "no-speech") {
          setErrorMessage("No speech detected. Please try speaking again.");
        } else if (event.error === "audio-capture") {
          setErrorMessage("No microphone was found. Please ensure a working mic is connected.");
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      setErrorMessage("Could not start microphone voice input: " + (err.message || "Unknown error"));
    }
  };

  const handleSend = async (textToSend?: string) => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { id: "u_" + Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);
    setErrorMessage(null);

    const newMsgId = "a_" + Date.now();
    let accumulatedText = "";

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let isFirstChunk = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                if (isFirstChunk) {
                  isFirstChunk = false;
                  setLoading(false);
                  setMessages((prev) => [...prev, { id: newMsgId, sender: "ai", text: accumulatedText }]);
                } else {
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === newMsgId ? { ...msg, text: accumulatedText } : msg))
                  );
                }
              }
            } catch {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      if (isFirstChunk) {
        // If no stream chunks parsed, fallback fetch
        const fastRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const fastData = await fastRes.json();
        accumulatedText = fastData.reply || "I'm here to help. Could you please rephrase?";
        setMessages((prev) => [...prev, { id: newMsgId, sender: "ai", text: accumulatedText }]);
      }

      if (autoSpeak && accumulatedText) {
        setTimeout(() => speakText(accumulatedText, newMsgId), 200);
      }
    } catch {
      // Fallback to fast standard endpoint if streaming fails
      try {
        const fallbackRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const fallbackData = await fallbackRes.json();
        const reply = fallbackData.reply || "I experienced a temporary issue. Please ask again.";
        setMessages((prev) => [...prev, { id: newMsgId, sender: "ai", text: reply }]);
        if (autoSpeak) {
          setTimeout(() => speakText(reply, newMsgId), 200);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newMsgId,
            sender: "ai",
            text: "Sorry, I had trouble connecting. Please check your internet or try again."
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Desk posture for back pain",
    "How to manage stress tension",
    "Nutrition for diabetes",
    "Breathing for shortness of breath"
  ];

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] pb-16">
      <TopBar title="AI Health Hub" subtitle="Guidance and tracking support" onBack={onBack} />

      {/* Disclaimer */}
      {(() => {
        const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai");
        const isSpeakingLast = lastAiMsg && speakingMsgId === lastAiMsg.id;

        return (
          <div className="bg-amber-50 text-amber-900 px-4 py-2 text-[11px] leading-tight flex items-center justify-between border-b border-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0 text-amber-600" />
              <span className="hidden sm:inline">General guidance only, not a medical diagnosis.</span>
              <span className="sm:hidden">Guidance only, not diagnosis.</span>
            </div>

            {/* Global Audio Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {lastAiMsg && (
                <button
                  type="button"
                  onClick={() => speakText(lastAiMsg.text, lastAiMsg.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                    isSpeakingLast
                      ? "bg-amber-600 text-white border-amber-700 animate-pulse"
                      : "bg-white text-slate-700 border-amber-300 hover:bg-amber-100"
                  }`}
                  title="Read latest response aloud"
                >
                  {isSpeakingLast ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isSpeakingLast ? "Stop Voice" : "Read Aloud"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                  autoSpeak
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-white text-slate-600 border-amber-300 hover:bg-amber-100"
                }`}
                title="Automatically read aloud new responses"
              >
                <Volume2 size={12} />
                <span>Auto Voice {autoSpeak ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Switch to Professional Chat Action Bar */}
      <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-indigo-950 text-xs font-semibold">
          <UserCheck size={15} className="text-indigo-600 shrink-0" />
          <span>Need direct care from a doctor or therapist?</span>
        </div>
        <button
          type="button"
          onClick={() => setProfChatOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <MessageSquarePlus size={13} />
          <span>Chat with Professional</span>
        </button>
      </div>

      {/* Error notification bar */}
      {errorMessage && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-[11px] border-b border-red-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 font-bold hover:text-red-800 text-xs cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white border border-slate-200 text-[var(--primary)]"
              }`}
            >
              {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed relative ${
                msg.sender === "user"
                  ? "bg-[var(--primary)] text-white rounded-tr-none"
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <Sparkles size={14} className="animate-spin text-[var(--primary)]" />
            <span>AI Health Assistant thinking...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 overflow-x-auto flex gap-2 shrink-0 bg-white/50 border-t border-slate-200">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-[var(--primary)] hover:text-[var(--primary)] cursor-pointer shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 relative"
      >
        {isListening && (
          <div className="absolute -top-8 left-4 bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Listening... Speak now
          </div>
        )}

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Type or dictate your health question..."}
            className={`w-full bg-slate-50 border rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors ${
              isListening ? "border-red-500 bg-red-50/30 font-medium" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop voice dictation" : "Start voice dictation"}
            className={`absolute right-2.5 p-1.5 rounded-full transition-all cursor-pointer ${
              isListening
                ? "bg-red-500 text-white animate-bounce"
                : "text-slate-400 hover:text-[var(--primary)] hover:bg-slate-100"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </form>

      {/* Professional Direct Chat Modal */}
      {profChatOpen && (
        <ProfessionalChatModal
          onClose={() => setProfChatOpen(false)}
        />
      )}
    </div>
  );
};
