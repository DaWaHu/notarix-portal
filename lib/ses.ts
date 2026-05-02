import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const region =
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  "us-east-1";

const fromEmail =
  process.env.SES_FROM_EMAIL ||
  process.env.EMAIL_FROM ||
  process.env.AWS_SES_FROM_EMAIL;

if (!fromEmail) {
  throw new Error(
    "Missing SES sender configuration. Set SES_FROM_EMAIL, EMAIL_FROM, or AWS_SES_FROM_EMAIL."
  );
}

const ses = new SESv2Client({ region });

function assertRequiredString(value: string, fieldName: string) {
  if (!value || !value.trim()) {
    throw new Error(`Missing required email field: ${fieldName}`);
  }
}

export async function sendVendorOnboardingEmail(args: {
  to: string;
  vendorCode: string;
  profileUrl: string;
}): Promise<void> {
  assertRequiredString(args.to, "to");
  assertRequiredString(args.vendorCode, "vendorCode");
  assertRequiredString(args.profileUrl, "profileUrl");

  const html = `
    <p>Hello,</p>
    <p>You have been added to the <strong>Notarix™</strong> system as a client.</p>
    <p>Your client code is <strong>${args.vendorCode}</strong>.</p>
    <p>Please use the link below to set up your account and access your client portal.</p>
    <p>
      <a href="${args.profileUrl}" style="
        display:inline-block;
        padding:12px 18px;
        background:#1D4ED8;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:700;
      ">Set Up Your Account</a>
    </p>
    <p>If you need assistance, please reply to this email.</p>
    <p>Thank you,<br/>Notarix™<br/>Professional Signing Coordination Platform</p>
  `;

  const text = [
    "Hello,",
    "",
    "You have been added to the Notarix™ system as a client.",
    `Your client code is ${args.vendorCode}.`,
    "Please use the link below to set up your account and access your client portal.",
    "",
    `Set up your account: ${args.profileUrl}`,
    "",
    "If you need assistance, please reply to this email.",
    "",
    "Thank you,",
    "Notarix™",
    "Professional Signing Coordination Platform",
  ].join("\n");

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: {
          ToAddresses: [args.to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: "Welcome to Notarix™ — Set Up Your Account",
            },
            Body: {
              Text: { Data: text },
              Html: { Data: html },
            },
          },
        },
      })
    );

    console.log("[SES] Vendor onboarding email sent", {
      to: args.to,
      vendorCode: args.vendorCode,
    });
  } catch (error) {
    console.error("[SES] Failed to send vendor onboarding email", {
      to: args.to,
      vendorCode: args.vendorCode,
      error,
    });
    throw error;
  }
}

export async function sendNotaryOnboardingEmail(args: {
  to: string;
  notaryCode: string;
  profileUrl: string;
}): Promise<void> {
  assertRequiredString(args.to, "to");
  assertRequiredString(args.notaryCode, "notaryCode");
  assertRequiredString(args.profileUrl, "profileUrl");

  const html = `
    <p>Hello,</p>
    <p>You have been added to the <strong>Notarix™</strong> system as a notary.</p>
    <p>Your notary code is <strong>${args.notaryCode}</strong>.</p>
    <p>Please use the link below to set up your account and access the Notarix™ notary portal.</p>
    <p>
      <a href="${args.profileUrl}" style="
        display:inline-block;
        padding:12px 18px;
        background:#1D4ED8;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:700;
      ">Set Up Your Account</a>
    </p>
    <p>If you need assistance, please reply to this email.</p>
    <p>Thank you,<br/>Notarix™<br/>Professional Signing Coordination Platform</p>
  `;

  const text = [
    "Hello,",
    "",
    "You have been added to the Notarix™ system as a notary.",
    `Your notary code is ${args.notaryCode}.`,
    "Please use the link below to set up your account and access the Notarix™ notary portal.",
    "",
    `Set up your account: ${args.profileUrl}`,
    "",
    "If you need assistance, please reply to this email.",
    "",
    "Thank you,",
    "Notarix™",
    "Professional Signing Coordination Platform",
  ].join("\n");

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: {
          ToAddresses: [args.to],
        },
        Content: {
          Simple: {
            Subject: {
              Data: "Welcome to Notarix™ — Set Up Your Account",
            },
            Body: {
              Text: { Data: text },
              Html: { Data: html },
            },
          },
        },
      })
    );

    console.log("[SES] Notary onboarding email sent", {
      to: args.to,
      notaryCode: args.notaryCode,
    });
  } catch (error) {
    console.error("[SES] Failed to send notary onboarding email", {
      to: args.to,
      notaryCode: args.notaryCode,
      error,
    });
    throw error;
  }
}