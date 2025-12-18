"use client";

import Footer from "../../components/Footer";

export default function TermsOfService() {
  return (
    <>
      <div className="min-h-screen bg-background text-text pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-center text-primary mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-center text-text/60 text-sm max-w-2xl mx-auto mb-12">
            Last updated: <span className="text-text font-medium">18/12/2025</span>
          </p>

          <p className="text-base md:text-lg text-text/80 mb-8 text-center max-w-3xl mx-auto leading-relaxed">
            Welcome to <span className="font-bold text-text">Sygil</span> (“Platform”, “we”, “us”, “our”). These Terms of Service (“Terms”) govern your access to and use of the Sygil website, applications, and related services.
          </p>
          <p className="text-base md:text-lg text-text/80 mb-12 text-center max-w-3xl mx-auto leading-relaxed">
            By accessing or using Sygil, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
          </p>

          <div className="space-y-12">
            {/* 1. Definitions */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">1. Definitions</h2>
              <ul className="space-y-3 pl-5 list-disc text-text/80 leading-relaxed">
                <li>
                  <strong>“User”</strong> refers to any person accessing or using the Platform.
                </li>
                <li>
                  <strong>“Creator”</strong> refers to a User who creates a Sygil page and receives support.
                </li>
                <li>
                  <strong>“Supporter” / “Fan”</strong> refers to a User who voluntarily contributes money to a Creator.
                </li>
                <li>
                  <strong>“Contribution”</strong> refers to a voluntary payment made by a Supporter to support a Creator.
                </li>
                <li>
                  <strong>“FamPoints”</strong> refers to non-monetary loyalty acknowledgment points used on the Platform.
                </li>
              </ul>
            </section>

            {/* 2. Nature of the Platform */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">2. Nature of the Platform</h2>
              <p className="text-text/80 mb-4 leading-relaxed">
                Sygil is a technology platform that enables creators to engage with their audience and receive voluntary support.
              </p>
              <p className="text-text/80 mb-2 font-medium">Sygil:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Acts as a facilitator and commission-based platform</li>
                <li>Is not a charity</li>
                <li>Is not a marketplace selling goods or services</li>
                <li>Does not provide financial, investment, or advisory services</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                Creators are independent users of the Platform. Sygil does not control or manage creator content or activities.
              </p>
            </section>

            {/* 3. Contributions & Payments */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">3. Contributions & Payments</h2>

              <h3 className="text-xl font-semibold text-text mb-3">3.1 Voluntary Nature of Contributions</h3>
              <p className="text-text/80 mb-2 font-medium">All Contributions on Sygil are:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Voluntary</li>
                <li>Made without obligation</li>
                <li>Made without expectation of any guaranteed return, product, or service</li>
              </ul>

              <p className="text-text/80 mb-2 font-medium">A Contribution does not constitute:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-6">
                <li>A donation to a charitable organization</li>
                <li>A purchase of goods or services</li>
                <li>An investment</li>
                <li>A wager, bet, or lottery entry</li>
              </ul>

              <h3 className="text-xl font-semibold text-text mb-3">3.2 No Entitlement</h3>
              <p className="text-text/80 mb-2 font-medium">Making a Contribution does not entitle a Supporter to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Any specific content</li>
                <li>Any guaranteed response</li>
                <li>Any goods or services</li>
                <li>Any monetary or non-monetary benefit</li>
              </ul>
              <p className="text-text/80 mb-6 leading-relaxed">
                Any acknowledgment provided by a Creator is discretionary.
              </p>

              <h3 className="text-xl font-semibold text-text mb-3">3.3 Payment Processing</h3>
              <p className="text-text/80 mb-4 leading-relaxed">
                Payments are processed through third-party payment gateways (such as Razorpay).
              </p>
              <p className="text-text/80 mb-2 font-medium">Sygil:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Does not store card or bank details</li>
                <li>Does not operate a wallet or stored-value system</li>
                <li>Does not hold funds beyond facilitating settlement</li>
                <li>Payment gateway fees may apply and are deducted as per the gateway’s terms.</li>
              </ul>
            </section>

            {/* 4. Platform Fees */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">4. Platform Fees</h2>
              <ul className="space-y-3 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Sygil earns revenue by charging Creators a platform service fee (commission).</li>
                <li>The platform fee is deducted from Contributions before settlement.</li>
                <li>Applicable taxes (including GST) are charged only on Sygil’s platform fee, as per law.</li>
              </ul>
              <p className="text-text/80 mt-4 mb-2 font-medium">Creators are responsible for:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Their own income tax obligations</li>
                <li>Any applicable GST or other taxes on their earnings</li>
              </ul>
            </section>

            {/* 5. FamPoints */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">5. FamPoints</h2>

              <h3 className="text-xl font-semibold text-text mb-3">5.1 Nature of FamPoints</h3>
              <p className="text-text/80 mb-2">FamPoints are a symbolic loyalty acknowledgment mechanism.</p>
              <p className="text-text/80 mb-2 font-medium">FamPoints:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Have no monetary value</li>
                <li>Are not redeemable for cash</li>
                <li>Are non-transferable</li>
                <li>Are not a financial instrument</li>
                <li>Do not represent consideration for payment</li>
              </ul>
              <p className="text-text/80 mb-6 leading-relaxed">
                FamPoints are provided only as a recognition of participation and support.
              </p>

              <h3 className="text-xl font-semibold text-text mb-3">5.2 No Rights or Guarantees</h3>
              <p className="text-text/80 mb-2 font-medium">FamPoints do not:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Create any enforceable rights</li>
                <li>Guarantee access to content</li>
                <li>Represent ownership or value</li>
                <li>Constitute a digital good or service</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                Sygil reserves the right to modify, suspend, or discontinue FamPoints at any time.
              </p>
            </section>

            {/* 6. Refunds & Chargebacks */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">6. Refunds & Chargebacks</h2>
              <p className="text-text/80 mb-3 leading-relaxed">
                Contributions are generally non-refundable due to their voluntary nature.
              </p>
              <p className="text-text/80 mb-2 font-medium">Refunds, if any, are subject to:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Payment gateway policies</li>
                <li>Applicable laws</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                Chargebacks may result in account restrictions or suspension.
              </p>
            </section>

            {/* 7. Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">7. Prohibited Activities</h2>
              <p className="text-text/80 mb-2 font-medium">Users must not:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Use the Platform for illegal activities</li>
                <li>Misrepresent Contributions as investments or purchases</li>
                <li>Conduct gambling, lotteries, or chance-based promotions</li>
                <li>Attempt to monetize FamPoints</li>
                <li>Violate applicable laws or regulations</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                Sygil reserves the right to suspend or terminate accounts for violations.
              </p>
            </section>

            {/* 8. Creator Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">8. Creator Responsibilities</h2>
              <p className="text-text/80 mb-2 font-medium">Creators agree that:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>They are solely responsible for their content and conduct</li>
                <li>They will not promise guaranteed rewards or benefits</li>
                <li>They will comply with applicable laws and tax requirements</li>
                <li>They will not misuse the Platform for misleading or unlawful purposes</li>
              </ul>
            </section>

            {/* 9. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">9. Intellectual Property</h2>
              <p className="text-text/80 mb-3 leading-relaxed">
                All Platform content, trademarks, and technology belong to Sygil or its licensors.
              </p>
              <p className="text-text/80 leading-relaxed">
                Users may not copy, distribute, or misuse Platform content without permission.
              </p>
            </section>

            {/* 10. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">10. Limitation of Liability</h2>
              <p className="text-text/80 mb-2 font-medium">To the maximum extent permitted by law:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed mb-4">
                <li>Sygil is not liable for creator actions or content</li>
                <li>Sygil does not guarantee uninterrupted access</li>
                <li>Sygil is not responsible for disputes between Users</li>
              </ul>
              <p className="text-text/80 leading-relaxed">
                Use of the Platform is at your own risk.
              </p>
            </section>

            {/* 11. Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">11. Indemnification</h2>
              <p className="text-text/80 mb-2 font-medium">You agree to indemnify and hold harmless Sygil from any claims arising from:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of applicable laws</li>
              </ul>
            </section>

            {/* 12. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">12. Termination</h2>
              <p className="text-text/80 mb-2 font-medium">Sygil may suspend or terminate access:</p>
              <ul className="space-y-2 pl-5 list-disc text-text/80 leading-relaxed">
                <li>For violation of these Terms</li>
                <li>For legal or regulatory reasons</li>
                <li>At its discretion, with or without notice</li>
              </ul>
            </section>

            {/* 13. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">13. Changes to Terms</h2>
              <p className="text-text/80 mb-3 leading-relaxed">
                Sygil may update these Terms from time to time.
              </p>
              <p className="text-text/80 leading-relaxed">
                Continued use of the Platform constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* 14. Governing Law & Jurisdiction */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">14. Governing Law & Jurisdiction</h2>
              <p className="text-text/80 mb-3 leading-relaxed">
                These Terms are governed by the laws of <strong>India</strong>.
              </p>
              <p className="text-text/80 leading-relaxed">
                Any disputes shall be subject to the exclusive jurisdiction of courts in India.
              </p>
            </section>

            {/* 15. Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-secondary mb-4">15. Contact Information</h2>
              <p className="text-text/80 mb-4 leading-relaxed">
                For questions or concerns regarding these Terms, contact:
              </p>
              <ul className="space-y-1 text-text/80 leading-relaxed">
                <li>
                  <span className="font-semibold">Email:</span> <a href="mailto:contact@sygil.app" className="underline hover:text-primary transition-colors">contact@sygil.app</a>
                </li>
                <li>
                  <span className="font-semibold">Company:</span> Sygil
                </li>
              </ul>
            </section>

            {/* One-Line Legal Summary */}
            <section className="bg-secondary/10 p-6 rounded-xl border border-secondary/20 mt-8">
              <h2 className="text-lg font-semibold text-secondary mb-2">One-Line Legal Summary</h2>
              <p className="text-text/90 italic leading-relaxed">
                "Sygil is a platform facilitating voluntary creator support with symbolic loyalty acknowledgment, operating on a commission basis."
              </p>
            </section>

          </div>
        </div>
      </div>
      <Footer forceShow={true} />
    </>
  );
}
