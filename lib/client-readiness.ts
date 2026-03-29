export type ClientDocumentLike = {
  fileName: string;
  notes?: string | null;
};

export type ClientVendorLike = {
  approvalStatus: string;
  companyName?: string | null;
  companyType?: string | null;
  companyLogoUrl?: string | null;
  website?: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  primaryPhone?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  primaryContactPhone?: string | null;
  secondaryContactName?: string | null;
  secondaryContactEmail?: string | null;
  secondaryContactPhone?: string | null;
  documents?: ClientDocumentLike[];
};

export function getProfileChecks(vendor: ClientVendorLike) {
  return [
    { label: "Company Name", complete: !!vendor.companyName },
    { label: "Company Type", complete: !!vendor.companyType },
    { label: "Company Logo", complete: !!vendor.companyLogoUrl },
    { label: "Website", complete: !!vendor.website },
    { label: "Address Line 1", complete: !!vendor.address1 },
    { label: "City", complete: !!vendor.city },
    { label: "State", complete: !!vendor.state },
    { label: "ZIP", complete: !!vendor.zip },
    { label: "Main Office Phone", complete: !!vendor.primaryPhone },
    { label: "Primary Contact Name", complete: !!vendor.primaryContactName },
    { label: "Primary Contact Email", complete: !!vendor.primaryContactEmail },
    { label: "Primary Contact Phone", complete: !!vendor.primaryContactPhone },
    { label: "Secondary Contact Name", complete: !!vendor.secondaryContactName },
    { label: "Secondary Contact Email", complete: !!vendor.secondaryContactEmail },
    { label: "Secondary Contact Phone", complete: !!vendor.secondaryContactPhone },
  ];
}

export function getCompletionStats(vendor: ClientVendorLike) {
  const checks = getProfileChecks(vendor);
  const completed = checks.filter((c) => c.complete).length;
  const total = checks.length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent, checks };
}

export function classifyClientDocument(
  fileName: string,
  notes?: string | null
) {
  const haystack = `${fileName} ${notes || ""}`.toLowerCase();

  if (haystack.includes("w-9") || haystack.includes("w9")) return "W-9";

  if (
    haystack.includes("e&o") ||
    haystack.includes("eo insurance") ||
    haystack.includes("errors and omissions")
  ) {
    return "E&O Certificate";
  }

  if (
    haystack.includes("agreement") ||
    haystack.includes("msa") ||
    haystack.includes("service agreement")
  ) {
    return "Service Agreement";
  }

  if (haystack.includes("license")) return "Business License or Registration";
  if (haystack.includes("billing")) return "Billing Setup Form";

  if (haystack.includes("portal") || haystack.includes("access")) {
    return "Portal Access Authorization";
  }

  if (
    haystack.includes("contact sheet") ||
    haystack.includes("contact confirmation") ||
    haystack.includes("contact form")
  ) {
    return "Primary & Secondary Contact Confirmation";
  }

  return "General Supporting Document";
}

export function getRequiredClientDocuments() {
  return [
    "Service Agreement",
    "Billing Setup Form",
    "Primary & Secondary Contact Confirmation",
    "W-9",
    "Business License or Registration",
    "E&O Certificate",
    "Portal Access Authorization",
  ];
}

export function getReadinessState(args: {
  approvalStatus: string;
  profilePercent: number;
  requiredDocsReceived: number;
  requiredDocsTotal: number;
  primaryContactEmail?: string | null;
}) {
  const allDocs = args.requiredDocsReceived >= args.requiredDocsTotal;
  const profileReady = args.profilePercent >= 85 && !!args.primaryContactEmail;

  if (String(args.approvalStatus).toUpperCase() === "APPROVED") {
    return {
      label: "Approved",
      tone: {
        border: "1px solid #A7F3D0",
        background: "#ECFDF5",
        color: "#047857",
      },
      description:
        "All required documentation is on file and the client has been fully approved.",
    };
  }

  if (allDocs && profileReady) {
    return {
      label: "Ready for Final Review",
      tone: {
        border: "1px solid #BFDBFE",
        background: "#EFF6FF",
        color: "#1D4ED8",
      },
      description:
        "Required profile fields and required documents appear complete. Admin final review is the next step.",
    };
  }

  if (args.requiredDocsReceived > 0 || args.profilePercent > 40) {
    return {
      label: "Pending Documents",
      tone: {
        border: "1px solid #FCD34D",
        background: "#FFFBEB",
        color: "#B45309",
      },
      description:
        "The client profile has started, but required documents and/or required profile information are still missing.",
    };
  }

  return {
    label: "Draft",
    tone: {
      border: "1px solid #CBD5E1",
      background: "#F8FAFC",
      color: "#475569",
    },
    description:
      "Client draft created. Profile and required documentation are still incomplete.",
  };
}

export function getClientReadiness(vendor: ClientVendorLike) {
  const completion = getCompletionStats(vendor);
  const requiredDocs = getRequiredClientDocuments();

  const uploadedLabels = (vendor.documents || []).map((doc) =>
    classifyClientDocument(doc.fileName, doc.notes)
  );

  const requiredDocsReceived = requiredDocs.filter((required) =>
    uploadedLabels.some((uploaded) => uploaded === required)
  ).length;

  const missingProfileFields = completion.checks
    .filter((check) => !check.complete)
    .map((check) => check.label);

  const missingRequiredDocs = requiredDocs.filter(
  (required) => !uploadedLabels.some((uploaded) => uploaded === required)
);

  const readiness = getReadinessState({
    approvalStatus: vendor.approvalStatus,
    profilePercent: completion.percent,
    requiredDocsReceived,
    requiredDocsTotal: requiredDocs.length,
    primaryContactEmail: vendor.primaryContactEmail,
  });

  const isReadyForFinalReview =
    readiness.label === "Ready for Final Review";

  return {
    completion,
    requiredDocs,
    uploadedLabels,
    requiredDocsReceived,
    requiredDocsTotal: requiredDocs.length,
    missingProfileFields,
    missingRequiredDocs,
    isReadyForFinalReview,
    readiness,
  };
}