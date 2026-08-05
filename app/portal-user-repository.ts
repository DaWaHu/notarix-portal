import { and, eq, gt, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import {
  portalAuthSessions,
  portalRoleAssignments,
  portalUserIdentities,
  portalUsers,
} from "../db/schema";
import {
  ownerSuperAdminEmail,
  type PortalAccountStatus,
  type PortalRole,
} from "./auth-config";

export type PortalUserSessionRecord = {
  displayName: string;
  email: string;
  role: PortalRole;
  sessionId: string;
  status: PortalAccountStatus;
  userId: string;
};

export type CognitoIdentityInput = {
  displayName: string;
  email: string;
  issuer: string;
  provider: string;
  subject: string;
};

export async function upsertCognitoPortalUser(
  identity: CognitoIdentityInput,
): Promise<PortalUserSessionRecord> {
  const db = await getDb();
  const now = new Date();
  const email = identity.email.trim().toLowerCase();
  const ownerEmail = ownerSuperAdminEmail();
  const ownerLocked = email === ownerEmail;

  const existingIdentityRows = await db
    .select({
      identityId: portalUserIdentities.id,
      userDisplayName: portalUsers.displayName,
      userEmail: portalUsers.email,
      userId: portalUsers.id,
      userRole: portalUsers.role,
      userStatus: portalUsers.status,
    })
    .from(portalUserIdentities)
    .innerJoin(portalUsers, eq(portalUserIdentities.userId, portalUsers.id))
    .where(
      and(
        eq(portalUserIdentities.provider, identity.provider),
        eq(portalUserIdentities.providerSubject, identity.subject),
      ),
    )
    .limit(1);
  const existingIdentity = existingIdentityRows[0];

  if (existingIdentity) {
    await db
      .update(portalUserIdentities)
      .set({
        email,
        lastAuthenticatedAtUtc: now,
        updatedAtUtc: now,
      })
      .where(eq(portalUserIdentities.id, existingIdentity.identityId));
    return {
      displayName: existingIdentity.userDisplayName,
      email: existingIdentity.userEmail,
      role: existingIdentity.userRole as PortalRole,
      sessionId: "",
      status: existingIdentity.userStatus as PortalAccountStatus,
      userId: existingIdentity.userId,
    };
  }

  const existingUser = await db.query.portalUsers.findFirst({
    where: eq(portalUsers.email, email),
  });

  const userId = existingUser?.id ?? `usr_${randomUUID()}`;
  const role = existingUser
    ? (existingUser.role as PortalRole)
    : ownerLocked
      ? "SUPER_ADMIN"
      : "OBSERVER";
  const status = existingUser
    ? (existingUser.status as PortalAccountStatus)
    : ownerLocked
      ? "ACTIVE"
      : "INVITED";

  if (!existingUser) {
    await db.insert(portalUsers).values({
      id: userId,
      createdAtUtc: now,
      displayName: identity.displayName,
      email,
      ownerLocked,
      role,
      status,
      updatedAtUtc: now,
    });
    await db.insert(portalRoleAssignments).values({
      id: `role_${randomUUID()}`,
      assignedAtUtc: now,
      assignedBy: ownerLocked ? "system:owner-bootstrap" : "system:cognito-invite",
      revokedAtUtc: null,
      role,
      userId,
    });
  } else if (ownerLocked && existingUser.role !== "SUPER_ADMIN") {
    await db
      .update(portalUsers)
      .set({
        ownerLocked: true,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        updatedAtUtc: now,
      })
      .where(eq(portalUsers.id, existingUser.id));
    await db.insert(portalRoleAssignments).values({
      id: `role_${randomUUID()}`,
      assignedAtUtc: now,
      assignedBy: "system:owner-bootstrap",
      revokedAtUtc: null,
      role: "SUPER_ADMIN",
      userId,
    });
  }

  await db.insert(portalUserIdentities).values({
    id: `idn_${randomUUID()}`,
    createdAtUtc: now,
    email,
    issuer: identity.issuer,
    lastAuthenticatedAtUtc: now,
    provider: identity.provider,
    providerSubject: identity.subject,
    updatedAtUtc: now,
    userId,
  });

  const user = await db.query.portalUsers.findFirst({
    where: eq(portalUsers.id, userId),
  });
  if (!user) throw new Error("Portal user could not be loaded after Cognito sign-in.");

  return {
    displayName: user.displayName,
    email: user.email,
    role: user.role as PortalRole,
    sessionId: "",
    status: user.status as PortalAccountStatus,
    userId: user.id,
  };
}

export async function createPortalAuthSession(input: {
  expiresAtUtc: Date;
  ipAddress: string;
  sessionTokenHash: string;
  userAgent: string;
  userId: string;
}): Promise<string> {
  const db = await getDb();
  const now = new Date();
  const sessionId = `ses_${randomUUID()}`;
  await db.insert(portalAuthSessions).values({
    id: sessionId,
    createdAtUtc: now,
    expiresAtUtc: input.expiresAtUtc,
    ipAddress: input.ipAddress,
    revokedAtUtc: null,
    rotatedAtUtc: now,
    sessionTokenHash: input.sessionTokenHash,
    userAgent: input.userAgent,
    userId: input.userId,
  });
  return sessionId;
}

export async function getPortalSessionByHash(
  sessionTokenHash: string,
): Promise<PortalUserSessionRecord | null> {
  const db = await getDb();
  const sessionRows = await db
    .select({
      displayName: portalUsers.displayName,
      email: portalUsers.email,
      role: portalUsers.role,
      sessionId: portalAuthSessions.id,
      status: portalUsers.status,
      userId: portalUsers.id,
    })
    .from(portalAuthSessions)
    .innerJoin(portalUsers, eq(portalAuthSessions.userId, portalUsers.id))
    .where(
      and(
        eq(portalAuthSessions.sessionTokenHash, sessionTokenHash),
        isNull(portalAuthSessions.revokedAtUtc),
        gt(portalAuthSessions.expiresAtUtc, new Date()),
      ),
    )
    .limit(1);
  const session = sessionRows[0];

  if (!session || session.status !== "ACTIVE") return null;
  return {
    displayName: session.displayName,
    email: session.email,
    role: session.role as PortalRole,
    sessionId: session.sessionId,
    status: session.status as PortalAccountStatus,
    userId: session.userId,
  };
}

export async function revokePortalSession(sessionTokenHash: string) {
  const db = await getDb();
  await db
    .update(portalAuthSessions)
    .set({ revokedAtUtc: new Date() })
    .where(eq(portalAuthSessions.sessionTokenHash, sessionTokenHash));
}
