"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";

interface Company {
    _id: string;
    name: string;
    programDirectorName?: string;
    programDirectorSignatureUrl?: string;
    companyLogoUrl?: string;
}

export default function AdminSettingsPage() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [directorName, setDirectorName] = useState("");
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [signaturePreview, setSignaturePreview] = useState<string>("");
    const [logoPreview, setLogoPreview] = useState<string>("");

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch("/api/company");
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setCompany(data);
                        setDirectorName(data.programDirectorName || "");
                        setSignaturePreview(data.programDirectorSignatureUrl || "");
                        setLogoPreview(data.companyLogoUrl || "");
                    }
                }
            } catch (error) {
                console.error("Failed to load company settings");
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'logo') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'signature') {
                setSignatureFile(file);
                setSignaturePreview(URL.createObjectURL(file));
            } else {
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
            }
        }
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Image upload failed");
        }
        
        const data = await res.json();
        return data.secure_url;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company) return;
        setIsSaving(true);

        try {
            let sigUrl = company.programDirectorSignatureUrl || "";
            if (signatureFile) {
                sigUrl = await uploadFile(signatureFile);
            }
            
            let logoUrl = company.companyLogoUrl || "";
            if (logoFile) {
                logoUrl = await uploadFile(logoFile);
            }

            const res = await fetch("/api/company", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: company._id,
                    programDirectorName: directorName,
                    programDirectorSignatureUrl: sigUrl,
                    companyLogoUrl: logoUrl
                }),
            });

            if (res.ok) {
                toast.success("Settings updated successfully");
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
                <p className="text-muted-foreground">Configure certificate details and company branding.</p>
            </div>
            
            <form onSubmit={handleSave}>
                <Card>
                    <CardHeader>
                        <CardTitle>Certificate Configuration</CardTitle>
                        <CardDescription>These details will appear on all generated certificates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program Director Name</label>
                            <Input 
                                value={directorName}
                                onChange={(e) => setDirectorName(e.target.value)}
                                placeholder="e.g. Jane Doe"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Director Signature Scan</label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 cursor-pointer relative h-40">
                                    {signaturePreview ? (
                                        <img src={signaturePreview} alt="Signature" className="h-full object-contain" />
                                    ) : (
                                        <div className="text-muted-foreground">
                                            <UploadCloud className="h-8 w-8 mx-auto mb-2" />
                                            <span className="text-xs">Upload Signature (PNG/JPG)</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileChange(e, 'signature')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Use a transparent PNG for best results.</p>
                             </div>

                             <div className="space-y-2">
                                <label className="text-sm font-medium">Company Seal/Logo</label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 cursor-pointer relative h-40">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="h-full object-contain" />
                                    ) : (
                                        <div className="text-muted-foreground">
                                            <UploadCloud className="h-8 w-8 mx-auto mb-2" />
                                            <span className="text-xs">Upload Logo</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
