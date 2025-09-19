# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .

# Declare build args
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Make them available to Next.js build
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

RUN bun run build

# Production stage
FROM oven/bun:1 AS production
WORKDIR /app

# Install only production dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy only the necessary files from build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Expose port and define the command to run the app
EXPOSE 3000
CMD ["bun", "run", "start"]