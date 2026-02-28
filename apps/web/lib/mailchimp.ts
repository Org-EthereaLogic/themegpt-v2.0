import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mailchimpLib = require("@mailchimp/mailchimp_marketing") as {
  setConfig: (config: { apiKey: string; server: string }) => void;
  lists: {
    setListMember: (listId: string, hash: string, body: Record<string, unknown>) => Promise<unknown>;
    updateListMemberTags: (listId: string, hash: string, body: { tags: { name: string; status: "active" | "inactive" }[] }) => Promise<unknown>;
  };
};

function getConfig(): { apiKey: string; listId: string; server: string } | null {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const server = process.env.MAILCHIMP_SERVER_PREFIX;
  if (!apiKey || !listId || !server) {
    console.warn("[mailchimp] Missing env vars (MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER_PREFIX) — skipping");
    return null;
  }
  return { apiKey, listId, server };
}

function subscriberHash(email: string): string {
  return crypto.createHash("md5").update(email.toLowerCase().trim()).digest("hex");
}

export async function subscribeContact(
  email: string,
  tags: string[],
  mergeFields?: Record<string, string>
): Promise<void> {
  const config = getConfig();
  if (!config) return;

  try {
    mailchimpLib.setConfig({ apiKey: config.apiKey, server: config.server });
    const hash = subscriberHash(email);
    await mailchimpLib.lists.setListMember(config.listId, hash, {
      email_address: email.toLowerCase().trim(),
      status_if_new: "subscribed",
      tags: tags.map((t) => ({ name: t, status: "active" })),
      ...(mergeFields ? { merge_fields: mergeFields } : {}),
    });
  } catch (err) {
    console.error("[mailchimp] subscribeContact failed:", err);
  }
}

export async function tagContact(
  email: string,
  tags: string[],
  mergeFields?: Record<string, string>
): Promise<void> {
  const config = getConfig();
  if (!config) return;

  try {
    mailchimpLib.setConfig({ apiKey: config.apiKey, server: config.server });
    const hash = subscriberHash(email);
    if (mergeFields) {
      await mailchimpLib.lists.setListMember(config.listId, hash, {
        email_address: email.toLowerCase().trim(),
        status_if_new: "subscribed",
        merge_fields: mergeFields,
      });
    }
    await mailchimpLib.lists.updateListMemberTags(config.listId, hash, {
      tags: tags.map((t) => ({ name: t, status: "active" })),
    });
  } catch (err) {
    console.error("[mailchimp] tagContact failed:", err);
  }
}

export async function unsubscribeContact(email: string): Promise<void> {
  const config = getConfig();
  if (!config) return;

  try {
    mailchimpLib.setConfig({ apiKey: config.apiKey, server: config.server });
    const hash = subscriberHash(email);
    await mailchimpLib.lists.setListMember(config.listId, hash, {
      email_address: email.toLowerCase().trim(),
      status: "unsubscribed",
    });
  } catch (err) {
    console.error("[mailchimp] unsubscribeContact failed:", err);
  }
}
