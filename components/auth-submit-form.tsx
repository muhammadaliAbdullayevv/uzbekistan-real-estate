"use client";

import type { FormEvent, ReactNode } from "react";

type AuthSubmitFormProps = {
  action: string;
  method?: "post" | "get";
  className?: string;
  children: ReactNode;
};

export function AuthSubmitForm({ action, method = "post", className, children }: AuthSubmitFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    form.querySelectorAll<HTMLButtonElement>("button[type='submit']").forEach((button) => {
      button.disabled = true;
    });
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement) {
      submitter.setAttribute("aria-busy", "true");
    }
  }

  return (
    <form action={action} method={method} className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
