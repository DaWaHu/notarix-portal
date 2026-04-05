"use client";

type Props = {
  name: string;
  placeholder?: string;
  defaultValue?: string;
  style?: React.CSSProperties;
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PhoneInput({
  name,
  placeholder = "123-456-7890",
  defaultValue = "",
  style,
}: Props) {
  return (
    <input
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      maxLength={12}
      inputMode="numeric"
      style={style}
      onChange={(e) => {
        e.currentTarget.value = formatPhoneInput(e.currentTarget.value);
      }}
    />
  );
}