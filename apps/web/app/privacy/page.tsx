export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <a href="/register" className="text-sm text-accent-700 hover:underline">← Back</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 2026</p>

        <div className="border border-gray-200 rounded-lg bg-white p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              1. Data We Collect
            </h2>
            <p>
              We collect identity data (name, email, phone), financial data (bank details for
              withdrawal, transaction history, wallet balance), device data (IP address, browser
              type), and KYC data (phone verification records).
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              2. How We Use Your Data
            </h2>
            <p>
              To create and manage your account and wallet, process and fulfil your transactions,
              verify your identity and prevent fraud, and comply with legal and regulatory
              obligations including anti-money laundering requirements.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              3. Data Sharing
            </h2>
            <p>
              EmercSub does not sell user data to any third party under any circumstances. Data is
              shared only with payment processors, VTU providers, notification services, and
              hosting infrastructure — solely to deliver the platform's services.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              4. Your Rights Under NDPA 2023
            </h2>
            <p>
              You have the right to access, rectify, and request erasure of your personal data,
              the right to data portability, and the right to object to non-essential data
              processing. Privacy requests are responded to within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              5. Security of Personal Data
            </h2>
            <p>
              All personal data is encrypted at rest (AES-256) and in transit (TLS 1.3). In the
              event of a data breach, we will notify affected users and the Nigeria Data Protection
              Commission within 72 hours of discovery.
            </p>
          </section>

          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            This is a summary framework. The full legal document is reviewed and finalised by a
            qualified Nigerian legal practitioner before public launch.
          </p>
        </div>
      </div>
    </div>
  );
}