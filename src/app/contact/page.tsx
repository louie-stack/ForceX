import type { Metadata } from "next";
import { Hero } from "@/components/contact/Sections";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about ForceX, beta access, the data platform, or anything else? Send the team a message.",
};

export default function ContactPage() {
  return (
    <div className="ctp">
      <Hero />
    </div>
  );
}
