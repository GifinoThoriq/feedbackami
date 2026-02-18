import {
  LayoutDashboard,
  ListChecks,
  Users,
  BarChart3,
  MessageSquare,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Organized Feedback Boards",
    description:
      "Create dedicated boards for different product areas. Keep feedback organized and easy to navigate for your entire team.",
    color: "bg-blue-50",
    iconColor: "text-[#55adfe]",
  },
  {
    icon: ListChecks,
    title: "Status Tracking",
    description:
      "Move feedback through custom statuses — from Open to In Progress to Shipped. Keep users informed every step of the way.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Centralized Feedback",
    description:
      "Stop scattered feedback across emails and spreadsheets. Collect everything in one place and never lose an insight again.",
    color: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Work together with your team to triage, prioritize, and act on feedback. Everyone stays aligned on what to build next.",
    color: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: BarChart3,
    title: "Insights & Analytics",
    description:
      "Understand trends in your feedback. Identify the most requested features and make data-driven product decisions.",
    color: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    icon: Zap,
    title: "Fast & Easy Setup",
    description:
      "Get your feedback board up and running in minutes. No complex configuration needed — just sign up and start collecting.",
    color: "bg-yellow-50",
    iconColor: "text-yellow-500",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#55adfe] uppercase tracking-widest">
            Features
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
            Everything you need to
            <br />
            manage feedback
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            A complete toolkit for collecting, organizing, and acting on user
            feedback — all in one platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#55adfe]/30 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}
                >
                  <Icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
