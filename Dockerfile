# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Accept build arguments for API URL
ARG VITE_API_BASE_URL=http://localhost:8000/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy configuration files
COPY tsconfig.json vite.config.ts ./

# Copy source code (bao gồm assets)
COPY src ./src

# Copy index.html
COPY index.html ./

# Copy nginx config for later
COPY nginx.conf ./nginx.conf

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
