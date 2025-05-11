import "./globals.css";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/navbars/Navbar";
import Footer from "@/components/others/Footer";

const montserrat = Montserrat({ subsets: ["cyrillic"], weight: ["variable"] });

export const metadata = {
  metadataBase: new URL("https://topreachstudio.com"),
  description:
    "Topreach is a specialized agency with over 5 years of experience in video editing and recording. We help businesses grow by creating impactful videos for social media and YouTube channels. Our proven approach focuses on effective branding and audience expansion, helping clients boost sales and grow their online presence.",
  title: {
    default: "Top Reach",
    template: "%s | Top Reach",
  },
  opengraph: {
    title: "Top Reach",
    description:
      "Topreach is a specialized agency with over 5 years of experience in video editing and recording. We help businesses grow by creating impactful videos for social media and YouTube channels. Our proven approach focuses on effective branding and audience expansion, helping clients boost sales and grow their online presence.",
    type: "website",
    locale: "bg",
    url: "https://topreachstudio.com",
    siteName: "Top Reach",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={montserrat.className}
    >
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
