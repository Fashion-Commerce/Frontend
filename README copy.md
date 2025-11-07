# Fashion E-commerce Frontend

A modern React-based frontend for the Fashion E-commerce platform with AI-powered chatbot.

## Features

- 🛒 Product browsing and search with real-time API integration
- 🤖 AI-powered fashion assistant with streaming responses
- 🛍️ Shopping cart and order management
- 👤 User authentication and profiles
- 📱 Responsive design (mobile-friendly)
- 🎨 Dark/Light theme toggle
- 🔧 Admin dashboard
- 📦 Real-time inventory updates
- 🔍 Advanced product filtering and search

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Real-time API integration** with FastAPI backend
- **Server-Sent Events (SSE)** for streaming chat responses

## API Integration

The frontend is fully integrated with the FastAPI backend and supports:

### Product Management
- GET `/products` - List products with filtering and pagination
- GET `/products/{id}` - Get product details
- GET `/categories` - List categories
- GET `/brands` - List brands

### User Authentication
- POST `/token` - User login
- POST `/users` - User registration
- GET `/users/me` - Get current user profile

### Shopping Cart
- GET `/cart-items` - Get user's cart items
- POST `/cart-items` - Add item to cart
- PUT `/cart-items/{id}` - Update cart item quantity
- DELETE `/cart-items/{id}` - Remove item from cart

### Order Management
- POST `/orders` - Create new order
- GET `/orders` - Get user's orders

### AI Chat
- POST `/chat/stream` - Stream chat with AI assistant
- POST `/messages` - Send message
- GET `/messages` - Get chat history

## Getting Started

**Prerequisites:** Node.js 18+ and npm, Backend server running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`:
   ```bash
   VITE_API_BASE_URL=http://localhost:8000/v1
   VITE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Project Structure

```
frontend/
├── api/               # API client and endpoints
├── components/        # React components
│   ├── admin/        # Admin dashboard
│   ├── Chatbot.tsx   # AI chatbot
│   └── ...
├── services/         # Business logic services
│   ├── authService.ts
│   ├── cartService.ts
│   └── ...
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
├── utils/            # Helper functions
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
