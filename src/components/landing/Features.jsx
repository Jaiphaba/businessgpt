import {
  FaRobot,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaRobot size={32} />,
      title: "AI Generation",
      description:
        "Create complete business plans instantly."
    },
    {
      icon: <FaChartLine size={32} />,
      title: "Financial Forecasting",
      description:
        "Get revenue and expense projections."
    },
    {
      icon: <FaFileAlt size={32} />,
      title: "Export Reports",
      description:
        "Download professional PDF plans."
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-16">

          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border hover:shadow-xl transition"
            >
              <div className="text-blue-600">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mt-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 mt-3">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Features;