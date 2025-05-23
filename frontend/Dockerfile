# Base image for Node.js
FROM node:18 AS build-env

# Set the working directory
WORKDIR /app/frontend

# Copy and install frontend dependencies
COPY ./package*.json ./
RUN npm install

# Build the frontend
COPY ./src ./src
COPY ./angular.json ./
COPY ./tsconfig*.json ./
COPY ./*.config.js ./

# Build the frontend
RUN npm run build --omit dev

# Final base image with Nginx
FROM nginx:1.28

# Copy the frontend build output
COPY --from=build-env /app/frontend/dist/drinkster /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
