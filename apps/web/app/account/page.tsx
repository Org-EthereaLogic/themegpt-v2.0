"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubscriptionResponse, DownloadHistoryItem } from "@themegpt/shared";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            className="px-4 py-2 text-[#7D5A4A] hover:text-[#4B2E1E] transition-colors"
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

                {subscription.credits.isGracePeriod && (
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

              {/* Credits Display - Hidden for Lifetime */}
              {subscription.isLifetime ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4B2E1E] font-medium">
                      Theme Access
                    </span>
                    <span className="text-purple-600 font-bold text-lg">
                      Unlimited
                    </span>
                  </div>
                  <p className="text-sm text-[#7D5A4A] mt-2">
                    As a lifetime member, you have unlimited access to all current and future premium themes.
                  </p>
                </div>
              ) : (
                <div className="bg-[#FAF6F0] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#4B2E1E] font-medium">
                      Monthly Credits
                    </span>
                    <span className="text-[#7ECEC5] font-bold text-lg">
                      {subscription.credits.remaining} / {subscription.credits.total}
                    </span>
                  </div>
                  <div className="w-full bg-[#E5DDD5] rounded-full h-2">
                    <div
                      className="bg-[#7ECEC5] h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (subscription.credits.remaining /
                            subscription.credits.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-[#7D5A4A] mt-2">
                    Resets on{" "}
                    {new Date(subscription.credits.resetsAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {subscription.credits.isGracePeriod && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your subscription is canceled. You can still re-download
                    previously downloaded themes until your current period ends.
                    New downloads are not available.
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
                className="inline-block px-6 py-3 bg-[#7ECEC5] text-white font-medium rounded-lg hover:bg-[#6ABEB5] transition-colors"
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
                  {subscription &&
                    (subscription.status === "active" ||
                      subscription.status === "canceled") && (
                      <button
                        onClick={() => handleRedownload(item.themeId)}
                        className="px-4 py-2 text-sm text-[#7ECEC5] border border-[#7ECEC5] rounded-lg hover:bg-[#7ECEC5] hover:text-white transition-colors"
                      >
                        Re-download
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
            className="px-4 py-2 bg-[#4B2E1E] text-white rounded-lg hover:bg-[#3A2317] transition-colors"
          >
            Generate Link Code
          </button>
        </div>
      </div>
    </div>
  );

  async function handleRedownload(themeId: string) {
    try {
      const response = await fetch("/api/download/redownload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Theme data is returned - extension can use this
        alert(`Theme "${data.theme.name}" ready for download!`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to re-download theme");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  }

  async function handleGenerateLinkCode() {
    try {
      const response = await fetch("/api/link/generate", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Your link code is: ${data.shortCode}\n\nEnter this code in your ThemeGPT extension to link your account.\n\nThis code expires in 10 minutes.`
        );
      } else {
        alert("Failed to generate link code");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  }
}
