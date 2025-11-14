"use client";

import { useState, useEffect } from "react";

type WaitlistEntry = {
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
  budget: string;
  concerns: string[];
  approval_status: string;
  created_at: string;
};

export default function AdminWaitlistPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);

  const authenticate = () => {
    // Simple client-side check - the real security is in the API
    if (adminKey) {
      setIsAuthenticated(true);
      loadEntries();
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/waitlist");
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load entries:", error);
    }
    setLoading(false);
  };

  const approveEntry = async (waitlistId: string) => {
    if (!confirm("Are you sure you want to approve this entry?")) return;

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
        loadEntries();
        setSelectedEntry(null);
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
          <h1 className="text-3xl font-semibold">Demand Waitlist Admin</h1>
          <button
            onClick={loadEntries}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                  entry.approval_status === "approved"
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedEntry(entry)}
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
                  <p>{entry.college} '{entry.grad_year}</p>
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
          </div>
        )}

        {selectedEntry && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEntry(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">{selectedEntry.name}</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p>{selectedEntry.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Education</p>
                  <p>{selectedEntry.college} - Class of {selectedEntry.grad_year}</p>
                </div>
                {selectedEntry.linkedin && (
                  <div>
                    <p className="font-medium text-gray-700">LinkedIn</p>
                    <a
                      href={selectedEntry.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedEntry.linkedin}
                    </a>
                  </div>
                )}
                {selectedEntry.instagram && (
                  <div>
                    <p className="font-medium text-gray-700">Instagram</p>
                    <p>{selectedEntry.instagram}</p>
                  </div>
                )}
                {selectedEntry.twitter && (
                  <div>
                    <p className="font-medium text-gray-700">X (Twitter)</p>
                    <p>{selectedEntry.twitter}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Target Cities</p>
                  <p>{selectedEntry.target_cities.join(", ")}</p>
                </div>
                {selectedEntry.company && (
                  <div>
                    <p className="font-medium text-gray-700">Company</p>
                    <p>{selectedEntry.company}</p>
                  </div>
                )}
                {selectedEntry.sector && (
                  <div>
                    <p className="font-medium text-gray-700">Sector</p>
                    <p>{selectedEntry.sector}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">Housing Search Type</p>
                  <p className="capitalize">{selectedEntry.housing_search_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Budget</p>
                  <p>{selectedEntry.budget}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Concerns</p>
                  <ul className="list-disc list-inside">
                    {selectedEntry.concerns.map((concern, i) => (
                      <li key={i}>{concern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status</p>
                  <p className="capitalize">{selectedEntry.approval_status}</p>
                </div>
              </div>

              {selectedEntry.approval_status === "pending" && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={() => approveEntry(selectedEntry.id)}
                    className="w-full bg-green-600 text-white rounded-md px-4 py-3 font-medium hover:bg-green-700"
                  >
                    Approve & Send Email with Referral Link
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
