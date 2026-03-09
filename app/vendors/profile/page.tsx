import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { vendorCode?: string };
};

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "NA";
}

function nice(v: string | null | undefined) {
  const s = String(v || "").trim();
  return s ? s : "—";
}

export default async function VendorProfilePage({ searchParams }: Props) {
  const vendorCode = (searchParams?.vendorCode || "").toUpperCase().trim();

  // If they open the page without a vendor code
  if (!vendorCode) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold">Vendor Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            This page needs a vendor code in the link.
          </p>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
            Example:
            <div className="mt-2 font-mono">
              /vendors/profile?vendorCode=2601AB010
            </div>
          </div>

          <div className="mt-6">
            <Link href="/admin/vendors/new" className="rounded bg-black px-4 py-2 text-sm text-white">
              Go create a vendor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Your Prisma model uses vendorcode (all lowercase in schema)
  const vendor = await prisma.vendor.findUnique({
    where: { vendorcode: vendorCode },
    select: {
      id: true,
      createdAt: true,

      vendorcode: true,
      companyName: true,
      companyLogoUrl: true,

      address1: true,
      address2: true,
      city: true,
      state: true,
      zip: true,

      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,

      secondaryContactName: true,
      secondaryContactEmail: true,
      secondaryContactPhone: true,

    },
  });

  // If code is not found
  if (!vendor) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold">Vendor Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            No vendor was found for this vendor code:
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 p-3 font-mono text-sm">
            {vendorCode}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/admin/vendors/new" className="rounded bg-black px-4 py-2 text-sm text-white">
              Create Vendor
            </Link>
            <Link href="/admin/vendors" className="rounded border px-4 py-2 text-sm">
              View Vendor List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pInit = initials(vendor.primaryContactName);
  const sInit = vendor.secondaryContactName ? initials(vendor.secondaryContactName) : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-xs text-gray-500">Vendor Profile</div>
            <div className="text-lg font-semibold">{vendor.companyName}</div>
            <div className="mt-1 text-xs text-gray-600">
              Code: <span className="font-mono">{vendor.vendorcode}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/vendors/portal?vendorCode=${encodeURIComponent(vendor.vendorcode)}`}
              className="rounded bg-black px-3 py-2 text-sm text-white"
            >
              Go to Portal
            </Link>
            <Link
              href="/admin/vendors/new"
              className="rounded border px-3 py-2 text-sm"
            >
              Create Another Vendor
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-6">
        {/* Company card */}
        <section className="rounded-xl border bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border bg-gray-50">
                {vendor.companyLogoUrl ? (
                  <Image
                    src={vendor.companyLogoUrl}
                    alt="Company logo"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
                    LOGO
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600">Company</div>
                <div className="text-xl font-semibold">{vendor.companyName}</div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="text-xs text-gray-600">Created</div>
              <div className="mt-1 font-medium">
                {new Date(vendor.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold">Address</div>
              <div className="mt-2 text-sm text-gray-700">
                <div>{nice(vendor.address1)}</div>
                {vendor.address2 ? <div>{vendor.address2}</div> : null}
                <div>
                  {nice(vendor.city)}, {nice(vendor.state)} {nice(vendor.zip)}
                </div>
              </div>
              </div>
        </section>

        {/* Contacts */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Primary */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Primary Representative</div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                Main
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                {pInit}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {vendor.primaryContactName}
                </div>
                <div className="truncate text-xs text-gray-600">
                  {vendor.primaryContactEmail}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <div className="text-xs text-gray-600">Phone</div>
                <div className="mt-1 font-medium">
                  {nice(vendor.primaryContactPhone)}
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-gray-600">
                Photo will appear here after the vendor uploads it.
              </div>
            </div>
          </div>

          {/* Secondary */}
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Secondary Representative</div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                Optional
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                {vendor.secondaryContactName ? sInit : "—"}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {vendor.secondaryContactName || "Not provided"}
                </div>
                <div className="truncate text-xs text-gray-600">
                  {vendor.secondaryContactEmail || "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <div className="text-xs text-gray-600">Phone</div>
                <div className="mt-1 font-medium">
                  {nice(vendor.secondaryContactPhone)}
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-gray-600">
                Photo will appear here after the vendor uploads it.
              </div>
            </div>
          </div>
        </section>

        {/* Helpful links */}
        <section className="mt-6 rounded-xl border bg-white p-6">
          <div className="text-sm font-semibold">Quick Links</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/vendors/portal?vendorCode=${encodeURIComponent(vendor.vendorcode)}`}
              className="rounded bg-black px-4 py-2 text-sm text-white"
            >
              Vendor Portal Home
            </Link>
            <Link
              href={`/admin/vendors/new`}
              className="rounded border px-4 py-2 text-sm"
            >
              Admin: Create Vendor
            </Link>
            <Link
              href={`/admin/vendors`}
              className="rounded border px-4 py-2 text-sm"
            >
              Admin: Vendor List
            </Link>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
}
