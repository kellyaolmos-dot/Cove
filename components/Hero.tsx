import Link from "next/link";

export default function Hero() {
  const proofPoints = [
    "Verified rooms & sublets",
    "Roommate matching signals",
    "City-specific demand data",
  ];

  return (
    <section className="py-20 px-4 border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto space-y-10 text-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            Early access waitlist
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900">
            Find verified housing and compatible roommates in your next city — whether you’re
            recruiting or relocating.
          </h1>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Cove is a two-sided housing network for interns and young professionals. We collect
            detailed demand + supply signals so you can skip the group chat chaos and land in a vetted
            space faster.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/waitlist/demand"
            className="px-8 py-3 rounded-md border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Looking for housing
          </Link>
          <Link
            href="/waitlist/supply"
            className="px-8 py-3 rounded-md border border-dashed border-gray-400 text-gray-700 font-medium hover:border-gray-900 transition-colors"
          >
            Listing a property
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-left">
          {proofPoints.map((item) => (
            <div key={item} className="border border-gray-200 rounded-md p-4 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
