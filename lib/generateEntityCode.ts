import { prisma } from "@/lib/prisma";

type EntityRole = "CLIENT" | "NOTARY";

function getYearPrefix(date = new Date()) {
  return String(date.getFullYear()).slice(-2);
}

function normalizeState(state: string) {
  const value = String(state || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(value)) {
    throw new Error("State must be a 2-letter code.");
  }
  return value;
}

function getRolePrefix(role: EntityRole) {
  return role === "CLIENT" ? "C" : "N";
}

function getStartingSequence() {
  return 1000;
}

export async function generateEntityCode(args: {
  role: EntityRole;
  state: string;
  date?: Date;
}) {
  const role = args.role;
  const state = normalizeState(args.state);
  const date = args.date ?? new Date();

  const prefix = getRolePrefix(role);
  const year = getYearPrefix(date);
  const codePrefix = `${prefix}${year}`;

  if (role === "CLIENT") {
    const existingClients = await prisma.vendor.findMany({
      where: {
        vendorcode: {
          startsWith: codePrefix,
        },
      },
      select: {
        vendorcode: true,
      },
    });

    let maxSequence = getStartingSequence() - 1;

    for (const client of existingClients) {
      const code = String(client.vendorcode || "").trim().toUpperCase();

      if (!code.startsWith(codePrefix) || code.length < 7) continue;

      const numericPart = code.slice(3, 7);
      const sequence = Number(numericPart);

      if (!Number.isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }

    const nextSequence = String(maxSequence + 1).padStart(4, "0");
    return `${codePrefix}${nextSequence}${state}`;
  }

  const existingNotaries = await prisma.notaryProfile.findMany({
    where: {
      notaryCode: {
        startsWith: codePrefix,
      },
    },
    select: {
      notaryCode: true,
    },
  });

  let maxSequence = getStartingSequence() - 1;

  for (const notary of existingNotaries) {
    const code = String(notary.notaryCode || "").trim().toUpperCase();

    if (!code.startsWith(codePrefix) || code.length < 7) continue;

    const numericPart = code.slice(3, 7);
    const sequence = Number(numericPart);

    if (!Number.isNaN(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  const nextSequence = String(maxSequence + 1).padStart(4, "0");
  return `${codePrefix}${nextSequence}${state}`;
}