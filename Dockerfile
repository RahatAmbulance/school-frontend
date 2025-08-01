# Multi-stage build for optimization
FROM node:16-alpine AS builder

WORKDIR /opt/school-frontend

# Copy package files
COPY package*.json ./

# Install dependencies with better error handling
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Verify react-scripts is installed
RUN ls -la node_modules/.bin/ | grep react-scripts || exit 1

# Copy source code
COPY . .

# Build with error handling
RUN NODE_OPTIONS="--max_old_space_size=4096" \
    GENERATE_SOURCEMAP=false \
    npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built app
COPY --from=builder /opt/school-frontend/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]
