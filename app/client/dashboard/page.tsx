export default function ClientDashboardPage() {
    return (
        <div
            style={{
                background: "#F3F4F6",
                border: "1px solid #D1D5DB",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.16em",
                    color: "#6B7280",
                    marginBottom: 8,
                    textTransform: "uppercase",
                }}
            >
                Notarix™ Client Portal
            </div>

            <h1
                style={{
                    margin: 0,
                    fontSize: 44,
                    lineHeight: 1.05,
                    fontWeight: 950,
                    color: "#111827",
                }}
            >
                Client Dashboard
            </h1>

            <p
                style={{
                    marginTop: 14,
                    marginBottom: 24,
                    color: "#4B5563",
                    fontWeight: 600,
                    fontSize: 16,
                    maxWidth: 760,
                    lineHeight: 1.6,
                }}
            >
                View orders, manage your profile, create new orders, and access support resources.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                }}

            >
                <DashboardCard
                    href="/client/profile"
                    title="Profile"
                    description="Manage your organization and contact details."
                />

                <DashboardCard
                    href="/client/orders"
                    title="Orders"
                    description="View all orders and status updates."
                />

                <DashboardCard
                    href="/client/create-order"
                    title="Create Order"
                    description="Submit a new signing request."
                />

                <DashboardCard
                    href="/client/business-rules"
                    title="Business Rules"
                    description="Review requirements and expectations."
                />

                <DashboardCard
                    href="/client/support"
                    title="Support / Need Help"
                    description="Contact support for assistance."
                />
            </div>
        </div>
    );
}

function DashboardCard({
    href,
    title,
    description,
}: {
    href: string;
    title: string;
    description: string;
}) {
    return (
        <a
            href={href}
            style={{
                display: "block",
                textDecoration: "none",
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                padding: 18,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
        >
            <div
                style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#111827",
                    marginBottom: 6,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: 14,
                    color: "#6B7280",
                    fontWeight: 500,
                }}
            >
                {description}
            </div>
        </a>
    );
}