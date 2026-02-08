# Intern Management & Evaluation Platform

An internal organization tool designed to streamline the internship process, from task assignment to final performance evaluation. The platform serves Admins, Mentors, and Interns with role-specific dashboards.

## 🚀 Project Overview

The **Intern Management & Evaluation Platform** helps organizations manage interns effectively by providing a centralized system for tracking progress, reviewing work, and generating performance reports.

### Key Features
*   **Role-Based Access Control**: Separate portals for Admin/HR, Mentors, and Interns.
*   **Task Management**: Mentors create assignments; Interns submit proofs (GitHub/Deployments).
*   **Progress Tracking**: Tasks move through states (Assigned -> Submitted -> Needs Rework -> Completed).
*   **Weekly Reports**: Structured reporting system for interns to log their weekly activities and learnings.
*   **Evaluation System**: Comprehensive performance grading based on timeliness, quality, and communication.
*   **Automated Summaries**: Admin dashboard generates final internship completion reports.

## 🛠 Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Database**: MongoDB (Mongoose ODM)
*   **Authentication**: NextAuth.js (Credentials Provider)
*   **UI Components**: Shadcn UI + Tailwind CSS
*   **Validation**: Zod

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+
*   MongoDB Instance (Local or Atlas)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/intern-management-platform.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_generated_secret
    NEXTAUTH_URL=http://localhost:3000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
├── app/                # Next.js App Router pages & API routes
├── components/         # Reusable UI components
├── core/               # Core utilities (Auth config, DB connect)
├── models/             # Mongoose database schemas
├── schemas/            # Zod validation schemas
├── lib/               # Utility functions
└── public/            # Static assets
```

## 👥 User Roles

1.  **Admin/HR**: Manages users, views organizational stats, generates final reports.
2.  **Mentor**: Assigns tasks, reviews submissions, evaluates assigned interns.
3.  **Intern**: Views tasks, submits work, writes weekly reports, tracks own progress.

## 📄 License
Internal Organization Tool - Confidential.
