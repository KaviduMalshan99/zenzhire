"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, FileText, Target, MessageSquare, Crown, LogOut, KeyRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/lib/auth";
import { profileApi, type UsageStats } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";
import { PASSWORD_MIN_LENGTH, isPasswordValid, getPasswordHints } from "@/lib/password";

const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  pass7: "7-Day Pass",
};

const passwordSchema = z.object({
  current_password: z.string().min(1, "Enter your current password"),
  new_password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .refine(isPasswordValid, (password) => ({
      message: getPasswordHints(password).join(" · ") || "Password is too weak",
    })),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const inputClass =
  "w-full bg-[#0d1117] border border-[#30363d] hover:border-[#484f58] rounded-md px-3.5 py-2.5 text-[#e6edf3] placeholder:text-[#484f58] outline-none transition-all duration-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const newPasswordValue = watch("new_password") || "";

  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      await changePassword(values.current_password, values.new_password);
      toast.success("Password changed successfully.");
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 pt-5 border-t border-[#30363d] space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Current Password</label>
        <input {...register("current_password")} type="password" placeholder="••••••••" autoFocus className={inputClass} />
        {errors.current_password && <p className="text-red-400 text-xs mt-1.5">{errors.current_password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-[#c9d1d9] mb-2">New Password</label>
        <input {...register("new_password")} type="password" placeholder="••••••••" className={inputClass} />
        <PasswordStrengthMeter password={newPasswordValue} />
        {errors.new_password && <p className="text-red-400 text-xs mt-1.5">{errors.new_password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-[#c9d1d9] mb-2">Confirm New Password</label>
        <input {...register("confirm_password")} type="password" placeholder="••••••••" className={inputClass} />
        {errors.confirm_password && <p className="text-red-400 text-xs mt-1.5">{errors.confirm_password.message}</p>}
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Password
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-[#8b949e] hover:text-white text-sm px-4 py-2 rounded-md border border-[#30363d] hover:border-[#8b949e] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function UsageTile({
  icon: Icon,
  label,
  used,
  limit,
  loading,
}: {
  icon: LucideIcon;
  label: string;
  used: number;
  limit: number | null;
  loading: boolean;
}) {
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-blue-400 w-5 h-5" />
        <span className="text-[#8b949e] text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">
        {loading ? "—" : limit === null ? "Unlimited" : `${used} of ${limit}`}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: userLoading, logout } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    profileApi
      .usageStats()
      .then((res) => setStats(res.data))
      .finally(() => setStatsLoading(false));
  }, []);

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 w-full">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-[#8b949e] mt-1">Manage your account, subscription, and usage.</p>
        </div>

        {/* Account Info */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="text-white font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Name</span>
              <span className="text-[#e6edf3]">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Email</span>
              <span className="text-[#e6edf3]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Member since</span>
              <span className="text-[#e6edf3]">{formatDate(user.created_at)}</span>
            </div>
          </div>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="mt-5 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </button>
          ) : (
            <ChangePasswordForm onDone={() => setShowPasswordForm(false)} />
          )}
        </div>

        {/* Subscription */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="text-white font-semibold mb-4">Subscription</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {user.is_pro ? (
                <span className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full w-fit">
                  <Crown className="w-3 h-3" />
                  Pro{stats?.active_plan ? ` · ${PLAN_LABELS[stats.active_plan] ?? stats.active_plan}` : ""}
                </span>
              ) : (
                <span className="text-xs bg-[#0d1117] border border-[#30363d] text-[#8b949e] px-3 py-1 rounded-full w-fit">
                  Free
                </span>
              )}
              {user.is_pro && user.pro_until && (
                <p className="text-[#8b949e] text-xs mt-2">Expires on {formatDate(user.pro_until)}</p>
              )}
            </div>
            <a
              href="/pricing"
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-md transition-colors",
                user.is_pro
                  ? "border border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]"
                  : "bg-gradient-to-r from-amber-400 to-orange-400 text-black hover:opacity-90"
              )}
            >
              {user.is_pro ? "Manage Subscription" : "Upgrade to Pro"}
            </a>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="text-white font-semibold mb-4">Usage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageTile
              icon={FileText}
              label="CVs Created"
              used={stats?.cv_count ?? 0}
              limit={stats?.cv_limit ?? null}
              loading={statsLoading}
            />
            <UsageTile
              icon={Target}
              label="ATS Checks (lifetime)"
              used={stats?.ats_count ?? 0}
              limit={stats?.ats_limit ?? null}
              loading={statsLoading}
            />
            <UsageTile
              icon={MessageSquare}
              label="Zeni Chats Today"
              used={stats?.ai_usage_count ?? 0}
              limit={stats?.ai_usage_limit ?? null}
              loading={statsLoading}
            />
          </div>
        </div>

        {/* Sign out */}
        <div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors border border-[#30363d] hover:border-red-400/40 rounded-md px-4 py-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
