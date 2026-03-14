"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function SubmitTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId;

  const [formData, setFormData] = useState({
    proofLink: "",
    explanation: "",
    proofOfWorkType: "GITHUB_REPOSITORY",
  });

  const getPlaceholder = () => {
    switch (formData.proofOfWorkType) {
      case "GITHUB_REPOSITORY": return "https://github.com/username/project";
      case "FIGMA_LINK": return "https://www.figma.com/file/...";
      case "DEPLOYED_URL": return "https://my-app.vercel.app";
      case "PDF_DOCUMENT": return "https://drive.google.com/file/d/...";
      default: return "https://...";
    }
  };

  const validateLink = (url: string, type: string) => {
    try {
      const parsedUrl = new URL(url);
      if (type === "GITHUB_REPOSITORY" && !parsedUrl.hostname.includes("github.com")) {
        return "Please provide a valid GitHub URL";
      }
      if (type === "FIGMA_LINK" && !parsedUrl.hostname.includes("figma.com")) {
        return "Please provide a valid Figma URL";
      }
      return null;
    } catch {
      return "Please enter a valid URL (e.g., https://...)";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    const error = validateLink(formData.proofLink, formData.proofOfWorkType);
    if (error) {
      return toast.warning("Invalid Link", { description: error });
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          proofLink: formData.proofLink,
          explanation: formData.explanation,
          proofOfWorkType: formData.proofOfWorkType,
        }),
      });

      if (res.ok) {
        toast.success("Submission received!", {
          description: "Your work has been submitted for review."
        });
        router.push("/dashboard"); 
      } else {
        const err = await res.json();
        toast.error("Submission Failed", {
          description: err.error || "Please check your inputs."
        });
      }
    } catch (error) {
      toast.error("Network Error");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Submit Work</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-1.5">Submission Type</label>
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.proofOfWorkType}
            onChange={(e) => setFormData({ ...formData, proofOfWorkType: e.target.value })}
            required
          >
            <option value="GITHUB_REPOSITORY">GitHub Repository</option>
            <option value="FIGMA_LINK">Figma Design</option>
            <option value="DEPLOYED_URL">Deployed Website</option>
            <option value="PDF_DOCUMENT">Document / PDF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Proof Link (URL)</label>
          <Input
            value={formData.proofLink}
            onChange={(e) => setFormData({ ...formData, proofLink: e.target.value })}
            required
            placeholder={getPlaceholder()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Explanation / Notes</label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            required
            placeholder="Briefly describe your solution, trade-offs, and any instructions..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Submit Assignment</Button>
        </div>
      </form>
    </div>
  );
}