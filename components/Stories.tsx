export default function Stories() {
  return (
    <section className="py-16 px-4 border-b border-gray-200 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Community stories
          </p>
          <h2 className="text-3xl font-semibold text-gray-900">
            Collect real housing experiences
          </h2>
          <p className="text-sm text-gray-600">
            Use this space to gather stories about stressful housing searches,
            scams, or standout successes. Replace the copy when you have real
            submissions.
          </p>
        </header>

        <form className="space-y-4 bg-white border border-gray-200 rounded-md p-5">
          <div className="space-y-1">
            <label className="text-sm text-gray-700" htmlFor="story-name">
              Name or school (optional)
            </label>
            <input
              id="story-name"
              name="name"
              type="text"
              placeholder="e.g., Kelly — NYC intern"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700" htmlFor="story-message">
              Story
            </label>
            <textarea
              id="story-message"
              name="story"
              rows={5}
              placeholder="Share what made housing hard, what you wish existed, or how someone helped."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <button
            type="button"
            className="w-full border border-gray-900 text-gray-900 rounded-md py-2 font-medium"
          >
            Submit story (wire up later)
          </button>
        </form>
      </div>
    </section>
  );
}
