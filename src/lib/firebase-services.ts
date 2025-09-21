
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Type definitions based on your schema
type UserProfile = {
  uid: string;
  email: string;
  role: 'patient' | 'doctor';
  name?: string;
  createdAt: FieldValue;
};

type PatientProfile = UserProfile & {
  role: 'patient';
  age?: number;
  gender?: string;
  region?: string;
  skinTone?: string;
};

type DoctorProfile = UserProfile & {
  role: 'doctor';
  specialization?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
};

// This function creates a user document in Firestore in the correct collection.
export const createUserProfile = async (uid: string, data: { email: string, role: 'patient' | 'doctor' }) => {
  if (!db) throw new Error("Firestore is not initialized.");
  
  const collectionName = data.role === 'doctor' ? 'doctors' : 'patients';
  const userRef = doc(db, collectionName, uid);

  const userData = {
    uid,
    email: data.email,
    role: data.role,
    createdAt: new Date(),
  };

  if (data.role === 'doctor') {
    (userData as Partial<DoctorProfile>).verificationStatus = 'pending';
  }

  await setDoc(userRef, userData);
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
