import { cookies } from "next/headers";
import csrf from "csrf";

export function DELETE(req) {
  const csrfProtection = new csrf();
  const csrfToken = req.headers.get("csrf-token");
  const verified = csrfProtection.verify(process.env.CSRF_SECRET, csrfToken);

  if (!verified) {
    return new Response({ message: "Invalid CSRF token" }, { status: 403 });
  }

  const cookiesInstance = cookies();

  cookiesInstance.delete("sessionToken");
  cookiesInstance.delete("pgperm");
  cookiesInstance.delete("token");
  cookiesInstance.delete("expiry");
  cookiesInstance.delete("cToken");

  return new Response("Cookie deleted", { status: 200 });
}
