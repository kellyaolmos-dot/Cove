"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, Users, TrendingUp } from "lucide-react";

export default function EventsPage() {
  const router = useRouter();

  const categories = [
    {
      icon: Users,
      title: "City Meetups",
      description: "Connect with fellow students and interns in your city",
    },
    {
      icon: TrendingUp,
      title: "Move-In Week Community Runs",
      description: "Stay active and meet your neighbors",
    },
  ];

  const handleGetEarlyAccess = () => {
    router.push("/waitlist/demand");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Cove Events
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              A new kind of city community. Experiences launching soon.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Events starting in 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              What&apos;s Coming
            </h2>
            <p className="text-base text-gray-600">
              We&apos;re building experiences that bring the Cove community together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.title}
                className="relative bg-white border border-gray-200 rounded-lg p-6"
              >
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                    Coming Soon
                  </span>
                </div>

                <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mb-3">
                  <category.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Get Early Access CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Get Early Access
            </h2>
            <p className="text-base text-gray-600 mb-6">
              Be the first to know when events launch in your city
            </p>

            <button
              onClick={handleGetEarlyAccess}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              Join the Waitlist
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
