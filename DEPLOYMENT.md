# Deployment Guide

This project uses GitHub Actions for CI/CD to build and deploy the application using Docker and Dokploy.

## Prerequisites

### Docker Hub Setup
1. Create a Docker Hub account if you don't have one
2. Create a repository named `progrs` (or update the workflow to match your repository name)

### GitHub Secrets

You need to configure the following secrets in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following repository secrets:

#### Required Secrets:

- **DOCKER_USERNAME**: Your Docker Hub username
- **DOCKER_PASSWORD**: Your Docker Hub password or access token (recommended)
- **DOKPLOY_WEBHOOK_URL**: The webhook URL from your Dokploy application (optional)

### Dokploy Setup

1. Create an application in Dokploy
2. Set Source Type to "Docker"
3. Set Docker image to: `your-dockerhub-username/progrs:latest`
4. Configure the port to 3000
5. Copy the webhook URL from the Deployments tab (if you want auto-deployment)

## Workflow Triggers

The deployment workflow runs on:
- Direct pushes to the `main` branch
- Pull request merges to the `main` branch

## Docker Image Tags

The workflow creates the following tags:
- `latest` (for main branch)
- `main-<commit-sha>` (for tracking specific commits)

## Manual Deployment

To manually trigger a deployment:
1. Push to the main branch, or
2. Merge a pull request to main

The workflow will automatically build and push the Docker image to Docker Hub, and optionally trigger a deployment in Dokploy if the webhook URL is configured.

## Local Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Docker Build Locally

```bash
# Build the image
docker build -t progrs .

# Run the container
docker run -p 3000:3000 progrs
```