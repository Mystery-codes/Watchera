import type { Metadata } from "next";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "privacy notice for Watchera, owner and legal review.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <SiteInfoPage
      title="Privacy Notice"
      
      intro="This identifies data practices that must be confirmed by the Watchera operator before publication. It is not a final privacy notice."
      sections={[
        { title: "Information processed", content: "Document account information, authentication events, support messages, and any technical data collected by the hosting or service providers." },
        { title: "Device storage", content: "Watchera currently stores My List data in this browser and may store downloaded content and queue data on the device. Confirm retention and deletion behavior before publishing this notice." },
        { title: "Service providers and retention", content: "List the hosting, authentication, catalog, analytics, and other providers; explain their roles, data locations, retention periods, and applicable transfer safeguards." },
        { title: "Your choices and contact", content: "Explain how people can access, correct, or delete their data, identify the applicable privacy rights and response process, and provide the operator's legal identity and contact details." },
      ]}
    />
  );
}