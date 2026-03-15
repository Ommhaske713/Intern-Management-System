"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Star, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface InternEvaluationSummary {
  internId: string;
  name: string;
  email: string;
  tasksCompleted: number;
  tasksAssigned: number;
  reportsSubmitted: number;
  averageRating?: number;
  status: "PENDING" | "COMPLETED";     
}

export default function EvaluationsPage() {
  const [interns, setInterns] = useState<InternEvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await fetch("/api/evaluations");
        if (res.ok) {
          const data = await res.json();
          setInterns(data);
        }
      } catch (error) {
        console.error("Failed to load evaluation data");
      } finally {
        setLoading(false);
      }
    };
    fetchInterns();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Intern Evaluations</h2>
        <p className="text-muted-foreground">Monitor performance metrics and submit final assessments.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"/>
          ))}
        </div>
      ) : interns.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No Interns Found</h3>
            <p className="text-muted-foreground">You don't have any interns assigned to evaluate yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {interns.map((intern) => (
            <Card key={intern.internId} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                   <div>
                     <CardTitle className="text-lg">{intern.name}</CardTitle>
                     <CardDescription>{intern.email}</CardDescription>
                   </div>
                   {intern.status === "COMPLETED" ? (
                     <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1"/> Evaluated</Badge>
                   ) : (
                     <Badge variant="outline" className="text-yellow-600 border-yellow-600"><AlertCircle className="w-3 h-3 mr-1"/> Pending</Badge>
                   )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                 
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div className="flex flex-col p-3 bg-secondary/50 rounded-lg">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Tasks</span>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-xl font-bold">{intern.tasksCompleted}</span>
                        <span className="text-muted-foreground text-xs mb-1">/ {intern.tasksAssigned}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-700">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${intern.tasksAssigned ? (intern.tasksCompleted / intern.tasksAssigned) * 100 : 0}%` }}
                        ></div>
                      </div>
                   </div>

                   <div className="flex flex-col p-3 bg-secondary/50 rounded-lg">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Reports</span>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-xl font-bold">{intern.reportsSubmitted}</span>
                        <span className="text-muted-foreground text-xs mb-1">submitted</span>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500 mt-auto ml-auto" />
                   </div>
                 </div>

              </CardContent>
              <CardFooter className="pt-2">
                 <Link href={`/dashboard/evaluations/${intern.internId}`} className="w-full">
                    <Button variant={intern.status === "COMPLETED" ? "secondary" : "default"} className="w-full">
                      {intern.status === "COMPLETED" ? "View Evaluation" : "Start Evaluation"}
                    </Button>
                 </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}