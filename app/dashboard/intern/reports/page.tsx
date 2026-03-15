"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { PlusCircle, FileText } from "lucide-react";

interface Report {
  _id: string;
  weekNumber: number;
  submittedAt: string;
  tasksWorkingOn: { title: string }[];
  workSummary: string;
}

export default function MyReportsPage() {
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Reports</h2>
          <p className="text-muted-foreground">Track your weekly progress and consistency.</p>
        </div>
        <Link href="/dashboard/intern/reports/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Report
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No reports submitted yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Link href={`/dashboard/intern/reports/${report._id}`} key={report._id}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                   <CardTitle>Week {report.weekNumber}</CardTitle>
                   <span className="text-xs text-muted-foreground">{format(new Date(report.submittedAt), 'MMM d')}</span>
                </div>
                <CardDescription className="line-clamp-2">{report.workSummary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium mb-1">Tasks Updates:</div>
                <ul className="list-disc list-inside text-xs text-gray-500 mb-4">
                  {report.tasksWorkingOn?.slice(0, 3).map((t, idx) => (
                    <li key={idx} className="truncate">{t.title}</li>
                  ))}
                  {report.tasksWorkingOn?.length > 3 && <li>+{report.tasksWorkingOn.length - 3} more</li>}
                </ul>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}