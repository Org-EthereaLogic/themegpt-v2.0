"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SubscriptionResponse } from "@themegpt/shared";

// Local type for download history (API response)
interface DownloadHistoryItem {
  themeId: string;
  themeName: string;
  downloadedAt: string;
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redownloadingTheme, setRedownloadingTheme] = useState<string | null>(null);
  const [generatingLinkCode, setGeneratingLinkCode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAccountData();
    }
  }, [status]);

  const fetchAccountData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch subscription status
      const subResponse = await fetch("/api/subscription");
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      // Fetch download history
      const historyResponse = await fetch("/api/download/history");
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }
    } catch (err) {
      setError("Failed to load account data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="animate-pulse text-[#4B2E1E]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Determine if user is in grace period (canceled but still has access)
  const isGracePeriod = subscription?.status === "canceled" && subscription?.gracePeriodEnds;

  return (
    <div className="min-h-screen bg-[#FAF6F0] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4B2E1E]">Your Account</h1>
            <p className="text-[#7D5A4A]">{session.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 text-[#7D5A4A] hover:text-[#4B2E1E] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] rounded-lg"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Subscription Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#4B2E1E] mb-4">
            Subscription Status
          </h2>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === "active"
                      ? "bg-green-100 text-green-800"
                      : subscription.status === "trialing"
                      ? "bg-blue-100 text-blue-800"
                      : subscription.status === "canceled"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {subscription.status === "active"
                    ? "Active"
                    : subscription.status === "trialing"
                    ? "Trial"
                    : subscription.status === "canceled"
                    ? "Canceling"
                    : "Expired"}
                </span>

                {/* Plan Type Badge */}
                {subscription.isLifetime ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Lifetime Member
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#E5DDD5] text-[#4B2E1E]">
                    {subscription.planType === "yearly" ? "Yearly Plan" : "Monthly Plan"}
                  </span>
                )}

                {isGracePeriod && (
                  <span className="text-sm text-[#7D5A4A]">
                    Access until{" "}
                    {new Date(subscription.gracePeriodEnds!).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Trial Info */}
              {subscription.status === "trialing" && subscription.trialEndsAt && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Your free trial ends on{" "}
                    <strong>{new Date(subscription.trialEndsAt).toLocaleDateString()}</strong>.
                    You will be charged after the trial period.
                  </p>
                </div>
              )}

              {/* Commitment Info for Yearly (non-lifetime) */}
              {subscription.planType === "yearly" && !subscription.isLifetime && subscription.commitmentEndsAt && (
                <div className="text-sm text-[#7D5A4A]">
                  Commitment period ends:{" "}
                  <strong>{new Date(subscription.commitmentEndsAt).toLocaleDateString()}</strong>
                </div>
              )}

              {/* Access Display */}
              <div className={`rounded-lg p-4 ${
                subscription.isLifetime
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                  : "bg-[#FAF6F0]"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[#4B2E1E] font-medium">
                    Premium Theme Access
                  </span>
                  <span className={`font-bold text-lg ${
                    subscription.isLifetime ? "text-purple-600" : "text-[#7ECEC5]"
                  }`}>
                    {subscription.hasFullAccess ? "Full Access" : "Restricted"}
                  </span>
                </div>
                <p className="text-sm text-[#7D5A4A] mt-2">
                  {subscription.isLifetime
                    ? "As a lifetime member, you have unlimited access to all current and future premium themes."
                    : subscription.hasFullAccess
                    ? "You have full access to all 8 premium themes and animated effects."
                    : "Your subscription is not currently active."}
                </p>
              </div>

              {isGracePeriod && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your subscription is canceled. You still have access to all premium
                    themes until your current period ends.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#7D5A4A] mb-4">
                You don&apos;t have an active subscription.
              </p>
              <Link
                href="/#pricing"
                className="inline-block px-6 py-3 bg-[#7ECEC5] text-white font-medium rounded-lg hover:bg-[#6ABEB5] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2]"
              >
                Subscribe Now
              </Link>
            </div>
          )}
        </div>

        {/* Download History */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#4B2E1E] mb-4">
            Download History
          </h2>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#FAF6F0] rounded-lg"
                >
                  <div>
                    <p className="font-medium text-[#4B2E1E]">
                      {item.themeName}
                    </p>
                    <p className="text-sm text-[#7D5A4A]">
                      Downloaded{" "}
                      {new Date(item.downloadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {subscription?.hasFullAccess && (
                    <button
                      onClick={() => handleRedownload(item.themeId)}
                      disabled={redownloadingTheme !== null}
                      aria-busy={redownloadingTheme === item.themeId}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#7ECEC5] border border-[#7ECEC5] rounded-lg hover:bg-[#7ECEC5] hover:text-white transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#7ECEC5]"
                    >
                      {redownloadingTheme === item.themeId && <Spinner />}
                      {redownloadingTheme === item.themeId ? "Downloading..." : "Re-download"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#7D5A4A] py-6">
              No downloads yet. Start exploring premium themes!
            </p>
          )}
        </div>

        {/* Account Linking Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-[#4B2E1E] mb-4">
            Extension Account Linking
          </h2>
          <p className="text-[#7D5A4A] mb-4">
            Link your extension to your account to sync your subscription and
            download history.
          </p>
          <button
            onClick={handleGenerateLinkCode}
            disabled={generatingLinkCode}
            aria-busy={generatingLinkCode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B2E1E] text-white rounded-lg hover:bg-[#3A2317] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingLinkCode && <Spinner />}
            {generatingLinkCode ? "Generating..." : "Generate Link Code"}
          </button>
        </div>
      </div>
    </div>
  );

  async function handleRedownload(themeId: string) {
    setRedownloadingTheme(themeId);
    try {
      const response = await fetch("/api/download/redownload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Theme data is returned - extension can use this
        toast.success(`Theme "${data.theme.name}" ready for download!`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to re-download theme");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setRedownloadingTheme(null);
    }
  }

  async function handleGenerateLinkCode() {
    setGeneratingLinkCode(true);
    try {
      const response = await fetch("/api/link/generate", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Your link code is: ${data.shortCode}`,
          {
            description: "Enter this code in your ThemeGPT extension to link your account. This code expires in 10 minutes.",
            duration: 15000,
          }
        );
      } else {
        toast.error("Failed to generate link code");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setGeneratingLinkCode(false);
    }
  }
}
