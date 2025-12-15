# =============================================================================
# NEXUSVPN FRONTEND DOCKERFILE - PRODUCTION
# =============================================================================
# Multi-stage build for React frontend
# Optimized for production with Nginx

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY frontend/package*.json ./
COPY frontend/yarn.lock* ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install Node.js for serving
RUN apk add --no-cache nodejs npm

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY infrastructure/nginx.conf /etc/nginx/conf.d/

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy health check script
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'wget -q --spider http://localhost/ || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Change ownership
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /healthcheck.sh

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Labels for metadata
LABEL maintainer="NexusVPN Team"
LABEL version="1.0.0"
LABEL description="NexusVPN Frontend Web Application"