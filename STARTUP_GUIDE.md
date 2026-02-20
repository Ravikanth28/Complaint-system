# Online Complaint Registration and Analysis System - Startup Guide

Follow these steps to run and use your AI-powered complaint system.

## 1. Backend: AWS Cloud System
Your backend is already live in the AWS cloud! 🚀
- **Submission API**: `https://xmq8p81c9g.execute-api.us-east-1.amazonaws.com/submit`
- **S3 Bucket**: `complaint-system-raw-data-raka123`

## 2. Frontend: Next.js Website
To run the website on your local machine:

1.  **Open a terminal** at the project root: `e:\mini-project`
2.  **Go to the frontend folder**:
    ```powershell
    cd frontend
    ```
3.  **Install dependencies** (if you haven't yet):
    ```powershell
    npm install
    ```
4.  **Run the development server**:
    ```powershell
    npm run dev
    ```
5.  **Open your browser** and visit: [http://localhost:3000](http://localhost:3000)

## 3. How to Use the System
1.  **Submit a Complaint**: Use the form on the website to submit a "test" complaint (e.g., "The lab AC is not working").
2.  **Verify S3 Storage**: Check your AWS S3 Console in the `complaint-system-raw-data-raka123` bucket. You will see a new `.json` file appear instantly!
3.  **GenAI Analysis**: If you've set up the S3 Trigger (Event Notification) in the AWS Console, the AI will automatically summarize and categorize the complaint in the background.

## ⚙️ Configuration
- **Gemini AI**: Uses the API Key ending in `...5VM`
- **AWS Region**: `us-east-1`
- **Database**: No SQL DB needed — uses S3 as a serverless data lake.

---
*Developed with ❤️ by Antigravity*
