"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReviewSubmissionModal } from "./ReviewSubmissionModal"

interface ReviewPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewPopup({ open, onOpenChange }: ReviewPopupProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'bookings'>('reviews')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  // Fetch reviews on mount
  useEffect(() => {
    if (open) {
      fetchReviews()
    }
  }, [open])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      const data = await response.json()
      if (response.ok) {
        const approvedReviews = data.reviews.filter((r: any) => r.approved !== false)
        setReviews(approvedReviews)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  // Auto-rotate reviews in slideshow
  useEffect(() => {
    if (!open || reviews.length === 0) return

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 4000) // Change review every 4 seconds

    return () => clearInterval(interval)
  }, [open, reviews.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/80 backdrop-blur-md text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-4">Customer Reviews & Bookings</DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-white/20">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'reviews'
                ? 'border-b-2 border-white text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'border-b-2 border-white text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Bookings
          </button>
        </div>

        <div className="space-y-8">
          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <>
              {/* Review Form Button */}
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-xl mb-4">Share Your Experience</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      onOpenChange(false)
                      setShowSubmissionModal(true)
                    }}
                    className="flex-1 py-3 bg-white text-black rounded-lg nav-text hover:bg-gray-200 transition-all font-semibold"
                  >
                    Leave a Review
                  </button>
                  <Link
                    href="/reviews"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg nav-text hover:bg-white/20 transition-all font-semibold text-center flex items-center justify-center"
                  >
                    View All Reviews
                  </Link>
                </div>
              </div>

              {/* Reviews Slideshow */}
              {reviews.length > 0 && (
                <div className="border-t border-white/20 pt-6">
                  <h3 className="text-xl mb-4">Customer Reviews</h3>
                  <div className="relative overflow-hidden rounded-lg bg-white/5 p-6 min-h-[200px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentReviewIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-lg">{reviews[currentReviewIndex]?.name}</div>
                          <div className="body-text opacity-60">
                            {reviews[currentReviewIndex]?.createdAt 
                              ? new Date(reviews[currentReviewIndex].createdAt).toLocaleDateString()
                              : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (reviews[currentReviewIndex]?.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-white/30"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="body-text leading-relaxed">
                          {reviews[currentReviewIndex]?.comment || ''}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Review Indicators */}
                    {reviews.length > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        {reviews.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentReviewIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentReviewIndex
                                ? "w-8 bg-white"
                                : "w-2 bg-white/40 hover:bg-white/60"
                            }`}
                            aria-label={`Go to review ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="border-b border-white/20 pb-6">
                <h3 className="text-xl mb-4">Book a Vehicle</h3>
                <p className="body-text text-white/70 mb-6">
                  Browse our fleet and find the perfect vehicle for your needs. Flexible rental terms, transparent pricing, and easy booking.
                </p>
                <Link
                  href="/inventory"
                  onClick={() => onOpenChange(false)}
                  className="w-full py-3 bg-white text-black rounded-lg nav-text hover:bg-gray-200 transition-all font-semibold text-center flex items-center justify-center"
                >
                  View Fleet & Book Now
                </Link>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-3">Why Choose Femi Leasing?</h4>
                <ul className="space-y-2 body-text text-white/80">
                  <li>• Pre-approved vehicles for Uber, Lyft, and DoorDash</li>
                  <li>• Flexible short and long-term rentals</li>
                  <li>• Transparent pricing with no hidden fees</li>
                  <li>• Well-maintained fleet ready for your next adventure</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      
      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        open={showSubmissionModal}
        onOpenChange={setShowSubmissionModal}
        onSuccess={() => {
          fetchReviews()
          onOpenChange(true) // Reopen the popup to show new review
        }}
      />
    </Dialog>
  )
}

