"use client";

interface FilterBarProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  moveInDate: string;
  moveOutDate: string;
  onMoveInChange: (date: string) => void;
  onMoveOutChange: (date: string) => void;
  showMoreFilters?: boolean;
  onShowMoreClick?: () => void;
}

const cities = ["All", "San Francisco", "Washington DC", "New York"];

export default function FilterBar({
  selectedCity,
  onCityChange,
  moveInDate,
  moveOutDate,
  onMoveInChange,
  onMoveOutChange,
  showMoreFilters = true,
  onShowMoreClick,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* City Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by City
        </label>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => onCityChange(city)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCity === city
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Date Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label
            htmlFor="move-in-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Move-In Date
          </label>
          <input
            type="date"
            id="move-in-date"
            value={moveInDate}
            onChange={(e) => onMoveInChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none"
          />
        </div>

        <div>
          <label
            htmlFor="move-out-date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Move-Out Date
          </label>
          <input
            type="date"
            id="move-out-date"
            value={moveOutDate}
            onChange={(e) => onMoveOutChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none"
          />
        </div>
      </div>

      {/* Show More Filters */}
      {showMoreFilters && onShowMoreClick && (
        <button
          onClick={onShowMoreClick}
          className="w-full px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Show More Filters
        </button>
      )}
    </div>
  );
}
