import type { ChangeEvent } from "react";

type LocationSelectOption = {
  value: string;
  label: string;
};

type LocationSelectProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  value?: string;
  options: LocationSelectOption[];
  emptyLabel?: string;
  className?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export function LocationSelect({
  id,
  name,
  label,
  defaultValue,
  value,
  options,
  emptyLabel,
  className,
  onChange
}: LocationSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink/80">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        className={className ? `select ${className}` : "select"}
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
