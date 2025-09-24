
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Loader2, User, MessageSquare, LayoutGrid, Settings, FileText, LogOut, Check, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { DoctorProfile, getUserProfile, saveDoctorNote, getDoctorNotesForMonth, DoctorNote } from '@/lib/firebase-services';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { format, getYear, getMonth } from 'date-fns';

export default function DoctorCalendar() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({}); // Store notes as { 'YYYY-MM-DD': 'note text' }
  const [isSaving, setIsSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push('/login?role=doctor');
      return;
    }
    
    setIsLoading(true);
    getUserProfile(currentUser.uid).then(profile => {
      if (profile && profile.role === 'doctor') {
        setDoctorProfile(profile as DoctorProfile);
      }
      setIsLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedDate || !doctorProfile) return;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setNote(notes[dateKey] || '');
  }, [selectedDate, notes, doctorProfile]);

  useEffect(() => {
    if (!doctorProfile) return;

    const fetchNotes = async () => {
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      const fetchedNotes = await getDoctorNotesForMonth(doctorProfile.uid, year, month);
      const notesMap = fetchedNotes.reduce((acc, n) => {
        acc[n.date] = n.note;
        return acc;
      }, {} as Record<string, string>);
      setNotes(notesMap);
    };

    fetchNotes();
  }, [doctorProfile, currentMonth]);

  const handleSignOut = async () => {
    if (auth) {
        await auth.signOut();
        toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
        router.push('/login?role=doctor');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedDate || !doctorProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'No date selected or user not found.' });
      return;
    }
    setIsSaving(true);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    try {
      await saveDoctorNote(doctorProfile.uid, dateKey, note);
      setNotes(prev => ({...prev, [dateKey]: note}));
      toast({ title: 'Note Saved', description: `Your note for ${format(selectedDate, 'PPP')} has been saved.` });
    } catch (error) {
      console.error("Failed to save note:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save your note.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarNavItems = [
    { href: '/doctor/dashboard', icon: MessageSquare, title: 'Patient Cases' },
    { href: '/doctor/analytics', icon: LayoutGrid, title: 'Analytics' },
    { href: '/doctor/calendar', icon: CalendarIcon, title: 'Calendar' },
    { href: '#', icon: FileText, title: 'Documents' },
    { href: '/doctor/settings', icon: Settings, title: 'Settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Calendar...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
            <Link href="/doctor/dashboard" className="logo-sidebar">M</Link>
            <nav className="sidebar-nav">
               {sidebarNavItems.map(item => (
                  <Link href={item.href} key={item.title} className={cn('nav-item', { active: pathname === item.href })} title={item.title}>
                      <item.icon size={24} />
                  </Link>
               ))}
            </nav>
            <div className="flex flex-col gap-2 items-center mt-auto">
                <Link href="/doctor/profile" className="user-profile" title="Dr. Profile">
                  <User size={24} />
                </Link>
                 <button onClick={handleSignOut} className="nav-item !w-10 !h-10" title="Sign Out">
                    <LogOut size={22} />
                </button>
            </div>
        </div>

        {/* Main Calendar Panel */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
             <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
                    <p className="text-gray-500">Manage your schedule and personal notes.</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Calendar View */}
                  <Card className="lg:col-span-2 rounded-xl">
                    <CardContent className="p-2 md:p-6">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        onMonthChange={setCurrentMonth}
                        className="w-full"
                        classNames={{
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                          day_today: "bg-accent/50 text-accent-foreground",
                        }}
                        components={{
                            DayContent: ({ date, ...props }) => {
                                const dateKey = format(date, 'yyyy-MM-dd');
                                const hasNote = !!notes[dateKey];
                                return (
                                    <div className="relative w-full h-full flex items-center justify-center">
                                      {props.children}
                                      {hasNote && <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                                    </div>
                                );
                            }
                        }}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Notes Section */}
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle>Notes for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
                      <CardDescription>Add or edit your private notes for the selected day.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Write your notes here..."
                        className="min-h-[300px] text-base"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={!selectedDate}
                      />
                      <Button onClick={handleSaveNote} disabled={isSaving || !selectedDate} className="w-full mt-4">
                        {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Note
                      </Button>
                    </CardContent>
                  </Card>
                </div>
            </div>
        </div>
    </div>
  );
}
