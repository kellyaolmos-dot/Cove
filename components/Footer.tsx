export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col gap-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-gray-900">Cove</p>
          <p className="text-xs text-gray-500">Swap in your own boilerplate.</p>
        </div>
        <p>© {new Date().getFullYear()} Placeholder footer copy.</p>
      </div>
    </footer>
  );
}
