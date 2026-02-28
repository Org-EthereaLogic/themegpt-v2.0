import subprocess

bad_var = "MAILCH\n  IMP_SERVER_PREFIX"
cmd = [
    "gcloud", "run", "services", "update", "themegpt-web",
    "--remove-env-vars", f"{bad_var}",
    "--remove-secrets", "MAILCHIMP_API_KEY",
    "--region", "us-central1"
]
print(f"Executing: {cmd}")
subprocess.run(cmd)
