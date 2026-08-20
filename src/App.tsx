import React, { useState, useEffect } from "react";
import { HealthcareService, ThemeName, LanguageCode } from "./types";
import { applyTheme } from "./lib/theme";
import { LandingView } from "./components/LandingView";
import { HomeView } from "./components/HomeView";
import { SymptomCheckerModal } from "./components/SymptomCheckerModal";
import { BookingModal } from "./components/BookingModal";
import { AiChatView } from "./components/AiChatView";
import { MedicationView } from "./components/MedicationView";
import { DiaryView } from "./components/DiaryView";
import { NearbyView } from "./components/NearbyView";
import { LearnView } from "./components/LearnView";
import { ProfileView } from "./components/ProfileView";
import { ProviderDashboardView } from "./components/ProviderDashboardView";
import { AuthModal } from "./components/AuthModal";
import { ProfessionalChatModal } from "./components/ProfessionalChatModal";
import { Navbar, NavTab } from "./components/Navbar";

export default function App() {
  const [view, setView] = useState<"landing" | "app" | "provider">("landing");
  const [navTab, setNavTab] = useState<NavTab>("home");

  // Overlays / Modals
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState<HealthcareService | null>(null);
  const [bookingProvider, setBookingProvider] = useState<any | null>(null);
  const [medicationOpen, setMedicationOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profChatModalOpen, setProfChatModalOpen] = useState(false);

  // User session
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("userEmail") || null;
  });

  // Settings
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem("appTheme") as ThemeName) || "navy";
  });

  const [lang, setLang] = useState<LanguageCode>(() => {
    return (localStorage.getItem("appLang") as LanguageCode) || "en";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem("appTheme", newTheme);
  };

  const handleLangChange = (newLang: LanguageCode) => {
    setLang(newLang);
    localStorage.setItem("appLang", newLang);
  };

  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("userEmail", email);
    setAuthModalOpen(false);
    setView("app");
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("userEmail");
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans transition-colors duration-300">
      {/* 1. Landing Screen */}
      {view === "landing" && (
        <LandingView
          onStartUser={() => {
            if (!userEmail) {
              setAuthModalOpen(true);
            } else {
              setView("app");
            }
          }}
          onStartProvider={() => setView("provider")}
          lang={lang}
        />
      )}

      {/* 2. Provider Dashboard */}
      {view === "provider" && (
        <ProviderDashboardView onBack={() => setView("landing")} />
      )}

      {/* 3. Main Patient App View */}
      {view === "app" && (
        <div>
          {medicationOpen ? (
            <MedicationView onBack={() => setMedicationOpen(false)} />
          ) : (
            <>
              {navTab === "home" && (
                <HomeView
                  onSelectService={(service) => setBookingService(service)}
                  onOpenSymptomChecker={() => setSymptomModalOpen(true)}
                  onOpenNearby={() => setNavTab("nearby")}
                  onOpenMedication={() => setMedicationOpen(true)}
                  onOpenProfessionalChat={() => setProfChatModalOpen(true)}
                  lang={lang}
                />
              )}

              {navTab === "diary" && <DiaryView />}

              {navTab === "nearby" && (
                <NearbyView
                  onBookService={(service, provider) => {
                    setBookingProvider(provider || null);
                    setBookingService(service);
                  }}
                />
              )}

              {navTab === "learn" && <LearnView />}

              {navTab === "chat" && <AiChatView />}

              {navTab === "profile" && (
                <ProfileView
                  onLogout={handleLogout}
                  currentTheme={theme}
                  onThemeChange={handleThemeChange}
                  currentLang={lang}
                  onLangChange={handleLangChange}
                  currentUserEmail={userEmail || "user@aplushealth.com"}
                />
              )}

              <Navbar activeTab={navTab} onTabChange={(tab) => setNavTab(tab)} lang={lang} />
            </>
          )}
        </div>
      )}

      {/* Modals & Overlays */}
      {symptomModalOpen && (
        <SymptomCheckerModal
          onClose={() => setSymptomModalOpen(false)}
          onBookService={(service) => {
            setSymptomModalOpen(false);
            setBookingProvider(null);
            setBookingService(service);
          }}
        />
      )}

      {bookingService && (
        <BookingModal
          service={bookingService}
          initialProvider={bookingProvider}
          onClose={() => {
            setBookingService(null);
            setBookingProvider(null);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {profChatModalOpen && (
        <ProfessionalChatModal
          onClose={() => setProfChatModalOpen(false)}
        />
      )}
    </div>
  );
}
