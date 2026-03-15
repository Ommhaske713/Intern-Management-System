"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

export default function ViewReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data);
      } catch (error) {
        toast.error("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId]);

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
           <p className="text-muted-foreground">Submitted on {format(new Date(report.submittedAt), 'PPP')}</p>
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

        {report.mentorFeedback && (
            <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle>Mentor Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-sm">{report.mentorFeedback}</p>
                </CardContent>
            </Card>
        )}
        
        <div className="md:col-span-2 flex justify-end">
            <Button variant="outline" onClick={() => router.back()}>Back to List</Button>
        </div>
      </div>
    </div>
  );
}