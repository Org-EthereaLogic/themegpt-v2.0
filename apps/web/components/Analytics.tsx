"use client";

// Importing analytics triggers Firebase Analytics initialization on the client.
// Pageview tracking is automatic once initialized.
import { analytics } from "@/lib/firebase";

// Consume the import to satisfy linters — analytics init is the side effect.
void analytics;

export function Analytics() {
  return null;
}
