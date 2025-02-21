# Chatty - Secure Real-time Messenger

A modern, secure chat application featuring end-to-end encryption, real-time messaging, and a sleek user interface. Built with React, TypeScript, Express, and Supabase.

![Chat Interface](https://ui.shadcn.com/examples/chat.png)

## ✨ Features

- 🔒 **End-to-End Encryption** - All messages are encrypted using client-side encryption
- 🚀 **Real-time Messaging** - Instant message delivery using WebSocket
- 🔐 **Secure Authentication** - User authentication with session management
- 💬 **Chat Rooms** - Create and join password-protected chat rooms
- 📱 **Responsive Design** - Works seamlessly on both desktop and mobile
- 🎨 **Modern UI** - Beautiful interface using shadcn/ui components

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/SakshamMamgain/Chatty.git
cd Chatty

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Supabase credentials to .env
# Get these from https://supabase.com -> Your Project -> Settings -> API
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-role-key

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 💻 Tech Stack

<table>
  <tr>
    <td align="center">Frontend</td>
    <td>
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black">
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white">
      <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white">
    </td>
  </tr>
  <tr>
    <td align="center">Backend</td>
    <td>
      <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white">
      <img src="https://img.shields.io/badge/WebSocket-010101?style=flat&logo=socket.io&logoColor=white">
      <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white">
    </td>
  </tr>
  <tr>
    <td align="center">Security</td>
    <td>
      <img src="https://img.shields.io/badge/E2E_Encryption-276DC3?style=flat&logo=data:image/png;base64,lock">
      <img src="https://img.shields.io/badge/Session_Auth-000000?style=flat&logo=data:image/png;base64,key">
    </td>
  </tr>
</table>

## 🔧 Setup Guide

### 1. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the following scripts:
   - `supabase_setup.sql` - Creates database tables
   - `supabase_rls.sql` - Sets up security policies
3. Get your API credentials from Project Settings → API

### 2. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run check

# Build for production
npm run build
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## 📁 Project Structure

```
chatty/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utilities
│   │   └── pages/     # Page components
├── server/             # Express backend
│   ├── auth.ts        # Authentication
│   ├── routes.ts      # API endpoints
│   └── storage.ts     # Database operations
└── shared/            # Shared types
```

## 🔐 Security Features

- End-to-end message encryption using `simple-crypto-js`
- Secure password hashing with `scrypt`
- Row Level Security with Supabase
- Session-based authentication
- HTTPS support for production

## 📝 License

MIT © [Saksham Mamgain](https://github.com/SakshamMamgain)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/SakshamMamgain">Saksham Mamgain</a>
</div>
