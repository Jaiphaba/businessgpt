function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Describe Your Idea",
      description:
        "Tell us about your startup, business, or project.",
    },
    {
      number: "02",
      title: "AI Generates Plan",
      description:
        "PlanForge AI creates a complete professional business plan.",
    },
    {
      number: "03",
      title: "Export & Share",
      description:
        "Download as PDF and share with investors or partners.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white p-8 rounded-2xl shadow-sm"
            >
              <span className="text-5xl font-bold text-blue-600">
                {step.number}
              </span>

              <h3 className="text-2xl font-semibold mt-4">
                {step.title}
              </h3>

              <p className="text-gray-600 mt-3">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;