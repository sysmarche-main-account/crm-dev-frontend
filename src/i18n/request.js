import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers"; // Optional for cookie handling

export default getRequestConfig(async () => {
  // Retrieve locale from cookies, headers, or other methods (for now, we check cookies)
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en"; // Fallback to 'en' if no cookie is found

  // Dynamically load the correct locale messages
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
