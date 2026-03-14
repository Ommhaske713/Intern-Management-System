"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  PlusCircle,
  BarChart,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
  
  if (!session) {
    router.push("/login");
    return null;
  }

  const role = session.user.role;

  const getDashboardLink = () => {
    switch (role) {
      case "ADMIN": return "/dashboard/admin";
      case "MENTOR": return "/dashboard/mentor";
      case "INTERN": return "/dashboard/intern";
      default: return "/dashboard";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold tracking-tight">Intern Platform</h1>
          <div className="mt-4 flex items-center space-x-3">
             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {session.user.name?.[0] || "U"}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{role.toLowerCase()}</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href={getDashboardLink()} className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group transition-colors">
            <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
            Dashboard
          </Link>
          
          {role === "ADMIN" && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </div>
              <Link href="/dashboard/batches" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                Batches
              </Link>
              <Link href="/dashboard/tasks/create" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <PlusCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                Create Task
              </Link>
              <Link href="/dashboard/reports" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <BarChart className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                Reports
              </Link>
            </>
          )}

          {role === "MENTOR" && (
             <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Mentorship
              </div>
              <Link href="/dashboard/tasks/create" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <PlusCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                Assign Task
              </Link>
              <Link href="/dashboard/evaluations" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <ClipboardList className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                Evaluations
              </Link>
             </>
          )}

          {role === "INTERN" && (
             <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Workspace
              </div>
              <Link href="/dashboard/submissions" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg group">
                <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                My Submissions
              </Link>
             </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}