import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50/60 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
            <Star size={14} className="text-[#55adfe] fill-[#55adfe]" />
            <span className="text-sm text-blue-700 font-medium">
              Trusted by 500+ product teams
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-center text-gray-900 leading-tight mb-6">
          Collect & manage
          <br />
          <span className="text-[#55adfe]">user feedback</span>
          <br />
          with ease
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-500 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
          Turn customer insights into your product roadmap. Create feedback
          boards, track feature requests, and ship what your users actually want.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 px-7 py-3.5 bg-[#55adfe] text-white font-semibold rounded-xl hover:bg-[#3d9fee] transition-colors shadow-lg shadow-blue-200"
          >
            Start for free
            <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* App Preview / Dashboard Mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden">
            {/* Mockup Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-md px-3 py-0.5 text-xs text-gray-400 border border-gray-200">
                  app.feedbackami.com/dashboard
                </div>
              </div>
            </div>

            {/* Mockup Body */}
            <div className="flex h-80">
              {/* Sidebar */}
              <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-[#55adfe]" />
                  <div className="h-3 bg-gray-200 rounded flex-1" />
                </div>
                {["Dashboard", "Feedback", "Boards", "Settings"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`h-8 rounded-lg flex items-center px-3 gap-2 ${
                        i === 1
                          ? "bg-[#55adfe]/10 text-[#55adfe]"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded ${i === 1 ? "bg-[#55adfe]" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-2 rounded flex-1 ${i === 1 ? "bg-[#55adfe]/30" : "bg-gray-200"}`}
                      />
                    </div>
                  )
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-8 bg-[#55adfe] rounded-lg w-28" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {["Total Feedback", "In Progress", "Shipped"].map(
                    (label, i) => (
                      <div
                        key={label}
                        className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                      >
                        <div className="h-2 bg-gray-200 rounded w-16 mb-2" />
                        <div
                          className={`h-6 rounded w-10 ${
                            i === 0
                              ? "bg-[#55adfe]/20"
                              : i === 1
                                ? "bg-yellow-100"
                                : "bg-green-100"
                          }`}
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Feedback List */}
                <div className="flex flex-col gap-2">
                  {[
                    { color: "bg-blue-100", label: "Open" },
                    { color: "bg-yellow-100", label: "In Progress" },
                    { color: "bg-green-100", label: "Shipped" },
                  ].map(({ color, label }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <div className="flex-1 h-2 bg-gray-100 rounded" />
                      <div className={`h-5 w-16 rounded-full ${color} text-xs`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
