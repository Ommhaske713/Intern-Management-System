"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, User as UserIcon, Lock } from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  skills?: string[];
  image?: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setBio(data.bio || "");
        setSkills(data.skills ? data.skills.join(", ") : "");
        setImagePreview(data.image || "");
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let imageUrl = profile?.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
      }

      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          skills: skillsArray,
          image: imageUrl
        }),
      });

      if (res.ok) {
         const updated = await res.json();
         setProfile(updated);
         setImageFile(null);
         await update({ image: updated.image });
         toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                   <div className="flex flex-col items-center gap-4">
                      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-gray-100 dark:border-gray-800">
                         {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                         ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                               <UserIcon className="h-12 w-12" />
                            </div>
                         )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="image-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3">
                           <Upload className="mr-2 h-4 w-4" /> Change Photo
                        </Label>
                        <Input 
                           id="image-upload" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleImageChange}
                        />
                      </div>
                   </div>

                   <div className="flex-1 space-y-4">
                      <div className="grid gap-2">
                         <Label htmlFor="name">Full Name</Label>
                         <Input id="name" value={profile?.name || ""} disabled />
                         <p className="text-[0.8rem] text-muted-foreground">Name cannot be changed directly. Contact admin.</p>
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="email">Email</Label>
                         <Input id="email" value={profile?.email || ""} disabled />
                      </div>
                      <div className="grid gap-2">
                         <Label htmlFor="role">Role</Label>
                         <div className="flex gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                               {profile?.role}
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid gap-2">
                   <Label htmlFor="bio">Bio</Label>
                   <textarea
                      id="bio"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us a little bit about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                   />
                </div>

                <div className="grid gap-2">
                   <Label htmlFor="skills">Skills</Label>
                   <Input 
                      id="skills" 
                      placeholder="React, Next.js, TypeScript (comma separated)" 
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                   />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" form="profile-form" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password securely.</CardDescription>
            </CardHeader>
            <CardContent>
               <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-2">
                     <Label htmlFor="current-password">Current Password</Label>
                     <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="new-password">New Password</Label>
                     <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                     />
                  </div>
                  <div className="grid gap-2">
                     <Label htmlFor="confirm-password">Confirm New Password</Label>
                     <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                     />
                  </div>
               </form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
               <Button type="submit" form="password-form" variant="outline" disabled={passwordLoading}>
                  {passwordLoading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                     </>
                  ) : (
                     <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                     </>
                  )}
               </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="hidden md:block">
           <Card>
              <CardHeader>
                 <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Joined</span>
                       <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground">Status</span>
                       <span className="text-green-600 font-medium">Active</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}