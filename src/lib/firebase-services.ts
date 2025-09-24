
import { doc, setDoc, getDoc, collection, getDocs, query, where, FieldValue, serverTimestamp, addDoc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
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
  gender: string;
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
  gender: string;
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
    gender: data.gender,
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
    return { uid: doctorSnap.id, ...doctorSnap.data() } as DoctorProfile;
  }

  // If not found, check patients collection
  const patientRef = doc(db, 'patients', uid);
  const patientSnap = await getDoc(patientRef);
  if (patientSnap.exists()) {
    return { uid: patientSnap.id, ...patientSnap.data() } as PatientProfile;
  }

  // If not found in either, return null
  return null;
};


export type Report = {
  id: string;
  reportName: string;
  patientId: string;
  patientProfile?: PatientProfile;
  doctorId?: string | null;
  aiReport: GenerateInitialReportOutput;
  status: 'pending-doctor-review' | 'doctor-approved' | 'doctor-modified' | 'rejected' | 'pending-patient-input';
  createdAt: FieldValue | Timestamp | { seconds: number, nanoseconds: number };
  doctorNotes?: string;
  prescription?: string;
}

export const saveReport = async (patientId: string, reportName: string, reportData: GenerateInitialReportOutput): Promise<Report> => {
    if (!db) throw new Error("Firestore is not initialized.");

    const reportsCollection = collection(db, 'reports');
    
    const newReportData = {
        patientId: patientId,
        reportName: reportName,
        aiReport: reportData,
        status: 'pending-patient-input' as const,
        createdAt: serverTimestamp(),
        doctorId: null,
        doctorNotes: '',
        prescription: '',
    };

    const reportDocRef = await addDoc(reportsCollection, newReportData);

    return {
        id: reportDocRef.id,
        ...newReportData,
    }
};

export const getReportsForPatient = async (patientId: string): Promise<Report[]> => {
    if (!db) throw new Error("Firestore is not initialized.");
    const reportsCollection = collection(db, 'reports');
    const q = query(reportsCollection, where("patientId", "==", patientId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
};

export const getReportsForDoctor = async (doctorId: string): Promise<Report[]> => {
    if (!db) throw new Error("Firestore is not initialized.");
    const reportsCollection = collection(db, 'reports');
    const q = query(reportsCollection, where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const report = { id: docSnapshot.id, ...docSnapshot.data() } as Report;
      if (report.patientId) {
        // Fetching patient profile might fail if rules are too strict.
        // It's better to fetch this on the backend or adjust rules.
        // For now, let's try fetching and handle potential nulls.
        const patientProfile = await getUserProfile(report.patientId) as PatientProfile | null;
        if (patientProfile) {
            report.patientProfile = patientProfile;
        }
      }
      reports.push(report);
    }
    return reports;
};


export const getDoctors = async (): Promise<DoctorProfile[]> => {
  if (!db) throw new Error("Firestore is not initialized.");
  const doctorsCollection = collection(db, 'doctors');
  // This query now matches the security rule and the composite index.
  const q = query(doctorsCollection, where("verificationStatus", "==", "approved"), orderBy("name"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as DoctorProfile));
};

export const sendReportToDoctor = async (reportId: string, doctorId: string) => {
    if (!db) throw new Error("Firestore is not initialized.");
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
        doctorId: doctorId,
        status: 'pending-doctor-review'
    });
};

export const logEmergency = async (patientId: string) => {
    if (!db) throw new Error("Firestore is not initialized.");
    const emergenciesCollection = collection(db, 'emergencies');
    await addDoc(emergenciesCollection, {
        patientId: patientId,
        timestamp: serverTimestamp()
    });
};
