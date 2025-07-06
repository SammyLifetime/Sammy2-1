# -------- Stage 1: Install dependencies --------
FROM node:18-slim AS builder
WORKDIR /usr/src/app

# Copy lockfile and package file to install exact deps, then cache
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# If you have a build step (e.g. TypeScript), run it here
# RUN npm run build

# -------- Stage 2: Create production image --------
FROM node:18-slim AS runner
WORKDIR /usr/src/app

# Copy only production node_modules and built code (if any)
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

# Use a non-root user for security
USER node

# (Optional) expose port for documentation; Koyeb/Railway set PORT env automatically
EXPOSE 3000

# Production environment variable
ENV NODE_ENV=production

# Start the bot
CMD ["node", "index.js"]
