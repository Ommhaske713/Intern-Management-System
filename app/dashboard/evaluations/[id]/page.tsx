"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Report {
    _id: string;
    weekNumber: number;
    submittedAt: string;
    workSummary: string;
    internId: { name: string };
}

interface Task {
    _id: string;
    title: string;
    status: string;
    deadline: string;
    assignedTo?: { name: string };
}

export default function CreateEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const internId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [existingEvaluation, setExistingEvaluation] = useState<any>(null);
  const [formData, setFormData] = useState({
    technicalScore: 0,
    communicationScore: 0,
    reliabilityScore: 0,
    qualitativeFeedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [internName, setInternName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, tasksRes, evalRes] = await Promise.all([
          fetch(`/api/reports?internId=${internId}`),
          fetch(`/api/tasks?assignedTo=${internId}`),
          fetch(`/api/evaluations?internId=${internId}`)
        ]);

        if (reportsRes.ok) {
            const data = await reportsRes.json();
            setReports(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0 && data[0].internId?.name) {
                setInternName(data[0].internId.name);
            }
        }
        
        if (tasksRes.ok) {
            const data = await tasksRes.json();
            setTasks(Array.isArray(data) ? data : []);
            if (!internName && Array.isArray(data) && data.length > 0 && data[0].assignedTo?.name) {
                 setInternName(prev => prev || data[0].assignedTo.name);
            }
        }

        if (evalRes.ok) {
            const data = await evalRes.json();
            if (data && data._id) {
                setExistingEvaluation(data);
                const tech = data.criteriaScores.find((c: any) => c.criteriaKey === 'TECHNICAL')?.score || 0;
                const comm = data.criteriaScores.find((c: any) => c.criteriaKey === 'COMMUNICATION')?.score || 0;
                const rel = data.criteriaScores.find((c: any) => c.criteriaKey === 'RELIABILITY')?.score || 0;
                
                setFormData({
                    technicalScore: tech,
                    communicationScore: comm,
                    reliabilityScore: rel,
                    qualitativeFeedback: data.qualitativeFeedback
                });
            }
        }
      } catch (error) {
        console.error("Failed to load intern data", error);
        toast.error("Failed to load intern contributions");
      } finally {
        setLoading(false);
      }
    };
    if (internId) fetchData();
  }, [internId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const criteriaScores = [
        { criteriaKey: "TECHNICAL", score: formData.technicalScore },
        { criteriaKey: "COMMUNICATION", score: formData.communicationScore },
        { criteriaKey: "RELIABILITY", score: formData.reliabilityScore },
      ];
      
      const weightedScore = (
        (formData.technicalScore * 0.5) + 
        (formData.communicationScore * 0.25) + 
        (formData.reliabilityScore * 0.25)
      );

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId,
          criteriaScores,
          finalWeightedScore: weightedScore,
          qualitativeFeedback: formData.qualitativeFeedback,
        }),
      });

      if (res.ok) {
        toast.success("Evaluation Submitted Successfully");
        router.push("/dashboard/evaluations");
      } else {
        const err = await res.json();
        toast.error("Failed to submit", { description: err.error });
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Final Performance Evaluation</h1>
        <p className="text-muted-foreground">
          Assessing performance for <span className="font-semibold text-foreground">{internName || "Intern"}</span>. Review their contributions below before grading.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Weekly Reports
                </CardTitle>
                <CardDescription>Submitted progress reports ({reports.length})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {reports.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No reports submitted.</p>
                ) : (
                    reports.map(report => (
                        <div key={report._id} className="border rounded p-3 text-sm">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold">Week {report.weekNumber}</span>
                                <span className="text-xs text-muted-foreground">{format(new Date(report.submittedAt), 'MMM d')}</span>
                            </div>
                            <p className="line-clamp-2 text-muted-foreground">{report.workSummary}</p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Assigned Tasks
                </CardTitle>
                <CardDescription>Task completion status ({tasks.length})</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No tasks assigned.</p>
                ) : (
                    tasks.map(task => (
                        <div key={task._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium text-sm line-clamp-1" title={task.title}>{task.title}</p>
                                <p className="text-xs text-muted-foreground">Deadline: {format(new Date(task.deadline), 'MMM d')}</p>
                            </div>
                            <Badge variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {task.status}
                            </Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Grading Form</h2>
            {existingEvaluation && (
                <Badge variant="default" className="text-sm bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Evaluation Completed on {format(new Date(existingEvaluation.evaluatedAt), 'PPP')}
                </Badge>
            )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Ratings (1-10)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Technical Skills (50% Weight)</label>
              <Input 
                type="number" min="1" max="10" 
                value={formData.technicalScore}
                onChange={e => setFormData({...formData, technicalScore: Number(e.target.value)})}
                required
                disabled={!!existingEvaluation}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">Code quality, problem solving, tool proficiency.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication (25% Weight)</label>
              <Input 
                type="number" min="1" max="10" 
                value={formData.communicationScore}
                onChange={e => setFormData({...formData, communicationScore: Number(e.target.value)})}
                required
                disabled={!!existingEvaluation}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">Clarity in reports, check-in responsiveness, teamwork.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reliability & Timeliness (25% Weight)</label>
              <Input 
                type="number" min="1" max="10" 
                value={formData.reliabilityScore}
                onChange={e => setFormData({...formData, reliabilityScore: Number(e.target.value)})}
                required
                disabled={!!existingEvaluation}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">Meeting deadlines, consistency in weekly updates.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualitative Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mentor Remarks *</label>
              <Textarea
                className="min-h-[150px]"
                placeholder="Detailed feedback on strengths, areas for improvement, and overall contribution..."
                value={formData.qualitativeFeedback}
                onChange={e => setFormData({...formData, qualitativeFeedback: e.target.value})}
                required
                disabled={!!existingEvaluation}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
             {existingEvaluation ? "Back to List" : "Cancel"}
          </Button>
          {!existingEvaluation && (
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Submit Evaluation
              </Button>
          )}
        </div>
      </form>
    </div>
  );
}