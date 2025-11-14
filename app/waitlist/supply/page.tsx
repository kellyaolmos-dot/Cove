"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

const contactOptions = ["email", "text"] as const;
const concernOptions = [
  "Finding qualified tenants",
  "Lease agreement concerns",
  "Property management",
  "Payment security",
  "Background checks",
  "Maintenance responsibilities",
  "Other"
];

const supplySchema = z.object({
  // Personal info
  name: z.string().min(2, "Name is required.").max(120),
  college: z.string().optional().or(z.literal("")),
  grad_year: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),

  // Listing info
  address: z.string().min(3, "Provide a street or building name."),
  city: z.string().min(2, "City is required."),
  rent: z.string().optional().or(z.literal("")),
  rooms: z.string().optional().or(z.literal("")),
  listing_link: z.string().optional().or(z.literal("")),
  listing_photos: z.string().optional().or(z.literal("")), // URLs of photos

  // Concerns and preferences
  concerns: z.array(z.string()).min(1, "Select at least one concern."),
  other_concern: z.string().optional().or(z.literal("")),

  // Contact
  contact_pref: z.array(z.enum(contactOptions)).min(1, "Choose at least one contact method."),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  willing_to_verify: z.boolean(),
});

type SupplyValues = z.infer<typeof supplySchema>;

const steps = [
  {
    id: 0,
    title: "Tell us about you",
    fields: ["name", "college", "grad_year", "linkedin", "instagram", "twitter"] as const
  },
  {
    id: 1,
    title: "Listing info",
    fields: ["address", "city", "rent", "rooms", "listing_link", "listing_photos"] as const
  },
  {
    id: 2,
    title: "Concerns & preferences",
    fields: ["concerns", "other_concern"] as const
  },
  {
    id: 3,
    title: "Contact & verification",
    fields: ["contact_pref", "email", "phone", "willing_to_verify"] as const
  },
] as const;

export default function SupplyWaitlistPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<SupplyValues>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      willing_to_verify: true,
      concerns: [],
      contact_pref: ["email"],
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      setUploadError("Maximum 5 files allowed");
      return;
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Each file must be under 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        return;
      }
    }

    setUploadedFiles(files);
    setUploadError(null);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    // Upload files first if any
    let photoUrls: string[] = [];
    if (uploadedFiles.length > 0) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        uploadedFiles.forEach((file) => formData.append("files", file));

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          setUploadError(error.error || "Failed to upload photos");
          setIsUploading(false);
          return;
        }

        const { urls } = await uploadResponse.json();
        photoUrls = urls;
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload photos");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/waitlist/supply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            listing_photos: photoUrls.join(","), // Store as comma-separated URLs
          }),
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
                  <Field label="Name" required>
                    <input
                      type="text"
                      placeholder="Preferred name"
                      {...form.register("name")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <Error message={form.formState.errors.name?.message} />
                  </Field>

                  <Field label="College or University">
                    <input
                      type="text"
                      placeholder="e.g., Boston University"
                      {...form.register("college")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>

                  <Field label="Graduation year">
                    <input
                      type="text"
                      placeholder="2025"
                      {...form.register("grad_year")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>

                  <Field label="LinkedIn">
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/you"
                      {...form.register("linkedin")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>

                  <Field label="Instagram">
                    <input
                      type="text"
                      placeholder="@yourusername"
                      {...form.register("instagram")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>

                  <Field label="X (Twitter)">
                    <input
                      type="text"
                      placeholder="@yourusername"
                      {...form.register("twitter")}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>
                </>
              )}

              {currentStep === 1 && (
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

                    <Field label="Monthly rent">
                      <input
                        type="text"
                        {...form.register("rent")}
                        placeholder="$2,200"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </Field>
                  </div>

                  <Field label="Number of bedrooms">
                    <input
                      type="text"
                      {...form.register("rooms")}
                      placeholder="2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </Field>

                  <Field label="Listing link (if posted elsewhere)">
                    <input
                      type="url"
                      {...form.register("listing_link")}
                      placeholder="https://facebook.com/groups/..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500">Share if you&apos;ve posted on Facebook groups, Craigslist, etc.</p>
                  </Field>

                  <Field label="Upload photos">
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800"
                      />
                      <p className="text-xs text-gray-500">
                        Upload up to 5 photos (max 5MB each). Images only.
                      </p>
                      {uploadedFiles.length > 0 && (
                        <div className="text-sm text-gray-700">
                          {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} selected
                        </div>
                      )}
                      {uploadError && (
                        <p className="text-sm text-red-600">{uploadError}</p>
                      )}
                    </div>
                  </Field>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Field label="What concerns do you have about listing your property?" required>
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-3"
                      />
                    )}
                    <Error message={form.formState.errors.concerns?.message} />
                  </Field>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <Field label="How should we reach out?" required>
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
                    <Error message={form.formState.errors.contact_pref?.message} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email" required>
                      <input
                        type="email"
                        {...form.register("email")}
                        placeholder="you@company.com"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <Error message={form.formState.errors.email?.message} />
                    </Field>

                    <Field label="Phone">
                      <input
                        type="tel"
                        placeholder="(xxx) xxx-xxxx"
                        {...form.register("phone")}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </Field>
                  </div>

                  <Field label="Verification consent" required>
                    <label className="flex items-start gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        {...form.register("willing_to_verify")}
                        defaultChecked
                        className="mt-1"
                      />
                      <span>
                        I&apos;m willing to verify ownership/lease details so Cove can share this listing with qualified
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
                disabled={isPending || isUploading}
                className="px-6 py-2 rounded-md border border-gray-900 text-gray-900 text-sm font-medium disabled:opacity-50"
              >
                {isUploading ? "Uploading photos..." : isPending ? "Submitting..." : "Share listing"}
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
