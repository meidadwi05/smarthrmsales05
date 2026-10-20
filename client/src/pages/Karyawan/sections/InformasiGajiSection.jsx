import React from "react";
import { Wallet } from "lucide-react";
import { Section, Field } from "../FormUI.jsx";

export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const stringValue = String(value);
  const digits = stringValue.replace(/\D/g, "").replace(/^0+(?!$)/, "");
  if (!digits) return "";
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${formatted}`;
};

const SALARY_FIELDS = [
  { label: "Gaji Pokok", name: "salary_basic" },
  { label: "Tunjangan Jabatan", name: "allowance_position" },
  { label: "Tunjangan Project", name: "allowance_project" },
  { label: "Tunjangan Makan", name: "allowance_meal" },
  { label: "Tunjangan Transport", name: "allowance_transport" },
  { label: "Tunjangan Lain-lain", name: "allowance_other" }
];

export default function InformasiGajiSection({ form, setForm }) {
  const handleCurrencyChange = (name) => (e) => {
    const input = e.target;
    const rawValue = input.value;
    const selectionStart = input.selectionStart || 0;

    // Hitung jumlah digit angka sebelum kursor untuk menjaga posisi kursor
    const digitsBeforeCursor = rawValue
      .slice(0, selectionStart)
      .replace(/\D/g, "").length;

    const formatted = formatRupiah(rawValue);

    setForm((previous) => ({
      ...previous,
      [name]: formatted
    }));

    requestAnimationFrame(() => {
      if (!input) return;
      if (!formatted) {
        input.setSelectionRange(0, 0);
        return;
      }

      let digitCount = 0;
      let newCursorPosition = formatted.length;

      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }

      // Pastikan posisi kursor tidak berada sebelum prefix "Rp"
      if (newCursorPosition < 2 && formatted.startsWith("Rp")) {
        newCursorPosition = 2;
      }

      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  return (
    <Section title="Informasi Gaji" icon={Wallet}>
      {SALARY_FIELDS.map(({ label, name }) => (
        <Field
          key={name}
          label={label}
          name={name}
          type="text"
          inputMode="numeric"
          form={form}
          setForm={setForm}
          value={form?.[name] ? formatRupiah(form[name]) : ""}
          onChange={handleCurrencyChange(name)}
          placeholder="Rp0"
        />
      ))}
    </Section>
  );
}
