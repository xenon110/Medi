
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, CheckCircle, Pencil, Loader2, Inbox, XCircle, ThumbsUp, Search, Stethoscope, FileText, Edit3, MessageSquare, LayoutGrid, Calendar, Settings, User, Phone, MoreVertical, Star, Bot, Home, Pill, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { Report, getUserProfile, PatientProfile, DoctorProfile } from '@/lib/firebase-services';
import { formatDistanceToNow } from 'date-fns';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';


type PatientCase = Report & {
    time: string;
    unread: number;
};

const statusMap: { [key in Report['status']]: { label: string; badgeClass: string; } } = {
  'pending-doctor-review': { label: 'Pending', badgeClass: 'status-pending' },
  'doctor-approved': { label: 'Reviewed', badgeClass: 'status-reviewed' },
  'doctor-modified': { label: 'Reviewed', badgeClass: 'status-reviewed' },
  'rejected': { label: 'Disqualified', badgeClass: 'status-reviewed' },
  'pending-patient-input': { label: 'Draft', badgeClass: 'status-reviewed' },
};


export default function DoctorDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [patientCases, setPatientCases] = useState<PatientCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // The layout now guarantees that only authenticated doctors can access this page.
    // We can directly get the current user.
    const currentUser = auth.currentUser;

    if (!currentUser || !db) {
        toast({ title: 'Error', description: 'Could not authenticate user.', variant: 'destructive' });
        router.push('/login?role=doctor');
        return;
    }

    setIsLoading(true);
    
    const reportsRef = collection(db, 'reports');
    // Query for reports assigned to the current doctor's UID.
    const q = query(reportsRef, where('doctorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

    const unsubscribeSnap = onSnapshot(q, async (querySnapshot) => {
      const casesPromises = querySnapshot.docs.map(async (doc) => {
        const report = { id: doc.id, ...doc.data() } as Report;
        if (!report.patientId) return null;

        // Fetch the profile for the patient associated with the report.
        const patientProfile = await getUserProfile(report.patientId) as PatientProfile | null;
        
        if (!patientProfile) return null;

        return {
          ...report,
          patientProfile: patientProfile,
          time: report.createdAt ? formatDistanceToNow(new Date((report.createdAt as any).seconds * 1000), { addSuffix: true }) : 'N/A',
          unread: report.status === 'pending-doctor-review' ? 1 : 0,
        };
      });

      // Await all promises and filter out any null results.
      const cases = (await Promise.all(casesPromises)).filter((c): c is PatientCase => c !== null);
      
      setPatientCases(cases);
      
      // Update the selected case if it's still in the list, otherwise select the first case.
      if (selectedCase) {
         const updatedSelectedCase = cases.find(c => c.id === selectedCase.id);
         setSelectedCase(updatedSelectedCase || cases[0] || null);
      } else if (cases.length > 0) {
         setSelectedCase(cases[0]);
      } else {
         setSelectedCase(null);
      }
      
      setIsLoading(false);

    }, (error) => {
      console.error("Error fetching reports in real-time:", error);
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        toast({ title: 'Permissions Error', description: 'Could not fetch reports. Please check your Firestore rules.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'A problem occurred while fetching patient cases.', variant: 'destructive' });
      }
      setIsLoading(false);
      router.push('/login?role=doctor');
    });

    // Cleanup the real-time listener on unmount.
    return () => unsubscribeSnap();
  }, [router, toast, selectedCase?.id]); // Depend on selectedCase.id to avoid re-running on every selection change


  const handleSelectCase = (patientCase: PatientCase) => {
    setSelectedCase(patientCase);
  };
  
  const filteredCases = patientCases.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return p.status === 'pending-doctor-review';
    if (filter === 'Reviewed') return p.status === 'doctor-approved' || p.status === 'doctor-modified';
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Patient Cases...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
            <div className="logo-sidebar">M</div>
            <nav className="sidebar-nav">
                <div className="nav-item active" title="Patient Cases"><MessageSquare size={24} /></div>
                <div className="nav-item" title="Analytics"><LayoutGrid size={24} /></div>
                <div className="nav-item" title="Calendar"><Calendar size={24} /></div>
                <div className="nav-item" title="Documents"><FileText size={24} /></div>
                <div className="nav-item" title="Settings"><Settings size={24} /></div>
            </nav>
            <div className="user-profile" title="Dr. Profile">
              <User size={24} />
            </div>
        </div>

        {/* Patient List Panel */}
        <div className="patient-list">
            <div className="list-header">
                <h2 className="text-xl font-bold text-gray-800">Patient Cases</h2>
                <p className="text-sm text-gray-500">{patientCases.filter(p => p.status === 'pending-doctor-review').length} pending reviews</p>
            </div>

            <div className="search-bar">
                <Search className="search-icon" size={18} />
                <input type="text" className="search-input" placeholder="Search patients..." />
            </div>

            <div className="filter-tabs">
                {['All', 'Pending', 'Reviewed'].map(tab => (
                    <div 
                      key={tab} 
                      className={cn('filter-tab', { 'active': filter === tab })}
                      onClick={() => setFilter(tab)}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            <div className="patients-container">
                {filteredCases.map((pCase) => (
                    pCase.patientProfile && (
                        <div 
                          key={pCase.id} 
                          className={cn('patient-item', { 'active': selectedCase?.id === pCase.id })}
                          onClick={() => handleSelectCase(pCase)}
                        >
                            <div className="patient-avatar">{pCase.patientProfile.name.split(' ').map(n => n[0]).join('')}</div>
                            <div className="patient-info">
                                <div className="patient-name">{pCase.patientProfile.name}</div>
                                <p className="patient-condition">Dermatology Case</p>
                                <p className="patient-time">{pCase.time}</p>
                            </div>
                            <div className="patient-status">
                                {statusMap[pCase.status] && <div className={cn('status-badge', statusMap[pCase.status].badgeClass)}>{statusMap[pCase.status].label}</div>}
                                {pCase.unread > 0 && <div className="unread-count">{pCase.unread}</div>}
                            </div>
                        </div>
                    )
                ))}
                 {filteredCases.length === 0 && !isLoading && (
                    <div className="text-center p-8 text-gray-500">
                        <Inbox size={32} className="mx-auto mb-2" />
                        <p>No {filter !== 'All' ? filter.toLowerCase() : ''} cases found.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Chat Panel */}
        {selectedCase && selectedCase.patientProfile ? (
          <div className="chat-panel">
            <div className="chat-header">
                <div className="chat-patient-info">
                    <div className="chat-avatar">{selectedCase.patientProfile.name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="chat-patient-details">
                        <h3 id="chat-patient-name">{selectedCase.patientProfile.name}</h3>
                        <p id="chat-patient-condition">Dermatology Case • Age: {selectedCase.patientProfile.age} • {selectedCase.patientProfile.gender}</p>
                    </div>
                </div>
                <div className="chat-actions">
                    <button className="action-btn btn-secondary"><FileText size={14}/> History</button>
                    <button className="action-btn btn-primary"><Phone size={14} /> Call</button>
                </div>
            </div>

            <div className="chat-messages">
                <div className="message-group fade-in">
                    <div className="message-date">{selectedCase.time}</div>
                    
                    <div className="ai-report">
                        <div className="report-header">
                            <div className="ai-badge"><Bot size={14} className="inline mr-1" /> AI GENERATED REPORT</div>
                            <div className="report-title">Dermatological Analysis</div>
                        </div>

                        <div className="patient-details-section">
                            <div className="details-grid">
                                <div className="detail-item">
                                    <div className="detail-label">Patient Name</div>
                                    <div className="detail-value">{selectedCase.patientProfile.name}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Age</div>
                                    <div className="detail-value">{selectedCase.patientProfile.age} years</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Gender</div>
                                    <div className="detail-value">{selectedCase.patientProfile.gender}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Region</div>
                                    <div className="detail-value">{selectedCase.patientProfile.region}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Skin Tone</div>
                                    <div className="detail-value">{selectedCase.patientProfile.skinTone}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Submitted</div>
                                    <div className="detail-value">{new Date((selectedCase.createdAt as any).seconds * 1000).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="symptoms-list">
                            <div className="symptoms-title">Reported Symptoms:</div>
                            <div className="symptoms-content">{selectedCase.aiReport.symptomInputs}</div>
                        </div>

                        <div className="image-analysis">
                            <div className="uploaded-image">
                                📸 Uploaded Skin Image<br />
                                <small>Click to view full image</small>
                            </div>
                        </div>

                        <div className="analysis-sections">
                             <div className="analysis-section">
                                <h4 className="section-title text-green-600">
                                    <Home size={18} /> Home Remedies Recommendation
                                </h4>
                                <div className="section-content whitespace-pre-wrap">
                                   {selectedCase.aiReport.homeRemedies}
                                </div>
                            </div>

                            <div className="analysis-section medical">
                                <h4 className="section-title text-amber-600">
                                    <Pill size={18} /> Medical Recommendation
                                </h4>
                                <div className="section-content whitespace-pre-wrap">
                                   {selectedCase.aiReport.medicalRecommendation}
                                </div>
                            </div>

                           {selectedCase.aiReport.doctorConsultationSuggestion && (
                             <div className="analysis-section consultation">
                                <h4 className="section-title text-red-600">
                                    <AlertTriangle size={18}/> Professional Consultation Required
                                </h4>
                                <div className="section-content">
                                    Based on the analysis, we recommend sharing this report with a doctor.
                                </div>
                            </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="doctor-response">
                <div className="response-header">
                    <h3 className="response-title">Your Professional Assessment</h3>
                    <div className="response-actions">
                        <button className="quick-action">✅ Approve AI Report</button>
                        <button className="quick-action active">✏️ Customize</button>
                        <button className="quick-action">❓ Request More Info</button>
                    </div>
                </div>

                <textarea className="response-editor" placeholder="Add your professional assessment, modifications, or additional recommendations..."></textarea>
                
                <div className="editor-toolbar">
                   <div className="file-upload">
                        <Paperclip size={16}/>
                        <span>Attach Prescription</span>
                   </div>
                   <button className="send-response">Send Assessment &rarr;</button>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-center">
            <div>
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">Select a patient case</h3>
              <p className="text-gray-500">Choose a case from the list to view details, or wait for new cases to arrive.</p>
            </div>
          </div>
        )}
    </div>
  );
}
