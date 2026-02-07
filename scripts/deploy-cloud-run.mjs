#!/usr/bin/env node
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = join(__dirname, '..', 'service-account.json');

const PROJECT_ID = 'gen-lang-client-0312336987';
const REGION = 'us-central1';
const SERVICE_NAME = 'theme-gpt-web';
const IMAGE = `us-central1-docker.pkg.dev/${PROJECT_ID}/theme-gpt-repo/theme-gpt-web:v4`;

async function deploy() {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const accessToken = (await client.getAccessToken()).token;

  // Load env vars for Cloud Run
  const envLocal = readFileSync(join(__dirname, '..', 'apps', 'web', '.env.local'), 'utf8');
  const envVars = {};
  envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2];
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Unescape newlines
      value = value.replace(/\\n/g, '\n');
      envVars[match[1]] = value;
    }
  });

  console.log('Deploying to Cloud Run...');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Region: ${REGION}`);
  console.log(`Service: ${SERVICE_NAME}`);
  console.log(`Image: ${IMAGE}`);
  console.log('Environment variables:', Object.keys(envVars));
  console.log('FIREBASE_PRIVATE_KEY starts with:', envVars.FIREBASE_PRIVATE_KEY?.substring(0, 30));

  const serviceConfig = {
    template: {
      containers: [{
        image: IMAGE,
        ports: [{ containerPort: 3000 }],
        env: Object.entries(envVars).map(([name, value]) => ({ name, value })),
        resources: {
          limits: {
            cpu: '1',
            memory: '1Gi',
          },
        },
      }],
      scaling: {
        minInstanceCount: 0,
        maxInstanceCount: 10,
      },
    },
  };

  // Check if service exists
  const getUrl = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE_NAME}`;
  let serviceExists = false;

  try {
    const getResponse = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    serviceExists = getResponse.ok;
    console.log(`Service exists: ${serviceExists}`);
  } catch (e) {
    console.log('Service does not exist, will create new');
  }

  let response;
  if (serviceExists) {
    // Update existing service
    console.log('Updating existing service...');
    response = await fetch(getUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceConfig),
    });
  } else {
    // Create new service
    console.log('Creating new service...');
    const createUrl = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services?serviceId=${SERVICE_NAME}`;
    response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceConfig),
    });
  }

  const result = await response.json();

  if (!response.ok) {
    console.error('Deployment failed:', JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log('Deployment initiated successfully!');
  console.log('Operation:', result.name);

  // Wait for operation to complete
  if (result.name) {
    console.log('Waiting for deployment to complete...');
    let operationDone = false;
    let attempts = 0;
    const maxAttempts = 60;

    while (!operationDone && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      const opResponse = await fetch(`https://run.googleapis.com/v2/${result.name}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const opResult = await opResponse.json();

      if (opResult.done) {
        operationDone = true;
        if (opResult.error) {
          console.error('Deployment failed:', opResult.error);
          process.exit(1);
        }
        console.log('Deployment completed!');
      } else {
        console.log(`Waiting... (attempt ${attempts}/${maxAttempts})`);
      }
    }

    if (!operationDone) {
      console.log('Deployment is still in progress. Check Cloud Console for status.');
    }
  }

  // Set IAM policy for public access
  console.log('Setting IAM policy for public access...');
  const iamUrl = `https://run.googleapis.com/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${SERVICE_NAME}:setIamPolicy`;
  const iamResponse = await fetch(iamUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      policy: {
        bindings: [{
          role: 'roles/run.invoker',
          members: ['allUsers'],
        }],
      },
    }),
  });

  if (iamResponse.ok) {
    console.log('Public access enabled!');
  } else {
    const iamError = await iamResponse.json();
    console.error('Failed to set IAM policy:', iamError);
  }

  // Get service URL
  const finalResponse = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const finalService = await finalResponse.json();
  console.log('\nService URL:', finalService.uri);
}

deploy().catch(console.error);
