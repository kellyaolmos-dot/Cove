"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { mockListings, Listing } from "@/lib/listings-data";
import ListingCard from "@/components/listings/ListingCard";
import ListingMap from "@/components/listings/ListingMap";
import FilterBar from "@/components/listings/FilterBar";
import { useRouter } from "next/navigation";

export default function ListingsPage() {
  const router = useRouter();

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [moveInDate, setMoveInDate] = useState<string>("");
  const [moveOutDate, setMoveOutDate] = useState<string>("");

  // Listings states
  const [allListings, setAllListings] = useState<Listing[]>(mockListings);
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>();

  // Filter listings based on city and dates
  useEffect(() => {
    let filtered = [...allListings];

    // Filter by city
    if (selectedCity !== "All") {
      filtered = filtered.filter((listing) => listing.city === selectedCity);
    }

    // Filter by move-in date
    if (moveInDate) {
      filtered = filtered.filter((listing) => {
        const listingFrom = new Date(listing.availableFrom);
        const selectedMoveIn = new Date(moveInDate);
        return listingFrom <= selectedMoveIn;
      });
    }

    // Filter by move-out date
    if (moveOutDate) {
      filtered = filtered.filter((listing) => {
        const listingTo = new Date(listing.availableTo);
        const selectedMoveOut = new Date(moveOutDate);
        return listingTo >= selectedMoveOut;
      });
    }

    setFilteredListings(filtered);
    setCurrentIndex(0);
  }, [selectedCity, moveInDate, moveOutDate, allListings]);

  // Load liked listings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("likedListings");
    if (saved) {
      try {
        setLikedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse liked listings", e);
      }
    }
  }, []);

  // Save to localStorage when liked IDs change
  const saveLikedListing = (id: string) => {
    const updated = [...likedIds, id];
    setLikedIds(updated);
    localStorage.setItem("likedListings", JSON.stringify(updated));
  };

  const handleSwipeRight = (id: string) => {
    saveLikedListing(id);
    if (currentIndex < filteredListings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeLeft = (id: string) => {
    if (currentIndex < filteredListings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/listings/${id}`);
  };

  const handleMarkerClick = (listingId: string) => {
    setSelectedListingId(listingId);
    // Find the listing and show it in the card stack
    const index = filteredListings.findIndex((l) => l.id === listingId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handleViewLikes = () => {
    router.push("/listings/liked");
  };

  const handleCreateListing = () => {
    router.push("/waitlist/supply");
  };

  const handleEditPreferences = () => {
    // Could open a modal or expand filters
    alert("Edit Preferences - coming soon!");
  };

  const currentListing = filteredListings[currentIndex];
  const remainingCount = filteredListings.length - currentIndex;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:gap-6">
            <div className="max-w-2xl space-y-1 lg:space-y-2 text-center md:text-left mx-auto md:mx-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Find Your Perfect Home
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Swipe through verified listings in top cities
              </p>
            </div>
            <div className="flex flex-row justify-center md:justify-end gap-2 lg:gap-3 w-full md:w-auto">
              <button
                onClick={handleViewLikes}
                className="px-4 lg:px-6 py-2 border border-gray-900 text-gray-900 rounded-md text-sm font-medium hover:bg-gray-50 flex-1 sm:flex-none"
              >
                View Likes
              </button>
              <button
                onClick={handleCreateListing}
                className="px-4 lg:px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 flex-1 sm:flex-none"
              >
                Create Listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8">
          {/* Left Column - Filters and Map */}
          <div className="lg:col-span-5 order-1 space-y-4 lg:space-y-6">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6">
              <FilterBar
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                moveInDate={moveInDate}
                moveOutDate={moveOutDate}
                onMoveInChange={setMoveInDate}
                onMoveOutChange={setMoveOutDate}
                showMoreFilters={true}
                onShowMoreClick={() => alert("More filters coming soon!")}
              />
            </div>

            {/* Listings Count */}
            <div className="text-left px-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{remainingCount}</span> listing
                {remainingCount !== 1 ? "s" : ""} available
              </p>
            </div>

            {/* Map */}
            <div className="lg:sticky lg:top-8">
              <div className="h-[280px] lg:h-[600px] rounded-2xl overflow-hidden border border-gray-200">
                <ListingMap
                  listings={filteredListings}
                  selectedCity={selectedCity}
                  onMarkerClick={handleMarkerClick}
                  selectedListingId={selectedListingId}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Listing Cards */}
          <div className="lg:col-span-7 order-2">

            {/* Card Stack */}
            <div className="relative flex justify-center items-start w-full min-h-[500px] lg:min-h-[900px]">
              {filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No listings match your filters
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCity("All");
                      setMoveInDate("");
                      setMoveOutDate("");
                    }}
                    className="px-6 py-2 border border-gray-900 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : currentIndex >= filteredListings.length ? (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-gray-900 font-semibold mb-2">
                    You&apos;ve seen all listings!
                  </p>
                  <p className="text-gray-600 mb-4">
                    Check your liked homes or adjust your filters
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setCurrentIndex(0)}
                      className="px-6 py-2 border border-gray-900 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={handleViewLikes}
                      className="px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                    >
                      View Likes
                    </button>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredListings.slice(currentIndex, currentIndex + 3).map((listing, idx) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onViewDetails={handleViewDetails}
                      index={idx}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
