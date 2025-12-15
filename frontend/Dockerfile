# Frontend Dockerfile for NexusVPN
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve for production
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nexusvpn -u 1001

# Change ownership of the app directory
RUN chown -R nexusvpn:nodejs /app
USER nexusvpn

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]