import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MessageSquare, Plus, CheckCircle, Star, Phone, ShieldCheck, MapPin, Sparkles, Filter, Trash2, RotateCcw } from "lucide-react";
import { TopBar } from "./TopBar";
import { HealthcareService, Provider } from "../types";
import { INITIAL_PROVIDERS } from "../data/mockData";
import { ProfessionalChatModal } from "./ProfessionalChatModal";
import { AddProviderModal } from "./AddProviderModal";
import { subscribeToProviders, clearAllDemoProviders, restoreDemoProviders } from "../lib/firebase";

interface NearbyViewProps {
  onBack?: () => void;
  onBookService: (service: HealthcareService, provider?: Provider) => void;
}

const SERVICE_TABS: ("All" | HealthcareService)[] = [
  "All",
  "Physiotherapy",
  "Occupational Therapy",
  "Dietetics",
  "Psychology",
  "Respiratory Therapy",
];

export const NearbyView: React.FC<NearbyViewProps> = ({ onBack, onBookService }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [selectedService, setSelectedService] = useState<"All" | HealthcareService>("All");
  const [selectedChatProvider, setSelectedChatProvider] = useState<Provider | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>({
    lat: 5.6037,
    lng: -0.1870,
  });

  // Subscribe to live Firestore providers
  useEffect(() => {
    const unsubscribe = subscribeToProviders((liveProviders) => {
      setProviders(liveProviders || []);
    });

    return () => unsubscribe();
  }, []);

  const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Default Accra coordinates
        }
      );
    }
  }, []);

  // Map Rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([userPos.lat, userPos.lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userPos.lat, userPos.lng], 12);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom user dot icon
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `<div style="width:16px;height:16px;border-radius:50%;background:var(--primary);border:3px solid #FFF;box-shadow:0 0 0 2px var(--primary);"></div>`,
    });

    const userMarker = L.marker([userPos.lat, userPos.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup("<strong>You are here</strong>");
    markersRef.current.push(userMarker);

    // Filter providers according to selected discipline
    const filteredForMap = selectedService === "All"
      ? providers
      : providers.filter((p) => p.service === selectedService);

    filteredForMap.forEach((p) => {
      const pMarker = L.marker([p.lat, p.lng])
        .addTo(map)
        .bindPopup(
          `<strong>${p.name}</strong><br><span style="color:#0f766e;font-weight:600;">${p.service}</span><br>${p.area}${p.consultationFee ? `<br><b>GH₵${p.consultationFee}</b>` : ""}`
        );
      markersRef.current.push(pMarker);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userPos, providers, selectedService]);

  const filteredProviders = (
    selectedService === "All" ? providers : providers.filter((p) => p.service === selectedService)
  )
    .map((p) => ({
      ...p,
      distance: distanceKm(userPos.lat, userPos.lng, p.lat, p.lng),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24 flex flex-col">
      <TopBar
        title="Healthcare Directory & Map"
        subtitle="Find verified doctors and licensed specialists in Ghana"
        onBack={onBack}
      />

      {/* Action Sub-header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-14 z-20 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              {filteredProviders.length} Specialists Available
            </span>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>Add Professional</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="max-w-xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {SERVICE_TABS.map((tab) => {
            const isActive = selectedService === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedService(tab)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="w-full h-[35vh] z-0 shrink-0 relative" ref={mapContainerRef}>
        <div className="absolute top-2 right-2 z-400 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          GPS Live Tracking
        </div>
      </div>

      {/* Provider Listings */}
      <main className="p-4 max-w-xl mx-auto w-full space-y-3.5">
        <div className="flex items-center justify-between pt-1">
          <p className="font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
            VERIFIED HEALTHCARE PRACTITIONERS ({providers.length})
          </p>
          
          <div className="flex items-center gap-2">
            {providers.some((p) => p.isDemo || ["1", "2", "3", "4", "5", "6", "7", "8"].includes(p.id)) ? (
              <button
                onClick={async () => {
                  if (confirm("Remove all 8 demo placeholder doctors? Only real registered healthcare professionals will be shown.")) {
                    setIsClearing(true);
                    try {
                      await clearAllDemoProviders();
                    } finally {
                      setIsClearing(false);
                    }
                  }
                }}
                disabled={isClearing}
                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                title="Remove sample mock doctors"
              >
                <Trash2 size={11} />
                <span>{isClearing ? "Clearing..." : "Clear Demo Doctors"}</span>
              </button>
            ) : (
              <button
                onClick={async () => {
                  setIsClearing(true);
                  try {
                    await restoreDemoProviders();
                  } finally {
                    setIsClearing(false);
                  }
                }}
                disabled={isClearing}
                className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                title="Load sample doctors"
              >
                <RotateCcw size={11} />
                <span>{isClearing ? "Loading..." : "Load Demo Templates"}</span>
              </button>
            )}
          </div>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">No practitioners in this directory</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                No real doctors are registered in this category yet. You can add your practice or load demo profiles.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus size={14} />
                <span>Add Real Healthcare Specialist</span>
              </button>
              <button
                onClick={async () => {
                  await restoreDemoProviders();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer inline-flex items-center gap-1.5 border border-slate-200"
              >
                <RotateCcw size={13} />
                <span>Load 8 Demo Templates</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredProviders.map((p) => {
              const isDemo = p.isDemo || ["1", "2", "3", "4", "5", "6", "7", "8"].includes(p.id);
              return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-[var(--primary)] font-bold flex items-center justify-center text-base border border-slate-200 shrink-0">
                        {p.name.replace("Dr. ", "").charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                        {isDemo ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            Demo
                          </span>
                        ) : (
                          p.isVerified !== false && (
                            <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                          )
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[var(--primary)]">{p.title || p.service}</p>
                      {p.qualification && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{p.qualification}</p>
                      )}
                      {p.licenseNumber && (
                        <span className="inline-block mt-0.5 font-mono text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                          {p.licenseNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg inline-block">
                      {p.distance < 0.1 ? "< 100m" : `${p.distance.toFixed(1)} km`}
                    </span>
                    {p.consultationFee && (
                      <p className="text-xs font-bold text-emerald-700 mt-1">
                        GH₵{p.consultationFee}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio / Summary */}
                {p.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {p.bio}
                  </p>
                )}

                {/* Area and Visit Types */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{p.area}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-700">{p.rating.toFixed(1)}</span>
                    <span>({p.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onBookService(p.service, p)}
                    className="bg-[var(--primary)] text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-95 cursor-pointer shadow-xs text-center transition-opacity"
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => setSelectedChatProvider(p)}
                    className="bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>Direct Chat</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </main>

      {/* Add Professional Modal */}
      {addModalOpen && (
        <AddProviderModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={(newProv) => {
            setProviders((prev) => [newProv, ...prev.filter((p) => p.id !== newProv.id)]);
          }}
        />
      )}

      {/* Direct Professional Chat Modal */}
      {selectedChatProvider && (
        <ProfessionalChatModal
          initialProvider={selectedChatProvider}
          onClose={() => setSelectedChatProvider(null)}
        />
      )}
    </div>
  );
};
