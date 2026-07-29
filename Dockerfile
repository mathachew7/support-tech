# Placeholder Dockerfile for the Next.js app.
# Activated in Phase 0 once package.json exists; the app service in
# docker-compose.yml is commented out until then.
FROM node:22-alpine
WORKDIR /app

# Install deps first for layer caching (uncomment once package.json exists).
# COPY package.json package-lock.json* ./
# RUN npm ci

# COPY . .
# EXPOSE 3000
# CMD ["npm", "run", "dev"]
CMD ["node", "-e", "console.log('Dockerfile is a placeholder - scaffold Next.js in Phase 0')"]
