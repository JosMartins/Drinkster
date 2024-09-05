# Base image for Node.js
FROM node:18 AS build-env

# Set the working directory
WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install


COPY backend/ ./backend/

# Copy and install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Build the frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm run build --prod

# Final base image
FROM nginx:alpine

# Copy the frontend from the build stage
COPY --from=build-env /app/frontend/Drinkster /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the backend code
COPY --from=build-env /app/backend /app/backend

# Set working directory to backend
WORKDIR /app/backend

# Expose only the Nginx port
EXPOSE 80

# Start Nginx and Node.js backend
CMD nginx && node ./backend/index.js

