import { PlusCircle, Inbox, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: PlusCircle,
    title: "Create a feedback board",
    description:
      "Set up a board for any product area in seconds. Give it a name, a unique URL, and you're ready to start collecting.",
    detail: "No credit card required to get started.",
  },
  {
    step: "02",
    icon: Inbox,
    title: "Collect user feedback",
    description:
      "Users submit their ideas, requests, and bug reports directly to your board. Everything is organized and searchable.",
    detail: "All feedback is saved in real time.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Prioritize and ship",
    description:
      "Review, triage, and update statuses as you work through your backlog. Keep users in the loop as features ship.",
    detail: "Users get notified when their request ships.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#55adfe] uppercase tracking-widest">
            How it works
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
            From feedback to shipped
            <br />
            in three simple steps
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Feedbackami makes it simple to build the right thing by keeping you
            close to what users actually need.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#55adfe]/20 via-[#55adfe]/60 to-[#55adfe]/20" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#55adfe]/20 shadow-lg shadow-blue-100 flex items-center justify-center">
                    <Icon size={32} className="text-[#55adfe]" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#55adfe] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-3">
                  {step.description}
                </p>
                <span className="text-xs text-[#55adfe] font-medium">
                  {step.detail}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
