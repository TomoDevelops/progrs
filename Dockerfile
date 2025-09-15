# Use Bun base image
FROM oven/bun:1 AS base
WORKDIR /app
ENV NODE_ENV=production

# Accept build-time environment variables
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG DATABASE_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG RESEND_API_KEY
ARG EMAIL_FROM
ARG APP_NAME

# Set environment variables for build time
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL
ENV NEXT_PUBLIC_BETTER_AUTH_URL=$NEXT_PUBLIC_BETTER_AUTH_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV DATABASE_URL=$DATABASE_URL
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV EMAIL_FROM=$EMAIL_FROM
ENV APP_NAME=$APP_NAME

# Install dependencies into temp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build the application
RUN bun run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/.next .next
COPY --from=prerelease /app/public public
COPY --from=prerelease /app/package.json .

# Expose port
EXPOSE 3000/tcp

# Start the application
CMD ["bun", "run", "start"]