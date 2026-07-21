"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { resetPassword } from "@/lib/auth";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { PASSWORD_MIN_LENGTH, isPasswordValid, getPasswordHints } from "@/lib/password";

const schema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .refine(isPasswordValid, (password) => ({
      message: getPasswordHints(password).join(" · ") || "Password is too weak",
    })),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormValues = z.infer<typeof schema>;

function AuthShell({ children }: { children: React.ReactNode }) {
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
          <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-[#8b949e] text-sm">Choose a new password for your account</p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40">
          {children}
        </div>

        <p className="text-center text-sm text-[#8b949e] mt-6">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password") || "";

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    setLoading(true);
    try {
      await resetPassword(token, values.password);
      setDone(true);
      toast.success("Password reset successful!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "This password reset link is invalid or has expired. Please request a new one.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-[#e6edf3] text-sm mb-4">
            This reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors text-sm text-center"
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-[#e6edf3] text-sm mb-4">
            Your password has been reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors text-sm"
          >
            Go to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">New Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoFocus
            className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] rounded-md px-3.5 py-2.5 text-[#e6edf3] placeholder:text-[#484f58] outline-none transition-all duration-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          <PasswordStrengthMeter password={passwordValue} />
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div className="mb-7">
          <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Confirm New Password</label>
          <input
            {...register("confirm_password")}
            type="password"
            placeholder="••••••••"
            className="w-full bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] rounded-md px-3.5 py-2.5 text-[#e6edf3] placeholder:text-[#484f58] outline-none transition-all duration-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          {errors.confirm_password && (
            <p className="text-red-400 text-xs mt-1.5">{errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset password
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
