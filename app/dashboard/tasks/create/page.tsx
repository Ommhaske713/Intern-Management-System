"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CreateTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    weekNumber: 1,
    batchId: "",
    assignedTo: "all",
    priority: "MEDIUM",
    requiredProofType: "GITHUB_REPOSITORY",
  });

  useEffect(() => {
    const fetchBatches = async () => {
      if (!session?.user) return;
      try {
        const role = session.user.role;
        const url = role === "ADMIN" ? "/api/batches" : "/api/dashboard/mentor/batches";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
          if (data.length > 0) setFormData(prev => ({ ...prev, batchId: data[0]._id }));
        }
      } catch (error) {
        toast.error("Data Load Error", {
          description: "Could not fetch available batches."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId) return toast.warning("Please select a batch first.", {
      description: "You must assign the task to a specific cohort."
    });
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        batchId: formData.batchId,
        weekNumber: formData.weekNumber,
        assignedTo: formData.assignedTo === "all" ? null : formData.assignedTo,
        priority: formData.priority,
        requiredProofType: formData.requiredProofType,
      };
      if (formData.deadline) payload.deadline = formData.deadline;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Task assigned successfully", {
          description: "Notified all members of the batch."
        });
        router.push("/dashboard"); 
      } else {
        const err = await res.json();
        toast.error("Failed to create task", {
          description: err.error || "Please try again later."
        });
      }
    } catch (error) {
      toast.error("Network Error", {
        description: "Please check your internet connection."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  const selectedBatch = batches.find(b => b._id === formData.batchId);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Select Batch *</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value, assignedTo: "all" })}
              required
            >
              <option value="" disabled>Choose a batch...</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              disabled={!formData.batchId}
            >
              <option value="all">Entire Batch</option>
              {selectedBatch?.internIds?.map((intern: any) => (
                <option key={intern._id || intern} value={intern._id || intern}>
                  {intern.name || intern.email || "Intern"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
             <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="FINAL">Final Project</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Required Proof Type</label>
             <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.requiredProofType}
              onChange={(e) => setFormData({ ...formData, requiredProofType: e.target.value })}
              required
            >
              <option value="GITHUB_REPOSITORY">GitHub Repository</option>
              <option value="DEPLOYED_URL">Deployed URL</option>
              <option value="FIGMA_LINK">Figma Link</option>
              <option value="PDF_DOCUMENT">PDF Document</option>
              <option value="GOOGLE_DOC">Google Doc</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
           <div>
            <label className="block text-sm font-medium mb-1">Week Number *</label>
            <Input 
              type="number" 
              min={1} 
              value={formData.weekNumber} 
              onChange={e => setFormData({ ...formData, weekNumber: Number(e.target.value) })} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <Input 
              type="date" 
              value={formData.deadline} 
              onChange={e => setFormData({ ...formData, deadline: e.target.value })} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}