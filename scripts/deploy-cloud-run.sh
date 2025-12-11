#!/bin/bash
set -e

# Project configuration
export PATH=$PATH:/Users/etherealogic/google-cloud-sdk/bin
PROJECT_ID="gen-lang-client-0312336987"
REGION="us-central1"
SERVICE_NAME="theme-gpt-web"
ENV_FILE="apps/web/.env.local"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Deploying ThemeGPT to Cloud Run...${NC}"

# 1. Build Container
echo -e "\n${GREEN}1. Building container image with Cloud Build...${NC}"

IMAGE_NAME="us-central1-docker.pkg.dev/$PROJECT_ID/theme-gpt-repo/$SERVICE_NAME"
echo -e "Image: $IMAGE_NAME"
gcloud builds submit . \
  --project=$PROJECT_ID \
  --config=cloudbuild.yaml \
  --config=cloudbuild.yaml \
  --quiet

# 2. Prepare Environment Variables
echo -e "\n${GREEN}2. Preparing environment variables...${NC}"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found!${NC}"
    exit 1
fi

# Construct comma-separated env vars string from .env.local
# Filter out comments and empty lines
ENV_VARS=$(grep -v '^#' $ENV_FILE | grep -v '^\s*$' | tr '\n' ',' | sed 's/,$//')

# 3. Deploy to Cloud Run
echo -e "\n${GREEN}3. Deploying to Cloud Run service: $SERVICE_NAME...${NC}"

gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --allow-unauthenticated \
  --service-account=web-app-admin@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars="$ENV_VARS"

# 4. Deploy Firebase Hosting
# Note: This requires firebase-tools to be installed.
# If not, we might need to skip or use npx.
echo -e "\n${GREEN}4. Deploying Firebase Hosting config...${NC}"
if command -v firebase &> /dev/null; then
    firebase deploy --only hosting --project $PROJECT_ID
else
    echo -e "Firebase CLI not found, trying npx..."
    npx firebase-tools deploy --only hosting --project $PROJECT_ID
fi

echo -e "\n${GREEN}Deployment Complete!${NC}"
