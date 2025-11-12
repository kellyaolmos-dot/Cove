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
    <section className="py-16 px-4 border-b border-gray-200">
      <div className="max-w-xl mx-auto space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            Collect interest here
          </h2>
          <p className="text-sm text-gray-600">
            Use any email tool you like. Replace this copy with a value prop when
            you have it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900"
          />
          <button
            type="submit"
            className="w-full border border-gray-900 text-gray-900 px-4 py-3 rounded-md font-medium"
          >
            Join waitlist
          </button>
        </form>

        {submitted && (
          <div className="text-sm text-gray-600" role="status">
            Thanks for the nudge — feel free to swap in your own confirmation
            microcopy.
          </div>
        )}
      </div>
    </section>
  );
}
