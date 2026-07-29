# AI Recruit Pro - Frontend

AI Recruit Pro is a modern, AI-powered recruitment platform designed to streamline the hiring process. This repository contains the frontend application built with the latest web technologies, offering dedicated portals for both companies (Perusahaan) and applicants (Pelamar).

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Charts & Data Visualization:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## ✨ Key Features

- **Multi-Role Portals:** 
  - **Company Portal (`/perusahaan`):** Dashboard for HR and recruiters to manage job postings, candidate pipelines, reviews, and archives.
  - **Applicant Portal (`/pelamar`):** Interface for candidates to discover jobs, track their application status, and manage their profiles.
- **Candidate Pipeline Management:** Interactive drag-and-drop or structured views to track candidates through various recruitment stages.
- **Analytics & Dashboard:** Visual insights into recruitment metrics using Recharts.
- **Smart Filtering & Archiving:** Efficient tools to manage and archive candidate profiles.

## 📂 Project Structure

```text
frontend-airecruitpro/
├── app/
│   ├── (pelamar)/       # Routes and pages for applicants
│   ├── (perusahaan)/    # Routes and pages for companies
│   ├── globals.css      # Global styles including Tailwind directives
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components
│   ├── archive/         # Archive page components
│   ├── dashboard/       # Dashboard layout and widgets
│   ├── pipeline/        # Candidate pipeline components
│   └── reviews/         # Reviews and assessment components
├── hooks/               # Custom React hooks (e.g., translation, data fetching)
├── lib/                 # Utility functions and configurations
├── public/              # Static assets (images, fonts, etc.)
└── package.json         # Project metadata and dependencies
```

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v20 or higher recommended) and `npm` installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd frontend-airecruitpro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## 🧑‍💻 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is private and proprietary.
