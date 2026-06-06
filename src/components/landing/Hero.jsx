function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">

        <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
          AI-Powered Business Planning
        </div>

        <h1 className="text-6xl font-bold leading-tight">

          Complete Business Plan

          <span className="block text-blue-600">
           WITH A SINGLE CLICK 
          </span>

        </h1>

        <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-600">

          Generate professional business plans,
          market analysis, financial forecasts,
          and growth strategies in minutes.

        </p>

        <div className="mt-10 flex justify-center gap-4">

          <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700">
            Start Free
          </button>

          <button className="px-8 py-4 border rounded-xl text-lg font-semibold hover:bg-gray-100">
            View Demo
          </button>

        </div>

      </div>
    </section>
  );
}

export default Hero;