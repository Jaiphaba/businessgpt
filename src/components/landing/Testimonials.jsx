function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Startup Founder",
      quote:
        "BusinessGPT helped me create a complete business plan in less than 10 minutes."
    },
    {
      name: "Michael Lee",
      role: "Entrepreneur",
      quote:
        "The financial forecasting feature saved me hours of work."
    },
    {
      name: "David Chen",
      role: "Business Consultant",
      quote:
        "Professional output that I can actually present to investors."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <p className="text-gray-600">
                "{item.quote}"
              </p>

              <div className="mt-6">
                <h4 className="font-bold">
                  {item.name}
                </h4>

                <p className="text-gray-500">
                  {item.role}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;