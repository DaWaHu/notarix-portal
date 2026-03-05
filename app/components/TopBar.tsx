import Link from "next/link";

export default function TopBar() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <TopBar />
    <section className="mx-auto max-w-6xl px-6 py-10">
      ...
    </section>
  </main>
);     
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white font-extrabold">
            NP
          </div>
          <div>
            <div className="text-lg font-extrabold text-slate-900">Notary Portal</div>
            <div className="text-sm text-slate-500">Document management</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/documents"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Documents
          </Link>
          <Link
            href="#"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            New Packet
          </Link>
        </nav>
      </div>
    </header>
  );
}
