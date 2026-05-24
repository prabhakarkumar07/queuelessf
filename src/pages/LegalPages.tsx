import { SEOHead } from './landing/SEOHead';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function LegalLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead title={`${title} — QueueLess`} description={subtitle} canonicalUrl={`https://queueless.in`} />
      {/* Nav bar */}
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="QueueLess" className="h-7 w-7 rounded object-cover" />
            <span className="text-[14px] font-bold tracking-tight text-slate-900">QueueLess</span>
          </Link>
          <span className="text-slate-300">•</span>
          <span className="text-[13px] text-slate-500">{title}</span>
        </div>
      </div>
      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-slate-500 text-[15px]">{subtitle}</p>
        <div className="mt-10 prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          {children}
        </div>
      </div>
      {/* Footer note */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-6 mt-12">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-400">© {new Date().getFullYear()} QueueLess. All rights reserved.</p>
          <div className="flex gap-4 text-[12px] text-slate-500">
            <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-700">Terms</Link>
            <Link to="/contact" className="hover:text-slate-700">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT ──────────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <LegalLayout
      title="About QueueLess"
      subtitle="We're on a mission to make waiting in line a thing of the past for businesses and customers across India."
    >
      <section>
        <h2>Our Story</h2>
        <p>
          QueueLess was started in 2023 by a small team frustrated by the same problem: walking into a clinic, bank, or government office and being handed a crumpled paper slip — then waiting for 90 minutes with no idea when your turn was coming.
        </p>
        <p>
          We believed customers deserved better, and that shop owners deserved tools that actually worked — not complex enterprise software that cost a fortune to set up, but something they could get running in five minutes.
        </p>
      </section>

      <section>
        <h2>What We Build</h2>
        <p>
          QueueLess is a digital queue and appointment management platform built specifically for walk-in service businesses. Today it's used by clinics, salons, banks, government offices, and retail service centres.
        </p>
        <p>
          The platform has three key surfaces:
        </p>
        <ul>
          <li><strong>Owner Dashboard</strong> — Manage your queue, call the next token, pause during breaks, and view daily analytics from any device.</li>
          <li><strong>Customer App</strong> — Scan a QR code or search nearby shops, get a digital token, track your position in real time, and receive a notification when it's your turn.</li>
          <li><strong>TV Display</strong> — A clean full-screen display for your waiting area that shows "Now Serving" and the upcoming queue — without any setup headache.</li>
        </ul>
      </section>

      <section>
        <h2>Our Values</h2>
        <ul>
          <li><strong>Simplicity first.</strong> If a shop owner can't figure it out in five minutes, we've failed.</li>
          <li><strong>Reliability over features.</strong> A system that's down during peak hours helps nobody. We obsess over uptime and performance.</li>
          <li><strong>Respect for everyone's time.</strong> Customers and staff both deserve systems that work as fast as they do.</li>
          <li><strong>Built for India.</strong> Designed for the realities of Indian businesses — unreliable connectivity, multi-language customers, paper-first staff, and walk-in culture.</li>
        </ul>
      </section>

      <section>
        <h2>Get in Touch</h2>
        <p>
          Have a question or want to explore a partnership? <Link to="/contact">Reach out to our team</Link>. We read every message.
        </p>
      </section>
    </LegalLayout>
  );
}

// ─── PRIVACY POLICY ─────────────────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Last updated: 1 May 2025. This policy explains what information we collect, why we collect it, and how you can control it."
    >
      <section>
        <h2>1. Who We Are</h2>
        <p>
          QueueLess ("we", "our", "us") is a digital queue management platform operated by QueueLess Technologies Pvt. Ltd., incorporated in India. Our registered office is in Bangalore, Karnataka, India.
        </p>
        <p>
          If you have any questions about this policy, contact us at <a href="mailto:privacy@queueless.in">privacy@queueless.in</a>.
        </p>
      </section>

      <section>
        <h2>2. What Information We Collect</h2>
        <h3>Account Information</h3>
        <p>When you register, we collect your name, mobile number, and optionally your email address. Shop owners additionally provide their business name, address, and category.</p>

        <h3>Usage Data</h3>
        <p>We collect information about how you interact with the platform — which features you use, when tokens are issued, queue wait times, and similar operational data. This is used to improve the product and provide analytics to shop owners.</p>

        <h3>Location Data</h3>
        <p>If you use the "Find nearby shops" feature, we request your device location. This is used only to surface relevant shops and is not stored beyond your active session unless you explicitly save a favourite shop.</p>

        <h3>Device Information</h3>
        <p>We automatically collect basic device and browser information (browser type, OS version, screen resolution) for debugging and compatibility purposes.</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To operate the platform and provide the queue management service</li>
          <li>To send queue position updates, call notifications, and appointment reminders</li>
          <li>To generate anonymised analytics for shop owners (e.g. peak hours, average wait time)</li>
          <li>To detect and prevent fraud or abuse</li>
          <li>To respond to support requests</li>
          <li>To comply with legal obligations under Indian law</li>
        </ul>
        <p>We do not sell your personal data. We do not use it to train AI models. We do not share it with third-party advertisers.</p>
      </section>

      <section>
        <h2>4. Data Sharing</h2>
        <p>We share data only in the following circumstances:</p>
        <ul>
          <li><strong>With the shop you visit</strong> — The shop owner can see your name, token number, and waiting status. They cannot see your contact details unless you explicitly provided them during booking.</li>
          <li><strong>With service providers</strong> — We use third-party providers for SMS delivery (e.g. MSG91), cloud hosting (AWS), and email (Amazon SES). These providers process data only on our behalf and under strict data processing agreements.</li>
          <li><strong>When required by law</strong> — If required by a valid court order, Indian government authority, or applicable law.</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>We retain account data for as long as your account is active. If you delete your account, we anonymise your personal identifiers within 30 days. Operational queue data (token records) is retained for 12 months for analytics purposes, after which it is aggregated and personal details removed.</p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your account and personal data</li>
          <li>Download your data in a machine-readable format</li>
          <li>Opt out of non-essential communications</li>
        </ul>
        <p>To exercise any of these rights, email <a href="mailto:privacy@queueless.in">privacy@queueless.in</a> or use the Account Deletion option in your profile settings.</p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>We use industry-standard security practices including HTTPS/TLS encryption for all data in transit, bcrypt password hashing, JWT-based authentication with short expiry windows, and role-based access control. Our infrastructure is hosted on AWS with automated backups and monitoring.</p>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>We use only essential session cookies required for authentication. We do not use tracking cookies or third-party advertising cookies. You can disable cookies in your browser, but the platform will not function correctly without session cookies.</p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>QueueLess is not intended for use by anyone under the age of 13. If you believe a child has created an account, please contact us at <a href="mailto:privacy@queueless.in">privacy@queueless.in</a>.</p>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We'll notify registered users by email or in-app notification when we make material changes. Continued use of the platform after notification constitutes acceptance of the revised policy.</p>
      </section>
    </LegalLayout>
  );
}

// ─── TERMS OF SERVICE ────────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Last updated: 1 May 2025. By using QueueLess, you agree to these terms."
    >
      <section>
        <h2>1. Acceptance</h2>
        <p>These Terms of Service ("Terms") govern your use of the QueueLess platform, operated by QueueLess Technologies Pvt. Ltd. ("QueueLess", "we", "us"). By creating an account or using the service, you agree to these Terms in full.</p>
        <p>If you are using QueueLess on behalf of a business, you represent that you have authority to bind that business to these Terms.</p>
      </section>

      <section>
        <h2>2. Services Provided</h2>
        <p>QueueLess provides a digital queue and appointment management platform. This includes:</p>
        <ul>
          <li>Digital token issuance and management</li>
          <li>Real-time queue tracking via WebSocket</li>
          <li>Appointment booking with optional payment</li>
          <li>Customer notification via SMS and push alerts</li>
          <li>Analytics and reporting for shop owners</li>
          <li>TV display mode for waiting areas</li>
          <li>Staff management and multi-branch support</li>
        </ul>
      </section>

      <section>
        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the security of your account credentials</li>
          <li>All activity that occurs under your account</li>
          <li>Ensuring that information you provide is accurate and kept up to date</li>
          <li>Not sharing your account with others or using automated tools to access the service</li>
        </ul>
        <p>Notify us immediately at <a href="mailto:support@queueless.in">support@queueless.in</a> if you suspect unauthorised access to your account.</p>
      </section>

      <section>
        <h2>4. Shop Owner Responsibilities</h2>
        <p>If you register a shop on QueueLess, you agree to:</p>
        <ul>
          <li>Provide accurate business information including address, operating hours, and category</li>
          <li>Manage your queue in good faith — calling tokens promptly and not artificially inflating wait times</li>
          <li>Not use the platform to deceive or defraud customers</li>
          <li>Comply with all applicable local laws including consumer protection regulations</li>
          <li>Handle customer data you receive through the platform in accordance with applicable privacy laws</li>
        </ul>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You may not use QueueLess to:</p>
        <ul>
          <li>Impersonate another person or business</li>
          <li>Transmit spam, malware, or malicious content</li>
          <li>Attempt to gain unauthorised access to the platform or other users' data</li>
          <li>Reverse-engineer, decompile, or create derivative works based on the service</li>
          <li>Use the platform for any unlawful purpose</li>
        </ul>
        <p>Violations may result in immediate account suspension without refund.</p>
      </section>

      <section>
        <h2>6. Subscription and Payment</h2>
        <p>QueueLess offers a free single-branch plan and paid plans for additional features. Paid subscriptions are billed monthly or annually as selected at checkout. Payments are processed via Razorpay. By subscribing, you authorise us to charge your payment method on the billing cycle selected.</p>
        <p>Downgrading or cancelling your subscription takes effect at the end of the current billing period. We do not provide pro-rated refunds for unused subscription time except as required by applicable law.</p>
        <p>See our <Link to="/refund">Refund Policy</Link> for full details.</p>
      </section>

      <section>
        <h2>7. Intellectual Property</h2>
        <p>QueueLess and all associated software, designs, and content are the exclusive property of QueueLess Technologies Pvt. Ltd. You receive a limited, non-exclusive, non-transferable licence to use the platform during the term of your subscription.</p>
        <p>Content you submit (e.g. your shop name, logo, service descriptions) remains yours. By submitting it, you grant QueueLess a licence to display it as part of the service.</p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, QueueLess shall not be liable for indirect, incidental, or consequential damages including lost revenue, lost data, or business interruption, even if advised of the possibility of such damages.</p>
        <p>Our total liability to you for any claim arising out of the service shall not exceed the amount you paid to us in the 3 months preceding the claim.</p>
      </section>

      <section>
        <h2>9. Termination</h2>
        <p>We may suspend or terminate your account if you breach these Terms, if required by law, or if we discontinue the service. You may delete your account at any time from Profile Settings.</p>
      </section>

      <section>
        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>For questions about these Terms, contact <a href="mailto:legal@queueless.in">legal@queueless.in</a>.</p>
      </section>
    </LegalLayout>
  );
}

// ─── REFUND POLICY ──────────────────────────────────────────────────────────
export function RefundPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="Last updated: 1 May 2025. Our commitment to fair and transparent billing."
    >
      <section>
        <h2>Subscription Cancellation</h2>
        <p>
          You may cancel your QueueLess subscription at any time from your account's <strong>Subscription</strong> settings page. Cancellation takes effect at the end of your current billing period. You will continue to have access to paid features until the period ends.
        </p>
        <p>
          We do not offer pro-rated refunds for the unused portion of a billing period except in the circumstances described below.
        </p>
      </section>

      <section>
        <h2>Refund Eligibility</h2>
        <p>We will issue a full refund in the following circumstances:</p>
        <ul>
          <li><strong>Service outage</strong> — If QueueLess was unavailable for more than 4 cumulative hours in a single billing month due to causes within our control, you may request a credit or partial refund for that month.</li>
          <li><strong>Duplicate charge</strong> — If you were charged more than once for the same subscription period, contact us and we will refund the duplicate immediately.</li>
          <li><strong>Charge after cancellation</strong> — If you were charged after a valid cancellation was processed, you will receive a full refund for that charge.</li>
          <li><strong>New subscription, first 7 days</strong> — If you signed up for a paid plan and are not satisfied within 7 days of your first payment, contact us and we will issue a full refund, no questions asked.</li>
        </ul>
      </section>

      <section>
        <h2>Non-Refundable Situations</h2>
        <ul>
          <li>Refunds are not issued for subscription periods that have already ended</li>
          <li>Refunds are not issued if your account was suspended due to a Terms of Service violation</li>
          <li>Refunds are not issued for annual plans after the 7-day new subscriber window, except in the outage or duplicate-charge scenarios above</li>
          <li>Setup fees (if any) are non-refundable</li>
        </ul>
      </section>

      <section>
        <h2>Appointment Payment Refunds</h2>
        <p>
          If a customer books an appointment through QueueLess and pays online, refund eligibility is determined by the individual shop's cancellation policy. QueueLess facilitates the payment but is not a party to the service transaction between the customer and the shop.
        </p>
        <p>
          If a shop fails to honour a confirmed, paid appointment, contact us at <a href="mailto:support@queueless.in">support@queueless.in</a> and we will investigate and mediate where possible.
        </p>
      </section>

      <section>
        <h2>How to Request a Refund</h2>
        <p>To request a refund, email <a href="mailto:billing@queueless.in">billing@queueless.in</a> with:</p>
        <ul>
          <li>Your registered email address or phone number</li>
          <li>The amount and date of the charge</li>
          <li>The reason for the refund request</li>
        </ul>
        <p>We respond to refund requests within 3 business days. Approved refunds are processed within 5–10 business days and returned to your original payment method.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>For billing enquiries: <a href="mailto:billing@queueless.in">billing@queueless.in</a></p>
      </section>
    </LegalLayout>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, Clock } from 'lucide-react';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', category: 'general' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (resp.ok || resp.status === 201) {
        setSent(true);
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
      } else {
        throw new Error('API error');
      }
    } catch {
      // Graceful fallback — open mailto
      const mailto = `mailto:support@queueless.in?subject=${encodeURIComponent(form.subject || 'Contact from website')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
      window.location.href = mailto;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LegalLayout
      title="Contact Us"
      subtitle="Have a question, need help, or want to explore a partnership? We'd love to hear from you."
    >
      <div className="not-prose grid gap-8 lg:grid-cols-3 mt-2">
        {/* Contact info */}
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <Mail className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900">Email support</p>
                <a href="mailto:support@queueless.in" className="text-[13px] text-blue-600 hover:underline">support@queueless.in</a>
                <p className="mt-1 text-[11px] text-slate-500">For product help and technical issues</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <MessageSquare className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900">Sales & partnerships</p>
                <a href="mailto:hello@queueless.in" className="text-[13px] text-blue-600 hover:underline">hello@queueless.in</a>
                <p className="mt-1 text-[11px] text-slate-500">Enterprise, resellers, and integrations</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white">
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900">Response time</p>
                <p className="text-[13px] text-slate-700">Within 24 hours</p>
                <p className="mt-1 text-[11px] text-slate-500">Monday–Saturday, 9 AM–6 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Message sent!</h3>
              <p className="mt-2 text-[14px] text-emerald-700">We've received your message and will get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '', category: 'general' }); }} className="mt-6 rounded-lg border border-emerald-300 bg-white px-5 py-2 text-[13px] font-semibold text-emerald-700 hover:bg-emerald-50">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Your name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="rahul@example.com" required className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="general">General enquiry</option>
                  <option value="technical">Technical support</option>
                  <option value="billing">Billing & subscription</option>
                  <option value="partnership">Partnership / sales</option>
                  <option value="feedback">Product feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Subject</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of your enquiry" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us how we can help..." required rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors">
                {submitting ? 'Sending…' : 'Send message'}
                <Mail className="h-4 w-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                We'll respond to your registered email within 24 hours. For urgent technical issues, please include your shop ID or account phone number.
              </p>
            </form>
          )}
        </div>
      </div>
    </LegalLayout>
  );
}

// ─── BLOG ────────────────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    title: 'Why paper token books are costing your clinic money',
    date: 'April 18, 2025',
    category: 'Operations',
    excerpt: 'Every day, clinics across India lose 20–30% of their patient capacity to no-shows and disorganised queues. We break down the math and show how digital queue management changes the equation.',
    readTime: '5 min read',
  },
  {
    title: 'The staff efficiency formula: serving more customers without hiring more people',
    date: 'March 29, 2025',
    category: 'Productivity',
    excerpt: 'Most service businesses don\'t need more staff — they need better coordination. Here\'s how automated queue routing and real-time dashboards help your existing team do more.',
    readTime: '7 min read',
  },
  {
    title: 'How a Bangalore salon reduced no-shows by 40% in one month',
    date: 'March 5, 2025',
    category: 'Case Study',
    excerpt: 'A look at how Priya\'s Salon in Koramangala deployed QueueLess and what they learned in the first 30 days — including what worked, what didn\'t, and what they\'d do differently.',
    readTime: '6 min read',
  },
  {
    title: 'Building for India: why queue management software needs to work offline',
    date: 'February 14, 2025',
    category: 'Engineering',
    excerpt: 'Internet connectivity in Indian businesses is inconsistent. Here\'s how we designed QueueLess to degrade gracefully when connectivity drops — and why most SaaS tools get this wrong.',
    readTime: '8 min read',
  },
];

export function BlogPage() {
  return (
    <LegalLayout
      title="Blog"
      subtitle="Practical guides, case studies, and product updates for businesses managing walk-in customer flow."
    >
      <div className="not-prose space-y-6">
        {BLOG_POSTS.map((post) => (
          <article key={post.title} className="group rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{post.category}</span>
              <span className="text-[12px] text-slate-400">{post.date}</span>
              <span className="text-[12px] text-slate-400">·</span>
              <span className="text-[12px] text-slate-400">{post.readTime}</span>
            </div>
            <h2 className="text-[17px] font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{post.title}</h2>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed">{post.excerpt}</p>
            <p className="mt-3 text-[13px] font-semibold text-blue-600">Read article →</p>
          </article>
        ))}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
          <p className="text-[14px] font-semibold text-slate-700">More articles coming soon</p>
          <p className="mt-1 text-[13px] text-slate-500">Subscribe to get notified when we publish new guides and case studies.</p>
          <div className="mx-auto mt-4 flex max-w-sm gap-2">
            <input type="email" placeholder="your@email.com" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-slate-800">Subscribe</button>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}

// ─── CAREERS ──────────────────────────────────────────────────────────────────
const OPEN_ROLES = [
  { title: 'Full-Stack Engineer (Spring Boot + React)', team: 'Engineering', location: 'Bangalore / Remote', type: 'Full-time' },
  { title: 'Product Designer (0→1 SaaS experience)', team: 'Design', location: 'Bangalore / Remote', type: 'Full-time' },
  { title: 'Growth & Partnerships Manager', team: 'Business', location: 'Bangalore', type: 'Full-time' },
  { title: 'Customer Success Specialist', team: 'Support', location: 'Remote (India)', type: 'Full-time' },
];

export function CareersPage() {
  return (
    <LegalLayout
      title="Careers at QueueLess"
      subtitle="We're a small team building something genuinely useful. If that sounds good to you, we'd love to talk."
    >
      <section>
        <h2>Why QueueLess</h2>
        <p>
          We're a lean team of engineers, designers, and business builders who are genuinely passionate about making waiting in line feel like a problem from the past. We move fast, ship frequently, and care deeply about the businesses that rely on our product every day.
        </p>
        <p>
          We're not the right fit for everyone. We don't have unlimited vacation days or a Ping-Pong table. What we do have is a real product with real customers, a codebase you'll actually be proud of, and the kind of team where your decisions matter.
        </p>
      </section>

      <div className="not-prose mt-8 space-y-4">
        <h2 className="text-[18px] font-bold text-slate-900">Open Roles</h2>
        {OPEN_ROLES.map((role) => (
          <div key={role.title} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[15px] font-bold text-slate-900">{role.title}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{role.team}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{role.location}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{role.type}</span>
              </div>
            </div>
            <a
              href={`mailto:careers@queueless.in?subject=Application: ${encodeURIComponent(role.title)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Apply →
            </a>
          </div>
        ))}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center mt-6">
          <p className="text-[14px] font-semibold text-slate-700">Don't see a role that fits?</p>
          <p className="mt-1 text-[13px] text-slate-500">Send your CV and a short note about what you'd bring to <a href="mailto:careers@queueless.in" className="text-blue-600 hover:underline">careers@queueless.in</a>. We keep great candidates on file.</p>
        </div>
      </div>
    </LegalLayout>
  );
}
