"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  userFirstName?: string | null;
}

export default function Navbar({ userFirstName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#55adfe] flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Feedbackami</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {/* <a
            href="#features"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </a> */}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {userFirstName ? (
            <>
              <span className="text-sm text-gray-600">
                Hello, {userFirstName}
              </span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#55adfe] text-white text-sm font-medium rounded-lg hover:bg-[#3d9fee] transition-colors"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-[#55adfe] text-white text-sm font-medium rounded-lg hover:bg-[#3d9fee] transition-colors"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          <a
            href="#features"
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {userFirstName ? (
              <Link
                href="/dashboard"
                className="w-full text-center px-4 py-2 bg-[#55adfe] text-white text-sm font-medium rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="w-full text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full text-center px-4 py-2 bg-[#55adfe] text-white text-sm font-medium rounded-lg"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
