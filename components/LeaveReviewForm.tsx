"use client";
import { useForm } from "react-hook-form";

export default function LeaveReviewForm() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log(data); // Replace with Supabase call later
    reset();
    alert("Thanks for your feedback!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <input {...register("name", { required: true })} placeholder="Your Name" className="input" />
      <input type="number" {...register("rating", { required: true, min: 1, max: 5 })} placeholder="Rating (1–5)" className="input" />
      <input {...register("vehicle")} placeholder="Vehicle (optional)" className="input" />
      <textarea {...register("comment", { required: true })} placeholder="Your Review" className="input" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
} 