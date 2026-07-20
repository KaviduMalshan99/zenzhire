"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { billingApi } from "@/lib/api";

interface Props {
  open: boolean;
  plan: "monthly" | "yearly" | "pass7";
  planLabel: string;
  planPrice: string;
  onClose: () => void;
}

export function BillingModal({ open, plan, planLabel, planPrice, onClose }: Props) {
  const [mobilePhone, setMobilePhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("LK");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canSubmit = mobilePhone.trim() && street.trim() && city.trim() && postcode.trim() && country.trim();

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await billingApi.checkout({
        plan,
        customer_mobile_phone: mobilePhone.trim(),
        billing_address_street: street.trim(),
        billing_address_city: city.trim(),
        billing_address_postcode_zip: postcode.trim(),
        billing_address_country: country.trim(),
      });
      window.location.href = res.data.payment_page;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-white font-semibold text-lg mb-1">Billing details</h2>
        <p className="text-[#8b949e] text-sm mb-5">
          {planLabel} — <span className="text-white font-medium">{planPrice}</span>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-[#8b949e] mb-1">Mobile Phone</label>
            <input
              type="tel"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-[#8b949e] mb-1">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Main St"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#8b949e] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Colombo"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#8b949e] mb-1">Postcode</label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="00100"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-[#8b949e] mb-1">Country Code</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              placeholder="LK"
              maxLength={3}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#484f58] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-md transition-colors text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment...
            </>
          ) : (
            "Continue to payment"
          )}
        </button>
        <p className="text-[10px] text-[#484f58] text-center mt-3">
          You'll complete payment securely on PAYable's hosted page.
        </p>
      </div>
    </div>
  );
}
