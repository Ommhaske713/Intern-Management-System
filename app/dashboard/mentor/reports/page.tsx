"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface Report {
  _id: string;
  internId: { name: string; email: string };
  weekNumber: number;
  submittedAt: string;
  tasksWorkingOn: { title: string }[];
  workSummary: string;
}

export default function MentorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (error) {
        console.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Intern Weekly Reports</h2>
        <p className="text-muted-foreground">Review progress and ensure consistency across the batch.</p>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No reports found for your batch.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Link href={`/dashboard/mentor/reports/${report._id}`} key={report._id}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                   <div>
                     <CardTitle className="text-lg">Week {report.weekNumber}</CardTitle>
                     <CardDescription>{report.internId?.name || "Unknown Intern"}</CardDescription>
                   </div>
                   <span className="text-xs text-muted-foreground">{format(new Date(report.submittedAt), 'MMM d')}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                   <p className="text-sm font-medium">Summary:</p>
                   <p className="text-sm text-gray-500 line-clamp-3">{report.workSummary}</p>
                </div>
                
                <div className="text-sm font-medium mb-1 mt-3">Linked Tasks:</div>
                {report.tasksWorkingOn?.length > 0 ? (
                   <div className="flex flex-wrap gap-1">
                     {report.tasksWorkingOn.slice(0, 3).map((t, idx) => (
                       <span key={idx} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                         {t.title}
                       </span>
                     ))}
                     {report.tasksWorkingOn.length > 3 && <span className="text-[10px] text-muted-foreground">+{report.tasksWorkingOn.length - 3} more</span>}
                   </div>
                ) : (
                   <p className="text-xs text-gray-400 italic">No tasks linked</p>
                )}
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}