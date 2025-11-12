"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") === "supply" ? "supply" : "demand";
  const citiesParam = searchParams.get("cities");
  const userId = searchParams.get("id");
  const [copied, setCopied] = useState(false);

  const selectedCities = citiesParam
    ? decodeURIComponent(citiesParam)
        .split(",")
        .filter(Boolean)
    : [];

  const referralLink = userId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/waitlist/demand?r=${userId}`
    : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Thanks for joining</p>
        <h1 className="text-4xl font-semibold text-gray-900">
          You’re officially on the Cove early-access list.
        </h1>
        {type === "demand" && selectedCities.length > 0 ? (
          <p className="text-base text-gray-600">
            We’ve flagged your interest in{" "}
            <span className="font-medium text-gray-900">{selectedCities.join(", ")}</span>. We’ll send
            an update once verified rooms in those cities unlock.
          </p>
        ) : (
          <p className="text-base text-gray-600">
            Our team reviews every submission manually. Expect a confirmation email once we verify your
            info.
          </p>
        )}

        {type === "demand" && userId && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Share your referral link</p>
            <div className="flex gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600 bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-2 rounded-md border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Friends who join through your link help boost your priority in the waitlist.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-md border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
