"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { format } from "date-fns";

export default function SubmissionsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("/api/submissions");
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        } else {
          console.error("Failed to fetch submissions");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSubmissions();
      setLoading(false);
    }
  }, [session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Your Submissions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submissions.map((sub) => (
          <Card key={sub._id}>
            <CardHeader>
              <CardTitle>Task: {sub.taskId?.title || 'Unknown Task'}</CardTitle>
              <CardDescription>
                Submitted: {format(new Date(sub.submittedAt), 'PPp')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Status:</span>{" "}
                  <Badge variant={sub.reviewStatus === 'APPROVED' ? 'default' : sub.reviewStatus === 'REWORK' ? 'destructive' : 'secondary'}>
                    {sub.reviewStatus || 'PENDING'}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Link:</span>{" "}
                  <a href={sub.proofLink} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate block">
                    {sub.proofLink}
                  </a>
                </div>
                {sub.feedback && (
                  <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">
                    <span className="font-semibold">Feedback:</span> {sub.feedback}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {submissions.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-10">
            No submissions yet.
          </p>
        )}
      </div>
    </div>
  );
}