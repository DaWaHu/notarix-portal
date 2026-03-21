import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ status?: string }>;
};

const STATUS_OPTIONS = ["ALL", "NEW", "REVIEW", "APPROVED", "ARCHIVED"] as const;

function normalizeStatus(value?: string) {
  const upper = String(value || "ALL").toUpperCase();
  return STATUS_OPTIONS.includes(upper as (typeof STATUS_OPTIONS)[number])
    ? upper
    : "ALL";
}

function badgeClasses(status: string) {
  switch (status.toUpperCase()) {
    case "NEW":
      return "bg-blue-100 text-blue-700";
    case "REVIEW":
      return "bg-amber-100 text-amber-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "ARCHIVED":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatPhone(phone?: string | null) {
  if (!phone) return "—";
  const cleaned = String(phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export default async function AdminIntakePage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const selectedStatus = normalizeStatus(params.status);

  const submissions = await prisma.intakeSubmission.findMany({
  where:
    selectedStatus === "ALL"
      ? {}
      : {
          status: selectedStatus as
            | "NEW"
            | "REVIEWING"
            | "APPROVED"
            | "REJECTED"
            | "CLOSED",
        },
  orderBy: {
    createdAt: "desc",
  },
});

  const counts = await prisma.intakeSubmission.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const countMap = counts.reduce<Record<string, number>>((acc, row) => {
    acc[row.status.toUpperCase()] = row._count.status;
    return acc;
  }, {});

  const totalCount =
    selectedStatus === "ALL"
      ? Object.values(countMap).reduce((sum, n) => sum + n, 0)
      : submissions.length;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 px-8 py-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
            NOTARIX™
          </p>

          <h1 className="mt-2 text-4xl font-bold">Admin Intake</h1>

          <p className="mt-3 max-w-3xl text-base text-blue-100">
            Review incoming contact requests, vendor approval submissions, demo
            inquiries, and platform access requests.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Intake Filters
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Quickly sort incoming inquiries by workflow status.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Showing {totalCount} submission{totalCount === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((status) => {
              const isActive = selectedStatus === status;
              const count =
                status === "ALL"
                  ? Object.values(countMap).reduce((sum, n) => sum + n, 0)
                  : countMap[status] || 0;

              return (
                <Link
                  key={status}
                  href={status === "ALL" ? "/admin/intake" : `/admin/intake?status=${status}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {status} ({count})
                </Link>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Intake Submissions
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-600">
              No intake submissions found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Created</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Details</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((item) => {
                    const details =
                      item.details && typeof item.details === "object"
                        ? (item.details as Record<string, unknown>)
                        : {};

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-200 align-top"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {item.fullName}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {item.phone ? (
                            <a
                              href={`tel:${item.phone}`}
                              className="font-medium text-blue-700 hover:underline"
                            >
                              {formatPhone(item.phone)}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {item.email ? (
                            <a
                              href={`mailto:${item.email}`}
                              className="font-medium text-blue-700 hover:underline"
                            >
                              {item.email}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {item.role}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          <div className="space-y-1">
                            {"company" in details && details.company ? (
                              <div>
                                <span className="font-semibold">Company:</span>{" "}
                                {String(details.company)}
                              </div>
                            ) : null}

                            {"contactType" in details && details.contactType ? (
                              <div>
                                <span className="font-semibold">Contact Type:</span>{" "}
                                {String(details.contactType)}
                              </div>
                            ) : null}

                            {"requestType" in details && details.requestType ? (
                              <div>
                                <span className="font-semibold">Request Type:</span>{" "}
                                {String(details.requestType)}
                              </div>
                            ) : null}

                            {"coverageArea" in details && details.coverageArea ? (
                              <div>
                                <span className="font-semibold">Coverage:</span>{" "}
                                {String(details.coverageArea)}
                              </div>
                            ) : null}

                            {item.message ? (
                              <div className="pt-2 text-slate-600">
                                <span className="font-semibold text-slate-800">
                                  Message:
                                </span>{" "}
                                {item.message}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex min-w-[180px] flex-col gap-2">
                            <a
                              href={`mailto:${item.email}`}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              Email
                            </a>

                            <a
                              href={item.phone ? `tel:${item.phone}` : "#"}
                              className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${
                                item.phone
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "cursor-not-allowed bg-slate-200 text-slate-500"
                              }`}
                            >
                              Call
                            </a>

                            <button
                              type="button"
                              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              Review
                            </button>

                            <button
                              type="button"
                              className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-700 hover:bg-green-100"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}