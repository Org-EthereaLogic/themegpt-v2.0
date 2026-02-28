import subprocess

print("Creating secret...")
subprocess.run('printf "YOUR_API_KEY_HERE-us4" | gcloud secrets create MAILCHIMP_API_KEY --data-file=-', shell=True)

print("Retrieving service account...")
res = subprocess.run('gcloud run services describe themegpt-web --region us-central1 --format="value(spec.template.spec.serviceAccountName)"', shell=True, capture_output=True, text=True)
sa = res.stdout.strip()

if not sa:
    print("Using default compute service account")
    res = subprocess.run('gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)"', shell=True, capture_output=True, text=True)
    sa = f"{res.stdout.strip()}-compute@developer.gserviceaccount.com"

print(f"Granting SecretAccessor role to {sa}...")
subprocess.run(f'gcloud secrets add-iam-policy-binding MAILCHIMP_API_KEY --member="serviceAccount:{sa}" --role="roles/secretmanager.secretAccessor"', shell=True)

print("Updating Cloud Run service (removing env vars and adding secret)...")
bad_var = "MAILCH\n  IMP_SERVER_PREFIX"
cmd = [
    "gcloud", "run", "services", "update", "themegpt-web",
    "--remove-env-vars", f"MAILCHIMP_API_KEY,{bad_var}",
    "--set-secrets", "MAILCHIMP_API_KEY=MAILCHIMP_API_KEY:latest",
    "--region", "us-central1"
]
subprocess.run(cmd)

print("Done.")
