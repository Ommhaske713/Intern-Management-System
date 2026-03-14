import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Intern Management & Evaluation Platform
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <p className="text-muted-foreground">System v1.0.0</p>
        </div>
      </div>

      <div className="relative flex place-items-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl text-center">
          Internship <br/> <span className="text-blue-600">Management System</span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-2 lg:text-left gap-8">
        <div className="group rounded-lg border border-gray-200 px-5 py-4 transition-colors hover:border-blue-300 hover:bg-blue-50/50">
          <h2 className={`mb-3 text-2xl font-semibold text-blue-700`}>
            Intern & Mentor Portal{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-70 mb-4`}>
            Access your tasks, submissions, and feedback.
          </p>
          <div className="flex gap-4">
             <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
               Login to Portal
             </Link>
          </div>
        </div>

        <div className="group rounded-lg border border-gray-200 px-5 py-4 transition-colors hover:border-gray-800 hover:bg-gray-100">
          <h2 className={`mb-3 text-2xl font-semibold text-gray-800`}>
            HR & Admin Console{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-70 mb-4`}>
            Manage batches, users, and company settings.
          </p>
           <div className="flex gap-4">
             <Link href="/admin/login" className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 font-medium">
               Admin Login
             </Link>
             <Link href="/register" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium">
               Register Company
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
