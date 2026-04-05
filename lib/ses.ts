import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const region =
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION ||
  "us-east-1";

const ses = new SESv2Client({ region });

export async function sendVendorOnboardingEmail(args: {
  to: string;
  vendorCode: string;
  profileUrl: string;
}): Promise<void> {

}

export async function sendNotaryOnboardingEmail(args: {
  to: string;
  notaryCode: string;
  profileUrl: string;
}) {
  const html = `
    <p>Hello,</p>
    <p>You have been added to the <strong>Notarix™</strong> system.</p>
    <p>Please log in to create your account and complete your profile.</p>
    <p>
      <a href="${args.profileUrl}" style="
        display:inline-block;
        padding:12px 18px;
        background:#1D4ED8;
        color:#ffffff;
        text-decoration:none;
        border-radius:8px;
        font-weight:700;
      ">Access Your Profile</a>
    </p>
    <p>If you need assistance, please reply to this email.</p>
    <p>Thank you,<br/>Notarix™<br/>Professional Signing Coordination Platform</p>
  `;

  const text = [
    "Hello,",
    "",
    "You have been added to the Notarix™ system.",
    "Please log in to create your account and complete your profile.",
    "",
    `Access your profile: ${args.profileUrl}`,
    "",
    "If you need assistance, please reply to this email.",
    "",
    "Thank you,",
    "Notarix™",
    "Professional Signing Coordination Platform",
  ].join("\n");

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: "staff@notarix.live",
      Destination: {
        ToAddresses: [args.to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "Welcome to Notarix™ — Complete Your Profile",
          },
          Body: {
            Text: { Data: text },
            Html: { Data: html },
          },
        },
      },
    })
  );
}