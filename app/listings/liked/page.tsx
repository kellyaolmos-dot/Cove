"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockListings, Listing } from "@/lib/listings-data";
import { Heart, ArrowLeft } from "lucide-react";

export default function LikedListingsPage() {
  const router = useRouter();
  const [likedListings, setLikedListings] = useState<Listing[]>([]);

  useEffect(() => {
    // Load liked IDs from localStorage
    const saved = localStorage.getItem("likedListings");
    if (saved) {
      try {
        const likedIds: string[] = JSON.parse(saved);
        const liked = mockListings.filter((listing) =>
          likedIds.includes(listing.id)
        );
        setLikedListings(liked);
      } catch (e) {
        console.error("Failed to parse liked listings", e);
      }
    }
  }, []);

  const handleUnlike = (id: string) => {
    // Remove from state
    setLikedListings(likedListings.filter((listing) => listing.id !== id));

    // Update localStorage
    const saved = localStorage.getItem("likedListings");
    if (saved) {
      try {
        const likedIds: string[] = JSON.parse(saved);
        const updated = likedIds.filter((likedId) => likedId !== id);
        localStorage.setItem("likedListings", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update liked listings", e);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/listings/${id}`);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}/mo`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/listings")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Listings
          </button>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Your Liked Homes
              </h1>
              <p className="text-gray-600">
                {likedListings.length} listing{likedListings.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {likedListings.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No liked homes yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start swiping to find your perfect place!
            </p>
            <button
              onClick={() => router.push("/listings")}
              className="px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Explore Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <div className="text-gray-400 text-sm">
                    {listing.neighborhood}, {listing.city.slice(0, 2).toUpperCase()}
                  </div>
                  {/* Price tag */}
                  <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-md shadow-sm">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(listing.price)}
                    </span>
                  </div>
                  {/* Unlike button */}
                  <button
                    onClick={() => handleUnlike(listing.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                    aria-label="Unlike"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {listing.neighborhood}, {listing.city}
                  </p>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                    <span>
                      {listing.bedrooms === 0
                        ? "Studio"
                        : `${listing.bedrooms} bed`}
                    </span>
                    <span>•</span>
                    <span>{listing.bathrooms} bath</span>
                  </div>

                  {/* Availability */}
                  <div className="text-xs text-gray-500 mb-4">
                    {formatDate(listing.availableFrom)} —{" "}
                    {formatDate(listing.availableTo)}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewDetails(listing.id)}
                    className="w-full px-6 py-2 border border-gray-900 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
