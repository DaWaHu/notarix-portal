import Link from "next/link";

export default function VendorHomePage({
  params,
}: {
  params: { vendorCode: string };
}) {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Vendor Portal: {params.vendorCode}
      </h1>

      <p style={{ marginTop: 12 }}>
        Go to the Notary Orders dashboard template.
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href={`/vendors/${params.vendorCode}/orders`}>
          Open Notary Orders →
        </Link>
      </div>
    </main>
  );
}