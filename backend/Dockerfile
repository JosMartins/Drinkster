# Base image for Node.js
FROM node:18

# Set the working directory
WORKDIR /app

# Copy code, install backend dependencies, build and prune dev dependencies
COPY . ./backend/
WORKDIR /app/backend
RUN npm install && npm run build --omit-dev && npm prune --omit=dev

# Expose port
EXPOSE 3432

# Start the backend
CMD ["node", "/app/backend/dist/app.js"]
