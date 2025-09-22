# KIET Collab - Collaboration Platform

A modern, production-ready collaboration platform built specifically for KIET Group of Institutions students.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with @kiet.edu email restriction
- **Modern UI**: Notion-inspired design with glassmorphism and dark/light themes
- **Real-time Chat**: Socket.IO powered messaging with typing indicators
- **Project Showcase**: Display and discover student projects
- **Events & Hackathons**: Event management and registration
- **Student Discovery**: Find and connect with peers
- **Q&A Forum**: Knowledge sharing platform
- **Admin Dashboard**: Role-based access control

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Responsive design with mobile-first approach

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **Redis** for caching and Socket.IO scaling
- **JWT** authentication with refresh tokens
- **Socket.IO** for real-time features
- **Swagger/OpenAPI** for API documentation

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5+
- Redis 6+
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kiet-collab
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/kiet-collab
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Start Development Servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 📚 API Documentation

Once the backend is running, visit:
- API Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Docker Build
```bash
# Backend
cd backend
docker build -t kiet-collab-backend .

# Frontend
cd frontend
docker build -t kiet-collab-frontend .
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up monitoring and logging

## 📊 Monitoring

- **Health Check**: `/health` endpoint
- **Metrics**: Prometheus-compatible metrics (planned)
- **Logging**: Structured logging with Winston (planned)
- **Error Tracking**: Sentry integration (planned)

## 🔒 Security Features

- HTTPS enforcement
- Helmet.js security headers
- Rate limiting with Redis
- Input validation
- RBAC (Role-Based Access Control)
- JWT with refresh token rotation
- Password hashing with bcrypt

## 🎯 Performance Targets

- p95 read latency < 200ms
- Chat p99 latency < 1s
- 99.9% availability
- Support for 500+ concurrent users

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the KIET Development Team

## 🚧 Roadmap

### Sprint 1 (Weeks 1-2) ✅
- [x] Project setup and architecture
- [x] Authentication system with JWT
- [x] Basic UI with landing page
- [x] User registration and login
- [x] OpenAPI documentation

### Sprint 2 (Weeks 3-4) 🔄
- [ ] Real-time chat implementation
- [ ] Project CRUD operations
- [ ] File upload system
- [ ] User profile management

### Sprint 3 (Weeks 5-6)
- [ ] Events and hackathons module
- [ ] Forum implementation
- [ ] Admin dashboard
- [ ] Mobile responsiveness improvements

## 🐛 Known Issues

- Google OAuth integration pending
- Email verification system pending
- Advanced search functionality pending

## 📞 Support

For support, email dev@kiet.edu or create an issue in the repository.