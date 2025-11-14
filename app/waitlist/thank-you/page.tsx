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
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Thanks for applying</p>
        <h1 className="text-4xl font-semibold text-gray-900">
          {type === "demand" ? "Your application is under review" : "You're officially on the Cove early-access list."}
        </h1>
        {type === "demand" && selectedCities.length > 0 ? (
          <div className="space-y-4">
            <p className="text-base text-gray-600">
              We've received your application for{" "}
              <span className="font-medium text-gray-900">{selectedCities.join(", ")}</span>.
            </p>
            <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">What happens next?</p>
              <ol className="text-left text-sm text-gray-700 space-y-2">
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">1.</span>
                  <span>Our team will review your application and verify your information</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">2.</span>
                  <span>Once approved, you'll receive an email with your exclusive referral link</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">3.</span>
                  <span>We'll keep you updated on verified housing options in your target cities</span>
                </li>
              </ol>
            </div>
            <p className="text-sm text-gray-500">
              Check your email (including spam folder) for updates from the Cove team.
            </p>
          </div>
        ) : (
          <p className="text-base text-gray-600">
            Our team reviews every submission manually. Expect a confirmation email once we verify your
            info.
          </p>
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
