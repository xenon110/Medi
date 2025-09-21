
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, CheckCircle, Pencil, Loader2, Inbox, XCircle, ThumbsUp, Search, Stethoscope, FileText, Edit3, MessageSquare, LayoutGrid, Calendar, Settings, User, Phone, MoreVertical, Star, Bot, Home, Pill, AlertTriangle } from 'lucide-react';
import { GenerateInitialReportOutput } from '@/ai/flows/generate-initial-report';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Dummy Data
const dummyPatients = [
  {
    id: 1,
    name: "Priya Sharma",
    avatarInitials: "PS",
    condition: "Skin Rash Analysis",
    time: "2 minutes ago",
    status: "Urgent",
    unread: 1,
    age: 28,
    gender: "Female",
    region: "Mumbai, India",
    skinTone: "Medium",
    submitted: "Today 2:43 PM",
    symptoms: "Patient reports itchy red rash on forearm for 3 days. Mild burning sensation. No fever. Applied aloe vera gel with temporary relief. Family history of eczema."
  },
  {
    id: 2,
    name: "Rahul Kumar",
    avatarInitials: "RK",
    condition: "Acne Treatment Follow-up",
    time: "15 minutes ago",
    status: "Pending",
    unread: 0,
    age: 22,
    gender: "Male",
    region: "Delhi, India",
    skinTone: "Light",
    submitted: "Today 2:30 PM",
    symptoms: "Following up on acne treatment. Still experiencing some breakouts on the chin area."
  },
  {
    id: 3,
    name: "Anjali Patel",
    avatarInitials: "AP",
    condition: "Mole Examination",
    time: "1 hour ago",
    status: "Pending",
    unread: 0,
    age: 35,
    gender: "Female",
    region: "Ahmedabad, India",
    skinTone: "Medium",
    submitted: "Today 1:45 PM",
    symptoms: "Concerned about a new mole on the back. It seems to have grown slightly in the last month."
  },
  {
    id: 4,
    name: "Vikram Singh",
    avatarInitials: "VS",
    condition: "Eczema Consultation",
    time: "3 hours ago",
    status: "Reviewed",
    unread: 0,
    age: 45,
    gender: "Male",
    region: "Jaipur, India",
    skinTone: "Medium",
    submitted: "Today 11:30 AM",
    symptoms: "Eczema flare-up on hands and elbows. Skin is very dry and cracked."
  },
  {
    id: 5,
    name: "Meera Reddy",
    avatarInitials: "MR",
    condition: "Psoriasis Treatment",
    time: "5 hours ago",
    status: "Urgent",
    unread: 2,
    age: 52,
    gender: "Female",
    region: "Hyderabad, India",
    skinTone: "Dark",
    submitted: "Today 9:00 AM",
    symptoms: "Psoriasis plaques are becoming more inflamed and spreading. Current treatment not effective."
  }
];

const aiReport = {
    patientName: "Priya Sharma",
    symptoms: ["Dark spot on arm", "Irregular borders", "Recent size increase"],
    aiAnalysis: "The AI analysis suggests this could be a concerning lesion that requires immediate dermatological evaluation. The irregular borders and recent growth pattern are notable findings.",
    recommendation: "Urgent dermatologist consultation recommended within 48 hours.",
    homeRemedies: "No home remedies recommended for this condition."
};


type Patient = typeof dummyPatients[0];

export default function DoctorDashboard() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(dummyPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0]);
  const [filter, setFilter] = useState('All');
  
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };
  
  const filteredPatients = patients.filter(p => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

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
                <p className="text-sm text-gray-500">{patients.filter(p => p.status === 'Pending' || p.status === 'Urgent').length} pending reviews</p>
            </div>

            <div className="search-bar">
                <Search className="search-icon" size={18} />
                <input type="text" className="search-input" placeholder="Search patients..." />
            </div>

            <div className="filter-tabs">
                {['All', 'Pending', 'Urgent'].map(tab => (
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
                {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={cn('patient-item', { 'active': selectedPatient?.id === patient.id })}
                      onClick={() => handleSelectPatient(patient)}
                    >
                        <div className="patient-avatar">{patient.avatarInitials}</div>
                        <div className="patient-info">
                            <div className="patient-name">{patient.name}</div>
                            <p className="patient-condition">{patient.condition}</p>
                            <p className="patient-time">{patient.time}</p>
                        </div>
                        <div className="patient-status">
                            {patient.status === 'Urgent' && <div className="status-badge status-urgent">Urgent</div>}
                            {patient.status === 'Pending' && <div className="status-badge status-pending">Pending</div>}
                            {patient.status === 'Reviewed' && <div className="status-badge status-reviewed">Reviewed</div>}
                            {patient.unread > 0 && <div className="unread-count">{patient.unread}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Panel */}
        {selectedPatient ? (
          <div className="chat-panel">
            <div className="chat-header">
                <div className="chat-patient-info">
                    <div className="chat-avatar">{selectedPatient.avatarInitials}</div>
                    <div className="chat-patient-details">
                        <h3 id="chat-patient-name">{selectedPatient.name}</h3>
                        <p id="chat-patient-condition">{selectedPatient.condition} • Age: {selectedPatient.age} • {selectedPatient.gender}</p>
                    </div>
                </div>
                <div className="chat-actions">
                    <button className="action-btn btn-secondary"><FileText size={14}/> History</button>
                    <button className="action-btn btn-primary"><Phone size={14} /> Call</button>
                </div>
            </div>

            <div className="chat-messages">
                <div className="message-group fade-in">
                    <div className="message-date">Today, 2:45 PM</div>
                    
                    <div className="ai-report">
                        <div className="report-header">
                            <div className="ai-badge"><Bot size={14} className="inline mr-1" /> AI GENERATED REPORT</div>
                            <div className="report-title">Dermatological Analysis</div>
                        </div>

                        <div className="patient-details-section">
                            <div className="details-grid">
                                <div className="detail-item">
                                    <div className="detail-label">Patient Name</div>
                                    <div className="detail-value">{selectedPatient.name}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Age</div>
                                    <div className="detail-value">{selectedPatient.age} years</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Gender</div>
                                    <div className="detail-value">{selectedPatient.gender}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Region</div>
                                    <div className="detail-value">{selectedPatient.region}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Skin Tone</div>
                                    <div className="detail-value">{selectedPatient.skinTone}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Submitted</div>
                                    <div className="detail-value">{selectedPatient.submitted}</div>
                                </div>
                            </div>
                        </div>

                        <div className="symptoms-list">
                            <div className="symptoms-title">Reported Symptoms:</div>
                            <div className="symptoms-content">{selectedPatient.symptoms}</div>
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
                                <div className="section-content">
                                    <strong>Recommended treatments:</strong><br />
                                    • Apply cool, damp cloth for 10-15 minutes twice daily<br />
                                    • Use fragrance-free moisturizer 3 times daily<br />
                                    • Avoid hot showers and harsh soaps<br />
                                    • Consider oatmeal baths for soothing relief<br />
                                    <br />
                                    <strong>Duration:</strong> Monitor for 48-72 hours. If symptoms persist or worsen, seek medical attention.
                                </div>
                            </div>

                            <div className="analysis-section medical">
                                <h4 className="section-title text-amber-600">
                                    <Pill size={18} /> Medical Recommendation
                                </h4>
                                <div className="section-content">
                                    <strong>Preliminary Assessment:</strong> Contact dermatitis (probable)<br />
                                    <strong>Confidence Level:</strong> 78%<br />
                                    <br />
                                    <strong>Suggested approach:</strong><br />
                                    • Topical corticosteroid (mild strength) if available<br />
                                    • Antihistamine for itch relief<br />
                                    • Identify and avoid potential allergens<br />
                                    • Document any new exposures in past week
                                </div>
                            </div>

                            <div className="analysis-section consultation">
                                <h4 className="section-title text-red-600">
                                    <AlertTriangle size={18}/> Professional Consultation Required
                                </h4>
                                <div className="section-content">
                                    <strong>Recommendation:</strong> Dermatologist consultation recommended<br />
                                    <br />
                                    <strong>Reasons:</strong><br />
                                    • Rash persisting beyond typical timeline<br />
                                    • Family history suggests possible chronic condition<br />
                                    • Professional assessment needed for accurate diagnosis<br />
                                    • May require patch testing for allergen identification
                                </div>
                            </div>
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
              <h3 className="text-xl font-semibold text-gray-700">Select a patient</h3>
              <p className="text-gray-500">Choose a case from the list to view details.</p>
            </div>
          </div>
        )}
    </div>
  );
}
