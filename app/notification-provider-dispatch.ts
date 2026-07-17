import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

export type ProviderDispatchRecord = {
  channel: string;
  id: string;
  purpose: string;
  recipient: string;
  recipientName: string;
  relatedRecord: string;
};

export type ProviderDispatchResult = {
  detail: string;
  ok: boolean;
  providerMessageId: string;
  providerStatus: string;
};

type RuntimeEnv = Record<string, string | undefined>;

export async function sendNotificationToProvider(
  record: ProviderDispatchRecord,
): Promise<ProviderDispatchResult> {
  if (phoneOrSmsChannel(record.channel)) {
    return sendAwsSms(record);
  }
  return sendAwsEmail(record);
}

async function sendAwsEmail(
  record: ProviderDispatchRecord,
): Promise<ProviderDispatchResult> {
  const env = process.env as RuntimeEnv;
  const region = env.AWS_SES_REGION ?? env.AWS_REGION;
  const fromEmail = env.AWS_SES_FROM_EMAIL;
  if (!region || !fromEmail) {
    return {
      detail:
        "AWS SES dispatch blocked because AWS_SES_REGION and AWS_SES_FROM_EMAIL are required.",
      ok: false,
      providerMessageId: "Pending",
      providerStatus: "Missing SES configuration",
    };
  }

  try {
    const client = new SESv2Client({ region });
    const result = await client.send(
      new SendEmailCommand({
        Content: {
          Simple: {
            Body: {
              Text: {
                Data: buildEmailBody(record),
              },
            },
            Subject: {
              Data: buildEmailSubject(record),
            },
          },
        },
        Destination: {
          ToAddresses: [record.recipient],
        },
        EmailTags: [
          { Name: "notificationId", Value: record.id },
          { Name: "relatedRecord", Value: record.relatedRecord },
        ],
        FromEmailAddress: fromEmail,
      }),
    );

    return {
      detail:
        "AWS SES accepted the notification for provider delivery and callback reconciliation.",
      ok: true,
      providerMessageId: result.MessageId ?? `SES-${record.id}`,
      providerStatus: "Accepted by AWS SES",
    };
  } catch (error) {
    return providerError("AWS SES", error);
  }
}

async function sendAwsSms(
  record: ProviderDispatchRecord,
): Promise<ProviderDispatchResult> {
  const env = process.env as RuntimeEnv;
  const region = env.AWS_SMS_REGION ?? env.AWS_REGION;
  if (!region) {
    return {
      detail: "AWS SMS dispatch blocked because AWS_SMS_REGION or AWS_REGION is required.",
      ok: false,
      providerMessageId: "Pending",
      providerStatus: "Missing SMS region",
    };
  }

  try {
    const client = new SNSClient({ region });
    const result = await client.send(
      new PublishCommand({
        Message: buildSmsMessage(record),
        MessageAttributes: {
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: "Transactional",
          },
        },
        PhoneNumber: record.recipient,
      }),
    );

    return {
      detail:
        "AWS SNS accepted the phone or SMS notification for provider delivery and callback reconciliation.",
      ok: true,
      providerMessageId: result.MessageId ?? `SNS-${record.id}`,
      providerStatus: "Accepted by AWS SNS",
    };
  } catch (error) {
    return providerError("AWS SNS", error);
  }
}

function buildEmailSubject(record: ProviderDispatchRecord) {
  return `Notarix Signings ${record.purpose}`;
}

function buildEmailBody(record: ProviderDispatchRecord) {
  return [
    `Hello ${record.recipientName},`,
    "",
    `Notarix Signings has an update for ${record.relatedRecord}: ${record.purpose}.`,
    "",
    "Please sign in to the Notarix Signings portal to review the secured workflow record.",
    "",
    `Notification reference: ${record.id}`,
  ].join("\n");
}

function buildSmsMessage(record: ProviderDispatchRecord) {
  return `Notarix Signings update for ${record.relatedRecord}: ${record.purpose}. Sign in to review. Ref ${record.id}.`;
}

function phoneOrSmsChannel(channel: string) {
  const normalized = channel.toLowerCase();
  return normalized.includes("phone") || normalized.includes("sms");
}

function providerError(provider: string, error: unknown): ProviderDispatchResult {
  const message = error instanceof Error ? error.message : "Provider dispatch failed.";
  return {
    detail: `${provider} rejected the notification dispatch: ${message}`,
    ok: false,
    providerMessageId: "Pending",
    providerStatus: `${provider} dispatch failed`,
  };
}
