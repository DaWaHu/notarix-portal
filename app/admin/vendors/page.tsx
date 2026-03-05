import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      vendorcode: true,
      companyName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      createdAt: true,
    },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="mt-1 text-sm text-gray-600">
            This is the list of vendor profiles saved in the system.
          </p>
        </div>

        <a
          href="/admin/vendors/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          + Create Vendor
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-700">
              <th className="px-4 py-3">Vendor Code</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Primary Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={5}>
                  No vendors found yet. Click “Create Vendor” to add one.
                </td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3 font-mono">{v.vendorcode}</td>
                  <td className="px-4 py-3">{v.companyName}</td>
                  <td className="px-4 py-3">{v.primaryContactName}</td>
                  <td className="px-4 py-3">{v.primaryContactEmail}</td>
                  <td className="px-4 py-3">
                    {new Date(v.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
