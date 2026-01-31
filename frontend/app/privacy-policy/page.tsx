import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - SiegerTech',
  description: 'SiegerTech Privacy Policy. How we collect, use, and protect your data when you use our crypto and gift card trading platform.',
};

export default function PrivacyPolicyPage() {
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
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-400 text-sm mt-1">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                SiegerTech (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the SiegerTech platform for cryptocurrency and gift card trading. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. By using SiegerTech, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-4">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Account information:</strong> Name, email address, password (hashed), and profile details when you register.</li>
                <li><strong className="text-white">Identity and verification (KYC):</strong> Documents and data you provide for identity verification, as required by applicable law.</li>
                <li><strong className="text-white">Financial and transaction data:</strong> Wallet balances, deposit and withdrawal history, trade history, and payment method details.</li>
                <li><strong className="text-white">Usage data:</strong> IP address, browser type, device information, pages visited, and how you interact with our platform.</li>
                <li><strong className="text-white">Communications:</strong> Support tickets, emails, and chat messages you send to us.</li>
              </ul>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our trading platform and services.</li>
                <li>Process transactions, verify identity, and comply with legal and regulatory obligations.</li>
                <li>Improve our platform, prevent fraud, and ensure security.</li>
                <li>Send you service-related notifications, updates, and support responses.</li>
                <li>Analyze usage to improve user experience and develop new features.</li>
                <li>Comply with applicable laws, regulations, and lawful requests from authorities.</li>
              </ul>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">4. Cookies and Similar Technologies</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies (e.g., local storage) to maintain your session, remember your preferences, and analyze traffic. You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our platform.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">5. Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Service providers:</strong> Payment processors, cloud hosting, analytics, and customer support tools, under strict confidentiality agreements.</li>
                <li><strong className="text-white">Regulators and law enforcement:</strong> When required by law or to protect our rights, users, or the public.</li>
                <li><strong className="text-white">Business transfers:</strong> In connection with a merger, sale, or acquisition, subject to the same privacy commitments.</li>
              </ul>
              <p className="leading-relaxed mt-4">We do not sell your personal information to third parties.</p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">6. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures, including encryption (e.g., TLS for data in transit), secure authentication, and access controls. While we strive to protect your data, no method of transmission or storage over the internet is 100% secure. You are responsible for keeping your login credentials and account secure.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">7. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Transaction and compliance-related data may be retained for longer periods as required by law.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">8. Your Rights</h2>
              <p className="leading-relaxed mb-4">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your personal information.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Data portability.</li>
                <li>Withdraw consent where processing is based on consent.</li>
                <li>Lodge a complaint with a supervisory authority.</li>
              </ul>
              <p className="leading-relaxed mt-4">To exercise these rights, contact us via the support or contact details provided on our platform.</p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p className="leading-relaxed">
                Our services are not directed to individuals under the age of 18 (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected such information, please contact us so we can delete it.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">10. International Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We take steps to ensure that such transfers are subject to appropriate safeguards and that your data remains protected in accordance with this Privacy Policy and applicable law.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">11. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date. Your continued use of SiegerTech after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4">12. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us through our <Link href="/support" className="text-blue-400 hover:text-blue-300 underline">Support</Link> page or the contact information provided on our website.
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
