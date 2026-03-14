"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ClipboardCheck,  Calendar, CheckCircle2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  assignedBy: { name: string };
  assignedTo: string;
}

export default function InternDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <div>Loading assigned tasks...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Intern Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and submit deliverables.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">My Assignments</h3>
        {tasks.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
             <p className="text-gray-500">You have no pending tasks assigned at the moment.</p>
             <p className="text-sm text-gray-400 mt-2">Check back later or contact your mentor.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Card key={task._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-1" title={task.title}>{task.title}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                     <Calendar className="h-3 w-3" /> Due {format(new Date(task.deadline), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">{task.description}</p>
                  <div className="text-xs text-gray-400 border-t pt-2">
                    Mentored by: <span className="font-medium text-gray-600">{task.assignedBy?.name || "System"}</span>
                  </div>
                </CardContent>
                <CardFooter>
                   <Link href={`/dashboard/tasks/${task._id}/submit`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Submit Work
                      </Button>
                   </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}