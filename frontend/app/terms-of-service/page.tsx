import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - SiegerTech',
  description: 'SiegerTech Terms of Service. Rules and conditions for using our crypto and gift card trading platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
              <p className="text-gray-400 text-sm mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using SiegerTech (&quot;the Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Platform. We may update these Terms from time to time; continued use after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">2. Description of Services</h2>
              <p className="leading-relaxed">
                SiegerTech provides a platform for buying, selling, and trading cryptocurrencies and gift cards. Our services include wallet management, deposit and withdrawal options, trade execution, and related support. We may add, modify, or discontinue features with reasonable notice where practicable.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">3. Eligibility</h2>
              <p className="leading-relaxed">
                You must be at least 18 years of age (or the age of majority in your jurisdiction) and legally permitted to use our services in your country of residence. By using the Platform, you represent that you meet these requirements and that you will not use the Platform for any illegal or unauthorized purpose.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">4. Account Registration and Security</h2>
              <p className="leading-relaxed mb-4">
                To use certain features, you must register an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keeping your login credentials confidential and secure.</li>
                <li>All activity that occurs under your account.</li>
                <li>Notifying us immediately of any unauthorized access or breach.</li>
              </ul>
              <p className="leading-relaxed mt-4">We may suspend or terminate accounts that violate these Terms or that we reasonably believe pose a risk to the Platform or other users.</p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">5. Identity Verification (KYC)</h2>
              <p className="leading-relaxed">
                We may require you to verify your identity (KYC) as required by law or our policies. Failure to complete verification when requested may result in limited access to services or account suspension. You agree to provide accurate documents and information and to keep them updated.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">6. Trading and Transactions</h2>
              <p className="leading-relaxed mb-4">
                When you trade or transact on the Platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for understanding the risks of cryptocurrency and gift card trading, including price volatility and counterparty risk.</li>
                <li>Rates and fees are displayed before you confirm a trade; by confirming, you agree to those terms.</li>
                <li>We do not guarantee the availability of any asset, rate, or payment method at all times.</li>
                <li>Completed trades are final except where otherwise required by law or our policies (e.g., fraud, error).</li>
              </ul>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">7. Fees</h2>
              <p className="leading-relaxed">
                We may charge fees for certain services (e.g., trading, withdrawals). Applicable fees will be disclosed before you complete a transaction. We reserve the right to change fees with reasonable notice. You are responsible for any taxes that may apply to your use of the Platform in your jurisdiction.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">8. Prohibited Conduct</h2>
              <p className="leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any illegal purpose or in violation of any applicable law.</li>
                <li>Engage in fraud, money laundering, or financing of illegal activities.</li>
                <li>Attempt to gain unauthorized access to the Platform, other accounts, or our systems.</li>
                <li>Interfere with or disrupt the Platform or its security.</li>
                <li>Use bots, scrapers, or automated means without our permission.</li>
                <li>Impersonate another person or entity or misrepresent your affiliation.</li>
                <li>Resell or commercially exploit the Platform or its content without our consent.</li>
              </ul>
              <p className="leading-relaxed mt-4">Violation of these rules may result in immediate suspension or termination of your account and reporting to authorities where appropriate.</p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">9. Intellectual Property</h2>
              <p className="leading-relaxed">
                The Platform and its content (including but not limited to software, design, text, graphics, and logos) are owned by SiegerTech or our licensors and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">10. Disclaimers</h2>
              <p className="leading-relaxed">
                THE PLATFORM AND SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES. CRYPTOCURRENCY AND GIFT CARD TRADING INVOLVE SUBSTANTIAL RISK; YOU TRADE AT YOUR OWN RISK.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">11. Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIEGERTECH AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED (100) USD, WHICHEVER IS GREATER. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN SUCH CASES, OUR LIABILITY WILL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">12. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless SiegerTech and its affiliates, officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or related to your use of the Platform, your violation of these Terms, or your violation of any law or the rights of a third party.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">13. Termination</h2>
              <p className="leading-relaxed">
                We may suspend or terminate your account and access to the Platform at any time, with or without cause or notice. You may close your account by contacting support. Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive (including disclaimers, limitation of liability, and indemnification) will survive termination.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">14. Governing Law and Disputes</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SiegerTech operates, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the Platform shall be resolved through binding arbitration or in the courts of that jurisdiction, as applicable.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">15. General</h2>
              <p className="leading-relaxed mb-4">
                These Terms constitute the entire agreement between you and SiegerTech regarding the Platform. If any provision is found unenforceable, the remaining provisions remain in effect. Our failure to enforce any right or provision does not waive that right or provision. You may not assign these Terms without our consent; we may assign them without restriction.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">16. Contact Us</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, please contact us through our <Link href="/support" className="text-blue-400 hover:text-blue-300 underline">Support</Link> page or the contact information provided on our website.
              </p>
            </section>
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/" className="btn-outline inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
