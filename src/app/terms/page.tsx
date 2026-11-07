import type { Metadata } from "next";
import { SiteInfoPage } from "@/components/site-info-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Watchera, pending owner and legal review.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <SiteInfoPage
      title="Terms of Use"
      reviewNotice
      intro="This page outlines topics the Watchera operator should review and complete before publishing binding terms. It is not a final agreement."
      sections={[
        { title: "Service description", content: "Describe the service, supported features, eligibility requirements, and any geographic limits here." },
        { title: "Accounts and acceptable use", content: "Define account responsibilities, permitted use, prohibited conduct, and how account access may be suspended or closed." },
        { title: "Content and availability", content: "Specify content rights, availability, third-party services, downloads, and any applicable limitations." },
        { title: "Operator and governing law", content: "Add the legal operator name, contact address, governing jurisdiction, dispute process, and effective date after legal review." },
      ]}
    />
  );
}