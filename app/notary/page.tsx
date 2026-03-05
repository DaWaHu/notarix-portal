"use client";

import { useMemo, useState } from "react";

type FormState = {
  contactName: string;
  companyName: string;
  companyType: string;

  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;

  phone: string;
  email: string;

  bestTimeWindow: string;
  timeZone: string;
  notes: string;
};

const COMPANY_TYPES = [
  "Title Company",
  "Signing Service",
  "Escrow Company",
  "Law Firm",
  "Lender / Mortgage Company",
  "Real Estate Brokerage",
  "Other",
] as const;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const TIME_ZONES = [
  { label: "Eastern (ET)", value: "ET" },
  { label: "Central (CT)", value: "CT" },
  { label: "Mountain (MT)", value: "MT" },
  { label: "Pacific (PT)", value: "PT" },
  { label: "Arizona (MST - no DST)", value: "AZ" },
  { label: "Alaska (AKT)", value: "AK" },
  { label: "Hawaii (HST)", value: "HI" },
];

const TIME_WINDOWS = [
  "8am–10am",
  "10am–12pm",
  "12pm–2pm",
  "2pm–4pm",
  "4pm–6pm",
  "Anytime during business hours",
];

function normalizePhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 10);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (digits.length <= 3) return a;
  if (digits.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

function RequiredAsterisk() {
  return <span className="text-rose-600 font-semibold">*</span>;
}

const initialForm: FormState = {
  contactName: "",
  companyName: "",
  companyType: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  bestTimeWindow: "",
  timeZone: "ET",
  notes: "",
};

export default function VendorsInquiryPage() {
  const [form, setForm] = useState<FormState>(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { ref: string }>(null);
  const [error, setError] = useState<string>("");

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!form.contactName.trim()) missing.push("Contact Name");
    if (!form.companyName.trim()) missing.push("Company Name");
    if (!form.companyType.trim()) missing.push("Company Type");

    if (!form.address1.trim()) missing.push("Address Line 1");
    if (!form.city.trim()) missing.push("City");
    if (!form.state.trim()) missing.push("State");
    if (!form.zip.trim()) missing.push("Zip Code");

    if (!form.phone.trim()) missing.push("Phone Number");
    if (!form.bestTimeWindow.trim()) missing.push("Best time to contact you");
    if (!form.email.trim()) missing.push("Email");
    return missing;
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit() {
    setError("");
    setSubmitted(null);

    if (requiredMissing.length) {
      setError(
        `Please complete the required fields: ${requiredMissing.join(", ")}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/vendors/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Submit failed (${res.status})`);
      }

      // Real reference returned by the server (and stored in S3)
      setSubmitted({ ref: data.ref });

      // Clear the form after a successful save
      setForm(initialForm);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400";

  const selectClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 text-slate-900";

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Header / branding */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 text-xs font-semibold">
              LOGO
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Notary Portal
              </div>
              <div className="text-sm text-slate-600">
                Vendor service inquiry
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Review process
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Submit your details below and our team will follow up to discuss
              onboarding and next steps.
            </div>
          </div>
        </div>

        {/* Top layout (left-only, full width) */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Vendor inquiry form
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              This request is used to evaluate vendor fit and set up portal
              access for approved customers. Please provide accurate contact
              information so we can reach the correct person quickly.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-900">
                Helpful details to include
              </div>
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Services requested and your preferred coverage area</li>
                <li>Primary contact for orders and escalations</li>
                <li>
                  Billing contact email (if different from the representative)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Contact information
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Required fields are marked with <RequiredAsterisk />.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Submitted. Reference:{" "}
                <span className="font-semibold">{submitted.ref}</span>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contact Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Contact Name <RequiredAsterisk />
              </label>
              <input
                className={inputClass}
                placeholder="First and Last Name"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Company Name <RequiredAsterisk />
              </label>
              <input
                className={inputClass}
                placeholder="Company"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            </div>

            {/* Company Type */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Company Type <RequiredAsterisk />
              </label>
              <select
                className={selectClass}
                value={form.companyType}
                onChange={(e) => update("companyType", e.target.value)}
              >
                <option value="">Company Type</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Phone Number <RequiredAsterisk />
              </label>
              <input
                className={inputClass}
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => update("phone", normalizePhone(e.target.value))}
              />
              <div className="mt-1 text-xs text-slate-500">
                Format: (###) ###-####
              </div>
            </div>

            {/* Best time + timezone */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Best time to contact you <RequiredAsterisk />
              </label>
              <select
                className={selectClass}
                value={form.bestTimeWindow}
                onChange={(e) => update("bestTimeWindow", e.target.value)}
              >
                <option value="">Select best time</option>
                {TIME_WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Time Zone <RequiredAsterisk />
              </label>
              <select
                className={selectClass}
                value={form.timeZone}
                onChange={(e) => update("timeZone", e.target.value)}
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="lg:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Email <RequiredAsterisk />
              </label>
              <input
                type="email"
                className={inputClass}
                placeholder="Email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            {/* Address group */}
            <div className="lg:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Address <RequiredAsterisk />
              </label>

              <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Address Line 1"
                    value={form.address1}
                    onChange={(e) => update("address1", e.target.value)}
                  />
                </div>

                <div className="lg:col-span-2">
                  <input
                    className={inputClass}
                    placeholder="Address Line 2"
                    value={form.address2}
                    onChange={(e) => update("address2", e.target.value)}
                  />
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>

                <div>
                  <select
                    className={selectClass}
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  >
                    <option value="">State</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    className={inputClass}
                    placeholder="Zip code"
                    value={form.zip}
                    onChange={(e) =>
                      update(
                        "zip",
                        e.target.value.replace(/[^\d-]/g, "").slice(0, 10)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="lg:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Additional details (optional)
              </label>
              <textarea
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
                placeholder="Briefly describe your service needs, coverage area, and any onboarding notes (no borrower data)."
                rows={4}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              By submitting, you confirm the information is accurate and does not
              include borrower personal data.
            </div>

            <button
              onClick={onSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit inquiry"}
            </button>
          </div>
        </div>

        <div className="mt-10 text-xs text-slate-500">
          Vendor Inquiry • Notary Portal
        </div>
      </section>
    </main>
  );
}
