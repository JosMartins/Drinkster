# Base image for Node.js
FROM node:18 AS build-env

# Set the working directory
WORKDIR /app

# Copy and install frontend dependencies
COPY ./package*.json ./frontend/
RUN cd frontend && npm install

# Build the frontend
COPY . ./frontend/
RUN cd frontend && npm run build --omit dev

# Final base image with Nginx
FROM nginx:latest

# Copy the frontend build output
COPY --from=build-env /app/frontend/dist/drinkster /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
