import { Star } from "lucide-react";

export default function ReviewCard({ name, rating, comment, date, vehicle }: {
  name: string;
  rating: number;
  comment: string;
  date: string;
  vehicle?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < rating ? "text-yellow-500" : "text-gray-300"} />
        ))}
      </div>
      {vehicle && <div className="text-sm text-gray-600 italic">{vehicle}</div>}
      <p className="text-gray-700 text-sm">{comment}</p>
    </div>
  );
} 