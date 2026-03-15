"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileText, CheckCircle2, Link as LinkIcon } from "lucide-react";

export default function SubmitTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId;

  const [formData, setFormData] = useState({
    proofLink: "",
    explanation: "",
    proofOfWorkType: "GITHUB_REPOSITORY",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'file'>('link');

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (res.ok) {
          const task = await res.json();
          if (task.requiredProofType) {
            setFormData(prev => ({ ...prev, proofOfWorkType: task.requiredProofType }));
            if (task.requiredProofType === "PDF_DOCUMENT") {
                setActiveTab("file");
            }
          }
        }
      } catch (error) {
        toast.error("Failed to load task requirements");
      } finally {
        setLoadingTask(false);
      }
    };
    fetchTask();
  }, [taskId]);

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

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const signatureRes = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'intern_submissions' }),
      });

      if (!signatureRes.ok) throw new Error("Failed to get upload signature");

      const { timestamp, signature, cloudName, apiKey } = await signatureRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', 'intern_submissions');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await uploadRes.json();
      return data.secure_url;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    let finalProofLink = formData.proofLink;

    try {
        if (file) {
            toast.loading("Uploading file...", { id: "upload" });
            finalProofLink = await handleFileUpload(file);
            toast.success("File uploaded successfully", { id: "upload" });
        } else {
            const error = validateLink(formData.proofLink, formData.proofOfWorkType);
            if (error) {
              return toast.warning("Invalid Link", { description: error });
            }
        }
    } catch (error) {
        toast.error("File upload failed. Please try again or use a direct link.", { id: "upload" });
        return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          proofLink: finalProofLink,
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
          <label className="block text-sm font-medium mb-1.5">Required Submission Type</label>
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
            {formData.proofOfWorkType.replace(/_/g, " ")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
             This task requires a specific type of proof. You cannot change it.
          </p>
        </div>

        <div>
           <Label className="block text-sm font-medium mb-1.5">Submission Method</Label>
           <div className="flex gap-4 mb-3">
              <div 
                className={`border rounded-lg p-3 cursor-pointer flex-1 flex flex-col items-center gap-2 transition-all ${activeTab === 'link' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50'}`}
                onClick={() => setActiveTab('link')}
              >
                  <LinkIcon className={`h-5 w-5 ${activeTab === 'link' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${activeTab === 'link' ? 'text-primary' : 'text-gray-700'}`}>External Link</span>
              </div>
              <div 
                className={`border rounded-lg p-3 cursor-pointer flex-1 flex flex-col items-center gap-2 transition-all ${activeTab === 'file' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50'}`}
                onClick={() => setActiveTab('file')}
              >
                  <UploadCloud className={`h-5 w-5 ${activeTab === 'file' ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${activeTab === 'file' ? 'text-primary' : 'text-gray-700'}`}>File Upload</span>
              </div>
           </div>

           {activeTab === 'link' ? (
                <div>
                  <Label>Proof Link (URL)</Label>
                  <Input
                    value={formData.proofLink}
                    onChange={(e) => {
                        setFormData({ ...formData, proofLink: e.target.value });
                        setFile(null); 
                    }}
                    required={activeTab === 'link'}
                    placeholder={getPlaceholder()}
                    className="mt-1.5"
                  />
                </div>
           ) : (
                <div 
                     className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-slate-50"
                     onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setFile(e.target.files[0]);
                                setFormData(prev => ({ ...prev, proofLink: "" })); 
                            }
                        }}
                    />
                    {file ? (
                        <div className="flex flex-col items-center text-green-600 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="h-10 w-10 mb-2" />
                            <span className="font-semibold">{file.name}</span>
                            <span className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <Button variant="ghost" size="sm" className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                            }}>Remove File</Button>
                        </div>
                    ) : (
                        <div className="pointer-events-none space-y-2">
                            <div className="bg-white p-3 rounded-full shadow-sm inline-block">
                                <UploadCloud className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-sm font-medium">Click to upload or drag and drop</div>
                            <p className="text-xs text-muted-foreground">PDF, Images, ZIP (Max 10MB)</p>
                        </div>
                    )}
                </div>
           )}
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