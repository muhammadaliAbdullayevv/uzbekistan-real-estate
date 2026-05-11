"use client";

import { useId, useState } from "react";

type PasswordInputProps = {
  id?: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  showLabel: string;
  hideLabel: string;
  showAriaLabel: string;
  hideAriaLabel: string;
};

export function PasswordInput({
  id,
  name,
  autoComplete,
  minLength,
  required,
  placeholder,
  defaultValue,
  className = "input pr-24",
  showLabel,
  hideLabel,
  showAriaLabel,
  hideAriaLabel
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={className}
      />
      <button
        type="button"
        aria-label={visible ? hideAriaLabel : showAriaLabel}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium text-accent transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        {visible ? hideLabel : showLabel}
      </button>
    </div>
  );
}
