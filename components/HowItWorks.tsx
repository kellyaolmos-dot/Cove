export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Tell our AI about your lifestyle, preferences, and what you're looking for in a roommate and neighborhood."
    },
    {
      number: "02",
      title: "Browse Verified Listings",
      description: "Explore scam-free, verified sublets in your desired city. Every listing is authenticated before going live."
    },
    {
      number: "03",
      title: "Get Matched",
      description: "Our AI analyzes compatibility and generates matches based on lifestyle, habits, and preferences."
    },
    {
      number: "04",
      title: "Connect & Move In",
      description: "Chat with potential roommates, tour places, and secure your perfect sublet - all through Cove."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to finding your perfect home and roommate
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600" />
              )}

              {/* Step Content */}
              <div className="relative">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
