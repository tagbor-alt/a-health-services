import React, { useState, useEffect } from "react";
import { X, Calendar, Download, Star, CheckCircle2, MessageSquare, ShieldCheck, MapPin, DollarSign, Clock } from "lucide-react";
import { HealthcareService, Provider, VisitType, Booking } from "../types";
import { INITIAL_PROVIDERS } from "../data/mockData";
import { ProfessionalChatModal } from "./ProfessionalChatModal";
import { saveBookingToFirestore, subscribeToProviders } from "../lib/firebase";

interface BookingModalProps {
  service: HealthcareService;
  initialProvider?: Provider | null;
  onClose: () => void;
  onBookingComplete?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  initialProvider,
  onClose,
  onBookingComplete,
}) => {
  const [allProviders, setAllProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  
  // Real-time providers
  useEffect(() => {
    const unsub = subscribeToProviders((liveList) => {
      if (liveList && liveList.length > 0) {
        setAllProviders(liveList);
      }
    });
    return () => unsub();
  }, []);

  const providersForService = allProviders.filter((p) => p.service === service);
  const fallbackProvider = providersForService[0] || allProviders[0];

  const [selectedProvider, setSelectedProvider] = useState<Provider>(
    initialProvider || fallbackProvider
  );

  useEffect(() => {
    if (initialProvider) {
      setSelectedProvider(initialProvider);
    } else if (providersForService.length > 0) {
      setSelectedProvider((prev) =>
        providersForService.some((p) => p.id === prev.id) ? prev : providersForService[0]
      );
    }
  }, [allProviders, service, initialProvider]);

  const [apptDate, setApptDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [apptTime, setApptTime] = useState<string>("10:00");
  const [visitType, setVisitType] = useState<VisitType>("Online");

  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [icsUrl, setIcsUrl] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Review section state
  const [stars, setStars] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const formatICSDate = (date: Date) => {
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  };

  const generateICS = (dateStr: string, timeStr: string, profName: string, serviceName: string, vType: string) => {
    const start = new Date(`${dateStr}T${timeStr}:00`);
    const end = new Date(start.getTime() + 45 * 60000);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//A+ Health Services//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@aplushealthservices`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${serviceName} Appointment - ${profName}`,
      `DESCRIPTION:${vType} appointment with ${profName} for ${serviceName}.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return lines.join("\r\n");
  };

  const handleConfirmBooking = () => {
    if (!apptDate || !apptTime) {
      alert("Please select a valid date and time.");
      return;
    }

    const booking: Booking = {
      id: "b_" + Date.now(),
      service,
      professional: selectedProvider.name,
      date: apptDate,
      time: apptTime,
      visitType,
      createdAt: new Date().toISOString(),
    };

    const icsContent = generateICS(apptDate, apptTime, selectedProvider.name, service, visitType);
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    setIcsUrl(url);
    setConfirmedBooking(booking);
    saveBookingToFirestore(booking);
    if (onBookingComplete) onBookingComplete(booking);
  };

  const handleSubmitReview = () => {
    if (stars === 0) {
      alert("Please select a star rating.");
      return;
    }
    setReviewSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <h1 className="font-serif text-2xl font-normal text-[var(--primary)] mb-1">Book an Appointment</h1>
        <p className="text-xs text-[var(--muted)] mb-5">{service} — Select specialist, consultation mode, and time</p>

        {!confirmedBooking ? (
          <div className="space-y-5">
            {/* Professional Picker */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold mb-2">
                CHOOSE HEALTHCARE PROFESSIONAL ({providersForService.length} available)
              </p>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {providersForService.map((p) => {
                  const isSelected = selectedProvider.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProvider(p)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md ring-2 ring-[var(--primary)]/20"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm">{p.name}</p>
                            {p.isVerified !== false && (
                              <ShieldCheck
                                size={15}
                                className={isSelected ? "text-emerald-300" : "text-emerald-600"}
                              />
                            )}
                          </div>
                          <p className={`text-xs ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                            {p.title || p.service}
                          </p>
                          <p
                            className={`text-[11px] flex items-center gap-1 mt-1 ${
                              isSelected ? "text-slate-200" : "text-slate-400"
                            }`}
                          >
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{p.rating.toFixed(1)} ({p.reviewCount} reviews)</span> · <span>{p.area}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {p.consultationFee && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              GH₵{p.consultationFee}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Doctor Summary Card */}
            {selectedProvider && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Practicing at {selectedProvider.area}</span>
                  {selectedProvider.experienceYears && (
                    <span className="text-[11px] text-slate-500 font-normal">
                      {selectedProvider.experienceYears}+ years exp.
                    </span>
                  )}
                </div>
                {selectedProvider.bio && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {selectedProvider.bio}
                  </p>
                )}
                {selectedProvider.workingHours && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <Clock size={12} className="text-slate-400" />
                    <span>Hours: {selectedProvider.workingHours}</span>
                  </div>
                )}
              </div>
            )}

            {/* Date & Time */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold mb-1.5">
                DATE & TIME
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--primary)] focus:outline-hidden text-slate-800"
                />
                <input
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[var(--primary)] focus:outline-hidden text-slate-800"
                />
              </div>
            </div>

            {/* Visit Type Toggle */}
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold mb-1.5">
                VISIT TYPE
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["Online", "In-person", "Home visit"] as VisitType[]).map((vt) => {
                  const active = visitType === vt;
                  return (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setVisitType(vt)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        active
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {vt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="w-full bg-[var(--primary)] text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-95 transition-opacity shadow-md cursor-pointer"
            >
              Confirm Appointment with {selectedProvider.name}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-[var(--bg)] p-5 rounded-2xl border border-slate-200 space-y-3 text-center">
              <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
              <p className="font-mono text-[10px] tracking-widest uppercase text-emerald-700 font-bold">
                BOOKING CONFIRMED IN FIRESTORE
              </p>
              <h3 className="font-serif text-xl text-[var(--primary)]">
                {confirmedBooking.service} with {confirmedBooking.professional}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {confirmedBooking.date} at {confirmedBooking.time} · {confirmedBooking.visitType}
              </p>

              {icsUrl && (
                <div className="space-y-2 mt-3">
                  <a
                    href={icsUrl}
                    download="appointment.ics"
                    className="inline-flex items-center justify-center gap-2 w-full bg-[var(--primary)] text-white font-bold text-xs py-3 rounded-xl hover:opacity-95 transition-opacity shadow-xs"
                  >
                    <Calendar size={16} />
                    <span>Add to Calendar (.ics)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Message {selectedProvider.name}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Review Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
                RATE YOUR EXPERIENCE
              </p>
              {!reviewSubmitted ? (
                <>
                  <div className="flex gap-2 text-2xl justify-center my-2">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        key={starNum}
                        onClick={() => setStars(starNum)}
                        className={`cursor-pointer transition-transform hover:scale-110 ${
                          starNum <= stars ? "text-amber-400" : "text-slate-200"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Leave feedback for this healthcare professional..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs resize-none focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                    rows={2}
                  />
                  <button
                    onClick={handleSubmitReview}
                    className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Submit Review
                  </button>
                </>
              ) : (
                <p className="text-center text-xs text-emerald-600 font-bold py-2">
                  Thank you for rating {selectedProvider.name}!
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Embedded direct chat if clicked */}
        {chatOpen && (
          <ProfessionalChatModal
            initialProvider={selectedProvider}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
