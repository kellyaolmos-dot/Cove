"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

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
    <section className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Get Early Access
          </h2>
          <p className="text-base text-gray-600 mb-6">
            For the ones moving first, dreaming bigger, and taking on the city.
          </p>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
          >
            Join the Waitlist
            <ArrowRight className="w-4 h-4" />
          </button>

          {submitted && (
            <div className="mt-4 text-sm text-gray-600" role="status">
              Thanks! We&apos;ll be in touch soon.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
