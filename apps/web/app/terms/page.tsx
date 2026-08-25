export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <a href="/register" className="text-sm text-accent-700 hover:underline">← Back</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: August 2026</p>

        <div className="border border-gray-200 rounded-lg bg-white p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By registering an account on EmercSub, you agree to be legally bound by these Terms
              and Conditions, the Privacy Policy, and the Acceptable Use Policy. You must be at
              least 18 years of age to register, and must provide accurate, truthful, and complete
              information during registration.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              2. Wallet and Payments
            </h2>
            <p>
              The EmercSub wallet is a stored-value account for use exclusively within the
              platform — it is not a bank account and is not covered by NDIC deposit insurance.
              EmercSub does not pay interest on wallet balances. All wallet funding transactions
              are final and non-refundable except where a transaction failure occurs.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              3. Data and Airtime Purchases
            </h2>
            <p>
              All data and airtime purchases are final and non-refundable once successfully
              delivered to the specified phone number. In the event of a failed delivery, EmercSub
              will refund the purchase amount to your wallet within 60 minutes.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              4. Prohibited Activities
            </h2>
            <p>
              Using the platform to launder money, submit stolen or fraudulently obtained airtime
              or recharge PINs, or attempt to compromise the platform's systems are strictly
              prohibited and grounds for immediate account termination and referral to law
              enforcement.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
              5. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes
              are first subject to good-faith negotiation, and if unresolved within 30 days,
              referred to arbitration under the Arbitration and Conciliation Act, with Lagos as
              the seat of arbitration.
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