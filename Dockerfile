# New Working Docker

# # Base image with Node.js 18+ (recommended for Next.js 14)
FROM 163742846785.dkr.ecr.ap-south-1.amazonaws.com/node18-alpine-base-image AS builder

# # Set working directory inside the container
WORKDIR /app

# # Copy package.json and package-lock.json (if available) to install dependencies first
COPY package.json package-lock.json ./

# # Install dependencies (ignores devDependencies for smaller build)
RUN npm ci --omit=dev

# # Copy the entire project (excluding files in .dockerignore)
COPY . .

# # Build the Next.js app (standalone mode for better performance)
RUN npm run build && npm prune --omit=dev  # Remove unnecessary devDependencies

# # ---- Production Stage ----
FROM 163742846785.dkr.ecr.ap-south-1.amazonaws.com/node18-alpine-base-image AS runner

WORKDIR /app

# # Copy the standalone build and .next output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# # Expose the production port
EXPOSE 3001

# # Set environment variables (Next.js uses these automatically)
ENV NODE_ENV=production
ENV PORT=3001

# # Start the Next.js standalone server
CMD ["node", "server.js"]