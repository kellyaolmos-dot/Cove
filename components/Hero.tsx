export default function Hero() {
  const placeholders = ["Key value prop", "Supporting detail", "Any quick stat"];

  return (
    <section className="py-16 px-4 border-b border-gray-200">
      <div className="max-w-4xl mx-auto space-y-10 text-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Tagline placeholder
          </p>
          <h1 className="text-4xl font-semibold text-gray-900">
            Start with your headline here
          </h1>
          <p className="text-base text-gray-600">
            Keep this paragraph short. Explain what Cove does and why it matters in one or two sentences so you can plug in your own copy later.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-3 rounded-md border border-gray-900 text-gray-900">
            Primary CTA
          </button>
          <button className="px-6 py-3 rounded-md border border-dashed border-gray-400 text-gray-700">
            Secondary CTA
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-left">
          {placeholders.map((item) => (
            <div
              key={item}
              className="border border-gray-200 rounded-md p-4 text-sm text-gray-600"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
