"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Report {
  _id: string;
  internId: { name: string; email: string };
  weekNumber: number;
  submittedAt: string;
  tasksWorkingOn: { title: string; status: string }[];
  workSummary: string;
  challengesFaced: string;
  learnings: string;
  mentorFeedback?: string;
  status: string;
}

export default function ReviewReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data);
        if (data.mentorFeedback) {
            setFeedback(data.mentorFeedback);
        }
      } catch (error) {
        toast.error("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorFeedback: feedback,
          status: "REVIEWED",
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      
      toast.success("Feedback submitted successfully");
      router.push("/dashboard/mentor/reports");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return <div className="text-center p-10">Report not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Week {report.weekNumber} Report</h2>
           <p className="text-muted-foreground">Submitted by {report.internId?.name} on {format(new Date(report.submittedAt), 'PPP')}</p>
        </div>
        <Badge variant={report.status === 'REVIEWED' ? 'default' : 'secondary'}>
            {report.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Work Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{report.workSummary}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Challenges Faced</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{report.challengesFaced}</p>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Key Learnings</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-wrap">{report.learnings}</p>
            </CardContent>
        </Card>
      
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Tasks Worked On</CardTitle>
            </CardHeader>
            <CardContent>
                {report.tasksWorkingOn?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                        {report.tasksWorkingOn.map((task: any) => (
                            <li key={task._id}>
                                {task.title} <span className="text-xs text-muted-foreground">({task.status})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground italic">No specific tasks linked.</p>
                )}
            </CardContent>
        </Card>

        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle>Mentor Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Provide constructive feedback, suggestions, or acknowledgement..."
                    className="min-h-[120px]"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {report.status === 'REVIEWED' ? 'Update Feedback' : 'Submit Review'}
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
