# Online Complaint Registration System (AI-Powered)

An end-to-end serverless complaint management system built with **AWS**, **Next.js**, and **Google Gemini AI**.

## 🚀 Overview
This system allows users to submit complaints which are automatically categorized and triaged using AI. Administrators can monitor complaints via a real-time dashboard with sentiment analysis and location breakdowns.

### Key Features
- **AI Triage**: Uses Gemini 1.5 Flash to analyze complaint urgency and sentiment.
- **Serverless Backend**: Entirely powered by AWS Lambda, S3, and API Gateway.
- **Admin Dashboard**: Real-time analytics and complaint monitoring.
- **Custom Security**: Proprietary S3-based authentication system with JWT authorization and role-based access (No external identity providers needed).

## 🛠️ Architecture
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Recharts.
- **Backend**: AWS Lambda (Node.js 20.x + TypeScript), S3 (Raw/Structured storage).
- **AI**: Google Generative AI (Gemini) SDK.
- **API**: AWS API Gateway (HTTP API).

## 📦 Setup & Installation

### Prerequisites
- AWS CLI configured with appropriate permissions.
- Node.js 20.x or later.+
---+++++++++++++++-
- Google Gemini API Key.

### 1. Backend Configuration
1. Clone the repository.
2. Navigate to `/functions` and install dependencies: `npm install`.
3. Create a `.env` file in the root directory (see `.env.example`).
4. Build the Lambda functions: `npm run build`.

### 2. Frontend Configuration
1. Navigate to `/frontend` and install dependencies: `npm install`.
2. Run the development server: `npm run dev`.
3. Access the portal at `http://localhost:3000`.

## 🔒 Security
- **Admin Password**: `admin123` (Configurable in `app/login/page.tsx`).
- **Data Protection**: All sensitive keys are managed via environment variables and should NOT be pushed to version control.

## 📝 License
MIT License - Developed for AI & Cloud Integration Project.
