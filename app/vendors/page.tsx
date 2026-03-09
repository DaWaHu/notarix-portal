import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-[0.2em] text-white/70 uppercase">
            Notarix Live
          </div>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Modern notary workflows, vendor management, and document handling in one place.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Notarix helps organize vendor onboarding, intake, profile management,
            and document processes with a clean operational portal.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/admin/vendors/create"
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Create Vendor
            </Link>

            <Link
              href="/documents"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View Documents
            </Link>

            <Link
              href="/vendors/profile"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Vendor Profile
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Vendor Management</div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Create vendor records, manage profile information, and keep contact
              details organized in one place.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Document Workflows</div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Centralize intake, uploads, downloads, and document access for your
              operating workflow.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Operational Portal</div>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Keep your process structured with a simple interface built for real
              day-to-day execution.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}