"use client"

import { useState } from "react"
import { Star, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewSubmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReviewSubmissionModal({ open, onOpenChange, onSuccess }: ReviewSubmissionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    rating: 0,
    bookingStartDate: "",
    bookingEndDate: "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    comment: "",
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.rating || !formData.bookingStartDate || !formData.bookingEndDate) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      // Reset form
      setFormData({
        name: "",
        rating: 0,
        bookingStartDate: "",
        bookingEndDate: "",
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        comment: "",
      })
      setHoveredStar(0)
      onOpenChange(false)
      if (onSuccess) onSuccess()
      alert("Thank you for your review! It will be reviewed and approved before being displayed.")
    } catch (error: any) {
      setError(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-4">Share Your Experience</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text block mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Booking Start Date *
              </label>
              <input
                type="date"
                value={formData.bookingStartDate}
                onChange={(e) => setFormData({ ...formData, bookingStartDate: e.target.value })}
                required
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
              />
            </div>
            <div>
              <label className="label-text block mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Booking End Date *
              </label>
              <input
                type="date"
                value={formData.bookingEndDate}
                onChange={(e) => setFormData({ ...formData, bookingEndDate: e.target.value })}
                required
                min={formData.bookingStartDate}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 text-white"
              />
            </div>
          </div>

          <div>
            <label className="label-text block mb-2">Overall Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
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

          {/* Five Questions */}
          <div className="space-y-4">
            <h3 className="label-text text-lg">Tell us about your experience:</h3>
            <div>
              <label className="label-text block mb-2">Question 1 (placeholder text)</label>
              <textarea
                value={formData.question1}
                onChange={(e) => setFormData({ ...formData, question1: e.target.value })}
                rows={2}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                placeholder="Your answer..."
              />
            </div>
            <div>
              <label className="label-text block mb-2">Question 2 (placeholder text)</label>
              <textarea
                value={formData.question2}
                onChange={(e) => setFormData({ ...formData, question2: e.target.value })}
                rows={2}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                placeholder="Your answer..."
              />
            </div>
            <div>
              <label className="label-text block mb-2">Question 3 (placeholder text)</label>
              <textarea
                value={formData.question3}
                onChange={(e) => setFormData({ ...formData, question3: e.target.value })}
                rows={2}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                placeholder="Your answer..."
              />
            </div>
            <div>
              <label className="label-text block mb-2">Question 4 (placeholder text)</label>
              <textarea
                value={formData.question4}
                onChange={(e) => setFormData({ ...formData, question4: e.target.value })}
                rows={2}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                placeholder="Your answer..."
              />
            </div>
            <div>
              <label className="label-text block mb-2">Question 5 (placeholder text)</label>
              <textarea
                value={formData.question5}
                onChange={(e) => setFormData({ ...formData, question5: e.target.value })}
                rows={2}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
                placeholder="Your answer..."
              />
            </div>
          </div>

          <div>
            <label className="label-text block mb-2">Additional Comments</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:border-white/40 placeholder:opacity-50 resize-none text-white"
              placeholder="Any additional feedback..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="w-full py-3 bg-white text-black rounded-lg nav-text hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

