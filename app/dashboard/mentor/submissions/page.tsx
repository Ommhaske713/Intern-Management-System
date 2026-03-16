"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  Loader2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MessageSquare,
  FileText
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { badgeVariants } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label";

interface Submission {
  _id: string;
  taskId: { _id: string; title: string; deadline: string };
  internId: { _id: string; name: string; email: string };
  proofOfWorkType: string;
  proofLink: string;
  explanation: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REWORK';
  submittedAt: string;
  feedback?: string;
}

export default function MentorSubmissionsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REWORK'>('PENDING');
  const [search, setSearch] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [session]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        toast.error("Failed to fetch submissions");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'APPROVED' | 'REWORK') => {
    if (!selectedSubmission) return;
    
    if (status === 'REWORK' && !feedback.trim()) {
      toast.error("Please provide feedback for rework requests");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      });

      if (res.ok) {
        toast.success(`Submission ${status.toLowerCase()}`);
        setSubmissions(prev => 
          prev.map(s => s._id === selectedSubmission._id ? { ...s, reviewStatus: status, feedback } : s)
        );
        setSelectedSubmission(null);
        setFeedback("");
      } else {
        toast.error("Failed to update submission");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'ALL' || sub.reviewStatus === filter;
    const matchesSearch = 
      sub.internId.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.taskId.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submission Review</h2>
          <p className="text-muted-foreground">Review and grade intern submissions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant={filter === 'PENDING' ? 'default' : 'outline'} onClick={() => setFilter('PENDING')}>Pending</Button>
           <Button variant={filter === 'REWORK' ? 'default' : 'outline'} onClick={() => setFilter('REWORK')}>Rework</Button>
           <Button variant={filter === 'APPROVED' ? 'default' : 'outline'} onClick={() => setFilter('APPROVED')}>Approved</Button>
           <Button variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')}>All</Button>
        </div>
      </div>
    
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search by intern or task..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubmissions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No submissions found matching your filters.
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission._id} className="cursor-pointer hover:shadow-lg transition-shadow border-l-4" style={{
                borderLeftColor: 
                    submission.reviewStatus === 'APPROVED' ? '#10b981' : 
                    submission.reviewStatus === 'REWORK' ? '#ef4444' : 
                    '#f59e0b'
            }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <CardTitle className="text-base font-semibold line-clamp-1">{submission.taskId.title}</CardTitle>
                      <CardDescription>by {submission.internId.name}</CardDescription>
                   </div>
                   <Badge status={submission.reviewStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                 <div className="text-sm text-gray-500 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                 </div>
                 {submission.proofLink && (
                    <a 
                      href={submission.proofLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" /> View Proof
                    </a>
                 )}
                 <Button className="w-full mt-2" size="sm" onClick={() => {
                     setSelectedSubmission(submission);
                     setFeedback(submission.feedback || "");
                 }}>
                    Review
                 </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
               <div>
                  <h3 className="text-xl font-bold">Review Submission</h3>
                  <p className="text-sm text-gray-500">Task: {selectedSubmission.taskId.title}</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>
                  <XCircle className="h-6 w-6 text-gray-400" />
               </Button>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Intern</Label>
                      <p className="font-medium">{selectedSubmission.internId.name} ({selectedSubmission.internId.email})</p>
                  </div>
                  <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Submitted On</Label>
                      <p className="font-medium">{format(new Date(selectedSubmission.submittedAt), 'PP p')}</p>
                  </div>
               </div>

               <div className="space-y-2 bg-gray-50 p-4 rounded-md border">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Proof of Work</Label>
                  <div className="flex items-center gap-2">
                     <ExternalLink className="h-4 w-4 text-blue-500" />
                     <a href={selectedSubmission.proofLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                        {selectedSubmission.proofLink}
                     </a>
                  </div>
                  {selectedSubmission.explanation && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                          <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Explanation</Label>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubmission.explanation}</p>
                      </div>
                  )}
               </div>

               <div className="space-y-2">
                   <Label htmlFor="feedback">Mentor Feedback</Label>
                   <Textarea 
                      id="feedback" 
                      placeholder="Provide feedback on the submission..." 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                   />
               </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
               <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                  Cancel
               </Button>
               <Button 
                   variant="destructive" 
                   onClick={() => handleReview('REWORK')}
                   disabled={isSubmittingReview}
               >
                   Request Rework
               </Button>
               <Button 
                   className="bg-green-600 hover:bg-green-700 text-white"
                   onClick={() => handleReview('APPROVED')}
                   disabled={isSubmittingReview}
               >
                   {isSubmittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <CheckCircle2 className="h-4 w-4 mr-2"/>}
                    Approve
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  if (status === 'APPROVED') {
      return <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Approved</span>;
  }
  if (status === 'REWORK') {
      return <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Needs Rework</span>;
  }
  return <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">Pending Review</span>;
}