# Dev image for the Next.js app. For production we would switch to a
# multi-stage build with `next build` + `next start`.
FROM node:22-alpine
WORKDIR /app

# Install deps first for layer caching.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]
