import { Resend } from "resend";

// Lazy-initialized Resend client (avoids build-time errors)
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email sender configuration
const EMAIL_FROM = process.env.EMAIL_FROM || "ThemeGPT <hello@themegpt.app>";

// Brand colors for email templates
export const BRAND_COLORS = {
  cream: "#FAF6F0",
  chocolate: "#4B2E1E",
  peach: "#F4A988",
  teal: "#7ECEC5",
} as const;

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  to: string,
  planType: "monthly" | "yearly" | "lifetime"
): Promise<EmailResult> {
  const planNames: Record<string, string> = {
    monthly: "Monthly",
    yearly: "Yearly",
    lifetime: "Lifetime (Early Adopter)",
  };

  const planPrices: Record<string, string> = {
    monthly: "$1.99/month",
    yearly: "$14.99/year",
    lifetime: "One-time payment",
  };

  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Welcome to ThemeGPT Premium! Your ${planNames[planType]} subscription is active`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND_COLORS.cream};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND_COLORS.chocolate}; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: ${BRAND_COLORS.cream}; font-size: 28px; font-weight: 700;">ThemeGPT</h1>
              <p style="margin: 8px 0 0; color: ${BRAND_COLORS.peach}; font-size: 14px;">Premium Themes for ChatGPT</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.chocolate}; font-size: 24px;">Welcome to Premium!</h2>
              <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for subscribing to ThemeGPT. Your ${planNames[planType]} plan is now active.
              </p>

              <!-- Plan Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream}; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Plan</p>
                    <p style="margin: 0; color: ${BRAND_COLORS.chocolate}; font-size: 20px; font-weight: 600;">${planNames[planType]}</p>
                    <p style="margin: 4px 0 0; color: ${BRAND_COLORS.peach}; font-size: 14px;">${planPrices[planType]}</p>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <h3 style="margin: 0 0 16px; color: ${BRAND_COLORS.chocolate}; font-size: 18px;">What's included:</h3>
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                <li>Access to all premium themes</li>
                <li>3 theme downloads per month</li>
                <li>Animated effects and seasonal themes</li>
                <li>Priority support</li>
              </ul>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://themegpt.ai/account" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLORS.peach}; color: ${BRAND_COLORS.chocolate}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      View Your Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                You're receiving this email because you subscribed to ThemeGPT Premium.
              </p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                <a href="https://themegpt.ai" style="color: ${BRAND_COLORS.chocolate}; text-decoration: none;">themegpt.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Failed to send subscription confirmation email:", error);
      return { success: false, error: error.message };
    }

    console.log(`Subscription confirmation email sent to ${to}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending subscription confirmation email:", message);
    return { success: false, error: message };
  }
}

/**
 * Send a single theme purchase confirmation email
 */
export async function sendThemePurchaseConfirmationEmail(
  to: string,
  themeName: string
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your ThemeGPT purchase: ${themeName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND_COLORS.cream};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND_COLORS.chocolate}; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: ${BRAND_COLORS.cream}; font-size: 28px; font-weight: 700;">ThemeGPT</h1>
              <p style="margin: 8px 0 0; color: ${BRAND_COLORS.peach}; font-size: 14px;">Premium Themes for ChatGPT</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.chocolate}; font-size: 24px;">Thank you for your purchase!</h2>
              <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.6;">
                You now have lifetime access to the following theme:
              </p>

              <!-- Theme Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream}; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Theme</p>
                    <p style="margin: 0; color: ${BRAND_COLORS.chocolate}; font-size: 24px; font-weight: 600;">${themeName}</p>
                    <p style="margin: 8px 0 0; color: ${BRAND_COLORS.teal}; font-size: 14px; font-weight: 500;">Lifetime Access</p>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <h3 style="margin: 0 0 16px; color: ${BRAND_COLORS.chocolate}; font-size: 18px;">How to use your theme:</h3>
              <ol style="margin: 0 0 24px; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                <li>Open the ThemeGPT extension in Chrome</li>
                <li>Go to the Premium Themes section</li>
                <li>Find "${themeName}" and click to apply</li>
                <li>Enjoy your new look!</li>
              </ol>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://themegpt.ai/account" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLORS.peach}; color: ${BRAND_COLORS.chocolate}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      View Your Account
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                You're receiving this email because you purchased a ThemeGPT theme.
              </p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                <a href="https://themegpt.ai" style="color: ${BRAND_COLORS.chocolate}; text-decoration: none;">themegpt.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Failed to send theme purchase confirmation email:", error);
      return { success: false, error: error.message };
    }

    console.log(`Theme purchase confirmation email sent to ${to}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending theme purchase confirmation email:", message);
    return { success: false, error: message };
  }
}

/**
 * Send a trial ending reminder email (3 days before trial ends)
 */
export async function sendTrialEndingEmail(
  to: string,
  daysRemaining: number = 3
): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your ThemeGPT trial ends in ${daysRemaining} days`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND_COLORS.cream};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND_COLORS.chocolate}; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: ${BRAND_COLORS.cream}; font-size: 28px; font-weight: 700;">ThemeGPT</h1>
              <p style="margin: 8px 0 0; color: ${BRAND_COLORS.peach}; font-size: 14px;">Premium Themes for ChatGPT</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.chocolate}; font-size: 24px;">Your trial is ending soon</h2>
              <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.6;">
                Your free trial of ThemeGPT Premium will end in <strong>${daysRemaining} days</strong>.
                After that, your subscription will automatically continue at the regular price.
              </p>

              <!-- Reminder Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream}; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; color: ${BRAND_COLORS.chocolate}; font-size: 14px; line-height: 1.6;">
                      If you'd like to continue enjoying premium themes, no action is needed.
                      Your subscription will automatically renew.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">
                If you'd like to cancel or make changes to your subscription, you can do so from your account page.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://themegpt.ai/account" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLORS.peach}; color: ${BRAND_COLORS.chocolate}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Manage Subscription
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                You're receiving this email because you have an active ThemeGPT trial.
              </p>
              <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
                <a href="https://themegpt.ai" style="color: ${BRAND_COLORS.chocolate}; text-decoration: none;">themegpt.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Failed to send trial ending email:", error);
      return { success: false, error: error.message };
    }

    console.log(`Trial ending email sent to ${to}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending trial ending email:", message);
    return { success: false, error: message };
  }
}
