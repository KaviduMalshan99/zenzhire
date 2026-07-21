"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed: "Google sign-in failed. Please try again.",
  google_email_unverified: "Your Google email isn't verified. Please verify it with Google first.",
  account_disabled: "This account has been disabled.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(GOOGLE_ERROR_MESSAGES[error] || "Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0d1117] overflow-hidden flex items-center justify-center px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.20), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-[340px] h-[340px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center mb-6">
            <Image src="/logo.png" alt="ZenzHire" width={165} height={37} className="h-8 w-auto" priority />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#8b949e] text-sm">Sign in to your account to continue</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] rounded-md px-3.5 py-2.5 text-[#e6edf3] placeholder:text-[#484f58] outline-none transition-all duration-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#c9d1d9]">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] rounded-md px-3.5 py-2.5 text-[#e6edf3] placeholder:text-[#484f58] outline-none transition-all duration-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#30363d]" />
            <span className="text-[11px] font-medium tracking-wider text-[#8b949e] uppercase">Or</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#30363d]" />
          </div>

          <GoogleButton />
        </div>

        <p className="text-center text-sm text-[#8b949e] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
