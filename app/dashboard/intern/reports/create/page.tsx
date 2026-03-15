"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  status: string;
}

export default function CreateReportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    weekNumber: "",
    workSummary: "",
    challengesFaced: "",
    learnings: "",
    tasksWorkingOn: [] as string[],
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (error) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskToggle = (taskId: string) => {
    setFormData((prev) => {
      const current = prev.tasksWorkingOn;
      if (current.includes(taskId)) {
        return { ...prev, tasksWorkingOn: current.filter((id) => id !== taskId) };
      } else {
        return { ...prev, tasksWorkingOn: [...current, taskId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.tasksWorkingOn.length === 0) {
       toast.warning("No Tasks Selected", { description: "Please select at least one task you worked on this week." });
       setIsSubmitting(false);
       return;
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          weekNumber: parseInt(formData.weekNumber),
        }),
      });

      if (res.ok) {
        toast.success("Report Submitted Successfully");
        router.push("/dashboard/intern");
      } else {
        const err = await res.json();
        toast.error("Submission Failed", { description: err.error });
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Submit Weekly Report</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Week Number</label>
          <Input 
            type="number" 
            min={1} 
            max={52}
            value={formData.weekNumber}
            onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
            required
            placeholder="e.g. 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Which tasks did you work on this week?</label>
          <div className="grid gap-2 border p-4 rounded-md max-h-60 overflow-y-auto">
            {tasks.length === 0 ? (
               <p className="text-sm text-gray-500">No tasks assigned yet.</p>
            ) : (
                tasks.map((task) => (
                  <div key={task._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={task._id}
                      checked={formData.tasksWorkingOn.includes(task._id)}
                      onChange={() => handleTaskToggle(task._id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={task._id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {task.title} <span className="text-xs text-gray-400">({task.status || 'PENDING'})</span>
                    </label>
                  </div>
                ))
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Select all applicable tasks.</p>
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Work Summary</label>
           <Textarea 
             value={formData.workSummary}
             onChange={(e) => setFormData({ ...formData, workSummary: e.target.value })}
             required
             placeholder="Briefly describe what you implemented..."
             rows={4}
           />
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Challenges Faced</label>
           <Textarea 
             value={formData.challengesFaced}
             onChange={(e) => setFormData({ ...formData, challengesFaced: e.target.value })}
             required
             placeholder="Any blockers or technical issues?"
             rows={3}
           />
        </div>

        <div>
           <label className="block text-sm font-medium mb-1">Key Learnings</label>
           <Textarea 
             value={formData.learnings}
             onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
             required
             placeholder="What new concepts did you learn?"
             rows={3}
           />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Report
        </Button>
      </form>
    </div>
  );
}