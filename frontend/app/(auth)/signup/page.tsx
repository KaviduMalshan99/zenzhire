"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import { signup } from "@/lib/auth";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await signup(values.email, values.password, values.full_name);
      toast.success("Account created! Welcome to ZenzHire.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="text-blue-500 w-6 h-6" />
            <span className="text-xl font-bold text-white">ZenzHire</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-[#8b949e] text-sm">Start optimizing your career today — free forever</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Full Name</label>
              <input
                {...register("full_name")}
                type="text"
                placeholder="Jane Smith"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Confirm Password</label>
              <input
                {...register("confirm_password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#8b949e] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
