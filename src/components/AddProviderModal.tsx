import React, { useState } from "react";
import { X, UserCheck, Stethoscope, MapPin, Award, Phone, Mail, Clock, DollarSign, Camera, Check, ShieldCheck, Sparkles } from "lucide-react";
import { HealthcareService, Provider, VisitType } from "../types";
import { saveProviderToFirestore } from "../lib/firebase";

interface AddProviderModalProps {
  onClose: () => void;
  onSuccess?: (newProvider: Provider) => void;
}

const GHANA_AREAS = [
  { area: "East Legon, Accra", lat: 5.6500, lng: -0.1500 },
  { area: "Osu, Accra", lat: 5.5560, lng: -0.1969 },
  { area: "Airport Residential, Accra", lat: 5.6025, lng: -0.1783 },
  { area: "Dansoman, Accra", lat: 5.5390, lng: -0.2670 },
  { area: "Tema Community 10", lat: 5.6698, lng: -0.0166 },
  { area: "Labone, Accra", lat: 5.5730, lng: -0.1450 },
  { area: "Achimota, Accra", lat: 5.6180, lng: -0.2350 },
  { area: "Cantonments, Accra", lat: 5.5780, lng: -0.1720 },
  { area: "Spintex Road, Accra", lat: 5.6320, lng: -0.1110 },
  { area: "Adenta, Accra", lat: 5.6980, lng: -0.1670 },
  { area: "Ridge / North Ridge, Accra", lat: 5.5720, lng: -0.1980 },
  { area: "Kumasi Central, Ashanti", lat: 6.6885, lng: -1.6244 },
  { area: "Takoradi, Western Region", lat: 4.9016, lng: -1.7831 },
];

const SERVICES: HealthcareService[] = [
  "Physiotherapy",
  "Occupational Therapy",
  "Dietetics",
  "Psychology",
  "Respiratory Therapy",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const AddProviderModal: React.FC<AddProviderModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [service, setService] = useState<HealthcareService>("Physiotherapy");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [phone, setPhone] = useState("+233 ");
  const [email, setEmail] = useState("");
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [customArea, setCustomArea] = useState("");
  const [consultationFee, setConsultationFee] = useState<number>(180);
  const [bio, setBio] = useState("");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [workingHours, setWorkingHours] = useState("08:30 AM - 05:00 PM");
  const [availableDays, setAvailableDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [visitTypes, setVisitTypes] = useState<VisitType[]>(["Online", "In-person", "Home visit"]);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleVisitType = (type: VisitType) => {
    setVisitTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide the healthcare professional's name.");
      return;
    }

    setIsSubmitting(true);

    const chosenArea = customArea.trim()
      ? { area: customArea.trim(), lat: 5.6037 + (Math.random() - 0.5) * 0.05, lng: -0.1870 + (Math.random() - 0.5) * 0.05 }
      : GHANA_AREAS[selectedAreaIndex] || GHANA_AREAS[0];

    const specialtiesList = specialtiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newProvider: Provider = {
      id: "prov_" + Date.now(),
      name: name.trim().startsWith("Dr.") || name.trim().includes(",") ? name.trim() : `Dr. ${name.trim()}`,
      title: title.trim() || `Consultant in ${service}`,
      service,
      specialties: specialtiesList.length > 0 ? specialtiesList : [`General ${service} Care`, "Patient Rehabilitation"],
      licenseNumber: licenseNumber.trim() || `AHPC/${service.slice(0, 2).toUpperCase()}/${Math.floor(10000 + Math.random() * 90000)}`,
      qualification: qualification.trim() || `BSc ${service}, Accredited Clinical Specialist`,
      experienceYears: Number(experienceYears) || 5,
      phone: phone.trim() || "+233 24 000 0000",
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, "")}@aplushealth.com`,
      area: chosenArea.area,
      lat: chosenArea.lat,
      lng: chosenArea.lng,
      rating: 5.0,
      reviewCount: 1,
      photo: photoUrl || undefined,
      bio: bio.trim() || `Dedicated ${service} specialist licensed to practice with A+ Health Services, prioritizing evidence-based treatments and holistic patient wellness.`,
      consultationFee: Number(consultationFee) || 180,
      availableDays: availableDays.length > 0 ? availableDays : ["Mon", "Tue", "Wed", "Thu", "Fri"],
      workingHours: workingHours || "08:30 AM - 05:00 PM",
      visitTypes: visitTypes.length > 0 ? visitTypes : ["Online", "In-person"],
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveProviderToFirestore(newProvider);
      setSuccessBanner(true);
      if (onSuccess) {
        onSuccess(newProvider);
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Failed to register professional:", err);
      alert("Failed to save professional profile. Please check your network.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[var(--primary)] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs text-white">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Healthcare Professional</h2>
              <p className="text-xs text-white/80">Register a licensed specialist into the live A+ Health directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Banner */}
        {successBanner ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Healthcare Professional Registered!</h3>
            <p className="text-sm text-slate-600 max-w-md">
              <strong>{name}</strong> is now registered and verified in the live directory. Patients can immediately discover, chat with, and book appointments with them.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-sm">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ama Serwaa Boateng"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Healthcare Discipline *
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as HealthcareService)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 text-slate-800 bg-white font-medium"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Professional Title / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Consultant Physiotherapist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. AHPC/PT/00492 or GMA/1029"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800 font-mono text-xs"
                />
              </div>
            </div>

            {/* Qualifications & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Qualifications & Degrees
                </label>
                <input
                  type="text"
                  placeholder="e.g. BSc Physiotherapy, MSc Orthopedic Rehab"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Location & Consultation Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Practice Area / City *
                </label>
                <select
                  value={selectedAreaIndex}
                  onChange={(e) => setSelectedAreaIndex(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800 bg-white"
                >
                  {GHANA_AREAS.map((item, idx) => (
                    <option key={item.area} value={idx}>
                      {item.area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Consultation Fee (GH₵)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">GH₵</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Direct Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+233 24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="doctor.name@aplushealth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
                />
              </div>
            </div>

            {/* Clinical Specialties */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Focus / Sub-Specialties (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Spine Rehab, Post-Surgical Recovery, Sports Injuries, Ergonomics"
                value={specialtiesText}
                onChange={(e) => setSpecialtiesText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800"
              />
            </div>

            {/* Supported Visit Modes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Consultation Modes Supported
              </label>
              <div className="flex flex-wrap gap-2">
                {(["Online", "In-person", "Home visit"] as VisitType[]).map((type) => {
                  const isSelected = visitTypes.includes(type);
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => toggleVisitType(type)}
                      className={`px-3.5 py-1.5 rounded-xl font-medium text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{type === "Online" ? "Online Telehealth" : type === "In-person" ? "In-Person Clinic" : "Home Visit"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Practice Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                  const isSelected = availableDays.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`w-10 h-8 rounded-lg font-bold text-xs border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Professional Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Bio & Background
              </label>
              <textarea
                rows={3}
                placeholder="Describe your medical background, treatment philosophies, and patient care approach..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--primary)] text-slate-800 resize-none text-xs"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Profile Photo
              </label>
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--primary)]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <Camera size={22} />
                  </div>
                )}
                <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <UserCheck size={16} />
                <span>{isSubmitting ? "Registering..." : "Register Professional"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
