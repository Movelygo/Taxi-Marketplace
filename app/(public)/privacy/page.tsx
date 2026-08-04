import { LegalPage, LegalSection } from '@/components/public/legal-page'

export const metadata = {
  title: 'Privacy Policy | Movely',
  description: 'How Movely collects, uses, and protects your personal information.',
}

const LAST_UPDATED = '2026-08-02'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Movely collects, uses, and protects your personal information."
      lastUpdated={LAST_UPDATED}
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

      <LegalSection title="Driver verification & responsibility">
        <p>
          Movely is <strong>not</strong> a verification service. We do not confirm driver identities, licenses, insurance, or backgrounds. Drivers self-declare that they hold the required licenses, registrations, and insurance to operate in their jurisdiction, but Movely does not validate these claims.
        </p>
        <p className="mt-3">
          <strong>Customers are responsible for verifying a driver's credentials</strong> before arranging a trip. We encourage customers to ask drivers for proof of licensing and insurance, agree on pricing and terms in advance, and arrange trips directly with the driver. Movely facilitates discovery and connection — not the transaction.
        </p>
        <p className="mt-3">
          If you encounter a profile that appears misleading or unsafe, please report it through the profile page or by emailing{' '}
          <a href="mailto:hello@movelygo.com" className="text-[#0B1F3D] font-semibold hover:underline">hello@movelygo.com</a>.
        </p>
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
