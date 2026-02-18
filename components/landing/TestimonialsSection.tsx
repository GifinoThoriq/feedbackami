import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Feedbackami transformed how we handle user requests. We went from a chaotic spreadsheet to a structured system our whole team loves. Shipping features our users actually want has never been easier.",
    name: "Sarah Chen",
    role: "Head of Product",
    company: "NovaTech",
    gradient: "from-blue-400 to-blue-600",
    initials: "SC",
  },
  {
    quote:
      "The simplicity is the best part. We set it up in an afternoon and started collecting valuable feedback immediately. Our users love that they can track the status of their requests.",
    name: "Marcus Rivera",
    role: "CTO",
    company: "Launchpad AI",
    gradient: "from-purple-400 to-purple-600",
    initials: "MR",
  },
  {
    quote:
      "We used to lose so much feedback in support tickets and emails. Feedbackami brought everything together. Now our roadmap is driven entirely by real user data.",
    name: "Aisha Thompson",
    role: "Product Manager",
    company: "ScaleUp",
    gradient: "from-green-400 to-green-600",
    initials: "AT",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#55adfe] uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
            Loved by product teams
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Here is what teams building great products have to say about
            Feedbackami.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote size={24} className="text-[#55adfe] mb-4" />

              {/* Quote Text */}
              <p className="text-gray-600 leading-relaxed flex-1 mb-6 text-sm">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-semibold text-sm">
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Numbers */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-16">
          {[
            { value: "500+", label: "Product teams" },
            { value: "50K+", label: "Feedback collected" },
            { value: "12K+", label: "Features shipped" },
            { value: "99%", label: "Customer satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
