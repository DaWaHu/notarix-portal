import { redirect } from "next/navigation";

export default function VendorPageRedirect({
  params,
}: {
  params: { vendorCode: string };
}) {
  redirect(`/vendors/${params.vendorCode}/orders`);
}
