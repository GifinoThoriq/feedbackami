import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for indie makers and small projects.",
    cta: "Get started",
    ctaHref: "/auth/register",
    highlighted: false,
    features: [
      "1 feedback board",
      "Up to 50 feedback posts",
      "Basic status tracking",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For growing teams that need more power.",
    cta: "Start free trial",
    ctaHref: "/auth/register",
    highlighted: true,
    features: [
      "Unlimited feedback boards",
      "Unlimited feedback posts",
      "Custom statuses",
      "Priority email support",
      "Feedback analytics",
      "Team members (up to 5)",
    ],
  },
  {
    name: "Business",
    price: "$49",
    period: "per month",
    description: "For larger teams with advanced needs.",
    cta: "Start free trial",
    ctaHref: "/auth/register",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Advanced analytics & reports",
      "Custom branding",
      "SSO / SAML",
      "Dedicated support",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-[#55adfe] uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Start for free. Upgrade when you need more power. No hidden fees,
            no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-[#55adfe] text-white shadow-2xl shadow-blue-200 scale-105"
                  : "bg-white border border-gray-100"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-[#55adfe] text-xs font-bold px-3 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name & Price */}
              <div className="mb-6">
                <p
                  className={`text-sm font-semibold uppercase tracking-widest mb-2 ${
                    plan.highlighted ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}
                  >
                    /{plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-gray-500"}`}
                >
                  {plan.description}
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 rounded-xl font-semibold text-sm mb-8 transition-colors ${
                  plan.highlighted
                    ? "bg-white text-[#55adfe] hover:bg-blue-50"
                    : "bg-[#55adfe] text-white hover:bg-[#3d9fee]"
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features List */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? "text-white" : "text-[#55adfe]"
                      }`}
                    />
                    <span
                      className={`text-sm ${plan.highlighted ? "text-blue-50" : "text-gray-600"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans come with a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
