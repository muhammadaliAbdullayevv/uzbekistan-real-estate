"use client";

type ConfirmSubmitButtonProps = {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
};

/** A form submit button that asks for confirmation before the browser submits it. */
export function ConfirmSubmitButton({ confirmMessage, className, children }: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
