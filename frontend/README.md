# MailBlast Frontend

Email Analytics Dashboard built with Next.js, React, and Tailwind CSS.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` file in the `frontend` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Important:** Make sure your backend server is running on the port specified in `NEXT_PUBLIC_API_URL`.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Access Analytics Dashboard

Navigate to:
```
http://localhost:3000/dashboard/analytics
```

## Features

- **Analytics Overview** - Key metrics at a glance
- **Timeline Charts** - Time-series performance data
- **Top Clicked Links** - Most popular URLs
- **Email Events** - Detailed event tracking per email

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Radix UI

