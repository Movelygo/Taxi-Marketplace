import { LegalPage, LegalSection } from '@/components/public/legal-page'

export const metadata = {
  title: 'Terms of Service | Movely',
  description: 'The terms that govern your use of the Movely directory.',
}

const LAST_UPDATED = '2026-05-18'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="The terms that govern your use of the Movely directory."
      lastUpdated={LAST_UPDATED}
      draft
    >
      <LegalSection title="What Movely is">
        <p>
          Movely is a directory that helps customers discover independent drivers and helps drivers publish their service information. Movely is not a transportation provider, broker, or dispatch service. We do not employ drivers, set prices, schedule rides, or process payments.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You are responsible for the accuracy of the information you provide and for maintaining the security of your account credentials. You must be 18 or older to create an account.
        </p>
      </LegalSection>

      <LegalSection title="Driver listings">
        <p>By creating a driver profile, you confirm that:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>The information you publish is accurate and reflects the service you actually provide.</li>
          <li>You hold the required licenses, registrations, and insurance to operate as a driver in your jurisdiction.</li>
          <li>You are solely responsible for the rides you arrange with customers.</li>
        </ul>
        <p>
          Movely reserves the right to remove or suspend listings that are inaccurate, misleading, or violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="Customer use">
        <p>
          Movely helps you find drivers but is not a party to the transaction between you and the driver. You are responsible for verifying a driver&apos;s credentials, agreeing on price and terms, and arranging your trip directly with the driver.
        </p>
      </LegalSection>

      <LegalSection title="No fees, no liability for transactions">
        <p>
          Movely does not charge customers booking fees and does not take commissions from drivers. Because Movely is not part of any transaction, we are not responsible for the conduct of any driver or customer, the quality or safety of any ride, or any disputes between users.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Misrepresent your identity, qualifications, or services.</li>
          <li>Use Movely to harass, deceive, or harm other users.</li>
          <li>Scrape, copy, or republish driver listings without permission.</li>
          <li>Attempt to interfere with or disrupt the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may suspend or terminate accounts that violate these terms. Drivers and customers may close their account at any time by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms from time to time. Material changes will be communicated via email or in-product notice.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions? Email{' '}
          <a href="mailto:hello@movelygo.com" className="text-[#0B1F3D] font-semibold hover:underline">
            hello@movelygo.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
