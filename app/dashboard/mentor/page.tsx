"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, FileStack, PlusCircle, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      totalInterns: 0,
      completionRate: 0,
      activeBatches: 0
  });

  // Review State
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, submissionsRes, statsRes] = await Promise.all([
          fetch("/api/dashboard/mentor/batches"),
          fetch("/api/dashboard/mentor/submissions"),
          fetch("/api/dashboard/mentor"),
        ]);

        if (batchesRes.ok) {
          const data = await batchesRes.json();
          setBatches(data);
        }
        if (submissionsRes.ok) {
            const data = await submissionsRes.json();
            setSubmissions(data);
        }
        if (statsRes.ok) {
            const data = await statsRes.json();
            setStats(data);
        }
      } catch (error) {
        console.error("Failed to load mentor dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchData();
  }, [session]);

  const pendingReviews = submissions.filter(s => s.reviewStatus === 'PENDING');

  const startReview = (id: string) => {
    setActiveReviewId(id);
    setFeedback("");
  };

  const cancelReview = () => {
    setActiveReviewId(null);
    setFeedback("");
  };

  const handleReview = async (status: 'APPROVED' | 'REWORK') => {
    if (!activeReviewId) return;
    setIsSubmitting(true);
    try {
        const response = await fetch(`/api/submissions/${activeReviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status,
                feedback
            }),
        });

        if (response.ok) {
            toast.success(`Submission ${status.toLowerCase()} successfully.`);
            setSubmissions(prev => prev.map(s => 
                s._id === activeReviewId ? { ...s, reviewStatus: status, feedback: feedback } : s
            ));
            cancelReview();
        } else {
            toast.error("Failed to update submission.");
        }
    } catch (error) {
        console.error("Error submitting review:", error);
        toast.error("An error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
        <p className="text-muted-foreground">Manage your assigned cohorts and reviews.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileStack className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{stats.totalInterns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{stats.completionRate}%</div>
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

        <Card className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border-dashed">
            <Link href="/dashboard/mentor/reports">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-600">Weekly Reports</CardTitle>
                    <ClipboardList className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">review intern progress</div>
                </CardContent>
            </Link>
        </Card>
      </div>

      <div className="max-w-4xl space-y-4">
        <h3 className="text-xl font-semibold">Pending Evaluations</h3>
        {pendingReviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">No pending submissions to review.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {pendingReviews.map((sub) => (
                    <Card key={sub._id} className="p-4 border">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{sub.taskId?.title}</h4>
                                <div className="text-sm text-gray-500">
                                    Submitted by <span className="font-medium text-gray-700">{sub.internId?.name} ({sub.internId?.email})</span> • {new Date(sub.submittedAt).toLocaleDateString()}
                                </div>
                                <div className="text-sm mt-1 bg-gray-50 p-2 rounded border">
                                    <span className="font-semibold text-gray-700">Explanation:</span> {sub.explanation}
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex gap-3">
                                <Link href={sub.proofLink} target="_blank" className="text-sm text-blue-600 hover:underline px-3 py-2">
                                    View Proof
                                </Link>
                                {activeReviewId !== sub._id && (
                                    <Button size="sm" variant="default" onClick={() => startReview(sub._id)}>
                                        Evaluate
                                    </Button>
                                )}
                            </div>
                        </div>

                        {activeReviewId === sub._id && (
                            <div className="mt-4 pt-4 border-t bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Review Submission</h4>
                                <Textarea 
                                    placeholder="Enter your feedback here..." 
                                    value={feedback} 
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="min-h-[100px] mb-4"
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" onClick={cancelReview} disabled={isSubmitting}>Cancel</Button>
                                    <Button 
                                        variant="outline" 
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" 
                                        onClick={() => handleReview('REWORK')}
                                        disabled={isSubmitting}
                                    >
                                        Request Changes
                                    </Button>
                                    <Button 
                                        onClick={() => handleReview('APPROVED')}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmitting}
                                    >
                                        Approve Submission
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
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