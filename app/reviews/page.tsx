import ReviewCard from "@/components/ReviewCard";
import { reviews } from "@/data/reviews";

export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Customer Reviews</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reviews.map((r, idx) => (
          <ReviewCard key={idx} {...r} />
        ))}
      </div>
    </div>
  );
} 