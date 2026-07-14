export type EvidenceRecord = {
  id: string;
  title: string;
  fileName: string;
  fileType: "PDF" | "JSON" | "HTML" | "CSV" | "URL";
  source: "Profile Verification" | "Order Document" | "Provider Result";
  requestId?: string;
  orderId?: string;
  section: string;
  category: string;
  custody: string;
  scanStatus: string;
  accessLevel: string;
  received: string;
  size: string;
  sha256: string;
  storageStatus: string;
  retentionRule: string;
  lastAccessed: string;
  auditEvents: string[];
  previewFields: Array<[string, string]>;
};

export const evidenceRecords: EvidenceRecord[] = [
  {
    id: "EV-IDENTITY-DOCUMENT-ANALYSIS",
    title: "Document analysis report",
    fileName: "identity-document-analysis-report.pdf",
    fileType: "PDF",
    source: "Provider Result",
    requestId: "NSR-1001",
    section: "Identity",
    category: "Identity proofing",
    custody: "Provider result stored",
    scanStatus: "Malware scan complete",
    accessLevel: "Restricted staff review",
    received: "Jul 10 2026 at 10:32 AM ET",
    size: "842 KB",
    sha256: "b7f25d9a7c0f4e2aa0b4d1a0c7a99d0e66f4f2c5a129cc5f0e4d7b6d94f1a2c8",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain with profile verification record and restricted audit report",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin001",
    auditEvents: [
      "Jul 10 2026 at 10:32 AM ET - Provider result received.",
      "Jul 10 2026 at 10:34 AM ET - Evidence packet linked to Identity review.",
      "Jul 18 2026 at 5:00 PM ET - Viewer access logged for staff review.",
    ],
    previewFields: [
      ["Provider result", "Document analysis completed"],
      ["Name match", "Requires staff confirmation"],
      ["Document expiration", "Requires staff confirmation"],
      ["Liveness dependency", "camera-based-liveness-result.json"],
    ],
  },
  {
    id: "EV-LIVENESS-RESULT",
    title: "Selfie and liveness result",
    fileName: "camera-based-liveness-result.json",
    fileType: "JSON",
    source: "Provider Result",
    requestId: "NSR-1001",
    section: "Identity",
    category: "Liveness capture",
    custody: "Restricted staff view",
    scanStatus: "Provider integrity check recorded",
    accessLevel: "Restricted staff review",
    received: "Jul 10 2026 at 10:33 AM ET",
    size: "94 KB",
    sha256: "9a2f65dd0c2c4c379e25cc92736f50f4bbfd5fb9c85a7bbef873d2f4fb5f1e31",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain with identity proofing evidence and access audit log",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin001",
    auditEvents: [
      "Jul 10 2026 at 10:33 AM ET - Camera-based liveness result received.",
      "Jul 18 2026 at 5:00 PM ET - Restricted identity evidence accessed.",
    ],
    previewFields: [
      ["Result type", "Camera-based selfie and liveness check"],
      ["Provider status", "Restricted"],
      ["Staff action", "Confirm provider result before activation"],
    ],
  },
  {
    id: "EV-NNA-CERTIFICATE",
    title: "NNA certification",
    fileName: "nna-signing-agent-certificate.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1001",
    section: "NNA",
    category: "NNA certification",
    custody: "Staff-view evidence",
    scanStatus: "Malware scan complete",
    accessLevel: "General Admin review",
    received: "Jul 10 2026 at 11:36 AM ET",
    size: "516 KB",
    sha256: "f481bc6139f8455aa7e9aa66f7899576db363ab6c884bc4f5b3b57542f418907",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain while profile is active and through credential audit period",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin002",
    auditEvents: [
      "Jul 10 2026 at 11:36 AM ET - NNA certificate attached.",
      "Jul 18 2026 at 5:00 PM ET - Certificate opened for staff verification.",
    ],
    previewFields: [
      ["Certificate status", "Awaiting staff verification"],
      ["Profile link", "nna-profile-verification-link.url"],
      ["Expiration", "Requires staff confirmation"],
    ],
  },
  {
    id: "EV-NOTARY-COMMISSION-CERTIFICATE",
    title: "Notary commission certificate",
    fileName: "notary-commission-certificate.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1001",
    section: "Commission",
    category: "Notary commission",
    custody: "Staff-view evidence",
    scanStatus: "Malware scan complete",
    accessLevel: "General Admin review",
    received: "Jul 10 2026 at 10:50 AM ET",
    size: "488 KB",
    sha256: "1c245d5c5f5d41deab026b191d7cf9ab356f4f1d48f07a1d8f9966a8131de125",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain while commission is active and through credential audit period",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin002",
    auditEvents: [
      "Jul 10 2026 at 10:50 AM ET - Commission certificate attached.",
      "Jul 18 2026 at 5:00 PM ET - Commission certificate opened for expiration monitoring.",
    ],
    previewFields: [
      ["Commission state", "NC"],
      ["Expiration", "Dec 31 2026"],
      ["Renewal dependency", "Replacement commission certificate required before expiration"],
    ],
  },
  {
    id: "EV-EO-INSURANCE-DECLARATION",
    title: "E&O insurance declaration",
    fileName: "eo-insurance-declaration-page.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1001",
    section: "E&O Insurance",
    category: "Insurance",
    custody: "Staff-view evidence",
    scanStatus: "Malware scan complete",
    accessLevel: "General Admin review",
    received: "Jul 10 2026 at 11:04 AM ET",
    size: "392 KB",
    sha256: "cc485eed305d4ba895b9971e3d5e2c309d272e4c5a7891339b35660ddb23a459",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain while profile is active and through insurance audit period",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin003",
    auditEvents: [
      "Jul 10 2026 at 11:04 AM ET - E&O declaration page attached.",
      "Jul 18 2026 at 5:00 PM ET - Insurance evidence opened for renewal monitoring.",
    ],
    previewFields: [
      ["Coverage status", "Active"],
      ["Expiration", "Nov 30 2026"],
      ["Assignment impact", "Loan signing assignment eligibility restricted if expired"],
    ],
  },
  {
    id: "EV-RON-DIGITAL-CERTIFICATE",
    title: "RON digital certificate",
    fileName: "ron-digital-certificate-record.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1003",
    section: "RON",
    category: "Digital certificate",
    custody: "Restricted RON evidence",
    scanStatus: "Malware scan complete",
    accessLevel: "Administrator or Super Admin review",
    received: "Jul 10 2026 at 11:48 AM ET",
    size: "304 KB",
    sha256: "28d40ec1f3054cc19af0d0fa375a642a530c579cc4d9c4d44d00a8d063ce8c84",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain with RON authorization and digital certificate audit",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin005",
    auditEvents: [
      "Jul 10 2026 at 11:48 AM ET - RON digital certificate record attached.",
      "Jul 18 2026 at 5:00 PM ET - RON credential opened for elevated renewal review.",
    ],
    previewFields: [
      ["RON status", "Elevated review"],
      ["Expiration", "Oct 15 2026"],
      ["Service restriction", "RON remains disabled until renewed evidence is verified"],
    ],
  },
  {
    id: "EV-W9-FORM",
    title: "Completed W-9 form",
    fileName: "completed-w-9-form.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1001",
    section: "Tax",
    category: "Tax onboarding",
    custody: "Restricted tax record",
    scanStatus: "Malware scan complete",
    accessLevel: "Restricted financial review",
    received: "Jul 10 2026 at 11:55 AM ET",
    size: "224 KB",
    sha256: "8ef7dfb05e9341e9801e4e057a0fa36657b8c0613412d9ef2a705cf8b98e3721",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain under tax onboarding and payable control policy",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by GenAdmin004",
    auditEvents: [
      "Jul 10 2026 at 11:55 AM ET - W-9 evidence received.",
      "Jul 18 2026 at 5:00 PM ET - Restricted tax evidence opened for review.",
    ],
    previewFields: [
      ["Tax record", "Completed W-9 or approved onboarding equivalent"],
      ["Payable dependency", "Administrator or Super Admin approval required"],
      ["Financial access", "Restricted"],
    ],
  },
  {
    id: "EV-CLIENT-BILLING-AUTH",
    title: "Billing authorization",
    fileName: "client-billing-authorization.pdf",
    fileType: "PDF",
    source: "Profile Verification",
    requestId: "NSR-1002",
    section: "Billing",
    category: "Billing authorization",
    custody: "Restricted financial record",
    scanStatus: "Malware scan complete",
    accessLevel: "Administrator or Super Admin review",
    received: "Jul 10 2026 at 12:35 PM ET",
    size: "332 KB",
    sha256: "ad07c19fbf35460c9b69fb0fd3389d2df01ed03541fc84f5027e0c5977a36b28",
    storageStatus: "Encrypted evidence object pending production storage binding",
    retentionRule: "Retain with client billing authorization and approval audit",
    lastAccessed: "Jul 18 2026 at 5:00 PM ET by Admin",
    auditEvents: [
      "Jul 10 2026 at 12:35 PM ET - Billing authorization uploaded.",
      "Jul 18 2026 at 5:00 PM ET - Elevated financial evidence access logged.",
    ],
    previewFields: [
      ["Billing authority", "Restricted pending elevated approval"],
      ["Invoice terms", "Requires staff confirmation"],
      ["Payment method", "Requires financial control review"],
    ],
  },
  {
    id: "DOC-2607-0001",
    title: "Seller closing package",
    fileName: "seller-closing-package.pdf",
    fileType: "PDF",
    source: "Order Document",
    orderId: "ORD-2607-0001",
    section: "Order Documents",
    category: "Closing package",
    custody: "Client uploaded",
    scanStatus: "Malware scan complete",
    accessLevel: "Client, assigned notary, staff",
    received: "Jul 18 2026 at 4:15 PM ET",
    size: "3.8 MB",
    sha256: "3d0977591a7a43bb94db7d3c6014ea61591e1f08474d9c774adeac26bf6d1b62",
    storageStatus: "Encrypted order document object pending production storage binding",
    retentionRule: "Retain with order file according to document retention policy",
    lastAccessed: "Jul 18 2026 at 4:20 PM ET by Avery Coleman",
    auditEvents: [
      "Jul 18 2026 at 4:15 PM ET - Client uploaded order document.",
      "Jul 18 2026 at 4:16 PM ET - Malware scan completed.",
      "Jul 18 2026 at 4:20 PM ET - Document opened from order case file.",
    ],
    previewFields: [
      ["Order", "ORD-2607-0001"],
      ["Client", "Coleman Title Group"],
      ["Service", "Loan signing appointment"],
      ["Assignment", "Pending staff confirmation"],
    ],
  },
  {
    id: "DOC-2607-0002",
    title: "Borrower identification copy",
    fileName: "borrower-identification-copy.pdf",
    fileType: "PDF",
    source: "Order Document",
    orderId: "ORD-2607-0001",
    section: "Order Documents",
    category: "Restricted identity document",
    custody: "Restricted identity document",
    scanStatus: "Restricted staff view",
    accessLevel: "Staff and assigned notary only",
    received: "Jul 18 2026 at 4:18 PM ET",
    size: "612 KB",
    sha256: "c91e0d72d88e4111bca17abf6f565c982ce507b2b7be8737f92743c60d40a612",
    storageStatus: "Encrypted restricted order document pending production storage binding",
    retentionRule: "Retain with order file under restricted identity access policy",
    lastAccessed: "Jul 18 2026 at 4:22 PM ET by GenAdmin001",
    auditEvents: [
      "Jul 18 2026 at 4:18 PM ET - Restricted identity document uploaded.",
      "Jul 18 2026 at 4:18 PM ET - Access classification set to restricted.",
      "Jul 18 2026 at 4:22 PM ET - Restricted document opened for review.",
    ],
    previewFields: [
      ["Order", "ORD-2607-0001"],
      ["Restriction", "Identity document"],
      ["Access", "Staff and assigned notary only"],
    ],
  },
];

export function findEvidenceRecord(evidenceId: string): EvidenceRecord | undefined {
  return evidenceRecords.find(
    (record) =>
      record.id.toLowerCase() === evidenceId.toLowerCase() ||
      evidenceIdFromFileName(record.fileName).toLowerCase() ===
        evidenceId.toLowerCase(),
  );
}

export function evidenceForOrder(orderId: string): EvidenceRecord[] {
  return evidenceRecords.filter(
    (record) => record.orderId?.toLowerCase() === orderId.toLowerCase(),
  );
}

export function evidenceForRequest(requestId: string): EvidenceRecord[] {
  return evidenceRecords.filter(
    (record) => record.requestId?.toLowerCase() === requestId.toLowerCase(),
  );
}

export function evidenceIdFromFileName(fileName: string): string {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return baseName
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}
