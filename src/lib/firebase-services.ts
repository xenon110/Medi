
import { doc, setDoc, getDoc, collection, getDocs, query, where, FieldValue, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';


// Type definitions based on your schema
export type UserProfile = {
  uid: string;
  email: string;
  role: 'patient' | 'doctor';
  name: string;
  age: number;
  createdAt: FieldValue;
};

export type PatientProfile = UserProfile & {
  role: 'patient';
  region: string;
  skinTone: string;
};

export type DoctorProfile = UserProfile & {
  role: 'doctor';
  experience?: number;
  specialization?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  degreeUrl?: string;
  additionalFileUrl?: string;
};

export type CreateUserProfileData = {
  email: string;
  role: 'patient' | 'doctor';
  name: string;
  age: number;
  skinTone?: string;
  region?: string;
  experience?: number;
};


// This function creates a user document in Firestore in the correct collection.
export const createUserProfile = async (uid: string, data: CreateUserProfileData) => {
  if (!db) throw new Error("Firestore is not initialized.");
  
  const collectionName = data.role === 'doctor' ? 'doctors' : 'patients';
  const userRef = doc(db, collectionName, uid);

  const userData: Partial<PatientProfile | DoctorProfile> = {
    uid,
    email: data.email,
    role: data.role,
    name: data.name,
    age: data.age,
    createdAt: serverTimestamp(),
  };

  if (data.role === 'doctor') {
    (userData as Partial<DoctorProfile>).verificationStatus = 'pending';
    (userData as Partial<DoctorProfile>).experience = data.experience;
  } else {
    (userData as Partial<PatientProfile>).skinTone = data.skinTone;
    (userData as Partial<PatientProfile>).region = data.region;
  }

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// This function retrieves a user's profile from either collection.
export const getUserProfile = async (uid: string): Promise<(PatientProfile | DoctorProfile | null)> => {
  if (!db) throw new Error("Firestore is not initialized.");

  // Check doctors collection first
  const doctorRef = doc(db, 'doctors', uid);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    return doctorSnap.data() as DoctorProfile;
  }

  // If not found, check patients collection
  const patientRef = doc(db, 'patients', uid);
  const patientSnap = await getDoc(patientRef);
  if (patientSnap.exists()) {
    return patientSnap.data() as PatientProfile;
  }

  // If not found in either, return null
  return null;
};


export type Report = {
  id?: string;
  patientId: string;
  doctorId?: string | null;
  aiReport: GenerateInitialReportOutput;
  status: 'pending-doctor-review' | 'doctor-approved' | 'doctor-modified' | 'rejected';
  createdAt: FieldValue;
  doctorNotes?: string;
  prescription?: string;
}

export const saveReport = async (patientId: string, reportData: GenerateInitialReportOutput) => {
    if (!db) throw new Error("Firestore is not initialized.");

    const reportsCollection = collection(db, 'reports');
    const reportDocRef = doc(reportsCollection); // Creates a new doc with a random ID

    const newReport: Report = {
        id: reportDocRef.id,
        patientId: patientId,
        aiReport: reportData,
        status: 'pending-doctor-review',
        createdAt: serverTimestamp(),
    };

    await setDoc(reportDocRef, newReport);
    return newReport;
};
