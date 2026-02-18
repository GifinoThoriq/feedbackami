import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#55adfe] to-[#2d8fef] p-12 md:p-16 text-center overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to build what
              <br />
              your users love?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Join 500+ product teams already using Feedbackami to turn user
              feedback into their competitive advantage.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 px-8 py-4 bg-white text-[#55adfe] font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start for free
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                Sign in to your account
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              Free forever plan available. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
