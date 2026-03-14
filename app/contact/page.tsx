"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  contactType: string;
  requestType: string;
  coverageArea: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  contactType: "",
  requestType: "",
  coverageArea: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const messagePlaceholder = useMemo(() => {
    switch (form.requestType) {
      case "Request Platform Access":
        return "Tell us about your organization, who will use NOTARIX™, and what type of platform access you are requesting.";
      case "Request Vendor Approval":
        return "Tell us about your notary or vendor experience, service area, and how you would like to work with NOTARIX™.";
      case "Request Demo":
        return "Tell us about your company, your current workflow, and what you would like to see in a NOTARIX™ demo.";
      case "Support Request":
        return "Describe the issue, what page or workflow you were using, and any details that will help us assist you.";
      case "Partnership Inquiry":
        return "Tell us about your company, your services, and what type of partnership you would like to discuss.";
      case "Integration / Technical Inquiry":
        return "Describe the systems you use today and the type of integration or technical discussion you want to have.";
      default:
        return "Tell us how you would like to use NOTARIX™, what type of access you need, or any relevant details for your request.";
    }
  }, [form.requestType]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (!form.name || !form.email || !form.contactType || !form.requestType) {
      setResult({
        ok: false,
        message:
          "Please complete Name, Email, Contact Type, and Request Type before submitting.",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          ok: false,
          message: data?.error || "Something went wrong. Please try again.",
        });
        setLoading(false);
        return;
      }

      setResult({
        ok: true,
        message:
          "Your request has been submitted successfully. Our team will review it and follow up with you.",
      });

      setForm(INITIAL_FORM);
    } catch {
      setResult({
        ok: false,
        message: "Unable to submit your request right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 px-8 py-8 text-white shadow-xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-2xl bg-white/10 p-2 shadow-md backdrop-blur-sm">
              <Image
                src="/notarix-logo.png"
                alt="NOTARIX logo"
                width={56}
                height={56}
                priority
                className="rounded-xl"
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                NOTARIX™
              </p>
              <h1 className="mt-1 text-4xl font-bold">Contact Us</h1>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-base text-blue-100">
            Connect with the NOTARIX™ team for demos, vendor onboarding, platform
            access, support, or partnership inquiries.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <input
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Contact Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="contactType"
                  value={form.contactType}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select one</option>
                  <option value="Title Company">Title Company</option>
                  <option value="Signing Service">Signing Service</option>
                  <option value="Notary Signing Agent">Notary Signing Agent</option>
                  <option value="Attorney / Law Firm">Attorney / Law Firm</option>
                  <option value="Lender / Mortgage Company">
                    Lender / Mortgage Company
                  </option>
                  <option value="Real Estate Professional">
                    Real Estate Professional
                  </option>
                  <option value="Vendor / Service Provider">
                    Vendor / Service Provider
                  </option>
                  <option value="Technology / Integration Partner">
                    Technology / Integration Partner
                  </option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="requestType"
                  value={form.requestType}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select one</option>
                  <option value="Request Platform Access">
                    Request Platform Access
                  </option>
                  <option value="Request Vendor Approval">
                    Request Vendor Approval
                  </option>
                  <option value="Request Demo">Request Demo</option>
                  <option value="Support Request">Support Request</option>
                  <option value="Partnership Inquiry">Partnership Inquiry</option>
                  <option value="Billing / Accounting">Billing / Accounting</option>
                  <option value="Integration / Technical Inquiry">
                    Integration / Technical Inquiry
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                State / Coverage Area
              </label>
              <input
                name="coverageArea"
                type="text"
                value={form.coverageArea}
                onChange={handleChange}
                placeholder="Example: North Carolina, South Carolina, Nationwide"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder={messagePlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {result ? (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  result.ok
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {result.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Submitting Request..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}