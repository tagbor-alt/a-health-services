import { Provider, Article, HealthcareService } from "../types";

export interface ServiceDefinition {
  name: HealthcareService;
  description: string;
  keywords: string[];
}

export const HEALTHCARE_SERVICES: ServiceDefinition[] = [
  {
    name: "Physiotherapy",
    description: "Rehabilitation for joint, muscle, lower back, neck, and sports injuries.",
    keywords: [
      "back pain", "lower back", "neck pain", "shoulder pain", "knee pain", "hip pain",
      "joint pain", "muscle pain", "muscle strain", "sprain", "injury", "sports injury",
      "mobility", "stiffness", "posture", "arthritis", "sciatica", "frozen shoulder",
      "tennis elbow", "post surgery", "balance", "gait", "walking difficulty", "swelling"
    ]
  },
  {
    name: "Occupational Therapy",
    description: "Support for independence in daily living, ergonomics, and motor skills.",
    keywords: [
      "daily activities", "disability", "stroke recovery", "home adaptation", "workplace adaptation",
      "fine motor", "self-care", "dressing", "feeding difficulty", "cerebral palsy",
      "developmental delay", "autism", "sensory issues", "hand function", "independence",
      "cognitive difficulty", "memory problems", "return to work"
    ]
  },
  {
    name: "Dietetics",
    description: "Nutrition management, medical diets, diabetes care, and weight health.",
    keywords: [
      "weight loss", "weight gain", "obesity", "diabetes", "blood sugar", "diet plan",
      "nutrition", "hypertension", "high blood pressure", "cholesterol", "eating habits",
      "malnutrition", "food allergy", "digestive issues", "gut health", "meal planning",
      "underweight", "pregnancy nutrition"
    ]
  },
  {
    name: "Psychology",
    description: "Therapy and counseling for stress, anxiety, mood, trauma, and mental wellness.",
    keywords: [
      "stress", "anxiety", "panic attacks", "depression", "low mood", "sadness",
      "mental health", "counselling", "grief", "trauma", "burnout", "sleep problems",
      "insomnia", "relationship issues", "anger", "overthinking", "confidence", "self esteem",
      "postpartum", "adhd", "ocd"
    ]
  },
  {
    name: "Respiratory Therapy",
    description: "Care for asthma, COPD, shortness of breath, lung rehab, and breathing health.",
    keywords: [
      "breathing difficulty", "shortness of breath", "asthma", "lungs", "chest tightness",
      "chronic cough", "copd", "wheezing", "bronchitis", "pneumonia recovery",
      "sleep apnea", "oxygen therapy", "lung rehabilitation", "smoking related"
    ]
  }
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Dr. Ama Boateng",
    title: "Senior Consultant Physiotherapist",
    service: "Physiotherapy",
    specialties: ["Spine Rehabilitation", "Posture Correction", "Musculoskeletal Recovery"],
    licenseNumber: "AHPC/PT/00481",
    qualification: "BSc (Hons) Physiotherapy, MSc Orthopedic Rehab",
    experienceYears: 11,
    phone: "+233 24 456 7890",
    email: "ama.boateng@aplushealth.com",
    lat: 5.5560,
    lng: -0.1969,
    area: "Osu, Accra",
    rating: 4.9,
    reviewCount: 24,
    consultationFee: 200,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    workingHours: "08:00 AM - 05:00 PM",
    visitTypes: ["Online", "In-person", "Home visit"],
    isVerified: true,
    isDemo: true,
    bio: "Senior Physiotherapist with 11+ years specializing in spine and posture alignment, stroke rehab, and ergonomic workspace assessments."
  },
  {
    id: "2",
    name: "Dr. Kojo Mensah",
    title: "Sports & Joint Rehabilitation Specialist",
    service: "Physiotherapy",
    specialties: ["Sports Injuries", "ACL Rehabilitation", "Joint Mobilization"],
    licenseNumber: "AHPC/PT/00612",
    qualification: "BSc Physiotherapy, Postgrad Sports Medicine",
    experienceYears: 8,
    phone: "+233 50 123 4567",
    email: "kojo.mensah@aplushealth.com",
    lat: 5.6980,
    lng: -0.1670,
    area: "Adenta, Accra",
    rating: 4.8,
    reviewCount: 18,
    consultationFee: 180,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Sat"],
    workingHours: "09:00 AM - 06:00 PM",
    visitTypes: ["Online", "In-person"],
    isVerified: true,
    isDemo: true,
    bio: "Sports medicine practitioner focused on athletes, ligament injuries, and fast return-to-play rehabilitation protocols."
  },
  {
    id: "3",
    name: "Dr. Nana Adjei",
    title: "Clinical Occupational Therapist",
    service: "Occupational Therapy",
    specialties: ["Pediatric Development", "Stroke Recovery", "Ergonomics"],
    licenseNumber: "AHPC/OT/00194",
    qualification: "BSc Occupational Therapy, MSc Neurorehabilitation",
    experienceYears: 12,
    phone: "+233 27 890 1234",
    email: "nana.adjei@aplushealth.com",
    lat: 5.6500,
    lng: -0.1500,
    area: "East Legon, Accra",
    rating: 5.0,
    reviewCount: 31,
    consultationFee: 220,
    availableDays: ["Tue", "Wed", "Thu", "Fri", "Sat"],
    workingHours: "08:30 AM - 04:30 PM",
    visitTypes: ["Online", "In-person", "Home visit"],
    isVerified: true,
    isDemo: true,
    bio: "Specializes in pediatric sensory integration, stroke recovery, and home/workplace environment adaptations."
  },
  {
    id: "4",
    name: "Dr. Kwabena Osei",
    title: "Registered Clinical Dietitian",
    service: "Dietetics",
    specialties: ["Diabetes Care", "Hypertension Management", "Weight Optimization"],
    licenseNumber: "AHPC/DT/00315",
    qualification: "BSc Dietetics, Certified Diabetes Educator",
    experienceYears: 9,
    phone: "+233 20 654 3210",
    email: "kwabena.osei@aplushealth.com",
    lat: 5.5390,
    lng: -0.2670,
    area: "Dansoman, Accra",
    rating: 4.7,
    reviewCount: 15,
    consultationFee: 160,
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    workingHours: "09:00 AM - 05:00 PM",
    visitTypes: ["Online", "In-person"],
    isVerified: true,
    isDemo: true,
    bio: "Clinical Dietitian specializing in personalized Ghanaian meal plans for diabetes, hypertension, and sustainable weight management."
  },
  {
    id: "5",
    name: "Dr. Kwame Sarpong",
    title: "Clinical Psychologist & Psychotherapist",
    service: "Psychology",
    specialties: ["Cognitive Behavioral Therapy (CBT)", "Anxiety & Stress", "Burnout Recovery"],
    licenseNumber: "GMA/PSY/00240",
    qualification: "MPhil Clinical Psychology, PhD Psychology",
    experienceYears: 14,
    phone: "+233 24 999 8888",
    email: "kwame.sarpong@aplushealth.com",
    lat: 5.6698,
    lng: -0.0166,
    area: "Tema Community 10",
    rating: 4.9,
    reviewCount: 29,
    consultationFee: 250,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    workingHours: "10:00 AM - 07:00 PM",
    visitTypes: ["Online", "In-person"],
    isVerified: true,
    isDemo: true,
    bio: "Licensed Clinical Psychologist providing evidence-based CBT for depression, panic disorders, marital counseling, and executive burnout."
  },
  {
    id: "6",
    name: "Dr. Yaw Appiah",
    title: "Lead Respiratory Therapist",
    service: "Respiratory Therapy",
    specialties: ["Asthma Management", "COPD Rehabilitation", "Sleep Apnea"],
    licenseNumber: "AHPC/RT/00092",
    qualification: "BSc Respiratory Care, Fellow Pulmonology Support",
    experienceYears: 10,
    phone: "+233 55 432 1098",
    email: "yaw.appiah@aplushealth.com",
    lat: 5.6180,
    lng: -0.2350,
    area: "Achimota, Accra",
    rating: 4.8,
    reviewCount: 12,
    consultationFee: 190,
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    workingHours: "08:00 AM - 04:00 PM",
    visitTypes: ["Online", "In-person", "Home visit"],
    isVerified: true,
    isDemo: true,
    bio: "Cardiopulmonary specialist focused on asthma education, oxygen therapy, post-infection lung recovery, and respiratory muscle training."
  },
  {
    id: "7",
    name: "Dr. Efua Owusu",
    title: "Neuro & Orthopedic Physiotherapist",
    service: "Physiotherapy",
    specialties: ["Post-Surgical Rehab", "Gait Retraining", "Elderly Mobility"],
    licenseNumber: "AHPC/PT/00527",
    qualification: "BSc Physiotherapy, Certificate in Neuro-Rehab",
    experienceYears: 7,
    phone: "+233 26 333 4444",
    email: "efua.owusu@aplushealth.com",
    lat: 5.5850,
    lng: -0.2400,
    area: "Dansoman, Accra",
    rating: 4.9,
    reviewCount: 22,
    consultationFee: 170,
    availableDays: ["Tue", "Wed", "Thu", "Fri", "Sat"],
    workingHours: "08:30 AM - 05:30 PM",
    visitTypes: ["Online", "In-person", "Home visit"],
    isVerified: true,
    isDemo: true,
    bio: "Compassionate physiotherapist specializing in post-operative hip/knee replacements, stroke recovery, and fall prevention in elderly patients."
  },
  {
    id: "8",
    name: "Dr. Akosua Frimpong",
    title: "Mindfulness & Mental Wellness Counselor",
    service: "Psychology",
    specialties: ["Grief Counseling", "Postpartum Mental Health", "Mindfulness"],
    licenseNumber: "GMA/PSY/00388",
    qualification: "MSc Counseling Psychology",
    experienceYears: 8,
    phone: "+233 54 876 5432",
    email: "akosua.frimpong@aplushealth.com",
    lat: 5.5730,
    lng: -0.1450,
    area: "Labone, Accra",
    rating: 5.0,
    reviewCount: 19,
    consultationFee: 220,
    availableDays: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    workingHours: "09:00 AM - 06:00 PM",
    visitTypes: ["Online", "In-person"],
    isVerified: true,
    isDemo: true,
    bio: "Dedicated psychologist supporting young mothers, individuals navigating grief or trauma, and professionals experiencing high-stress fatigue."
  }
];

export const COMMUNITY_ARTICLES: Article[] = [
  {
    id: "1",
    category: "Ergonomics",
    title: "Fixing your desk posture",
    readTime: "3 min read",
    body: "Sit with your feet flat on the floor, hips slightly above knee level, and your screen at eye height so you're not tilting your neck down. Keep elbows close to your body at roughly a 90-degree angle. Stand and move every 30 to 45 minutes — even a short walk resets the strain that builds up in the lower back and shoulders from long sitting."
  },
  {
    id: "2",
    category: "Falls",
    title: "Fall-proofing the home for older adults",
    readTime: "4 min read",
    body: "Most falls happen during ordinary daily movement, not dramatic accidents — a loose rug, a dim hallway, wet bathroom tiles. Remove trailing wires and loose mats, add grab bars near the toilet and shower, and keep a light source within reach of the bed. Well-fitted, closed-back footwear matters more than people expect; loose slippers are a common contributor to slips."
  },
  {
    id: "3",
    category: "Child Development",
    title: "What to expect: milestones by age 2",
    readTime: "3 min read",
    body: "By 24 months, most children can walk steadily, run, kick a ball, and climb stairs holding a rail. Language typically includes short two-word phrases and following simple two-step instructions. Every child develops at their own pace, but if several milestones are noticeably delayed together, it's worth mentioning to a pediatrician or occupational therapist."
  },
  {
    id: "4",
    category: "Nutrition",
    title: "Small changes that actually stick",
    readTime: "2 min read",
    body: "Rather than overhauling your whole diet at once, pick one meal to adjust — swap a sugary drink for water, or add a vegetable to lunch. Consistency over weeks beats intensity over days. If you're managing a chronic condition like diabetes or hypertension, a dietitian can tailor this to your specific numbers rather than general advice."
  },
  {
    id: "5",
    category: "Mental Health",
    title: "Naming stress before it builds up",
    readTime: "3 min read",
    body: "Stress often shows up physically before we consciously notice it — tight shoulders, shallow breathing, trouble sleeping. A simple daily check-in, even just naming how you feel in one word, can catch this early. Persistent low mood or anxiety that affects daily functioning is worth discussing with a psychologist rather than managing alone."
  },
  {
    id: "6",
    category: "Ergonomics",
    title: "Lifting safely at work or home",
    readTime: "2 min read",
    body: "Bend at the knees and hips, not the waist, keeping the load close to your body as you lift. Avoid twisting while carrying something heavy — turn your whole body with your feet instead. If a task involves repeated heavy lifting, a physiotherapy assessment can help you build the right technique and strength before an injury happens."
  }
];
