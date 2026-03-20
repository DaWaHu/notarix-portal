export default function VendorOrdersPage({
  params,
}: {
  params: { vendorCode: string };
}) {
  return <div>{params.vendorCode}</div>;
}