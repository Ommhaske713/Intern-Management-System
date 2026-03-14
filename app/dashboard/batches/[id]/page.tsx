"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Batch {
  _id: string;
  name: string;
  startDate: string;
  durationInWeeks: number;
  mentorIds: User[];
  internIds: User[];
}

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interns" | "mentors">("interns");

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userRoleToAdd, setUserRoleToAdd] = useState<"MENTOR" | "INTERN">("INTERN");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  
  useEffect(() => {
    fetchBatch();
  }, [params.id]);

  const fetchBatch = async () => {
    try {
      const res = await fetch(`/api/batches/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBatch(data);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to load batch");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", { userRoleToAdd, newUserEmail, newUserName });

    try {
      const res = await fetch(`/api/batches/${params.id}/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userRoleToAdd,
          email: newUserEmail,
          name: newUserName,
        }),
      });

      if (res.ok) {
        toast.success(`${userRoleToAdd} added successfully`);
        setNewUserEmail("");
        setNewUserName("");
        setIsAddingUser(false);
        fetchBatch();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add user");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!batch) return <div>Batch not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{batch.name}</h2>
          <p className="text-gray-500">
            Starts {format(new Date(batch.startDate), "PPP")} • {batch.durationInWeeks} Weeks
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'interns' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('interns')}
          >
            Interns ({batch.internIds.length})
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'mentors' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('mentors')}
          >
            Mentors ({batch.mentorIds.length})
          </button>
        </div>

        {activeTab === 'interns' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Interns</CardTitle>
                <Button onClick={() => { setUserRoleToAdd("INTERN"); setIsAddingUser(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Intern
                </Button>
              </CardHeader>
              <CardContent>
                {batch.internIds.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No interns in this batch yet.</p>
                ) : (
                  <div className="space-y-2">
                    {batch.internIds.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {user.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mentors</CardTitle>
                <Button onClick={() => { setUserRoleToAdd("MENTOR"); setIsAddingUser(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Mentor
                </Button>
              </CardHeader>
              <CardContent>
                {batch.mentorIds.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No mentors assigned to this batch.</p>
                ) : (
                  <div className="space-y-2">
                    {batch.mentorIds.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {user.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {isAddingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
             <div className="p-6 border-b">
                <h3 className="text-lg font-bold">Add {userRoleToAdd === "INTERN" ? "Intern" : "Mentor"}</h3>
             </div>
             <div className="p-6">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                            value={newUserName} 
                            onChange={(e) => setNewUserName(e.target.value)} 
                            required 
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                            type="email"
                            value={newUserEmail} 
                            onChange={(e) => setNewUserEmail(e.target.value)} 
                            required 
                            placeholder="john@company.com"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddingUser(false)}>Cancel</Button>
                        <Button type="submit">Invite User</Button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}