'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Video, Download, Edit, CheckCircle, Clock, Calendar } from 'lucide-react';
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Navbar } from '@/components/layout/Navbar';

const CountUpStat = ({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) => {
  const countValue = useMotionValue(0);
  const rounded = useTransform(countValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(countValue, end, {
      duration: 2.5,
      ease: "easeOut",
      delay: 1,
    });
    return controls.stop;
  }, [countValue, end]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-accent">
        <motion.span>{rounded}</motion.span>{suffix}
      </div>
      <div className="text-sm text-primary-foreground/70 mt-1">{label}</div>
    </div>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    phone: "",
    university: "",
    course: "",
    year: "",
    date_of_birth: null as Date | null,
    bio: "",
    linkedin: "",
    profile_picture: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const minimumDelay = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const userRes = await api.get("/api/student/profile");
        const data = userRes.data;
        setUser(data);

        // Sync with Navbar on load
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("userUpdated"));

        const dob = data.date_of_birth ? new Date(data.date_of_birth) : null;

        setProfileForm({
          phone: data.phone || "",
          university: data.university || "",
          course: data.course || "",
          year: data.year || "",
          date_of_birth: dob,
          bio: data.bio || "",
          linkedin: data.linkedin || "",
          profile_picture: null,
        });

        if (data.profile_picture) {
          setPreviewUrl(data.profile_picture);
        }

        const internRes = await api.get("/api/student/internships");
        setInternships(internRes.data);

        const mentorRes = await api.get("/api/student/mentorships");
        setMentorships(mentorRes.data);

        await minimumDelay;
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("phone", profileForm.phone || "");
    formData.append("university", profileForm.university || "");
    formData.append("course", profileForm.course || "");
    formData.append("year", profileForm.year || "");
    formData.append("bio", profileForm.bio || "");
    formData.append("linkedin", profileForm.linkedin || "");

    if (profileForm.date_of_birth) {
      formData.append("date_of_birth", profileForm.date_of_birth.toISOString().split("T")[0]);
    }

    if (profileForm.profile_picture) {
      formData.append("profile_picture", profileForm.profile_picture);
    }

    try {
      const res = await api.post("/api/student/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user;
      setUser(updatedUser);

      const dob = updatedUser.date_of_birth ? new Date(updatedUser.date_of_birth) : null;
      setProfileForm(prev => ({ ...prev, ...updatedUser, date_of_birth: dob, profile_picture: null }));

      setPreviewUrl(updatedUser.profile_picture || null);

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreview = URL.createObjectURL(file);
      setPreviewUrl(newPreview);
      setProfileForm({ ...profileForm, profile_picture: file });
    }
  };

  const profileCompletion = () => {
    if (!user) return 0;
    const required = ["phone", "university", "course", "year", "bio"];
    const filled = required.filter(key => user[key]?.toString().trim());
    return Math.round((filled.length / required.length) * 100);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-primary-foreground/80">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-foreground blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-[10%] w-80 h-80 rounded-full bg-foreground blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10">
        <section className="pt-24 lg:pt-32 pb-12 gradient-hero">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
              >
                Welcome back,{" "}
                <span className="relative inline-block">
                  <span className="text-accent">{user?.first_name || "Student"}</span>
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </span>
                !
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-primary-foreground/80 text-lg"
              >
                Here's what's happening with your career journey — stay on top of your applications, sessions, and profile.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
                <CardContent className="pt-6 text-center">
                  <Briefcase className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <CountUpStat
                    end={internships.filter(b => b.status === 'pending').length}
                    label="Pending Applications"
                  />
                  <div className="mt-2 text-sm text-foreground/60">
                    {internships.filter(b => b.status === 'approved').length} approved
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
                <CardContent className="pt-6 text-center">
                  <Video className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <CountUpStat
                    end={mentorships.filter(s => new Date(s.scheduled_at) > new Date()).length}
                    label="Upcoming Sessions"
                  />
                  <div className="mt-2 text-sm text-foreground/60">
                    Next: {mentorships[0]?.scheduled_at
                      ? new Date(mentorships[0].scheduled_at).toLocaleDateString()
                      : "None"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="bg-secondary/50 border border-border/50 p-1 rounded-xl">
              <TabsTrigger value="profile">My Profile</TabsTrigger>
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                <CardHeader>
                  <CardTitle className="text-2xl">My Profile</CardTitle>
                  <CardDescription>Keep your information up to date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile Completion</span>
                      <span className="text-accent font-medium">{profileCompletion()}%</span>
                    </div>
                    <Progress value={profileCompletion()} className="h-3" />
                  </div>

                  <div className="w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
                      <div className="relative mx-auto md:mx-0">
                        <div className="relative">
                          <Avatar className="w-32 h-32 border-4 border-accent/30 shadow-xl">
                            <AvatarImage 
                              src={previewUrl || "/default-avatar.png"} 
                              alt="Profile" 
                              className="object-cover"
                            />
                            <AvatarFallback className="text-4xl bg-accent/20">
                              {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <label className="absolute bottom-0 right-0 bg-accent text-accent-foreground p-2 rounded-full cursor-pointer hover:bg-accent/90 transition-colors shadow-lg">
                            <Edit className="w-5 h-5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                        </div>

                        {profileForm.profile_picture && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Selected: {profileForm.profile_picture.name}
                          </p>
                        )}
                      </div>

                      <div className="w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label>First Name</Label>
                            <Input value={user?.first_name || ""} disabled className="bg-secondary/50 mt-1" />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input value={user?.last_name || ""} disabled className="bg-secondary/50 mt-1" />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input value={user?.email || ""} disabled className="bg-secondary/50 mt-1" />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={profileForm.phone}
                              onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>University / Institution</Label>
                            <Input
                              value={profileForm.university}
                              onChange={e => setProfileForm({ ...profileForm, university: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Course</Label>
                            <Input
                              value={profileForm.course}
                              onChange={e => setProfileForm({ ...profileForm, course: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Level / Year</Label>
                            <Input
                              value={profileForm.year || ""}
                              onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                              className="mt-1"
                              placeholder="e.g. Level 300 / 3rd Year"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Date of Birth</Label>
                          <div className="relative mt-1">
                            <DatePicker
                              selected={profileForm.date_of_birth}
                              onChange={(date: Date | null) => setProfileForm({ ...profileForm, date_of_birth: date })}
                              dateFormat="yyyy-MM-dd"
                              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 15))}
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={100}
                              placeholderText="Select your date of birth"
                              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              calendarClassName="bg-card border border-border shadow-lg rounded-md"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Bio / About Me</Label>
                          <Textarea
                            value={profileForm.bio}
                            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                            rows={4}
                            className="mt-1"
                            placeholder="Tell us a bit about yourself, your interests, and career goals..."
                          />
                        </div>

                        <div>
                          <Label>LinkedIn</Label>
                          <Input
                            value={profileForm.linkedin}
                            onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/yourname"
                            className="mt-1"
                          />
                        </div>

                        <Button
                          variant="accent"
                          size="lg"
                          className="w-full md:w-auto"
                          onClick={handleProfileUpdate}
                        >
                          Save Profile Changes
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* <div className="border-t pt-8">
                    <h3 className="text-xl font-semibold mb-6">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label>Current Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label>Confirm New Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                    </div>
                    <Button className="mt-6" variant="outline">Update Password</Button>
                  </div> */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Internships Tab */}
            <TabsContent value="internships">
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-accent" />
                    My Internship Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {internships.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                      <p className="text-muted-foreground mb-6">Start exploring internships and apply today!</p>
                      <Button variant="accent" onClick={() => navigate("/internships")}>
                        Browse Internships
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {internships.map((app) => (
                            <TableRow key={app.id} className="hover:bg-secondary/30 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  {app.company?.logo && (
                                    <img src={`/${app.company.logo}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  )}
                                  {app.company?.name || "Company Name"}
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(app.applied_at)}</TableCell>
                              <TableCell>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(app.status)}`}>
                                  {app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || "Unknown"}
                                </span>
                              </TableCell>
                              <TableCell>
                                {app.status === "paid" ? (
                                  <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Paid
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">View Details</Button>
                                  {app.status === "paid" && (
                                    <Button variant="ghost" size="sm">
                                      <Download className="w-4 h-4 mr-1" /> Receipt
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mentorship Tab */}
            <TabsContent value="mentorship">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-accent" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {mentorships.filter(s => new Date(s.scheduled_at) > new Date()).length === 0 ? (
                      <div className="text-center py-10">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                        <Button variant="accent" onClick={() => navigate("/mentorship")}>
                          Book a Session
                        </Button>
                      </div>
                    ) : (
                      mentorships
                        .filter(s => new Date(s.scheduled_at) > new Date())
                        .map((session) => (
                          <div key={session.id} className="p-6 bg-secondary/30 rounded-xl border border-accent/10 hover:border-accent/30 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                {session.mentor?.image ? (
                                  <img
                                    src={session.mentor.image}
                                    alt="Mentor"
                                    className="w-14 h-14 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-2xl">
                                    👤
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold">{session.mentor?.name || "Mentor"}</h4>
                                  <p className="text-sm text-muted-foreground">{session.topic_description?.substring(0, 60)}...</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-accent/10 text-accent">
                                {new Date(session.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </Badge>
                            </div>
                            {session.google_meet_link && (
                              <Button
                                variant="default"
                                size="sm"
                                className="mt-4 bg-accent hover:bg-accent/90"
                                asChild
                              >
                                <a href={session.google_meet_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </a>
                              </Button>
                            )}
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-accent" />
                      Past Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mentorships.filter(s => new Date(s.scheduled_at) <= new Date()).length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        No past sessions yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mentorships
                          .filter(s => new Date(s.scheduled_at) <= new Date())
                          .map((session) => (
                            <div key={session.id} className="p-5 bg-secondary/20 rounded-xl flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{session.mentor?.name || "Mentor"}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.scheduled_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}