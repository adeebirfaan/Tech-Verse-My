import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit your product · Techverse MY",
  description: "Add a Malaysian-made app or website to the Techverse MY directory.",
};

export default function SubmitPage() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main">
        <SubmitForm />
      </main>
      <Footer />
    </>
  );
}
