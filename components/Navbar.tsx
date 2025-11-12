export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Cove
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#waitlist" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-shadow">
              Join Waitlist
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
