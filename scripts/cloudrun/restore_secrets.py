import json
import subprocess

with open("/tmp/rev_249.json", "r") as f:
    data = json.load(f)

containers = data.get("spec", {}).get("containers", [])
if not containers:
    print("No containers found")
    exit(1)

env_vars = containers[0].get("env", [])
secrets = []

for env in env_vars:
    if "valueFrom" in env and "secretKeyRef" in env["valueFrom"]:
        secret_name = env["name"]
        secret_ref_name = env["valueFrom"]["secretKeyRef"]["name"]
        secret_ref_key = env["valueFrom"]["secretKeyRef"]["key"]
        secrets.append(f"{secret_name}={secret_ref_name}:{secret_ref_key}")

print(f"Found {len(secrets)} secrets to restore.")

if secrets:
    secrets.append("MAILCHIMP_API_KEY=MAILCHIMP_API_KEY:latest")
    secrets_arg = ",".join(secrets)
    
    cmd = [
        "gcloud", "run", "services", "update", "themegpt-web",
        f"--set-secrets={secrets_arg}",
        "--region", "us-central1"
    ]
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd)
else:
    print("No secrets found to restore.")
