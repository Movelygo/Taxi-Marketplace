import { LegalPage, LegalSection } from '@/components/public/legal-page'

export const metadata = {
  title: 'Privacy Policy | Movely',
  description: 'How Movely collects, uses, and protects your personal information.',
}

const LAST_UPDATED = '2026-05-18'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Movely collects, uses, and protects your personal information."
      lastUpdated={LAST_UPDATED}
      draft
    >
      <LegalSection title="Overview">
        <p>
          Movely operates a directory that helps customers discover independent drivers and helps drivers list their services. This policy explains what information we collect, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li><strong>Account information:</strong> email address and password used to sign in.</li>
          <li><strong>Driver profile information:</strong> name, photo, phone number, WhatsApp number, city, service area, vehicle type, languages, and bio that drivers choose to publish.</li>
          <li><strong>Usage information:</strong> profile views, lead clicks (call / WhatsApp taps), and basic page analytics.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use information to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Operate the directory and display driver profiles to customers.</li>
          <li>Help drivers measure interest in their profile (views and lead counts).</li>
          <li>Communicate with users about their account and important platform updates.</li>
          <li>Maintain platform safety and prevent abuse.</li>
        </ul>
      </LegalSection>

      <LegalSection title="What we do not do">
        <ul className="list-disc pl-6 space-y-1.5">
          <li>We do not sell personal information.</li>
          <li>We do not share contact details with third parties for marketing.</li>
          <li>We do not process payments between customers and drivers — Movely is not part of the transaction.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Public profile information">
        <p>
          Driver profile information is intentionally public. By creating a profile, drivers consent to having their displayed information (name, photo, contact, service details) visible to anyone visiting the site.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>You can:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Edit or delete information from your profile at any time.</li>
          <li>Request account deletion by emailing <a href="mailto:hello@movelygo.com" className="text-[#0B1F3D] font-semibold hover:underline">hello@movelygo.com</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy? Email{' '}
          <a href="mailto:hello@movelygo.com" className="text-[#0B1F3D] font-semibold hover:underline">
            hello@movelygo.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
