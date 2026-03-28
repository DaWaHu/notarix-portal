// app/admin/orders/[orderId]/components/AppointmentPanel.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AppointmentItem = {
  id: string;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  locationName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

function nice(value: string | null | undefined) {
  const v = String(value || "").trim();
  return v || "—";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function AppointmentPanel({
  orderId,
  appointments,
}: {
  orderId: string;
  appointments: AppointmentItem[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledStart,
          scheduledEnd: scheduledEnd || null,
          locationName: locationName || null,
          address1: address1 || null,
          address2: address2 || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          contactName: contactName || null,
          contactPhone: contactPhone || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create appointment");
      }

      setScheduledStart("");
      setScheduledEnd("");
      setLocationName("");
      setAddress1("");
      setAddress2("");
      setCity("");
      setState("");
      setZip("");
      setContactName("");
      setContactPhone("");
      setNotes("");

      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: 20,
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.05)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #CBD5E1",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    boxSizing: "border-box",
  };

  return (
    <section style={sectionStyle}>
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Appointments</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Scheduled Start</div>
          <input
            type="datetime-local"
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Scheduled End</div>
          <input
            type="datetime-local"
            value={scheduledEnd}
            onChange={(e) => setScheduledEnd(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Location Name</div>
          <input value={locationName} onChange={(e) => setLocationName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Address 1</div>
          <input value={address1} onChange={(e) => setAddress1(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Address 2</div>
          <input value={address2} onChange={(e) => setAddress2(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>City</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>State</div>
            <input value={state} onChange={(e) => setState(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Zip</div>
            <input value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Contact Name</div>
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Contact Phone</div>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {error ? (
          <div style={{ color: "#B91C1C", fontWeight: 700 }}>{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "fit-content",
            border: "none",
            borderRadius: 10,
            padding: "12px 16px",
            background: "#94A3B8",
            color: "#fff",
            fontWeight: 900,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Scheduling..." : "Schedule Appointment"}
        </button>
      </form>

      {appointments.length === 0 ? (
        <div style={{ color: "#475569", fontWeight: 600 }}>
          No appointments scheduled yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {appointments.map((appt) => (
            <div
              key={appt.id}
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div><strong>Status:</strong> {nice(appt.status)}</div>
              <div><strong>Start:</strong> {formatDateTime(appt.scheduledStart)}</div>
              <div><strong>End:</strong> {formatDateTime(appt.scheduledEnd)}</div>
              <div><strong>Location:</strong> {nice(appt.locationName)}</div>
              <div><strong>Address:</strong> {nice(appt.address1)}</div>
              <div><strong>Address 2:</strong> {nice(appt.address2)}</div>
              <div><strong>City:</strong> {nice(appt.city)}</div>
              <div><strong>State:</strong> {nice(appt.state)}</div>
              <div><strong>Zip:</strong> {nice(appt.zip)}</div>
              <div><strong>Contact:</strong> {nice(appt.contactName)}</div>
              <div><strong>Phone:</strong> {nice(appt.contactPhone)}</div>
              <div><strong>Notes:</strong> {nice(appt.notes)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}