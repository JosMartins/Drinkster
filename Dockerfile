# Base image for Node.js
FROM node:18 AS build-env

# Set the working directory
WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend code
COPY backend/ ./backend/

# Copy and install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Build the frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm run build --omit dev

# Final base image with both Node.js and Nginx
FROM node:18

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Set up Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the frontend build output
COPY --from=build-env /app/frontend/dist/drinkster /usr/share/nginx/html

# Copy backend code
COPY --from=build-env /app/backend /app/backend

# Expose ports
EXPOSE 80
EXPOSE 3432

# Start both Nginx and Node.js backend
CMD ["sh", "-c", "service nginx start && node /app/backend/app.js"]
