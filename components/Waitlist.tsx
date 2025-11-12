"use client";

import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with your email service (e.g., Mailchimp, ConvertKit)
    console.log("Email submitted:", email);
    setSubmitted(true);
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Ready to Find Your Perfect Place?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join our waitlist and be the first to experience stress-free housing
        </p>

        {/* Waitlist Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Join Waitlist
            </button>
          </div>
        </form>

        {/* Success Message */}
        {submitted && (
          <div className="mt-4 text-white font-semibold animate-fade-in">
            Thanks for joining! We'll be in touch soon.
          </div>
        )}

        {/* Social Proof */}
        <p className="mt-8 text-blue-100">
          Join 1,000+ students already on the waitlist
        </p>
      </div>
    </section>
  );
}
