"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { PhoneDisplay } from "@/components/phone-display";
import ReviewCard from "@/components/ReviewCard";
// TODO: Implement reviews when backend is ready
import React from "react";

async function getReviews() {
  // TODO: Implement reviews when backend is ready
  return [];
}

export default function ReviewsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  // Fetch reviews on mount
  React.useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch(setError);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6">
        {/* Desktop Nav */}
        <div className="hidden sm:flex gap-4">
          <Link
            href="/"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Home
          </Link>
          <Link
            href="/inventory"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Fleet
          </Link>
        </div>
        {/* Hamburger for Mobile */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Center Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-center">
            <div className="text-sm font-bold tracking-widest">FE</div>
            <div className="text-sm font-bold tracking-widest -mt-1">MI</div>
          </div>
        </div>
        {/* Desktop Right Nav */}
        <div className="hidden sm:flex gap-4">
          {process.env.NEXT_PUBLIC_BUSINESS_PHONE && (
            <PhoneDisplay className="text-white" />
          )}
          <Link
            href="/about"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-text px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all"
          >
            Contact
          </Link>
        </div>
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full bg-black/95 border-t border-white/10 shadow-lg flex flex-col items-center py-6 gap-4 animate-fadein z-50">
            <Link
              href="/"
              className="nav-text px-6 py-3 rounded-full hover:bg-white/10 transition-all w-11/12 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/inventory"
              className="nav-text px-6 py-3 rounded-full hover:bg-white/10 transition-all w-11/12 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fleet
            </Link>
            <Link
              href="/about"
              className="nav-text px-6 py-3 rounded-full hover:bg-white/10 transition-all w-11/12 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="nav-text px-6 py-3 rounded-full hover:bg-white/10 transition-all w-11/12 text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {process.env.NEXT_PUBLIC_BUSINESS_PHONE && (
              <PhoneDisplay className="text-white mt-2" />
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Customer Reviews</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {error ? (
            <div className="col-span-2 text-red-500">Error loading reviews.</div>
          ) : reviews.length === 0 ? (
            <div className="col-span-2 text-gray-500">No reviews yet.</div>
          ) : (
            reviews.map((r: any) => <ReviewCard key={r.id} {...r} />)
          )}
        </div>
      </div>
    </div>
  );
} 