"use client";

import { useState } from "react";

type DemandEntry = {
  id: string;
  name: string;
  email: string;
  college: string;
  grad_year: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  target_cities: string[];
  company?: string;
  sector?: string;
  housing_search_type: string;
  roommate_preferences?: string[];
  other_roommate_preference?: string;
  budget: string;
  concerns: string[];
  approval_status: string;
  created_at: string;
};

type SupplyEntry = {
  id: string;
  name?: string;
  email: string;
  college?: string;
  grad_year?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  address?: string;
  city: string;
  rent?: string;
  rooms?: string;
  listing_link?: string;
  listing_photos?: string;
  concerns: string[];
  approval_status: string;
  created_at: string;
  contact_pref?: string[];
  phone?: string;
};

export default function AdminWaitlistPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"demand" | "supply">("demand");
  const [demandEntries, setDemandEntries] = useState<DemandEntry[]>([]);
  const [supplyEntries, setSupplyEntries] = useState<SupplyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<DemandEntry | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<SupplyEntry | null>(null);

  const authenticate = () => {
    if (adminKey) {
      setIsAuthenticated(true);
      loadDemandEntries();
      loadSupplyEntries();
    }
  };

  const loadDemandEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/waitlist");
      if (response.ok) {
        const data = await response.json();
        setDemandEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load demand entries:", error);
    }
    setLoading(false);
  };

  const loadSupplyEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/supply-waitlist");
      if (response.ok) {
        const data = await response.json();
        setSupplyEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load supply entries:", error);
    }
    setLoading(false);
  };

  const approveDemandEntry = async (waitlistId: string) => {
    if (!confirm("Are you sure you want to approve this demand entry?")) return;

    try {
      const response = await fetch("/api/waitlist/demand/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlist_id: waitlistId,
          admin_key: adminKey,
        }),
      });

      if (response.ok) {
        alert("Entry approved! Approval email sent with referral link.");
        loadDemandEntries();
        setSelectedDemand(null);
      } else {
        const data = await response.json();
        alert(`Failed to approve: ${data.error}`);
      }
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve entry");
    }
  };

  const approveSupplyEntry = async (waitlistId: string) => {
    if (!confirm("Are you sure you want to approve this supply entry?")) return;

    try {
      const response = await fetch("/api/waitlist/supply/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlist_id: waitlistId,
          admin_key: adminKey,
        }),
      });

      if (response.ok) {
        alert("Entry approved! Approval email sent with referral link.");
        loadSupplyEntries();
        setSelectedSupply(null);
      } else {
        const data = await response.json();
        alert(`Failed to approve: ${data.error}`);
      }
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve entry");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
            onKeyDown={(e) => e.key === "Enter" && authenticate()}
          />
          <button
            onClick={authenticate}
            className="w-full bg-gray-900 text-white rounded-md px-4 py-2 hover:bg-gray-800"
          >
            Access Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Waitlist Admin</h1>
          <button
            onClick={() => {
              loadDemandEntries();
              loadSupplyEntries();
            }}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("demand")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "demand"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Demand ({demandEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("supply")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "supply"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Supply ({supplyEntries.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeTab === "demand" &&
              demandEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                    entry.approval_status === "approved"
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedDemand(entry)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        entry.approval_status === "approved"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {entry.approval_status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{entry.email}</p>
                    <p>
                      {entry.college} &apos;{entry.grad_year}
                    </p>
                    <p className="font-medium text-gray-900">
                      {entry.target_cities.join(", ")}
                    </p>
                    {entry.company && <p>{entry.company}</p>}
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

            {activeTab === "supply" &&
              supplyEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                    entry.approval_status === "approved"
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedSupply(entry)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{entry.name || "Anonymous"}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        entry.approval_status === "approved"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {entry.approval_status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{entry.email}</p>
                    {entry.college && entry.grad_year && (
                      <p>
                        {entry.college} &apos;{entry.grad_year}
                      </p>
                    )}
                    <p className="font-medium text-gray-900">{entry.city}</p>
                    {entry.address && <p>{entry.address}</p>}
                    {entry.rent && <p>{entry.rent}/mo</p>}
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Demand Detail Modal */}
        {selectedDemand && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDemand(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">{selectedDemand.name}</h2>
                <button
                  onClick={() => setSelectedDemand(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p>{selectedDemand.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Education</p>
                  <p>
                    {selectedDemand.college} - Class of {selectedDemand.grad_year}
                  </p>
                </div>
                {selectedDemand.linkedin && (
                  <div>
                    <p className="font-medium text-gray-700">LinkedIn</p>
                    <a
                      href={selectedDemand.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedDemand.linkedin}
                    </a>
                  </div>
                )}
                {selectedDemand.instagram && (
                  <div>
                    <p className="font-medium text-gray-700">Instagram</p>
                    <p>{selectedDemand.instagram}</p>
                  </div>
                )}
                {selectedDemand.twitter && (
                  <div>
                    <p className="font-medium text-gray-700">X (Twitter)</p>
                    <p>{selectedDemand.twitter}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Target Cities</p>
                  <p>{selectedDemand.target_cities.join(", ")}</p>
                </div>
                {selectedDemand.company && (
                  <div>
                    <p className="font-medium text-gray-700">Company</p>
                    <p>{selectedDemand.company}</p>
                  </div>
                )}
                {selectedDemand.sector && (
                  <div>
                    <p className="font-medium text-gray-700">Sector</p>
                    <p>{selectedDemand.sector}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Housing Search Type</p>
                  <p className="capitalize">
                    {selectedDemand.housing_search_type.replace("_", " ")}
                  </p>
                </div>
                {selectedDemand.roommate_preferences && selectedDemand.roommate_preferences.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700">Roommate Preferences</p>
                    <ul className="list-disc list-inside">
                      {selectedDemand.roommate_preferences.map((pref, i) => (
                        <li key={i}>{pref}</li>
                      ))}
                    </ul>
                    {selectedDemand.other_roommate_preference && (
                      <p className="mt-1 text-gray-600 italic">{selectedDemand.other_roommate_preference}</p>
                    )}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Budget</p>
                  <p>{selectedDemand.budget}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Concerns</p>
                  <ul className="list-disc list-inside">
                    {selectedDemand.concerns.map((concern, i) => (
                      <li key={i}>{concern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <p className="capitalize">{selectedDemand.approval_status}</p>
                </div>
              </div>

              {selectedDemand.approval_status === "pending" && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => approveDemandEntry(selectedDemand.id)}
                    className="w-full bg-green-600 text-white rounded-md px-4 py-3 font-medium hover:bg-green-700"
                  >
                    Approve &amp; Send Email with Referral Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supply Detail Modal */}
        {selectedSupply && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSupply(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">{selectedSupply.name || "Supply Listing"}</h2>
                <button
                  onClick={() => setSelectedSupply(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p>{selectedSupply.email}</p>
                </div>
                {selectedSupply.name && (
                  <div>
                    <p className="font-medium text-gray-700">Name</p>
                    <p>{selectedSupply.name}</p>
                  </div>
                )}
                {selectedSupply.college && selectedSupply.grad_year && (
                  <div>
                    <p className="font-medium text-gray-700">Education</p>
                    <p>
                      {selectedSupply.college} - Class of {selectedSupply.grad_year}
                    </p>
                  </div>
                )}
                {selectedSupply.linkedin && (
                  <div>
                    <p className="font-medium text-gray-700">LinkedIn</p>
                    <a
                      href={selectedSupply.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedSupply.linkedin}
                    </a>
                  </div>
                )}
                {selectedSupply.instagram && (
                  <div>
                    <p className="font-medium text-gray-700">Instagram</p>
                    <p>{selectedSupply.instagram}</p>
                  </div>
                )}
                {selectedSupply.twitter && (
                  <div>
                    <p className="font-medium text-gray-700">X (Twitter)</p>
                    <p>{selectedSupply.twitter}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">City</p>
                  <p>{selectedSupply.city}</p>
                </div>
                {selectedSupply.address && (
                  <div>
                    <p className="font-medium text-gray-700">Address</p>
                    <p>{selectedSupply.address}</p>
                  </div>
                )}
                {selectedSupply.rent && (
                  <div>
                    <p className="font-medium text-gray-700">Monthly Rent</p>
                    <p>{selectedSupply.rent}</p>
                  </div>
                )}
                {selectedSupply.rooms && (
                  <div>
                    <p className="font-medium text-gray-700">Bedrooms</p>
                    <p>{selectedSupply.rooms}</p>
                  </div>
                )}
                {selectedSupply.listing_link && (
                  <div>
                    <p className="font-medium text-gray-700">Listing Link</p>
                    <a
                      href={selectedSupply.listing_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedSupply.listing_link}
                    </a>
                  </div>
                )}
                {selectedSupply.listing_photos && (
                  <div>
                    <p className="font-medium text-gray-700">Photo Links</p>
                    <p className="break-all">{selectedSupply.listing_photos}</p>
                  </div>
                )}
                {selectedSupply.phone && (
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p>{selectedSupply.phone}</p>
                  </div>
                )}
                {selectedSupply.contact_pref && (
                  <div>
                    <p className="font-medium text-gray-700">Contact Preferences</p>
                    <p className="capitalize">{selectedSupply.contact_pref.join(", ")}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Concerns</p>
                  <ul className="list-disc list-inside">
                    {selectedSupply.concerns.map((concern, i) => (
                      <li key={i}>{concern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <p className="capitalize">{selectedSupply.approval_status}</p>
                </div>
              </div>

              {selectedSupply.approval_status === "pending" && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => approveSupplyEntry(selectedSupply.id)}
                    className="w-full bg-green-600 text-white rounded-md px-4 py-3 font-medium hover:bg-green-700"
                  >
                    Approve &amp; Send Email with Referral Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
