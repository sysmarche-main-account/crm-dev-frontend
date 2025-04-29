import { CustomProvider } from "rsuite";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import "rsuite/dist/rsuite-no-reset.min.css";
import "@/styles/globals.scss";
import StoreProvider from "./StoreProvider";
import { SnackbarProvider } from "./(context)/SnackbarProvider";

// export const metadata = {
//   title: "Your Site Title",
//   description: "Your site description",
//   icons: {
//     icon: "./favicon.ico", // or '/favicon.png', or an array of icons
//   },
// };

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppRouterCacheProvider>
            <CustomProvider>
              <StoreProvider>
                <SnackbarProvider>{children}</SnackbarProvider>
              </StoreProvider>
            </CustomProvider>
          </AppRouterCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
