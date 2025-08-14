# Multi-stage build for Renow Recommerce Product Suggester
# Frontend and backend are pre-built locally to avoid ARM64 Rollup issues

# Stage 1: Production runtime
FROM node:18-alpine AS production

WORKDIR /app

# Install only production dependencies for backend
COPY server/package*.json ./
RUN npm ci --only=production

# Copy pre-built backend (built locally)
COPY server/dist ./dist

# Copy pre-built frontend (built locally)
COPY dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
