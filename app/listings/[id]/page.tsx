"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { mockListings } from "@/lib/listings-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const listing = mockListings.find((l) => l.id === resolvedParams.id);
  const [moveIn, setMoveIn] = useState("");
  const [moveOut, setMoveOut] = useState("");

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Listing not found
          </h1>
          <button
            onClick={() => router.push("/listings")}
            className="px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const hasMultipleGuests = listing.maxGuests > 1;
  const heroImage = listing.photos?.[0] ?? "/placeholder-listing-1.jpg";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const availabilityWindow = `${formatDate(listing.availableFrom)} – ${formatDate(listing.availableTo)}`;
  const statHighlights = [
    {
      label: "Monthly",
      value: formatPrice(listing.price),
    },
    {
      label: "Bedrooms",
      value: listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms}`,
    },
    {
      label: "Bathrooms",
      value: `${listing.bathrooms}`,
    },
    {
      label: "Guests",
      value: `${listing.maxGuests}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3 text-sm">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to results
          </button>
          <span className="hidden sm:inline text-gray-300">|</span>
          <p className="text-gray-500">
            {listing.neighborhood}, {listing.city}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              <div
                className="h-[320px] sm:h-[420px] bg-cover bg-center"
                style={{
                  backgroundImage: heroImage ? `url(${heroImage})` : "linear-gradient(135deg, #f5f5f5, #ececec)",
                }}
              >
                {!heroImage && (
                  <div className="flex h-full w-full items-center justify-center text-gray-400 text-lg font-medium">
                    Coming soon
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {[1, 2].map((offset) => {
              const image = listing.photos?.[offset];
              return (
                <div
                  key={offset}
                  className="h-[154px] sm:h-[200px] rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
                  style={
                    image
                      ? {
                          backgroundImage: `url(${image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!image && (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm font-medium">
                      Coming soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
                    For rent
                  </p>
                  <p className="text-4xl font-semibold text-gray-900">
                    {formatPrice(listing.price)}
                    <span className="text-base font-normal text-gray-500"> / month</span>
                  </p>
                  <p className="text-gray-600 text-lg mt-2">
                    {listing.neighborhood}, {listing.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {statHighlights.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-gray-200 p-3">
                      <p className="text-xs uppercase tracking-wider text-gray-500">{stat.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">About this property</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {listing.amenities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-gray-700 text-sm"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact host</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your timeline or questions and we&apos;ll introduce you directly to the host.
              </p>
              <button className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                Send message
              </button>
            </div>

            {hasMultipleGuests && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top roommate matches
                </h3>
                <div className="flex items-center justify-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">Matching recommendations coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
