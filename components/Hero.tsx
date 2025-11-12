export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sublet & Roommate
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered housing marketplace for college interns and young professionals.
            Safe, stress-free, and social living in major U.S. cities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#waitlist" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-shadow w-full sm:w-auto">
              Join the Waitlist
            </a>
            <a href="#how-it-works" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition-colors w-full sm:w-auto">
              Learn More
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI Roommate Matching
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Scam Protection
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Listings
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
