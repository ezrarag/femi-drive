"use client";
import Link from "next/link";
import { Menu, X, Star, Calendar, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { PhoneDisplay } from "@/components/phone-display";
import ReviewCard from "@/components/ReviewCard";
import NavBar from "@/components/NavBar";
import { ReviewSubmissionModal } from "@/components/ReviewSubmissionModal";

interface Review {
  id: string;
  name: string;
  rating: number;
  bookingStartDate: string;
  bookingEndDate: string;
  comment: string;
  createdAt: string;
  approved?: boolean;
}

export default function ReviewsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      if (response.ok) {
        // Filter to show only approved reviews (or all if none are approved yet)
        const approvedReviews = data.reviews.filter((r: Review) => r.approved !== false);
        setReviews(approvedReviews);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <NavBar variant="dark" />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h1 className="display-heading text-3xl sm:text-4xl md:text-5xl">CUSTOMER REVIEWS</h1>
          <button
            onClick={() => setShowReviewModal(true)}
            className="nav-text px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm sm:text-base"
          >
            Leave a Review
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="body-text text-white/60">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="body-text text-red-400">{error}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="body-text text-white/60 mb-6">No reviews yet. Be the first to leave a review!</p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="nav-text px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-all"
            >
              Leave a Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="label-text text-lg font-semibold">{review.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="body-text text-sm text-white/60">
                        {calculateDuration(review.bookingStartDate, review.bookingEndDate)} days
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="body-text text-white/80">{review.comment}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="body-text text-xs text-white/60">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {/* Admin delete button - TODO: Add admin check */}
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        onSuccess={fetchReviews}
      />
    </div>
  );
} 