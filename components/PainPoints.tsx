"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const painPointSchema = z.object({
  name: z.string().min(2, "Name is required"),
  story: z.string().min(10, "Please share your experience (at least 10 characters)"),
  can_reach_out: z.boolean(),
  contact_method: z.enum(["email", "phone", "none"]).optional(),
  contact_info: z.string().optional(),
});

type PainPointValues = z.infer<typeof painPointSchema>;

export default function PainPoints() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PainPointValues>({
    resolver: zodResolver(painPointSchema),
    defaultValues: {
      can_reach_out: false,
      contact_method: "none",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/pain-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error(data);
          setErrorMessage("Unable to submit. Please try again.");
          return;
        }

        setSubmitted(true);
        form.reset();
      } catch (error) {
        console.error(error);
        setErrorMessage("Something went wrong. Try again soon.");
      }
    });
  });

  if (submitted) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-5xl mb-4">🙏</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Thank you for sharing!
            </h3>
            <p className="text-gray-600">
              Your story helps us understand the real challenges people face and build a better solution.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-gray-900 underline hover:no-underline"
            >
              Share another story
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
            Share Your Experience
          </p>
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Tell us about your housing search
          </h2>
          <p className="text-lg text-gray-600">
            Tell us about a time when housing or roommate searching felt confusing, frustrating, or stressful. We&apos;re learning what to fix first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              {...form.register("name")}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Story */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your experience <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="What happened? What do you wish the process was like instead?"
              {...form.register("story")}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {form.formState.errors.story && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.story.message}</p>
            )}
          </div>

          {/* Can we reach out */}
          <div>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                {...form.register("can_reach_out")}
                className="mt-1"
              />
              <span className="text-gray-700">
                Yes, you can reach out to learn more about my experience
              </span>
            </label>
          </div>

          {/* Contact method (conditional) */}
          {form.watch("can_reach_out") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  How should we contact you?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="email"
                      {...form.register("contact_method")}
                    />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="phone"
                      {...form.register("contact_method")}
                    />
                    <span>Phone</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Contact info
                </label>
                <input
                  type="text"
                  placeholder={form.watch("contact_method") === "phone" ? "Phone number" : "Email address"}
                  {...form.register("contact_info")}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </>
          )}

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : "Share my story"}
          </button>
        </form>
      </div>
    </section>
  );
}
