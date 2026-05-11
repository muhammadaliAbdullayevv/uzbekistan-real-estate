import { redirect } from "next/navigation";

export { privatePageMetadata as metadata } from "@/lib/site";
import { getOwnerLoginPath } from "@/lib/owner";

export default function AdminLoginPage() {
  redirect(getOwnerLoginPath());
}
