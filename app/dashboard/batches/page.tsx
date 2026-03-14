"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface Batch {
  _id: string;
  name: string;
  startDate: string;
  durationInWeeks: number;
  internIds: any[];
  mentorIds: any[];
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (error) {
      console.error("Failed to fetch batches", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading batches...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Batches</h2>
        <Link href="/dashboard/batches/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Batch
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Card key={batch._id}>
            <CardHeader>
              <CardTitle>{batch.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Starts: {format(new Date(batch.startDate), "PPP")}
              </p>
              <p className="text-sm text-gray-500">
                Duration: {batch.durationInWeeks} weeks
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <span className="font-bold">{batch.internIds.length}</span> Interns
                </div>
                <div>
                  <span className="font-bold">{batch.mentorIds.length}</span> Mentors
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/batches/${batch._id}`} className="w-full">
                <Button variant="outline" className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        
        {batches.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No batches found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}