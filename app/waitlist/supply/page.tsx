"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

const supplySchema = z.object({
  email: z.string().email(),
  address: z.string().min(3, "Provide a street or building name."),
  city: z.string().min(2, "City is required."),
  rent: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  rooms: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  listing_link: z
    .string()
    .optional()
    .transform((val) => (val ? val : undefined)),
  willing_to_verify: z.boolean(),
});

type SupplyValues = z.infer<typeof supplySchema>;

const steps = [
  { id: 0, title: "Basics", fields: ["address", "city", "rent", "rooms"] as const },
  { id: 1, title: "Listing details", fields: ["listing_link"] as const },
  { id: 2, title: "Verification", fields: ["email", "willing_to_verify"] as const },
] as const;

export default function SupplyWaitlistPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const form = useForm<SupplyValues>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      willing_to_verify: true,
    },
  });

  const progressPercent = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  const goToNextStep = async () => {
    const valid = await form.trigger(steps[currentStep].fields as any, { shouldFocus: true });
    if (!valid) return;
    logAnalyticsEvent("supply_step_completed", { step: steps[currentStep].title });
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        if (attachment) {
          formData.append("attachment", attachment);
        }
        const response = await fetch("/api/waitlist/supply", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const data = await response.json();
          console.error(data);
          setErrorMessage("Unable to save your submission. Please try again.");
          return;
        }
        logAnalyticsEvent("supply_form_submitted", {
          city: values.city,
          willing_to_verify: values.willing_to_verify,
        });
        router.push("/waitlist/thank-you?type=supply");
      } catch (error) {
        console.error(error);
        setErrorMessage("Something went wrong. Try again soon.");
      }
    });
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Supply waitlist</p>
          <h1 className="text-4xl font-semibold text-gray-900">Submit a listing for interns & residents</h1>
          <p className="text-sm text-gray-600">
            We review every address manually. The more context you share, the faster we can pair you with
            pre-qualified roommates or tenants.
          </p>
        </header>

        <div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-gray-900 transition-all" style={{ width: `${progressPercent}%` }} />
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
                  <Field label="Address or building" required>
                    <input
                      type="text"
                      {...form.register("address")}
                      placeholder="123 Summer St"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <Error message={form.formState.errors.address?.message} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City" required>
                      <input
                        type="text"
                        {...form.register("city")}
                        placeholder="Boston"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <Error message={form.formState.errors.city?.message} />
                    </Field>
                    <Field label="Monthly rent (approx)">
                      <input
                        type="number"
                        inputMode="numeric"
                        {...form.register("rent")}
                        placeholder="2200"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </Field>
                  </div>
                  <Field label="Bedrooms or rooms">
                    <input
                      type="number"
                      inputMode="numeric"
                      {...form.register("rooms")}
                      placeholder="2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <Field label="If you've posted your listing on Facebook groups or anywhere else share the listing link">
                    <input
                      type="url"
                      {...form.register("listing_link")}
                      placeholder="https://"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Upload walkthrough, photos, or flyers of your listing">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setAttachment(file ?? null);
                      }}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-gray-100 file:text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Optional. Images or PDFs help us verify faster.</p>
                  </Field>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Field label="Email" required>
                    <input
                      type="email"
                      {...form.register("email")}
                      placeholder="you@company.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <Error message={form.formState.errors.email?.message} />
                  </Field>
                  <Field label="Verification consent" required>
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        {...form.register("willing_to_verify")}
                        defaultChecked
                        className="mt-1"
                      />
                      <span>
                        I’m willing to verify ownership/lease details so Cove can share this listing with qualified
                        renters.
                      </span>
                    </label>
                  </Field>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={goBack}
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
                {isPending ? "Submitting..." : "Share listing"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
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

function Error({ message }: { message?: string }) {
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
