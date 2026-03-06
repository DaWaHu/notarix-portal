import Link from "next/link";

export default function TopBar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Notarix
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/vendors"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Vendors
          </Link>
          <Link
            href="/documents"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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