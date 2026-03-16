"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function DemoTestPage() {

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [nPassword, setNPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch("/api/dashboard/analytics");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Status: ${res.status}`);
      }
      const data = await res.json();
      setAnalyticsData(data);
      toast.success("Analytics data fetched");
    } catch (error: any) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfileData(data);
      setBio(data.bio || "");
      setSkills(data.skills?.join(", ") || "");
      toast.success("Profile data loaded");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const updateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
        const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bio, skills: skillsArray }),
        });
        
        if (!res.ok) throw new Error("Update failed");
        
        const updated = await res.json();
        setProfileData(updated);
        toast.success("Profile updated via API");
    } catch (error) {
        toast.error("Failed to update profile");
    } finally {
        setIsUpdatingProfile(false);
    }
  };

  const changePassword = async () => {
      if (!currentPassword || !nPassword) {
            toast.warning("Please fill password fields");
            return;
      }
      setIsChangingPassword(true);
      try {
          const res = await fetch("/api/profile/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  currentPassword,
                  newPassword: nPassword
              }),
          });
          
          const data = await res.json();
          if (res.ok) {
              toast.success("Password change endpoint returned 200 OK");
              setCurrentPassword("");
              setNPassword("");
          } else {
              toast.error(`Error: ${data.error}`);
          }
      } catch (error) {
          toast.error("Request failed");
      } finally {
          setIsChangingPassword(false);
      }
  };

  return (
    <div className="container mx-auto p-8 space-y-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">1</div>
                Analytics API
            </h2>
            <Card>
                <CardHeader>
                    <CardTitle>Fetch Analytics Data</CardTitle>
                    <CardDescription>
                        GET /api/dashboard/analytics
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={fetchAnalytics} disabled={loadingAnalytics}>
                        {loadingAnalytics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {analyticsData ? "Refresh Data" : "Fetch Data"}
                    </Button>

                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[400px] text-xs font-mono">
                        {analyticsData ? (
                            <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
                        ) : (
                            <div className="text-slate-500 italic">No data fetched yet...</div>
                        )}
                    </div>

                    {analyticsData && (
                        <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                            <h4 className="font-semibold mb-2">Parsed Summary:</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Tasks: {analyticsData.taskDistribution?.length || 0} categories</li>
                                <li>Submissions Trend: {analyticsData.submissionTrends?.length || 0} data points</li>
                                <li>Batches: {analyticsData.batchPerformance?.length || 0} batches tracked</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">2</div>
                Profile Management API
            </h2>
            
            <Card>
                <CardHeader>
                    <CardTitle>Current Profile (GET)</CardTitle>
                    <CardDescription>GET /api/profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                         <Button variant="outline" size="sm" onClick={fetchProfile} disabled={loadingProfile}>
                            <RefreshCw className={`mr-2 h-3 w-3 ${loadingProfile ? 'animate-spin' : ''}`} />
                            Load Profile
                        </Button>
                    </div>

                    {profileData && (
                        <div className="grid gap-2 text-sm border p-3 rounded-md">
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{profileData.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Email:</span>
                                <span>{profileData.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Role:</span>
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{profileData.role}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Update Profile (PATCH)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Bio</Label>
                        <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Enter bio..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Skills (comma separated)</Label>
                        <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node..." />
                    </div>
                    <Button onClick={updateProfile} disabled={isUpdatingProfile || !profileData}>
                        {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Test Update
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password (POST)</CardTitle>
                    <CardDescription>Requires valid current password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input 
                        type="password" 
                        placeholder="Current Password" 
                        value={currentPassword} 
                        onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <Input 
                        type="password" 
                        placeholder="New Password" 
                        value={nPassword} 
                        onChange={e => setNPassword(e.target.value)}
                    />
                    <Button variant="destructive" onClick={changePassword} disabled={isChangingPassword}>
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Test Change Password
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}