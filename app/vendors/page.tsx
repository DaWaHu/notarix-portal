import Link from "next/link";

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 px-8 py-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            Notarix
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Vendor Access Portal
          </h1>

          <p className="mt-3 max-w-2xl text-base text-blue-100">
            The NOTARIX™ vendor portal allows approved signing professionals,
            notaries, and partner vendors to access assignments, documents,
            and communication tools.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Approved Vendor Login */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">
              Approved Vendor Login
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Vendors who have already been approved and issued portal access
              credentials may log in here to manage assignments and documents.
            </p>

            <Link
              href="/vendors/demo/orders"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Access Vendor Portal
            </Link>
          </div>

          {/* Request Approval */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900">
              Request Vendor Approval
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              If you are a notary signing agent, vendor, or service provider
              interested in working with NOTARIX™, submit an approval request.
              Our team will review your information before granting platform access.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-block rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Request Approval
            </Link>
          </div>

        </div>

        {/* Info Section */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow">
          <h3 className="text-lg font-semibold text-slate-900">
            Vendor Network
          </h3>

          <p className="mt-3 text-sm text-slate-600 max-w-2xl">
            NOTARIX™ works with professional notaries, signing services,
            and vendor partners across multiple jurisdictions. Access to the
            platform is provided only to verified vendors who meet our
            operational and compliance requirements.
          </p>
        </div>

      </div>
    </div>
  );
}