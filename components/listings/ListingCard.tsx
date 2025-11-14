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
      initial={{ scale: 1 - index * 0.08, y: index * 16, opacity: 1 - index * 0.3 }}
      animate={{ scale: 1 - index * 0.08, y: index * 16, opacity: 1 - index * 0.3 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      style={{ x: index === 0 ? x : 0, rotate: index === 0 ? rotate : 0, ...style, zIndex: 10 - index }}
      className={`absolute w-full max-w-2xl ${index === 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-6 right-6 z-10 bg-white border-2 border-gray-300 p-3 rounded-full shadow-md"
        >
          <Heart className="w-8 h-8 text-gray-600" />
        </motion.div>

        <motion.div
          style={{ opacity: passOpacity }}
          className="absolute top-6 left-6 z-10 bg-white border-2 border-gray-300 p-3 rounded-full shadow-md"
        >
          <X className="w-8 h-8 text-gray-600" />
        </motion.div>

        {/* Image */}
        <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <div className="text-gray-400 text-sm">
            {listing.neighborhood}, {listing.city.slice(0, 2).toUpperCase()}
          </div>
          {/* Price tag on image */}
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-md shadow-sm">
            <span className="font-semibold text-gray-900">{formatPrice(listing.price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {listing.title}
              </h3>
              <p className="text-base text-gray-600">
                {listing.neighborhood}, {listing.city}
              </p>
            </div>
          </div>

          <p className="text-base text-gray-600 mb-3 line-clamp-2">
            {listing.description}
          </p>

          {/* Details */}
          <div className="flex items-center gap-4 mb-3 text-base text-gray-600">
            <span>
              {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} ${listing.bedrooms === 1 ? "bedroom" : "bedrooms"}`}
            </span>
            <span>•</span>
            <span>{listing.bathrooms} {listing.bathrooms === 1 ? "bathroom" : "bathrooms"}</span>
            <span>•</span>
            <span>{listing.maxGuests} {listing.maxGuests === 1 ? "guest" : "guests"}</span>
          </div>

          {/* Availability */}
          <div className="text-sm text-gray-500 mb-4">
            {formatDate(listing.availableFrom)} — {formatDate(listing.availableTo)}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-gray-600"
              >
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-sm px-3 py-1.5 text-gray-500">
                +{listing.amenities.length - 4} more
              </span>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => onViewDetails(listing.id)}
            className="w-full px-6 py-2.5 border border-gray-900 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Action Buttons - Only show for the top card */}
      {index === 0 && (
        <div className="flex items-center justify-center gap-6 py-8">
          <button
            onClick={() => onSwipeLeft(listing.id)}
            className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md"
            aria-label="Pass"
          >
            <X className="w-8 h-8 text-gray-600" />
          </button>
          <button
            onClick={() => onSwipeRight(listing.id)}
            className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all shadow-md"
            aria-label="Like"
          >
            <Heart className="w-8 h-8 text-gray-600" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
