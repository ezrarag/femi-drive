"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeaveReviewForm() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.from("reviews").insert([
      {
        name: data.name,
        rating: Number(data.rating),
        vehicle: data.vehicle,
        comment: data.comment,
      },
    ]);
    setLoading(false);
    if (error) {
      setMessage("Error submitting review. Please try again.");
    } else {
      reset();
      setMessage("Thanks for your feedback!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <input {...register("name", { required: true })} placeholder="Your Name" className="input" />
      <input type="number" {...register("rating", { required: true, min: 1, max: 5 })} placeholder="Rating (1–5)" className="input" />
      <input {...register("vehicle")} placeholder="Vehicle (optional)" className="input" />
      <textarea {...register("comment", { required: true })} placeholder="Your Review" className="input" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      {message && <div className="text-center text-sm mt-2">{message}</div>}
    </form>
  );
} 