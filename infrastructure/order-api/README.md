# Notarix Signings Order API infrastructure specification

Status: **DESIGNED / NOT DEPLOYED**

`resource-manifest.yaml` is a provider-oriented inventory and control contract,
not deployable infrastructure. The repository has no established IaC standard.
Phase A deliberately does not introduce CDK, SAM, Terraform, Pulumi, or a
CloudFormation stack because selecting and maintaining a framework is a material
architecture decision.

## Future framework recommendation

Use AWS CDK in TypeScript if the owner approves AWS implementation. It matches
the repository language, can synthesize reviewable CloudFormation, supports
assertion tests, and can represent API Gateway, Lambda, IAM, networking, logs,
alarms, and tags. Require pinned dependencies, `cdk diff`, synthesized-template
review, least-privilege assertions, cost review, isolated Preview deployment,
and owner approval before any apply/deploy.

SAM is a viable smaller alternative for the Lambda/API portion but becomes less
convenient for the complete subnet/security-group/endpoint design. Terraform is
appropriate only if the operating team adopts it across AWS and accepts remote
state governance. No framework is installed by this phase.

## Network and cost controls

The manifest excludes NAT Gateway and RDS Proxy. API Gateway invokes the VPC
Lambda without public Lambda egress, and Lambda reaches RDS by security-group
reference. If Lambda retrieves its runtime secret at invocation/cold start, a
two-AZ Secrets Manager interface endpoint is the preferred private path and is
estimated at about `$14.60/month` before data processing. That raises the total
low-volume architecture to about `$36–$39/month`, including Vercel Pro.

A cheaper AWS-native deployment-time injection method may be approved only if
plaintext never enters source, generated templates, CI logs, shell history,
Vercel, or human-readable deployment output and rotation can be proven. NAT is
not justified solely for Secrets Manager access.

## Credential separation

- Order Lambda: only the least-privilege Order runtime credential.
- Migration runner: separate credential, secret, role, and network path; never
  Lambda or Vercel.
- Administrator: named MFA-backed access through a separately approved SSM
  path; never Lambda or Vercel.
- Preview: independent resource, credentials, app client, and synthetic data.

The secret reference is non-secret metadata. The manifest contains no password,
connection string, account credential, private key, or actual secret ARN.
