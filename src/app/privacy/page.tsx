// import type { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
//   title: 'Privacy Policy — VidyaSangrah',
//   description:
//     'Read the Privacy Policy for VidyaSangrah, including how we collect, use, and protect your information.',
// };

// export default function PrivacyPolicyPage() {
//   return (
//     <main className="min-h-screen px-4 py-12">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-start justify-between gap-6 mb-8">
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">Privacy Policy</h1>
//             <p className="mt-2 text-sm font-semibold text-[#6B7280]">
//               Effective date: 2026-03-31
//             </p>
//           </div>
//           <Link
//             href="/"
//             className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#111827] hover:text-[#f97316] hover:border-[#f97316] transition-colors"
//           >
//             Back to Home
//           </Link>
//         </div>

//         <article className="card p-6 sm:p-8">
//           <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
//             This Privacy Policy explains how VidyaSangrah (“we”, “us”, “our”) collects, uses, and
//             protects information when you use our website and services.
//           </p>

//           <section className="space-y-6 text-sm sm:text-base text-[#111827]">
//             <div>
//               <h2 className="font-extrabold text-lg mb-2">1. Information we collect</h2>
//               <ul className="list-disc pl-5 space-y-2 text-[#374151]">
//                 <li>Account details you provide during sign-up (e.g., name, email, role).</li>
//                 <li>Content you upload (videos, photos, and articles) and associated metadata.</li>
//                 <li>Usage information (pages viewed, interactions, and performance metrics).</li>
//                 <li>Device and log information (IP address, browser type, timestamps).</li>
//               </ul>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">2. How we use your information</h2>
//               <ul className="list-disc pl-5 space-y-2 text-[#374151]">
//                 <li>To provide and maintain the platform and core features.</li>
//                 <li>To personalize learning and teaching experiences.</li>
//                 <li>To improve safety through moderation and anti-abuse measures.</li>
//                 <li>To communicate with you about updates, support, and account-related matters.</li>
//               </ul>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">3. Sharing of information</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 We may share information with service providers who help us operate the platform.
//                 We also may disclose information if required by law or to protect our rights and
//                 safety.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">4. Data security</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 We use reasonable administrative, technical, and physical safeguards designed to
//                 protect information. No method of transmission or storage is 100% secure.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">5. Your choices</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 Depending on where you live, you may have rights regarding your personal data.
//                 You can contact us to request access, correction, or deletion where applicable.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">6. Contact us</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 If you have questions about this Privacy Policy, email{' '}
//                 <a className="text-[#f97316] font-bold hover:underline" href="mailto:team@servexai.in">
//                   team@servexai.in
//                 </a>
//                 .
//               </p>
//             </div>
//           </section>
//         </article>
//       </div>
//     </main>
//   );
// }



import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — VidyaSangrah',
  description:
    'Read the Privacy Policy for VidyaSangrah, including how we collect, use, and protect your information in compliance with DPDP Act, 2023.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">Privacy Policy</h1>
            <p className="mt-2 text-sm font-semibold text-[#6B7280]">
              Effective date: 2026-03-31 | Last Updated: March 30, 2026 | Version: 2.0 (DPDP Act Compliant)
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#111827] hover:text-[#f97316] hover:border-[#f97316] transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="prose prose-sm sm:prose-base max-w-none prose-headings:font-extrabold prose-headings:text-[#111827] prose-p:text-[#374151] prose-strong:text-[#111827] prose-li:text-[#374151] prose-a:text-[#f97316] prose-a:no-underline hover:prose-a:underline">
            
            {/* Part B: Privacy Policy */}
            <h2>Part B: Privacy Policy</h2>

            <h3>1. Introduction</h3>
            <p>
              VidyaSangrah (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy and security of your Personal Data. This Privacy Policy explains how we collect, use, store, share, and protect your information in compliance with the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;) and the DPDP Rules, 2025.
              By using the Platform, you consent to the data practices described in this Privacy Policy.
              This Privacy Policy should be read in conjunction with our Terms and Conditions.
            </p>

            <h3>2. Data Fiduciary Information</h3>
            <p>
              VidyaSangrah acts as a Data Fiduciary under the DPDP Act, determining the purpose and means of processing your Personal Data.
            </p>
            <p>
              <strong>Registered Office:</strong><br />
              [Complete Registered Office Address]<br />
              [City, State, PIN Code]
            </p>
            <p>
              <strong>Contact:</strong><br />
              Email: <a href="mailto:privacy@vidyasangrah.app">privacy@vidyasangrah.app</a><br />
              Phone: [Phone Number]
            </p>

            <h3>3. Information We Collect</h3>
            <p>We collect the following categories of Personal Data:</p>
            <p><strong>3.1 Information You Provide Directly</strong></p>
            <ul>
              <li><strong>Account Registration:</strong> Name, email address, mobile number, date of birth, gender, profile picture</li>
              <li><strong>Educational Details:</strong>
                <ul>
                  <li>Students: Grade/class, school name, subjects, learning preferences</li>
                  <li>Teachers: Qualifications, teaching experience, subjects taught, institution affiliation, professional certifications</li>
                </ul>
              </li>
              <li><strong>Parental/Guardian Information:</strong> Name, email, mobile number, relationship to Child (for users under 18)</li>
              <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party payment gateways; we do not store full credit/debit card numbers)</li>
              <li><strong>Content:</strong> Educational materials, videos, documents, comments, forum posts, messages</li>
              <li><strong>Communication:</strong> Emails, support requests, feedback, grievance submissions</li>
            </ul>
            <p><strong>3.2 Information Collected Automatically</strong></p>
            <ul>
              <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on Platform, Content accessed, search queries, click patterns, navigation paths</li>
              <li><strong>Cookies and Tracking Technologies:</strong> Session cookies, persistent cookies, analytics pixels (see Section 7 for details)</li>
              <li><strong>Location Data:</strong> General location derived from IP address (precise geolocation only with explicit consent)</li>
            </ul>
            <p><strong>3.3 Information from Third Parties</strong></p>
            <ul>
              <li><strong>Social Media Login:</strong> If you register via Google, Facebook, or other third-party services, we may collect your name, email, and profile picture as permitted by those platforms.</li>
              <li><strong>Educational Institutions:</strong> With consent, we may receive student enrollment data, grades, or attendance records from schools partnered with VidyaSangrah.</li>
              <li><strong>Payment Processors:</strong> Transaction confirmation and payment status from authorized gateways (e.g., Razorpay, Paytm).</li>
            </ul>

            <h3>4. How We Use Your Information</h3>
            <p>We process Personal Data for the following specified, lawful, and legitimate purposes:</p>
            <p><strong>4.1 Service Provision</strong></p>
            <ul>
              <li>Create and manage User accounts</li>
              <li>Provide access to educational Content, tools, and community features</li>
              <li>Enable Teacher-Student interaction and content sharing</li>
              <li>Process payments and subscriptions</li>
              <li>Deliver customer support and respond to inquiries</li>
            </ul>
            <p><strong>4.2 Platform Improvement</strong></p>
            <ul>
              <li>Analyze usage patterns to improve user experience and Platform functionality</li>
              <li>Develop new features, courses, and educational tools</li>
              <li>Conduct research and analytics (using aggregated, anonymized data)</li>
            </ul>
            <p><strong>4.3 Communication</strong></p>
            <ul>
              <li>Send service-related notifications (e.g., account updates, subscription renewals)</li>
              <li>Provide educational updates, course recommendations, and promotional offers (with consent; opt-out available)</li>
              <li>Respond to grievances, support requests, and feedback</li>
            </ul>
            <p><strong>4.4 Security and Compliance</strong></p>
            <ul>
              <li>Detect and prevent fraud, abuse, security threats, and policy violations</li>
              <li>Enforce Terms and Conditions and community guidelines</li>
              <li>Comply with legal obligations, court orders, and regulatory requirements</li>
              <li>Conduct audits and maintain records for accountability</li>
            </ul>
            <p><strong>4.5 Parental Controls and Child Safety</strong></p>
            <ul>
              <li>Verify parental consent for users under 18</li>
              <li>Enable parental monitoring and control features</li>
              <li>Ensure compliance with child data protection provisions under the DPDP Act</li>
            </ul>
            <p><strong>Purpose Limitation:</strong> We will not process Personal Data for purposes incompatible with those disclosed at the time of collection without obtaining fresh consent.</p>

            <h3>5. Legal Basis for Processing</h3>
            <p>We process Personal Data based on one or more of the following legal grounds:</p>
            <ul>
              <li><strong>Consent:</strong> You have provided explicit, informed, and freely given consent (primary basis for most processing).</li>
              <li><strong>Contract Performance:</strong> Processing is necessary to fulfill our contractual obligations under the Terms and Conditions.</li>
              <li><strong>Legal Obligation:</strong> Processing is required to comply with Indian laws, regulations, or court orders.</li>
              <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate business interests (e.g., fraud prevention, security), provided it does not override your rights and freedoms.</li>
            </ul>
            <p>For Children&apos;s Data: Processing is based exclusively on verifiable parental or guardian consent as mandated by Section 9 of the DPDP Act.</p>

            <h3>6. Data Sharing and Disclosure</h3>
            <p>VidyaSangrah does not sell, rent, or trade your Personal Data to third parties for marketing purposes.</p>
            <p>We may share your information with the following categories of recipients:</p>
            <p><strong>6.1 Service Providers and Processors</strong></p>
            <p>We engage trusted third-party vendors to assist with Platform operations, including:</p>
            <ul>
              <li><strong>Cloud Hosting:</strong> Amazon Web Services (AWS), Google Cloud Platform</li>
              <li><strong>Payment Gateways:</strong> Razorpay, Paytm, PhonePe</li>
              <li><strong>Email and Communication:</strong> SendGrid, Twilio</li>
              <li><strong>Analytics:</strong> Google Analytics, Mixpanel</li>
              <li><strong>Content Delivery Networks (CDNs):</strong> Cloudflare, Akamai</li>
            </ul>
            <p>All service providers are contractually bound to:</p>
            <ul>
              <li>Process data only as per our instructions</li>
              <li>Implement appropriate security measures</li>
              <li>Not use data for their own purposes</li>
              <li>Comply with the DPDP Act and Rules</li>
            </ul>
            <p><strong>6.2 Educational Institutions</strong></p>
            <p>With explicit consent, we may share student performance data, progress reports, and assessment results with schools or educational institutions partnered with VidyaSangrah.</p>
            <p><strong>6.3 Legal and Regulatory Authorities</strong></p>
            <p>We may disclose Personal Data when required by law or in good faith to:</p>
            <ul>
              <li>Comply with legal processes, subpoenas, court orders, or government requests</li>
              <li>Protect the rights, property, or safety of VidyaSangrah, our Users, or the public</li>
              <li>Detect, prevent, or address fraud, security breaches, or illegal activities</li>
              <li>Report child exploitation material to the National Crime Records Bureau (NCRB) and Cyber Crime Cell</li>
            </ul>
            <p><strong>6.4 Business Transfers</strong></p>
            <p>In the event of a merger, acquisition, reorganization, or sale of assets, Personal Data may be transferred to the acquiring entity, subject to the same privacy protections outlined in this Policy. Users will be notified of any such change in ownership.</p>
            <p><strong>6.5 Aggregated and Anonymized Data</strong></p>
            <p>We may share aggregated, anonymized, or de-identified data (which cannot reasonably identify individuals) with:</p>
            <ul>
              <li>Researchers and academic institutions for educational studies</li>
              <li>Business partners for industry analysis</li>
              <li>Public reports and statistics</li>
            </ul>

            <h3>7. Cookies and Tracking Technologies</h3>
            <p>VidyaSangrah uses cookies and similar technologies to enhance user experience, analyze Platform usage, and deliver personalized content.</p>
            <p><strong>7.1 Types of Cookies</strong></p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for Platform functionality (e.g., session management, authentication). These cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Collect data on how Users interact with the Platform (e.g., Google Analytics).</li>
              <li><strong>Preference Cookies:</strong> Remember User settings and preferences.</li>
              <li><strong>Advertising Cookies:</strong> Deliver personalized promotional content (used only with explicit consent; never used for Children).</li>
            </ul>
            <p><strong>7.2 Cookie Management</strong></p>
            <p>You can control cookies through:</p>
            <ul>
              <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies.</li>
              <li><strong>Cookie Consent Manager:</strong> Available on the Platform to manage non-essential cookies.</li>
            </ul>
            <p>Note: Disabling essential cookies may impair Platform functionality.</p>
            <p><strong>7.3 Third-Party Trackers</strong></p>
            <p>Some third-party services (e.g., Google Analytics, YouTube embeds) may set their own cookies. We recommend reviewing their privacy policies:</p>
            <ul>
              <li>Google Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
              <li>YouTube Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a></li>
            </ul>
            <p><strong>Children&apos;s Privacy:</strong> In compliance with Section 9(3) of the DPDP Act, we do not track, monitor, or profile Children for behavioral advertising or profiling purposes.</p>

            <h3>8. Data Security Measures</h3>
            <p>VidyaSangrah implements industry-standard technical and organizational measures to protect Personal Data from unauthorized access, disclosure, alteration, or destruction.</p>
            <p><strong>8.1 Technical Safeguards</strong></p>
            <ul>
              <li><strong>Encryption:</strong> Data in transit is encrypted using TLS 1.3; data at rest is encrypted using AES-256.</li>
              <li><strong>Secure Hosting:</strong> Platform hosted on ISO 27001-certified cloud infrastructure with regular security audits.</li>
              <li><strong>Access Controls:</strong> Role-based access controls (RBAC) ensure only authorized personnel can access sensitive data.</li>
              <li><strong>Firewall and Intrusion Detection:</strong> Advanced firewalls and intrusion detection systems (IDS) monitor and block malicious activity.</li>
              <li><strong>Regular Security Audits:</strong> Third-party penetration testing and vulnerability assessments conducted annually.</li>
            </ul>
            <p><strong>8.2 Organizational Safeguards</strong></p>
            <ul>
              <li><strong>Data Minimization:</strong> We collect only the minimum data necessary for specified purposes.</li>
              <li><strong>Employee Training:</strong> All employees undergo mandatory data protection and privacy training.</li>
              <li><strong>Confidentiality Agreements:</strong> Staff and contractors sign non-disclosure agreements (NDAs).</li>
              <li><strong>Incident Response Plan:</strong> Documented procedures for identifying, containing, and responding to data breaches.</li>
            </ul>
            <p><strong>8.3 Limitations</strong></p>
            <p>No system is completely secure. While we employ robust security measures, we cannot guarantee absolute protection against all cyber threats. Users are responsible for safeguarding their own login credentials and reporting suspicious activity immediately.</p>

            <h3>9. Your Rights as a Data Principal</h3>
            <p>Under the DPDP Act, 2023, you have the following rights regarding your Personal Data:</p>
            <p><strong>9.1 Right to Access</strong></p>
            <p>You may request a copy of the Personal Data we hold about you, including details on how it is being processed.</p>
            <p><strong>9.2 Right to Correction</strong></p>
            <p>You may request correction or updating of inaccurate, incomplete, or outdated Personal Data.</p>
            <p><strong>9.3 Right to Erasure</strong></p>
            <p>You may request deletion of your Personal Data when:</p>
            <ul>
              <li>The purpose for which it was collected has been fulfilled</li>
              <li>You withdraw consent (and there is no other legal basis for processing)</li>
              <li>Processing is no longer necessary or lawful</li>
            </ul>
            <p>Exceptions: We may retain data if required by law (e.g., tax records, legal disputes).</p>
            <p><strong>9.4 Right to Data Portability</strong></p>
            <p>You may request your Personal Data in a structured, commonly used, and machine-readable format (e.g., CSV, JSON) for transfer to another service provider.</p>
            <p><strong>9.5 Right to Withdraw Consent</strong></p>
            <p>You may withdraw consent at any time by:</p>
            <ul>
              <li>Using the account settings on the Platform</li>
              <li>Contacting the Grievance Officer</li>
            </ul>
            <p>Effect of Withdrawal: Withdrawal will not affect the lawfulness of processing conducted prior to withdrawal. However, certain services may no longer be available.</p>
            <p><strong>9.6 Right to Grievance Redressal</strong></p>
            <p>You may file a complaint regarding data processing practices with our Grievance Officer (see Section 19 of Terms and Conditions).</p>
            <p><strong>9.7 Right to Nominate</strong></p>
            <p>You may nominate another individual to exercise your rights in the event of death or incapacity.</p>
            <p><strong>9.8 Exercising Your Rights</strong></p>
            <p>To exercise any of the above rights, contact us at:</p>
            <p>Email: <a href="mailto:privacy@vidyasangrah.app">privacy@vidyasangrah.app</a><br />
            Grievance Officer: <a href="mailto:grievance@vidyasangrah.app">grievance@vidyasangrah.app</a></p>
            <p><strong>Response Timeline:</strong> We will respond to your request within 7 working days. If additional time is needed, we will inform you of the reason and expected timeline.</p>

            <h3>10. Children&apos;s Privacy and Parental Rights</h3>
            <p>VidyaSangrah is committed to protecting the privacy and safety of Children in strict compliance with the DPDP Act, 2023.</p>
            <p><strong>10.1 Age Verification</strong></p>
            <p>We implement age-gating mechanisms at registration to identify users who are Children (under 18). If a User is identified as a Child, verifiable parental consent is mandatory before account activation.</p>
            <p><strong>10.2 Parental Consent Verification</strong></p>
            <p>Parents/Guardians must provide consent using one of the methods outlined in Section 4.2 of the Terms and Conditions. Consent records are maintained for a minimum of 7 years.</p>
            <p><strong>10.3 Parental Rights</strong></p>
            <p>Parents/Guardians of Children have the right to:</p>
            <ul>
              <li><strong>Access:</strong> View all Personal Data collected from their Child.</li>
              <li><strong>Correct:</strong> Request correction of inaccurate information.</li>
              <li><strong>Delete:</strong> Request deletion of their Child&apos;s account and all associated data.</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent at any time, resulting in account termination and data deletion.</li>
              <li><strong>Monitor Usage:</strong> Access parental control dashboards to monitor their Child&apos;s Platform activity, Content consumption, and interactions.</li>
            </ul>
            <p><strong>10.4 Prohibited Processing for Children</strong></p>
            <p>In compliance with Section 9(3) of the DPDP Act, VidyaSangrah strictly prohibits:</p>
            <ul>
              <li><strong>Tracking or Behavioral Monitoring:</strong> We do not track browsing behavior, clicks, or navigation patterns of Children for profiling purposes.</li>
              <li><strong>Targeted Advertising:</strong> Children will not be served personalized or targeted advertisements based on their data.</li>
              <li><strong>Profiling:</strong> We do not create behavioral profiles of Children that may influence decisions affecting them.</li>
              <li><strong>Harmful Processing:</strong> Any processing likely to cause physical, psychological, or emotional harm to Children is prohibited.</li>
            </ul>
            <p><strong>10.5 Data Minimization for Children</strong></p>
            <p>We collect only the minimum Personal Data necessary for educational purposes, such as name, grade, and Content access records.</p>
            <p><strong>10.6 Educational Institution Exemption</strong></p>
            <p>Under Rule 10(2) of the DPDP Rules, 2025, certain educational institutions may process Children&apos;s data without full parental consent verification when necessary for educational, health, or welfare purposes. VidyaSangrah will only invoke this exemption when partnering with schools that meet the regulatory criteria.</p>

            <h3>11. Cross-Border Data Transfers</h3>
            <p>VidyaSangrah primarily stores and processes Personal Data within India using cloud servers located in Indian data centers.</p>
            <p>However, certain service providers (e.g., AWS, Google Cloud) may involve cross-border transfers to servers located outside India.</p>
            <p><strong>Safeguards for International Transfers:</strong></p>
            <ul>
              <li><strong>Standard Contractual Clauses (SCCs):</strong> We ensure third-party processors outside India execute SCCs guaranteeing DPDP Act-level protection.</li>
              <li><strong>Adequacy Determinations:</strong> We transfer data only to countries recognized by the Indian government as providing adequate data protection.</li>
              <li><strong>User Consent:</strong> Where required, we obtain explicit consent for international transfers.</li>
            </ul>
            <p>Under Rule 15 of the DPDP Rules, 2025, offshore processors must comply with Indian data protection standards, including deletion timelines and breach notification requirements.</p>

            <h3>12. Data Retention and Deletion</h3>
            <p>Please refer to Section 17 of the Terms and Conditions for detailed data retention periods and deletion procedures.</p>
            <p><strong>Key Points:</strong></p>
            <ul>
              <li>Personal Data is retained only as long as necessary for the specified purpose or as required by law.</li>
              <li>Users will receive 48 hours advance notice before data erasure (unless immediate deletion is requested).</li>
              <li>Consent records are retained for a minimum of 7 years for regulatory compliance.</li>
              <li>Data in encrypted, immutable backups may persist for up to 90 days but will not be accessible or used.</li>
            </ul>

            <h3>13. Third-Party Links and Services</h3>
            <p>The Platform may contain links to third-party websites, applications, or services (e.g., YouTube, Google Drive, social media platforms).</p>
            <p>VidyaSangrah is not responsible for the privacy practices, content, or security of third-party services. We encourage you to review the privacy policies of any third-party sites you visit.</p>
            <p>Note: Embedded third-party content (e.g., YouTube videos) may set their own cookies and collect data subject to their own privacy policies.</p>

            <h3>14. Marketing and Promotional Communications</h3>
            <p>With your explicit consent, VidyaSangrah may send promotional emails, SMS, or in-app notifications about:</p>
            <ul>
              <li>New courses, Content, and features</li>
              <li>Special offers, discounts, and subscription promotions</li>
              <li>Educational webinars, events, and community activities</li>
            </ul>
            <p><strong>Opt-Out:</strong> You may unsubscribe from marketing communications at any time by:</p>
            <ul>
              <li>Clicking the &quot;Unsubscribe&quot; link in emails</li>
              <li>Updating notification preferences in account settings</li>
              <li>Contacting <a href="mailto:privacy@vidyasangrah.app">privacy@vidyasangrah.app</a></li>
            </ul>
            <p>Note: Even if you opt out of marketing, you will still receive essential service-related communications (e.g., account updates, security alerts, subscription confirmations).</p>
            <p><strong>Children and Marketing:</strong> We do not send promotional or marketing communications to Children (users under 18).</p>

            <h3>15. Changes to This Privacy Policy</h3>
            <p>VidyaSangrah reserves the right to update this Privacy Policy periodically to reflect changes in:</p>
            <ul>
              <li>Legal or regulatory requirements</li>
              <li>Business practices and services</li>
              <li>Technology and security measures</li>
            </ul>
            <p><strong>Notification of Changes:</strong></p>
            <ul>
              <li>Material changes will be communicated via email, in-app notifications, and a prominent banner on the Platform.</li>
              <li>The &quot;Last Updated&quot; date at the top of this Policy will be revised.</li>
              <li>Continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.</li>
            </ul>
            <p>For material changes affecting Children&apos;s data, we will seek fresh parental consent.</p>

            <h3>16. Contact Information and Grievance Officer</h3>
            <p>For any privacy-related questions, concerns, or to exercise your rights, please contact:</p>
            <p><strong>Privacy Team:</strong><br />
            Email: <a href="mailto:privacy@vidyasangrah.app">privacy@vidyasangrah.app</a></p>
            <p><strong>Grievance Officer:</strong><br />
            Name: [Grievance Officer Name]<br />
            Designation: Grievance Officer, VidyaSangrah<br />
            Email: <a href="mailto:grievance@vidyasangrah.app">grievance@vidyasangrah.app</a><br />
            Phone: [Phone Number]<br />
            Address: [Complete Registered Office Address]</p>
            <p><strong>Grievance Redressal Timeline:</strong> Complaints will be acknowledged within 24-72 hours and resolved within 7 working days.</p>
            <p><strong>Escalation:</strong> If you are dissatisfied with our response, you may escalate your complaint to the Data Protection Board of India via their official online portal.</p>

            <h3>17. Compliance with DPDP Act, 2023 and DPDP Rules, 2025</h3>
            <p>This Privacy Policy is designed to ensure full compliance with:</p>
            <ul>
              <li>Digital Personal Data Protection Act, 2023 (Sections 6, 8, 9, 10, 11, 12)</li>
              <li>DPDP Rules, 2025 (Rules 4, 6, 7, 8, 9, 10, 12, 15)</li>
              <li>Information Technology Act, 2000 and IT Rules, 2011</li>
              <li>Consumer Protection Act, 2019</li>
            </ul>
            <p>VidyaSangrah is committed to:</p>
            <ul>
              <li>Upholding the rights of Data Principals</li>
              <li>Implementing robust security and accountability measures</li>
              <li>Maintaining transparency in data processing practices</li>
              <li>Protecting Children&apos;s privacy and safety</li>
              <li>Cooperating with the Data Protection Board of India</li>
            </ul>

            <hr className="my-8" />

            <p><strong>Acknowledgment</strong></p>
            <p>By using the VidyaSangrah Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and Privacy Policy.</p>
            <p>For any questions or concerns, please contact:</p>
            <p>
              <strong>VidyaSangrah</strong><br />
              Email: <a href="mailto:support@vidyasangrah.app">support@vidyasangrah.app</a><br />
              Website: <a href="https://www.vidyasangrah.app" target="_blank" rel="noopener noreferrer">https://www.vidyasangrah.app</a><br />
              Grievance Officer: <a href="mailto:grievance@vidyasangrah.app">grievance@vidyasangrah.app</a>
            </p>

            <p className="text-sm text-[#6B7280] mt-6 pt-4 border-t border-gray-100">
              <strong>Last Updated:</strong> March 30, 2026<br />
              <strong>Version:</strong> 2.0 (DPDP Act Compliant)
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}