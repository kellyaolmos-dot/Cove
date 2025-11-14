"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Listing } from "@/lib/listings-data";
import { Heart, X } from "lucide-react";

interface ListingCardProps {
  listing: Listing;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
  onViewDetails: (id: string) => void;
  style?: React.CSSProperties;
  index?: number;
}

export default function ListingCard({
  listing,
  onSwipeLeft,
  onSwipeRight,
  onViewDetails,
  style,
  index = 0,
}: ListingCardProps) {
  const x = useMotionValue(0);

  // Transform x position to rotation
  const rotate = useTransform(x, [-200, 200], [-20, 20]);

  // Transform x position to opacity for indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 100;

    if (info.offset.x > swipeThreshold) {
      // Swiped right - Like
      onSwipeRight(listing.id);
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left - Pass
      onSwipeLeft(listing.id);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}/mo`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <motion.div
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1 - index * 0.05, y: index * 12, opacity: 1 - index * 0.3 }}
      animate={{ scale: 1 - index * 0.05, y: index * 12, opacity: 1 - index * 0.3 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      style={{ x: index === 0 ? x : 0, rotate: index === 0 ? rotate : 0, ...style, zIndex: 10 - index }}
      className={`absolute w-full max-w-md lg:max-w-2xl px-2 sm:px-0 ${index === 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-4 right-4 z-10 bg-white border-2 border-gray-300 p-2 lg:p-3 rounded-full shadow-md"
        >
          <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
        </motion.div>

        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-4 left-4 z-10 bg-white border-2 border-gray-300 p-2 lg:p-3 rounded-full shadow-md"
        >
          <X className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
        </motion.div>

        {/* Image */}
        <div className="w-full h-[300px] sm:h-[380px] lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <div className="text-gray-400 text-sm">
            {listing.neighborhood}, {listing.city.slice(0, 2).toUpperCase()}
          </div>
          {/* Price tag on image */}
          <div className="absolute bottom-3 left-3 lg:bottom-4 lg:left-4 bg-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-md shadow-sm">
            <span className="font-semibold text-gray-900 text-sm lg:text-base">{formatPrice(listing.price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-1">
                {listing.title}
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                {listing.neighborhood}, {listing.city}
              </p>
            </div>
          </div>

          <p className="text-sm lg:text-base text-gray-600 mb-3 line-clamp-2">
            {listing.description}
          </p>

          {/* Details */}
          <div className="flex items-center gap-2 lg:gap-4 mb-3 text-sm lg:text-base text-gray-600 flex-wrap">
            <span className="whitespace-nowrap">
              {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} ${listing.bedrooms === 1 ? "bed" : "beds"}`}
            </span>
            <span>•</span>
            <span className="whitespace-nowrap">{listing.bathrooms} {listing.bathrooms === 1 ? "bath" : "baths"}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{listing.maxGuests} {listing.maxGuests === 1 ? "guest" : "guests"}</span>
          </div>

          {/* Availability */}
          <div className="text-xs lg:text-sm text-gray-500 mb-3 lg:mb-4">
            {formatDate(listing.availableFrom)} — {formatDate(listing.availableTo)}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 lg:gap-2 mb-3 lg:mb-4">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-1.5 text-gray-500">
                +{listing.amenities.length - 4} more
              </span>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(listing.id)}
            className="w-full px-4 lg:px-6 py-2 lg:py-2.5 border border-gray-900 rounded-lg text-sm lg:text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Action Buttons - Only show for the top card */}
      {index === 0 && (
        <div className="flex items-center justify-center gap-4 lg:gap-6 py-4 lg:py-8">
          <button
            onClick={() => onSwipeLeft(listing.id)}
            className="w-14 h-14 lg:w-16 lg:h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md"
            aria-label="Pass"
          >
            <X className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
          </button>
          <button
            onClick={() => onSwipeRight(listing.id)}
            className="w-14 h-14 lg:w-16 lg:h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md"
            aria-label="Like"
          >
            <Heart className="w-6 h-6 lg:w-8 lg:h-8 text-gray-600" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
