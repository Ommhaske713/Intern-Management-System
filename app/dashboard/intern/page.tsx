"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ClipboardCheck, Calendar, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  assignedBy: { name: string };
  assignedTo: string;
  priority: string;
  requiredProofType: string;
}

interface Submission {
    _id: string;
    reviewStatus: string;
    submittedAt: string;
}

interface TaskWithStatus {
    task: Task;
    submission: Submission | null;
}

interface Evaluation {
  _id: string;
  batchId: string;
  finalWeightedScore: number;
  qualitativeFeedback: string;
  evaluatedAt: string;
}

interface Certificate {
    _id: string;
    createdAt: string;
}

export default function InternDashboard() {
  const { data: session } = useSession();
  const [taskData, setTaskData] = useState<TaskWithStatus[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, evalRes, certRes] = await Promise.all([
          fetch("/api/tasks?includeStatus=true"),
          fetch("/api/evaluations"),
          fetch("/api/certificates")
        ]);

        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTaskData(data);
        }
        
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          if (Array.isArray(evalData) && evalData.length > 0) {
             setEvaluation(evalData[0]);
          }
        }

        if (certRes.ok) {
            const certData = await certRes.json();
            if (certData && certData._id) {
                setCertificate(certData);
            }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchData();
  }, [session]);

  const handleDownloadCertificate = async () => {
      if (certificate) {
          window.open(`/api/certificates/${certificate._id}/download`, '_blank');
          return;
      }

      if (!evaluation || !session?.user) return;
      setDownloadingCert(true);
      try {
          const res = await fetch('/api/certificates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  internId: session.user.id,
                  batchId: evaluation.batchId,
                  evaluationId: evaluation._id
              })
          });
          
          if (!res.ok) throw new Error("Failed to generate certificate");
          const newCert = await res.json();
          setCertificate(newCert);

          window.open(`/api/certificates/${newCert._id}/download`, '_blank');
          toast.success("Certificate downloaded!");
      } catch (error) {
          toast.error("Could not download certificate. Please contact your mentor.");
      } finally {
          setDownloadingCert(false);
      }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Intern Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and submit deliverables.</p>
      </div>

      {certificate ? (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-100 border-blue-200">
           <CardHeader>
             <CardTitle className="text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> Certificate Available!
             </CardTitle>
             <CardDescription className="text-blue-700">
               Congratulations! Your internship certificate is ready for download.
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Button 
                onClick={handleDownloadCertificate} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Download className="mr-2 h-4 w-4" /> Download Certificate
            </Button>
           </CardContent>
        </Card>
      ) : evaluation && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200">
           <CardHeader>
             <CardTitle className="text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> Internship Completed!
             </CardTitle>
             <CardDescription className="text-emerald-700">
               Your final evaluation is available.
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="text-lg font-semibold text-emerald-900">
                       Final Score: {(evaluation.finalWeightedScore ?? 0).toFixed(1)} / 10
                    </div>
                    <p className="text-emerald-800 italic">"{evaluation.qualitativeFeedback || "No feedback provided."}"</p>
                    <div className="text-sm text-emerald-600">
                       Evaluated on {evaluation.evaluatedAt ? format(new Date(evaluation.evaluatedAt), 'PPP') : 'N/A'}
                    </div>
                </div>
                
                <div className="pt-2">
                    <Button 
                        onClick={handleDownloadCertificate} 
                        disabled={downloadingCert}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {downloadingCert ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Download Certificate
                            </>
                        )}
                    </Button>
                </div>
             </div>
           </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">
                {taskData.filter(t => !t.submission || t.submission.reviewStatus === 'REWORK').length}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">My Assignments</h3>
        {taskData.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
             <p className="text-gray-500">You have no pending tasks assigned at the moment.</p>
             <p className="text-sm text-gray-400 mt-2">Check back later or contact your mentor.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {taskData.map(({ task, submission }) => {
              const isCompleted = submission?.reviewStatus === 'APPROVED';
              const isSubmitted = !!submission;
              const isRework = submission?.reviewStatus === 'REWORK';
              
              return (
              <Card key={task._id} className={`flex flex-col ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1" title={task.title}>{task.title}</CardTitle>
                    {isCompleted ? (
                        <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
                    ) : isRework ? (
                        <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700">Needs Rework</Badge>
                    ) : isSubmitted ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Review</Badge>
                    ) : (
                        task.priority && (
                        <Badge variant={task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "default" : "secondary"} className="text-[10px]">
                            {task.priority}
                        </Badge>
                        )
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                     <Calendar className="h-3 w-3" /> Due {format(new Date(task.deadline), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {task.requiredProofType && (
                    <div className="mb-2">
                      <span className="text-[10px] font-medium bg-secondary px-2 py-1 rounded text-secondary-foreground">
                        {task.requiredProofType.replace(/_/g, " ")} Required
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">{task.description}</p>
                  
                  {submission && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                          <p className="font-medium">Recent Submission:</p>
                          <p className="text-gray-500">Submitted on {format(new Date(submission.submittedAt), 'MMM d')}</p>
                          {isRework && <p className="text-red-500 font-medium mt-1">Status: Needs Rework</p>}
                      </div>
                  )}

                  <div className="text-xs text-gray-400 border-t pt-2 mt-2">
                    Mentored by: <span className="font-medium text-gray-600">{task.assignedBy?.name || "System"}</span>
                  </div>
                </CardContent>
                <CardFooter>
                   {isCompleted ? (
                       <Button className="w-full" variant="outline" disabled>
                           <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Done
                       </Button>
                   ) : (
                       <Link href={`/dashboard/tasks/${task._id}/submit`} className="w-full">
                          <Button className={`w-full ${isRework ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isRework ? 'Resubmit Work' : isSubmitted ? 'Update Submission' : 'Submit Work'}
                          </Button>
                       </Link>
                   )}
                </CardFooter>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}