const placeholders = [
  {
    title: "Section / Flow Name",
    body: "Describe what lives here. Keep copy short so you can iterate quickly later.",
  },
  {
    title: "Another Block",
    body: "Use this slot for flows, personas, or program pillars you want to highlight.",
  },
  {
    title: "Extra Idea",
    body: "Duplicate or remove cards as needed. The layout is intentionally minimal.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 border-b border-gray-200">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Outline the flow
          </p>
          <h2 className="text-3xl font-semibold text-gray-900">
            Map out the experience in your own words
          </h2>
          <p className="text-sm text-gray-600">
            Swap in screenshots, lists, or anything else. This section is just a
            neutral placeholder.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {placeholders.map((item) => (
            <article
              key={item.title}
              className="border border-gray-200 rounded-md p-4 space-y-2 bg-white"
            >
              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
