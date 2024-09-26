import "./globals.css";
import { Arimo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/providers/modal-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import Script from "next/script";

const font = Arimo({
  weight: "400",

  subsets: ["latin"],
});

export const metadata = {
  title: "Stella Admin Dashboard",
  description: "Dashboard for Stella",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Add the Stripe.js script in the head section */}
          {/* <Script
            src="https://js.stripe.com/v3"
            id="show-banner"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `document.getElementById('banner').classList.remove('hidden')`,
            }}
          /> */}
        </head>
        <body className={font.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider />
            <ModalProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
