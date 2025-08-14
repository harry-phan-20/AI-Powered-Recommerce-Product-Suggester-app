# AI-Powered Recommerce Product Suggester

A React-based application that uses AI to generate compelling marketing text and suggest product categories for second-hand electronics. Built with modern web technologies and designed for scalability.

## 🚀 Features

- **AI-Powered Suggestions**: Generate marketing text using Google Gemini AI
- **Smart Category Selection**: Intelligent category matching from Google Product Taxonomy
- **Modern UI/UX**: Built with Radix UI components and smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Robust error handling with retry logic and user feedback
- **Performance Monitoring**: Built-in performance metrics and optimization tools

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Library**: Radix UI Primitives + Radix Themes
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
- **Testing**: Vitest + Testing Library
- **Build Tool**: Vite with TypeScript compilation
- **Styling**: Radix Themes CSS variables and components
- **Performance**: Custom monitoring and optimization utilities

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd renow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**To get your Gemini API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key to your `.env` file

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 🏗️ Build

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🏗️ Architecture

### Current Architecture (MVP)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  Google Gemini   │───▶│  AI Response    │
│   (Frontend)    │    │     API          │    │   Processing    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Form Input     │    │  Prompt          │    │  Category       │
│  Validation     │    │  Engineering     │    │  Selection      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Production Architecture (Planned)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│  Backend API     │───▶│  Google Gemini  │
│   (Frontend)    │    │  (Express.js)    │    │     API         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  CDN + Cache    │    │  Authentication  │    │  Rate Limiting  │
│  (Performance)  │    │  + Security      │    │  + Monitoring   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔒 Security Considerations

### Current Implementation (Development)
- **API Key Exposure**: API keys are currently exposed in client-side code
- **No Authentication**: No user authentication or authorization
- **Basic Validation**: Input validation with Zod schemas
- **Rate Limiting**: Basic client-side rate limiting

### Production Security (Planned)
- **Backend Proxy**: All API calls routed through secure backend
- **JWT Authentication**: Secure user authentication with refresh tokens
- **Rate Limiting**: Redis-based rate limiting per user/IP
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Configuration**: Strict CORS policies for production domains
- **API Key Management**: Secure storage and rotation of API keys

### Security Best Practices Implemented
- **Environment Variables**: Sensitive data stored in `.env` files
- **Input Validation**: Zod schemas for type-safe input validation
- **Error Handling**: Secure error messages without information leakage
- **HTTPS Enforcement**: Production deployment with SSL/TLS
- **Security Headers**: Helmet.js for security headers

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker build -t renow-app .
docker run -p 3001:3001 -e GEMINI_API_KEY=your_key renow-app

# Or use Docker Compose for full stack
docker-compose up -d
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
GEMINI_API_KEY=your_production_key
ALLOWED_ORIGINS=https://yourdomain.com
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://user:pass@db:5432/renow
```

### Monitoring and Observability
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and dashboards
- **Health Checks**: `/api/health` endpoint for monitoring
- **Performance Metrics**: Real-time performance tracking
- **Error Tracking**: Comprehensive error logging and alerting

## 📊 Performance Optimization

### Built-in Optimizations
- **Code Splitting**: Dynamic imports for lazy loading
- **Bundle Analysis**: Built-in bundle size monitoring
- **Memory Monitoring**: Real-time memory usage tracking
- **Network Optimization**: Request caching and optimization
- **Image Optimization**: Automatic image format and size optimization

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **AI Response Time**: < 2s (95th percentile)
- **Bundle Size**: < 500KB (gzipped)
- **Memory Usage**: < 100MB

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: Form submission and API integration
- **Component Tests**: React component behavior
- **Performance Tests**: Load testing and optimization

### Testing Tools
- **Vitest**: Fast unit testing framework
- **Testing Library**: Component testing utilities
- **jsdom**: DOM environment for testing
- **Coverage Reports**: Detailed test coverage analysis

## 🔧 Development Workflow

### Code Quality
- **TypeScript**: Strict type checking and validation
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting and consistency
- **Git Hooks**: Pre-commit validation and testing

### Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
renow/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedContainer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── AdvancedAnimations.tsx
│   ├── lib/                # Core business logic
│   │   ├── suggester.ts    # AI integration
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # Type definitions
│   │   ├── categories.ts   # Product taxonomy
│   │   └── performance.ts  # Performance monitoring
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── server/                  # Backend server (production)
│   ├── index.ts            # Express server
│   └── package.json        # Backend dependencies
├── public/                  # Static assets
│   └── taxonomy-subset.json # Product categories
├── scripts/                 # Build and utility scripts
├── tests/                   # Test files
├── Dockerfile              # Production container
├── docker-compose.yml      # Development environment
└── README.md               # This file
```

## 🎯 Design Decisions & Trade-offs

### AI Integration Approach
- **Choice**: Google Gemini API for AI suggestions
- **Reasoning**: Free tier available, excellent performance, good documentation
- **Trade-off**: Vendor lock-in vs. rapid development and cost-effectiveness

### Category Selection Strategy
- **Choice**: Hybrid approach (AI + algorithmic fallback)
- **Reasoning**: AI provides intelligent suggestions, fallback ensures reliability
- **Trade-off**: Complexity vs. robustness and user experience

### Frontend Framework
- **Choice**: React 19 with TypeScript
- **Reasoning**: Modern, performant, excellent ecosystem, type safety
- **Trade-off**: Learning curve vs. long-term maintainability

### State Management
- **Choice**: React useState (local state)
- **Reasoning**: Simple requirements, no complex state sharing needed
- **Trade-off**: Scalability vs. simplicity for MVP

### Testing Strategy
- **Choice**: Vitest + Testing Library
- **Reasoning**: Fast, modern, excellent React support
- **Trade-off**: Ecosystem maturity vs. performance and developer experience

## 🚀 Future Enhancements

### Short Term (1-2 months)
- [ ] Backend API server implementation
- [ ] User authentication and authorization
- [ ] Database integration for suggestions
- [ ] Enhanced error handling and logging

### Medium Term (3-6 months)
- [ ] Multiple AI provider support
- [ ] Advanced analytics and reporting
- [ ] Mobile application (React Native)
- [ ] API marketplace for third-party integrations

### Long Term (6+ months)
- [ ] Machine learning for category prediction
- [ ] Image recognition for product photos
- [ ] Multi-language support
- [ ] White-label solution for enterprise clients

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the documentation above
3. Contact the development team

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the AI capabilities
- **Radix UI** for the excellent component library
- **Vite** for the fast build tooling
- **Vitest** for the testing framework

---

**Built with ❤️ by the Renow Team**

