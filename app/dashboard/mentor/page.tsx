"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, FileStack, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface Intern {
  _id: string;
  name: string;
  email: string;
}

interface Batch {
  _id: string;
  name: string;
  startDate: string;
  internIds: Intern[];
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBatches = async () => {
      try {
        const res = await fetch("/api/dashboard/mentor/batches");
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
        }
      } catch (error) {
        console.error("Failed to load mentor dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBatches();
  }, []);

  const totalInterns = batches.reduce((acc, curr) => acc + curr.internIds.length, 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
        <p className="text-muted-foreground">Manage your assigned cohorts and interns.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Batches</CardTitle>
            <FileStack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{totalInterns}</div>
          </CardContent>
        </Card>
        <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-dashed">
           <Link href="/dashboard/tasks/create">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Assign New Task</CardTitle>
                <PlusCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">assign work to interns</div>
            </CardContent>
           </Link>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">My Active Batches</h3>
        {batches.length === 0 ? (
          <p className="text-gray-500 italic">You have not been assigned to any batches yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
             {batches.map((batch) => (
                <Card key={batch._id}>
                    <CardHeader>
                        <CardTitle>{batch.name}</CardTitle>
                        <CardDescription>Started {format(new Date(batch.startDate), "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Assigned Interns ({batch.internIds.length})</div>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                                {batch.internIds.map(intern => (
                                    <div key={intern._id} className="text-sm flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span>{intern.name}</span>
                                        <span className="text-xs text-gray-400">{intern.email}</span>
                                    </div>
                                ))}
                                {batch.internIds.length === 0 && <span className="text-xs text-gray-400">No interns yet</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}