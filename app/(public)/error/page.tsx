import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-blue-50/40 to-white px-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="size-7 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          We ran into an unexpected error. This might be a temporary issue — try going back to the login page.
          If the problem persists, please contact support.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#55adfe] hover:bg-[#3d9fee] text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-colors"
          >
            Back to login
          </Link>
          <a
            href="mailto:support@feedbackami.com"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-sm transition-colors"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
