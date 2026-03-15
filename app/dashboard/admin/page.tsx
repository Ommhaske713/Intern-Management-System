"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Layout, Award } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    batches: 0,
    mentors: 0,
    interns: 0,
    totalTasks: 0,
    completedTasks: 0,
    submissions: 0,
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/admin');
        if (res.ok) {
            const data = await res.json();
            setStats({
                batches: data.batches.total,
                mentors: data.users.mentors,
                interns: data.users.interns,
                totalTasks: data.tasks.total,
                completedTasks: data.tasks.completed,
                submissions: data.submissions.total,
                recentActivity: data.recentActivity || []
            });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage your organization&apos;s internship program.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.batches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.mentors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.interns}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.completedTasks} <span className="text-sm font-normal text-muted-foreground">/ {stats.totalTasks}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <Link href="/dashboard/batches/create">
                <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Create New Batch
                </Button>
            </Link>
             <Link href="/dashboard/batches">
                <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" /> Manage People (via Batches)
                </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest work submitted by interns</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div>Loading...</div>
            ) : stats.recentActivity.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                   No recent submissions found.
                </div>
            ) : (
                <div className="space-y-4">
                    {stats.recentActivity.map((sub, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="text-sm font-medium">{sub.taskId?.title || 'Unknown Task'}</p>
                                <p className="text-xs text-muted-foreground">
                                    by {sub.internId?.name} • {new Date(sub.submittedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <Link href={sub.proofLink} target="_blank" className="text-xs text-blue-500 hover:underline">
                                View
                            </Link>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}