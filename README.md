# Secure Messenger

A real-time secure messaging application built with React, TypeScript, Express, and Supabase. Features end-to-end encryption, real-time messaging using WebSockets, and a modern UI with shadcn/ui components.

## Features

- 🔐 End-to-end encryption for messages
- 👥 Create and join chat rooms
- 🚀 Real-time messaging with WebSocket
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔑 User authentication with session management
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, WebSocket (ws)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with Passport.js
- **Security**: End-to-end encryption using simple-crypto-js
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- Supabase account and project

### Environment Setup

1. Create a new Supabase project
2. Execute the SQL scripts in your Supabase database:
   - Run `supabase_setup.sql` to create tables
   - Run `supabase_rls.sql` to set up Row Level Security policies

3. Set up environment variables:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-role-key
   PORT=3000 (optional, defaults to 3000)
   NODE_ENV=development (for development)
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd secure-messenger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
SecureMessenger/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── pages/      # Page components
├── server/              # Backend Express server
│   ├── auth.ts         # Authentication setup
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database operations
└── shared/             # Shared TypeScript types and schemas
```

## Security Features

- End-to-end encryption for messages
- Secure password hashing using scrypt
- Row Level Security in Supabase
- Session-based authentication
- HTTPS in production

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
