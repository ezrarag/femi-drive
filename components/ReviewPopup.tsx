"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { reviews } from "@/data/reviews"

interface ReviewPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReviewPopup({ open, onOpenChange }: ReviewPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    rating: 0,
    rentalDate: "",
    comment: "",
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  // Auto-rotate reviews in slideshow
  useEffect(() => {
    if (!open || reviews.length === 0) return

    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 4000) // Change review every 4 seconds

    return () => clearInterval(interval)
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement review submission when backend is ready
    console.log("Review submitted:", formData)
    // Reset form
    setFormData({ name: "", rating: 0, rentalDate: "", comment: "" })
    setHoveredStar(0)
    alert("Thank you for your review! It will be reviewed and approved before being displayed.")
  }

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating })
  }

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  // Filter approved reviews (for now, using all reviews from data)
  const approvedReviews = reviews.filter((review) => review)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-4">Customer Reviews</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Review Form */}
          <div className="border-b border-white/20 pb-6">
            <h3 className="text-xl mb-4">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text block mb-2">Your Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 text-white"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Rental Date *</label>
                <input
                  type="date"
                  value={formData.rentalDate}
                  onChange={(e) => setFormData({ ...formData, rentalDate: e.target.value })}
                  required
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={handleStarLeave}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoveredStar || formData.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {formData.rating === 0 && (
                  <p className="body-text text-sm opacity-60 mt-2">Please select a rating</p>
                )}
              </div>

              <div>
                <label className="label-text block mb-2">Your Review *</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                  rows={4}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                  placeholder="Tell us about your experience..."
                />
              </div>

              <button
                type="submit"
                disabled={formData.rating === 0}
                className="w-full py-3 bg-white text-black rounded-lg nav-text hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews Slideshow */}
          {approvedReviews.length > 0 && (
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
                      <div className="font-semibold text-lg">{approvedReviews[currentReviewIndex].name}</div>
                      <div className="body-text opacity-60">
                        {new Date(approvedReviews[currentReviewIndex].date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < approvedReviews[currentReviewIndex].rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-white/30"
                          }`}
                        />
                      ))}
                    </div>
                    {approvedReviews[currentReviewIndex].vehicle && (
                      <div className="body-text opacity-60 mb-2 italic">
                        {approvedReviews[currentReviewIndex].vehicle}
                      </div>
                    )}
                    <p className="body-text leading-relaxed">
                      {approvedReviews[currentReviewIndex].comment}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Review Indicators */}
                {approvedReviews.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {approvedReviews.map((_, index) => (
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

