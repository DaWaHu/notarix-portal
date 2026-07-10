"use client";

import { useState } from "react";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length > 6) {
    return `${area}-${prefix}-${line}`;
  }

  if (digits.length > 3) {
    return `${area}-${prefix}`;
  }

  return area;
}

export function PortalAccessForm() {
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <form
      className="access-form"
      action="mailto:support@notarix.live"
      method="post"
      encType="text/plain"
    >
      <div className="form-heading">
        <p>Access request form</p>
        <h1>Submit onboarding information to Notarix staff.</h1>
      </div>

      <label>
        Request type
        <select name="Request type" required>
          <option value="">Select request type</option>
          <option>Client / Law Firm / Title Company</option>
          <option>Notary</option>
        </select>
      </label>

      <div className="field-row">
        <label>
          Primary contact name
          <input name="Primary contact name" autoComplete="name" required />
        </label>
        <label>
          Email address
          <input name="Email address" type="email" autoComplete="email" required />
        </label>
      </div>

      <div className="field-row">
        <label>
          Phone number
          <input
            name="Phone number"
            type="tel"
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={12}
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            placeholder="555-123-4567"
            title="Enter phone numbers as ###-###-####."
            value={phoneNumber}
            onChange={(event) =>
              setPhoneNumber(formatPhoneNumber(event.currentTarget.value))
            }
          />
        </label>
        <label>
          Organization or commission name
          <input name="Organization or commission name" required />
        </label>
      </div>

      <label>
        Service interest
        <select name="Service interest" required>
          <option value="">Select service interest</option>
          <option>Mobile notarial services</option>
          <option>Electronic notarial services</option>
          <option>Remote online notarial services</option>
          <option>Multiple services</option>
        </select>
      </label>

      <label>
        State or primary operating jurisdiction
        <input name="State or primary operating jurisdiction" required />
      </label>

      <label>
        Brief onboarding notes
        <textarea
          name="Brief onboarding notes"
          rows={5}
          placeholder="Provide relevant business type, notary credentials, electronic/RON authorization status, or staff review notes."
        />
      </label>

      <div className="form-actions">
        <button type="submit">Send Access Request</button>
        <p>
          Staff will review the request and issue the appropriate profile
          completion invitation when approved for onboarding.
        </p>
      </div>
    </form>
  );
}
