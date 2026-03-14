"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      switch (role) {
        case "ADMIN":
          router.replace("/dashboard/admin");
          break;
        case "MENTOR":
          router.replace("/dashboard/mentor");
          break;
        case "INTERN":
          router.replace("/dashboard/intern");
          break;
        default:
          router.replace("/login");
      }
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-500">Redirecting to your dashboard...</span>
    </div>
  );
}