"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { Listing, cityCoordinates } from "@/lib/listings-data";
import "mapbox-gl/dist/mapbox-gl.css";

interface ListingMapProps {
  listings: Listing[];
  selectedCity: string;
  onMarkerClick: (listingId: string) => void;
  selectedListingId?: string;
}

export default function ListingMap({
  listings,
  selectedCity,
  onMarkerClick,
  selectedListingId,
}: ListingMapProps) {
  const mapRef = useRef<any>(null);

  // Get center coordinates based on selected city
  const center = cityCoordinates[selectedCity as keyof typeof cityCoordinates] || cityCoordinates["All"];

  const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: center.zoom,
  });

  // Update map center when city changes
  useEffect(() => {
    const newCenter = cityCoordinates[selectedCity as keyof typeof cityCoordinates] || cityCoordinates["All"];
    setViewState({
      longitude: newCenter.lng,
      latitude: newCenter.lat,
      zoom: newCenter.zoom,
    });
  }, [selectedCity]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
        <p className="text-sm text-gray-500">
          Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            longitude={listing.lng}
            latitude={listing.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onMarkerClick(listing.id);
            }}
          >
            <button
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer hover:scale-110 ${
                selectedListingId === listing.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              ${(listing.price / 1000).toFixed(1)}k
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
