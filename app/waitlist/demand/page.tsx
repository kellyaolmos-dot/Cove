"use client";

import { useState, useTransition, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

const cityOptions = ["NYC", "Boston", "SF", "Chicago", "DC", "LA", "Austin", "Other"];
const moveInOptions = ["May 2026", "June 2026", "July 2026", "Fall 2026", "Not sure yet"];
const statusOptions = ["confirmed", "recruiting", "exploring"] as const;
const contactOptions = ["email", "text"] as const;
const housingSearchOptions = ["solo", "with_roommates"] as const;
const sectorOptions = ["Tech", "Finance", "Consulting", "Healthcare", "Law", "Media", "Non-profit", "Government", "Startup", "Other"];
const roommatePreferenceOptions = [
  "Similar routine",
  "Similar lifestyle",
  "Similar cleanliness level",
  "Similar social vibe",
  "Similar age",
  "Same gender",
  "Shared interests",
  "Other"
];
const concernOptions = [
  "Finding affordable housing",
  "Finding roommates",
  "Understanding the neighborhood",
  "Navigating the lease process",
  "Moving logistics",
  "Safety concerns",
  "Commute to work",
  "Other"
];

const demandFormSchema = z.object({
  name: z.string().min(2, "Name is required.").max(120),
  college: z.string().min(2, "College is required."),
  grad_year: z
    .string()
    .min(4, "Grad year is required.")
    .max(10, "Grad year should be short."),
  linkedin: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  status: z.enum(statusOptions),
  target_cities: z.array(z.string()).min(1, "Pick at least one city."),
  other_city: z.string().optional().or(z.literal("")),
  move_in_month: z.string(),
  company: z.string().max(120).optional().or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  housing_search_type: z.enum(housingSearchOptions),
  roommate_preferences: z.array(z.string()).optional(),
  other_roommate_preference: z.string().optional().or(z.literal("")),
  budget: z.string().min(1, "Budget is required."),
  concerns: z.array(z.string()).min(1, "Select at least one concern."),
  other_concern: z.string().optional().or(z.literal("")),
  contact_pref: z.array(z.enum(contactOptions)).min(1, "Choose at least one contact method."),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
});

type DemandFormValues = z.infer<typeof demandFormSchema>;

const steps = [
  {
    id: 0,
    title: "Tell us about you",
    fields: ["name", "college", "grad_year", "linkedin", "instagram", "twitter"] as const,
  },
  {
    id: 1,
    title: "Where are you headed?",
    fields: ["status", "target_cities", "other_city", "move_in_month", "company", "sector"] as const,
  },
  {
    id: 2,
    title: "Housing preferences",
    fields: ["housing_search_type", "roommate_preferences", "other_roommate_preference", "budget", "concerns", "other_concern"] as const,
  },
  {
    id: 3,
    title: "Contact",
    fields: ["contact_pref", "email", "phone"] as const,
  },
] as const;

function DemandWaitlistForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referrerId = searchParams.get("r") ?? undefined;
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      name: "",
      college: "",
      grad_year: "",
      status: "recruiting",
      target_cities: [],
      move_in_month: "Not sure yet",
      housing_search_type: "with_roommates",
      roommate_preferences: [],
      budget: "",
      concerns: [],
      contact_pref: ["email"],
    },
  });

  const currentStepFields = steps[currentStep].fields;

  const progressPercent = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  const goToNextStep = async () => {
    const valid = await form.trigger(currentStepFields as any, { shouldFocus: true });
    if (!valid) return;
    logAnalyticsEvent("demand_step_completed", {
      step: steps[currentStep].title,
      cities: form.getValues("target_cities"),
    });
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    const targetCities = values.target_cities.includes("Other") && values.other_city
      ? [
          ...values.target_cities.filter((city: string) => city !== "Other"),
          values.other_city,
        ]
      : values.target_cities;
    const { other_city, ...rest } = values;

    startTransition(async () => {
      try {
        const response = await fetch("/api/waitlist/demand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...rest,
            target_cities: targetCities,
            referrer_id: referrerId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setErrorMessage("Unable to save your submission. Please try again.");
          console.error(data);
          return;
        }

        logAnalyticsEvent("demand_form_submitted", {
          cities: targetCities,
          status: values.status,
        });

        router.push(
          `/waitlist/thank-you?type=demand&cities=${encodeURIComponent(targetCities.join(","))}`
        );
      } catch (err) {
        console.error(err);
        setErrorMessage("Something went wrong. Try again in a moment.");
      }
    });
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Demand waitlist</p>
          <h1 className="text-4xl font-semibold text-gray-900">Tell us how and where you plan to move</h1>
          <p className="text-sm text-gray-600">
            Cove prioritizes confirmed movers first, but we still collect recruiting and exploring signals to
            plan inventory. Expect a follow-up if we confirm options in your target city.
          </p>
        </header>

        <div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-gray-900 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length} · {steps[currentStep].title}
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <>
                  <Fieldset label="Name" required>
                    <input
                      type="text"
                      placeholder="Preferred name"
                      {...form.register("name")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage message={form.formState.errors.name?.message} />
                  </Fieldset>

                  <Fieldset label="College or University" required>
                    <input
                      type="text"
                      placeholder="e.g., Boston University"
                      {...form.register("college")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage message={form.formState.errors.college?.message} />
                  </Fieldset>

                  <Fieldset label="Graduation year" required>
                    <input
                      type="text"
                      placeholder="2025"
                      {...form.register("grad_year")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage message={form.formState.errors.grad_year?.message} />
                  </Fieldset>

                  <Fieldset label="LinkedIn">
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/you"
                      {...form.register("linkedin")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage message={form.formState.errors.linkedin?.message} />
                  </Fieldset>

                  <Fieldset label="Instagram">
                    <input
                      type="text"
                      placeholder="@yourusername"
                      {...form.register("instagram")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Fieldset>

                  <Fieldset label="X (Twitter)">
                    <input
                      type="text"
                      placeholder="@yourusername"
                      {...form.register("twitter")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Fieldset>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <Fieldset label="Status" required>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {statusOptions.map((option) => (
                        <label
                          key={option}
                          className={`border rounded-md px-4 py-3 text-sm capitalize cursor-pointer ${
                            form.watch("status") === option
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-200 text-gray-700"
                          }`}
                        >
                          <input
                            type="radio"
                            value={option}
                            {...form.register("status")}
                            className="sr-only"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                    <ErrorMessage message={form.formState.errors.status?.message} />
                  </Fieldset>

                  <Fieldset label="Where are you headed or intending to go?" required>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cityOptions.map((city) => (
                        <label
                          key={city}
                          className={`flex items-center gap-3 border rounded-md px-4 py-3 text-sm ${
                            form.watch("target_cities").includes(city)
                              ? "border-gray-900"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={city}
                            {...form.register("target_cities")}
                          />
                          <span>{city}</span>
                        </label>
                      ))}
                    </div>
                    {form.watch("target_cities").includes("Other") && (
                      <input
                        type="text"
                        placeholder="Add another city"
                        {...form.register("other_city")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    )}
                    <ErrorMessage message={form.formState.errors.target_cities?.message} />
                  </Fieldset>

                  <Fieldset label="Move-in month" required>
                    <select
                      {...form.register("move_in_month")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {moveInOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Fieldset>

                  <Fieldset label="Where are you working or where do you anticipate working?">
                    <input
                      type="text"
                      placeholder="e.g., Google, Goldman Sachs, or Exploring opportunities"
                      {...form.register("company")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Fieldset>

                  <Fieldset label="Sector">
                    <select
                      {...form.register("sector")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select a sector</option>
                      {sectorOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Fieldset>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Fieldset label="Do you want to find housing solo or with roommates?" required>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label
                        className={`border rounded-md px-4 py-3 text-sm cursor-pointer ${
                          form.watch("housing_search_type") === "solo"
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          value="solo"
                          {...form.register("housing_search_type")}
                          className="sr-only"
                        />
                        Solo
                      </label>
                      <label
                        className={`border rounded-md px-4 py-3 text-sm cursor-pointer ${
                          form.watch("housing_search_type") === "with_roommates"
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          value="with_roommates"
                          {...form.register("housing_search_type")}
                          className="sr-only"
                        />
                        With roommates
                      </label>
                    </div>
                    <ErrorMessage message={form.formState.errors.housing_search_type?.message} />
                  </Fieldset>

                  {form.watch("housing_search_type") === "with_roommates" && (
                    <Fieldset label="What do you look for in roommates? (select all that apply)">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {roommatePreferenceOptions.map((preference) => (
                          <label
                            key={preference}
                            className={`flex items-center gap-3 border rounded-md px-4 py-3 text-sm ${
                              form.watch("roommate_preferences")?.includes(preference)
                                ? "border-gray-900"
                                : "border-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={preference}
                              {...form.register("roommate_preferences")}
                            />
                            <span>{preference}</span>
                          </label>
                        ))}
                      </div>
                      {form.watch("roommate_preferences")?.includes("Other") && (
                        <textarea
                          rows={2}
                          placeholder="Please describe other preferences"
                          {...form.register("other_roommate_preference")}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-3"
                        />
                      )}
                      <ErrorMessage message={form.formState.errors.roommate_preferences?.message} />
                    </Fieldset>
                  )}

                  <Fieldset label="Budget (monthly rent)" required>
                    <input
                      type="text"
                      placeholder="e.g., $1,500 - $2,000"
                      {...form.register("budget")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <ErrorMessage message={form.formState.errors.budget?.message} />
                  </Fieldset>

                  <Fieldset label="Any concerns about finding housing or moving to a new city?" required>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {concernOptions.map((concern) => (
                        <label
                          key={concern}
                          className={`flex items-center gap-3 border rounded-md px-4 py-3 text-sm ${
                            form.watch("concerns").includes(concern)
                              ? "border-gray-900"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={concern}
                            {...form.register("concerns")}
                          />
                          <span>{concern}</span>
                        </label>
                      ))}
                    </div>
                    {form.watch("concerns").includes("Other") && (
                      <textarea
                        rows={3}
                        placeholder="Please describe your other concerns"
                        {...form.register("other_concern")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    )}
                    <ErrorMessage message={form.formState.errors.concerns?.message} />
                  </Fieldset>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Fieldset label="How should we follow up?" required>
                    <div className="flex flex-wrap gap-3">
                      {contactOptions.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            value={option}
                            {...form.register("contact_pref")}
                          />
                          <span className="capitalize">{option}</span>
                        </label>
                      ))}
                    </div>
                    <ErrorMessage message={form.formState.errors.contact_pref?.message} />
                  </Fieldset>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Fieldset label="Email" required>
                      <input
                        type="email"
                        placeholder="you@school.edu"
                        {...form.register("email")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <ErrorMessage message={form.formState.errors.email?.message} />
                    </Fieldset>
                    <Fieldset label="Phone">
                      <input
                        type="tel"
                        placeholder="(xxx) xxx-xxxx"
                        {...form.register("phone")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </Fieldset>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStep === 0 || isPending}
              className="text-sm text-gray-600 disabled:text-gray-300"
            >
              Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={isPending}
                className="px-6 py-2 rounded-md border border-gray-900 text-gray-900 text-sm font-medium disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 rounded-md border border-gray-900 text-gray-900 text-sm font-medium disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Join the waitlist"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Fieldset({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </p>
      {children}
    </div>
  );
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

function logAnalyticsEvent(eventType: string, payload: Record<string, unknown>) {
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify({ event_type: eventType, payload })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }
  } catch (error) {
    console.error("Beacon error", error);
  }

  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event_type: eventType, payload }),
  }).catch((error) => console.error("Analytics error", error));
}

export default function DemandWaitlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <DemandWaitlistForm />
    </Suspense>
  );
}


