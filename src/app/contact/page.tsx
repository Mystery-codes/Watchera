import type { Metadata } from "next";
import Link from "next/link";
import { SiteInfoPage } from "@/components/site-info-page";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 text-[#25D366]" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.137.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.626.711.226 1.358.194 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.89-9.884 2.64.001 5.12 1.03 6.985 2.898a9.825 9.825 0 0 1 2.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c-.001 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.887 11.887 0 0 0 5.684 1.447h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.479-8.415z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Contact Watchera",
  description: "Contact Watchera for general questions and support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteInfoPage
      title="Contact"
      intro="For questions about Watchera, send us an email."
      sections={[
        { title: "Email", content: <Link className="text-foreground underline" href="mailto:watchera205@gmail.com">watchera205@gmail.com</Link> },
        { title: "WhatsApp", content: <Link className="inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" href="https://wa.me/2349027237737" target="_blank" rel="noreferrer" aria-label="Message Watchera on WhatsApp at 09027237737" title="Message Watchera on WhatsApp"><WhatsAppIcon /></Link> },
      ]}
    />
  );
}