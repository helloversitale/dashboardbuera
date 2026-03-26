# Sentry Setup Guide

This guide covers the necessary steps to set up [Sentry](https://sentry.io/) for error tracking and a user feedback loop in the application.

## 1. Create a Sentry Account & Project
1. Go to [sentry.io/signup](https://sentry.io/signup/) and create an account (or log in).
2. Create a new **Organization** and **Project**.
3. Choose the platform that matches your application (e.g., **React** or **Vite**).
4. After creating the project, Sentry will provide you with a unique **DSN (Data Source Name)**. Keep this handy.

## 2. Install Sentry SDK
Run the following command in your terminal to install the Sentry SDK for React:

```bash
npm install @sentry/react
```

## 3. Configure Sentry in Your App
Initialize Sentry as early as possible in your application's lifecycle (e.g., inside `src/main.jsx` or `src/index.js`):

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // Use environment variables for safety
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      // Additional preferences for your feedback widget
      colorScheme: "system",
      isNameRequired: true,
      isEmailRequired: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% sample rate for normal sessions (adjust as needed)
  replaysOnErrorSampleRate: 1.0, // 100% sample rate when an error occurs
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 4. Environment Variables
Never hardcode your DSN in the codebase. Instead, use an environment variable:
1. Open or create your `.env` file at the root of the project.
2. Add the DSN value:
   ```env
   VITE_SENTRY_DSN="https://your_public_key@o0.ingest.sentry.io/0"
   ```
3. When deploying to production (e.g., Vercel, Netlify), make sure to add this environment variable to your deployment settings.

## 5. Verify the Integration
1. Run your development server: `npm run dev`
2. You should see the Sentry Feedback widget appear in the bottom right corner.
3. To test error reporting, you can intentionally throw an error in one of your components:
   ```javascript
   <button onClick={() => { throw new Error("This is your first Sentry error!"); }}>
     Break the world
   </button>
   ```
4. Verify that the error shows up in your Sentry dashboard.
