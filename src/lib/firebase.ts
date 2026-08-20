import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, deleteDoc, getDocs, onSnapshot, query, orderBy } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Booking, DiaryEntry, UserProfile, Provider } from "../types";
import { INITIAL_PROVIDERS } from "../data/mockData";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface FirestoreMessage {
  id?: string;
  providerId: string;
  providerName: string;
  sender: "patient" | "provider";
  text: string;
  timestamp: string;
  createdAt: number;
}

// Real-time listener for provider chats
export function subscribeToChats(
  providerId: string,
  callback: (messages: FirestoreMessage[]) => void
) {
  const chatsRef = collection(db, "chats");
  return onSnapshot(
    chatsRef,
    (snapshot) => {
      const msgs: FirestoreMessage[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as FirestoreMessage;
        if (data.providerId === providerId) {
          msgs.push({ id: d.id, ...data });
        }
      });
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      callback(msgs);
    },
    (error) => {
      console.warn("Firestore onSnapshot error:", error);
    }
  );
}

// Send a chat message
export async function sendChatMessage(msg: Omit<FirestoreMessage, "id">) {
  try {
    const chatsRef = collection(db, "chats");
    await addDoc(chatsRef, msg);
  } catch (err) {
    console.error("Failed to send chat message to Firestore:", err);
  }
}

// --- BOOKINGS SYNC ---
export function subscribeToBookings(callback: (bookings: Booking[]) => void) {
  const ref = collection(db, "bookings");
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: Booking[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Booking;
        list.push({ ...data, id: d.id });
      });
      callback(list);
    },
    (error) => {
      console.warn("Firestore bookings sync error:", error);
    }
  );
}

export async function saveBookingToFirestore(booking: Booking) {
  try {
    const docRef = doc(db, "bookings", booking.id || `booking_${Date.now()}`);
    await setDoc(docRef, booking);
  } catch (err) {
    console.error("Failed to save booking to Firestore:", err);
  }
}

// --- DIARY ENTRIES SYNC ---
export function subscribeToDiaryEntries(callback: (entries: DiaryEntry[]) => void) {
  const ref = collection(db, "diaryEntries");
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: DiaryEntry[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as DiaryEntry;
        list.push({ ...data, id: d.id });
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      console.warn("Firestore diary entries sync error:", error);
    }
  );
}

export async function saveDiaryEntryToFirestore(entry: DiaryEntry) {
  try {
    const docRef = doc(db, "diaryEntries", entry.id || `entry_${Date.now()}`);
    await setDoc(docRef, entry);
  } catch (err) {
    console.error("Failed to save diary entry to Firestore:", err);
  }
}

// --- PROFILE SETTINGS SYNC ---
export function subscribeToProfileSettings(email: string, callback: (profile: UserProfile) => void) {
  const docRef = doc(db, "profileSettings", email || "default_user");
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      }
    },
    (error) => {
      console.warn("Firestore profile settings sync error:", error);
    }
  );
}

export async function saveProfileSettingsToFirestore(profile: UserProfile) {
  try {
    const docRef = doc(db, "profileSettings", profile.email || "default_user");
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    console.error("Failed to save profile settings to Firestore:", err);
  }
}

// --- PROVIDERS (HEALTHCARE PROFESSIONALS) SYNC & SEEDING ---
let providersSeeded = false;

export function subscribeToProviders(callback: (providers: Provider[]) => void) {
  const ref = collection(db, "providers");
  const isDemoCleared = localStorage.getItem("demo_providers_cleared") === "true";

  return onSnapshot(
    ref,
    async (snapshot) => {
      if (snapshot.empty) {
        if (!isDemoCleared && !providersSeeded) {
          providersSeeded = true;
          // Seed initial providers to Firestore so database has rich starting directory
          try {
            for (const p of INITIAL_PROVIDERS) {
              const docRef = doc(db, "providers", p.id);
              await setDoc(docRef, { ...p, createdAt: new Date().toISOString() }, { merge: true });
            }
          } catch (seedErr) {
            console.warn("Could not auto-seed initial providers:", seedErr);
          }
          callback(INITIAL_PROVIDERS);
          return;
        } else {
          // Explicitly cleared or empty
          callback([]);
          return;
        }
      }

      const list: Provider[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Provider;
        list.push({ ...data, id: d.id });
      });

      callback(list);
    },
    (error) => {
      console.warn("Firestore providers sync error:", error);
      callback(isDemoCleared ? [] : INITIAL_PROVIDERS);
    }
  );
}

export async function saveProviderToFirestore(provider: Provider) {
  try {
    const id = provider.id || `prov_${Date.now()}`;
    const docRef = doc(db, "providers", id);
    const dataToSave = {
      ...provider,
      id,
      createdAt: provider.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return dataToSave;
  } catch (err) {
    console.error("Failed to save provider to Firestore:", err);
    throw err;
  }
}

export async function deleteProviderFromFirestore(providerId: string) {
  try {
    const docRef = doc(db, "providers", providerId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete provider from Firestore:", err);
    throw err;
  }
}

// Clear all demo / fake placeholder providers from Firestore
export async function clearAllDemoProviders() {
  try {
    localStorage.setItem("demo_providers_cleared", "true");
    const ref = collection(db, "providers");
    const snapshot = await getDocs(ref);
    const demoIds = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
    
    for (const d of snapshot.docs) {
      const data = d.data() as Provider;
      if (data.isDemo || demoIds.has(d.id)) {
        await deleteDoc(doc(db, "providers", d.id));
      }
    }
  } catch (err) {
    console.error("Failed to clear demo providers:", err);
    throw err;
  }
}

// Restore demo starter templates if user wants them back
export async function restoreDemoProviders() {
  try {
    localStorage.removeItem("demo_providers_cleared");
    for (const p of INITIAL_PROVIDERS) {
      const docRef = doc(db, "providers", p.id);
      await setDoc(docRef, { ...p, createdAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.error("Failed to restore demo providers:", err);
    throw err;
  }
}


