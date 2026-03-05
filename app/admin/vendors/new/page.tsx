"use client";

import { useState } from "react";

type FormState = {
  vendorCode: string; // e.g. 2601XX-001
  companyName: string;
  logoUrl: string;

  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;

  primaryName: string;
  primaryEmail: string;
  primaryPhone: string;

  secondaryName: string;
  secondaryEmail: string;
  secondaryPhone: string;

  notes: string;
};

const initial: FormState = {
  vendorCode: "",
  companyName: "",
  logoUrl: "",

  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",

  primaryName: "",
  primaryEmail: "",
  primaryPhone: "",

  secondaryName: "",
  secondaryEmail: "",
  secondaryPhone: "",

  notes: "",
};

function normalizeVendorCode(v: string) {
  return (v || "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

function formatUSPhone(v: string) {
  const digits = (v || "").replace(/\D/g, "");
  if (digits.length === 10) {
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6);
    return `(${a}) ${b}-${c}`;
  }
  return (v || "").trim();
}

export default function NewVendorPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      vendorCode: normalizeVendorCode(form.vendorCode),
      primaryPhone: formatUSPhone(form.primaryPhone),
      secondaryPhone: formatUSPhone(form.secondaryPhone),
    };

    const required: (keyof FormState)[] = ["vendorCode", "companyName", "primaryName", "primaryEmail"];
    const missing = required.filter((k) => !String(payload[k] || "").trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vendors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setSuccess(`Vendor saved! Vendor Code: ${data.vendorCode || payload.vendorCode}`);
      setForm(initial);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Create Vendor Profile</h1>
      <p className="mt-1 text-sm text-gray-600">
        This page will create a vendor profile after you approve a vendor.
      </p>

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Vendor Basics</h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Vendor Code (example: 2601XX-001) *</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.vendorCode}
                onChange={(e) => update("vendorCode", e.target.value)}
                placeholder="2601XX-001"
              />
            </label>

            <label className="block">
              <span className="text-sm">Company Name *</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Company X"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm">Company Logo URL (optional)</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Company Address</h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm">Address line 1</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.address1}
                onChange={(e) => update("address1", e.target.value)}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm">Address line 2 (optional)</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.address2}
                onChange={(e) => update("address2", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">City</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">State</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">ZIP</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Primary Contact</h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Name *</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.primaryName}
                onChange={(e) => update("primaryName", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">Email *</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.primaryEmail}
                onChange={(e) => update("primaryEmail", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">Phone</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.primaryPhone}
                onChange={(e) => update("primaryPhone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Secondary Contact (optional)</h2>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Name</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.secondaryName}
                onChange={(e) => update("secondaryName", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">Email</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.secondaryEmail}
                onChange={(e) => update("secondaryEmail", e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm">Phone</span>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={form.secondaryPhone}
                onChange={(e) => update("secondaryPhone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Notes (optional)</h2>
          <textarea
            className="mt-2 w-full rounded border px-3 py-2"
            rows={4}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any notes you want saved with this vendor..."
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Vendor"}
        </button>
      </form>
    </div>
  );
}
