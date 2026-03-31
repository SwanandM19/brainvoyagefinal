// import type { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
//   title: 'Terms of Service — VidyaSangrah',
//   description:
//     'Read the Terms of Service for VidyaSangrah, including user responsibilities and service policies.',
// };

// export default function TermsOfServicePage() {
//   return (
//     <main className="min-h-screen px-4 py-12">
//       <div className="max-w-3xl mx-auto">
//         <div className="flex items-start justify-between gap-6 mb-8">
//           <div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
//               Terms of Service
//             </h1>
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
//             These Terms of Service govern your use of VidyaSangrah (“we”, “us”, “our”) services.
//             By accessing or using the platform, you agree to these terms.
//           </p>

//           <section className="space-y-6 text-sm sm:text-base text-[#111827]">
//             <div>
//               <h2 className="font-extrabold text-lg mb-2">1. Use of the service</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 You agree to use the service lawfully and not to interfere with the platform.
//                 You are responsible for the content you upload and the activity conducted through
//                 your account.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">2. Acceptable content</h2>
//               <ul className="list-disc pl-5 space-y-2 text-[#374151]">
//                 <li>No illegal, harmful, or infringing content.</li>
//                 <li>Respect intellectual property rights and privacy.</li>
//                 <li>Do not post abusive or inappropriate material.</li>
//               </ul>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">3. Moderation</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 We may review and moderate content to maintain a safe and educational experience.
//                 We may remove content that violates these Terms.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">4. Account security</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 Keep your login credentials secure. Notify us immediately if you suspect unauthorized
//                 access to your account.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">5. Changes to the terms</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 We may update these Terms from time to time. Continued use of the service after
//                 changes means you accept the updated Terms.
//               </p>
//             </div>

//             <div>
//               <h2 className="font-extrabold text-lg mb-2">6. Contact</h2>
//               <p className="text-[#374151] leading-relaxed">
//                 If you have questions, contact us at{' '}
//                 <a
//                   className="text-[#f97316] font-bold hover:underline"
//                   href="mailto:team@servexai.in"
//                 >
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
  title: 'Terms of Service — VidyaSangrah',
  description:
    'Read the Terms of Service for VidyaSangrah, including user responsibilities and service policies.',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827]">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#6B7280]">
              Effective date: 2026-03-31
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
            
            {/* Part A: Terms and Conditions */}
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              These Terms of Service govern your use of VidyaSangrah (“we”, “us”, “our”) services.
              By accessing or using the platform, you agree to these terms.
            </p>

            <h2>Part A: Terms and Conditions</h2>

            <h3>1. Introduction</h3>
            <p>
              Welcome to VidyaSangrah (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). VidyaSangrah is an educational community platform designed to connect teachers and students through shared educational resources, interactive learning materials, and collaborative features.
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website, mobile application, and related services (collectively, the &quot;Platform&quot;). By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and our Privacy Policy.
              If you do not agree to these Terms, you must immediately cease using the Platform.
            </p>

            <h3>2. Definitions</h3>
            <p>For the purposes of these Terms and the Privacy Policy:</p>
            <ul>
              <li><strong>&quot;User&quot;</strong> refers to any individual who accesses or uses the Platform, including Teachers, Students, Parents, and Guardians.</li>
              <li><strong>&quot;Teacher&quot;</strong> refers to a User who uploads, shares, or creates educational content on the Platform.</li>
              <li><strong>&quot;Student&quot;</strong> refers to a User who accesses, consumes, or interacts with educational content on the Platform.</li>
              <li><strong>&quot;Parent/Guardian&quot;</strong> refers to the legal guardian or parent of a minor User (under 18 years of age).</li>
              <li><strong>&quot;Content&quot;</strong> includes videos, study materials, documents, images, assessments, worksheets, interactive tools, and any other educational resources available on or uploaded to the Platform.</li>
              <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable individual as defined under the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;).</li>
              <li><strong>&quot;Child&quot;</strong> or <strong>&quot;Minor&quot;</strong> refers to any individual under 18 years of age as per the DPDP Act, 2023.</li>
              <li><strong>&quot;Data Fiduciary&quot;</strong> refers to VidyaSangrah as the entity determining the purpose and means of processing Personal Data.</li>
              <li><strong>&quot;Data Principal&quot;</strong> refers to the individual (User) to whom the Personal Data relates.</li>
            </ul>

            <h3>3. Acceptance and Amendment of Terms</h3>
            <p>
              By creating an account, browsing the Platform, or using any of our services, you accept these Terms in full. We reserve the right to modify, update, or replace these Terms at any time. Changes will be effective immediately upon posting on the Platform, and continued use constitutes acceptance of the revised Terms.
              We recommend reviewing these Terms periodically.
            </p>

            <h3>4. Eligibility and Age Requirements</h3>
            <p><strong>4.1 General Eligibility</strong></p>
            <ul>
              <li>All Users must be at least 13 years of age to access the Platform independently.</li>
              <li>Users between 13 and 17 years of age are classified as Minors and must use the Platform only with verifiable parental or guardian consent as required under the DPDP Act, 2023.</li>
              <li>Users below 13 years of age are prohibited from creating accounts or using the Platform without explicit parental supervision and consent.</li>
            </ul>
            <p><strong>4.2 Parental/Guardian Consent for Minors (Under 18)</strong></p>
            <p>
              In compliance with Section 9 of the DPDP Act, 2023 and Rule 10 of the DPDP Rules, 2025, VidyaSangrah requires verifiable parental or guardian consent before processing any personal data of a Child.
            </p>
            <p><strong>Verification Mechanisms:</strong></p>
            <p>VidyaSangrah employs one or more of the following methods to verify parental identity and obtain consent:</p>
            <ol>
              <li>OTP-based Verification: A one-time password sent to the Parent/Guardian&apos;s registered mobile number.</li>
              <li>Email Verification with Multi-Factor Authentication: Confirmation via email with secondary authentication.</li>
              <li>Government-Issued ID Verification: Upload of Aadhaar, PAN, Driving License, or Passport to establish identity and relationship.</li>
              <li>DigiLocker Age Token: Use of government-backed digital identity verification (where available).</li>
              <li>Video-Based Verification: Live video confirmation for high-risk or premium services.</li>
              <li>Self-Declaration with Supporting Documents: Declaration of parental relationship accompanied by supporting identity proof.</li>
            </ol>
            <p><strong>Burden of Proof:</strong> VidyaSangrah bears the responsibility of ensuring that the consenting individual is indeed the Parent or lawful Guardian of the Child. The consent obtained must be:</p>
            <ul>
              <li>Free, specific, informed, unconditional, and unambiguous</li>
              <li>Given through clear affirmative action</li>
              <li>Capable of being withdrawn at any time</li>
            </ul>
            <p><strong>Prohibited Activities for Children:</strong></p>
            <p>In compliance with Section 9(3) of the DPDP Act, VidyaSangrah strictly prohibits:</p>
            <ul>
              <li>Tracking or behavioral monitoring of Children</li>
              <li>Targeted advertising directed at Children</li>
              <li>Profiling that may cause harm to the Child</li>
              <li>Any processing likely to cause harm to the well-being of the Child</li>
            </ul>
            <p><strong>4.3 Teacher Eligibility</strong></p>
            <p>Teachers must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, complete, and verifiable information during registration</li>
              <li>Possess appropriate qualifications, credentials, or demonstrated expertise in their subject area (subject to verification by VidyaSangrah at its discretion)</li>
              <li>Comply with all applicable laws and educational standards</li>
            </ul>

            <h3>5. Account Registration and Security</h3>
            <p><strong>5.1 Account Creation</strong></p>
            <p>Users must provide accurate, current, and complete information during registration, including:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Mobile number</li>
              <li>Educational details (for Students: grade, school; for Teachers: qualifications, subjects)</li>
              <li>Parent/Guardian contact details (for Minors)</li>
            </ul>
            <p><strong>5.2 Account Confidentiality and Responsibility</strong></p>
            <p>You are solely responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials (username and password)</li>
              <li>All activities that occur under your account, whether authorized or unauthorized</li>
              <li>Notifying us immediately of any suspected unauthorized access or security breach</li>
            </ul>
            <p>VidyaSangrah will not be liable for any loss or damage arising from your failure to maintain account security.</p>
            <p><strong>5.3 Account Suspension or Termination</strong></p>
            <p>We reserve the right to suspend, restrict, or terminate your account at any time, with or without notice, if:</p>
            <ul>
              <li>You violate these Terms or applicable laws</li>
              <li>Your account is used for fraudulent, harmful, or unlawful activities</li>
              <li>Your Content violates intellectual property rights, contains prohibited material, or harms other Users</li>
              <li>You provide false, misleading, or incomplete information</li>
            </ul>

            <h3>6. Services Provided by VidyaSangrah</h3>
            <p>VidyaSangrah provides the following educational services:</p>
            <ul>
              <li><strong>Content Sharing Platform:</strong> Teachers can upload and share educational videos, documents, worksheets, assessments, and other study materials.</li>
              <li><strong>Student Learning Resources:</strong> Students can access Content, participate in interactive learning activities, and track their progress.</li>
              <li><strong>Community Features:</strong> Discussion forums, Q&amp;A sections, peer collaboration tools, and teacher-student communication channels.</li>
              <li><strong>Premium Features:</strong> Subscription-based access to exclusive Content, advanced analytics, personalized learning paths, and certification programs.</li>
              <li><strong>Assessment Tools:</strong> Quiz creation, grading, progress tracking, and performance analytics.</li>
              <li><strong>Parental Controls:</strong> Tools for Parents/Guardians to monitor and manage their Child&apos;s Platform usage.</li>
            </ul>
            <p>VidyaSangrah reserves the right to modify, suspend, or discontinue any service at any time without prior notice.</p>

            <h3>7. Subscription, Payments, and Refunds</h3>
            <p><strong>7.1 Subscription Plans</strong></p>
            <ul>
              <li>Teachers may be required to subscribe to paid plans to upload, publish, or monetize their Content.</li>
              <li>Students may pay for premium Content, courses, or certification programs.</li>
              <li>Subscription fees, billing cycles, and payment terms are displayed on the Platform and may vary by plan.</li>
            </ul>
            <p><strong>7.2 Payment Terms</strong></p>
            <ul>
              <li>All payments must be made through authorized payment gateways integrated with the Platform.</li>
              <li>By subscribing, you authorize VidyaSangrah to charge the applicable fees to your chosen payment method.</li>
              <li>Prices are subject to change with prior notice. Changes will apply to renewals, not current active subscriptions.</li>
            </ul>
            <p><strong>7.3 Refund Policy</strong></p>
            <ul>
              <li>All payments are generally non-refundable unless:
                <ul>
                  <li>A technical error prevented access to purchased Content or services</li>
                  <li>VidyaSangrah terminates or discontinues a service before the subscription period ends</li>
                  <li>Required by applicable consumer protection laws</li>
                </ul>
              </li>
              <li>Refund requests must be submitted to our Grievance Officer within 7 days of the transaction.</li>
              <li>Decisions on refunds are at the sole discretion of VidyaSangrah and will be processed within 14 business days of approval.</li>
            </ul>

            <h3>8. User Responsibilities and Code of Conduct</h3>
            <p>All Users agree to:</p>
            <ul>
              <li>Use the Platform responsibly, ethically, and in compliance with all applicable laws.</li>
              <li>Provide accurate and truthful information at all times.</li>
              <li>Respect the intellectual property rights, privacy, and dignity of others.</li>
              <li>Not upload, share, or distribute Content that is:
                <ul>
                  <li>Illegal, harmful, obscene, defamatory, or offensive</li>
                  <li>Infringing on third-party intellectual property rights</li>
                  <li>Promoting violence, hatred, discrimination, or harmful conduct</li>
                  <li>Containing malware, viruses, or malicious code</li>
                </ul>
              </li>
              <li>Not engage in cheating, plagiarism, or academic dishonesty.</li>
              <li>Not impersonate any person or entity.</li>
              <li>Not interfere with or disrupt the Platform&apos;s functionality or security.</li>
            </ul>
            <p>Violation of this Code of Conduct may result in immediate account suspension or termination.</p>

            <h3>9. Prohibited Activities</h3>
            <p>Users must not:</p>
            <ul>
              <li>Copy, reproduce, distribute, or create derivative works of Platform Content without explicit written permission.</li>
              <li>Use automated systems (bots, scrapers, crawlers) to access or extract data from the Platform.</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from the Platform.</li>
              <li>Hack, breach, or compromise the security of the Platform or other Users&apos; accounts.</li>
              <li>Engage in fraudulent transactions, money laundering, or financial misconduct.</li>
              <li>Harass, abuse, threaten, or intimidate other Users or staff.</li>
              <li>Upload Content that violates child safety laws, including explicit or inappropriate material involving Minors.</li>
              <li>Use the Platform for unauthorized commercial purposes, spam, or unsolicited advertising.</li>
            </ul>
            <p>VidyaSangrah reserves the right to report illegal activities to law enforcement authorities.</p>

            <h3>10. Intellectual Property Rights</h3>
            <p><strong>10.1 User-Generated Content Ownership</strong></p>
            <ul>
              <li>Teachers retain full ownership and copyright of the original Content they upload to the Platform.</li>
              <li>By uploading Content, Teachers grant VidyaSangrah a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to:
                <ul>
                  <li>Use, reproduce, modify, adapt, display, and distribute the Content on the Platform</li>
                  <li>Promote, market, and showcase the Content in connection with the Platform&apos;s services</li>
                  <li>Create derivative works for technical purposes (e.g., format conversion, optimization)</li>
                </ul>
              </li>
              <li>This license terminates when the Teacher deletes the Content from the Platform, except where Content has been shared or downloaded by Students under permitted use.</li>
            </ul>
            <p><strong>10.2 Platform Ownership</strong></p>
            <p>VidyaSangrah retains exclusive ownership of:</p>
            <ul>
              <li>The Platform&apos;s design, interface, software, algorithms, and source code</li>
              <li>VidyaSangrah branding, logos, trademarks, and service marks</li>
              <li>Aggregated, anonymized, and derivative data generated from Platform usage</li>
            </ul>
            <p>Unauthorized use of VidyaSangrah&apos;s intellectual property is strictly prohibited and may result in legal action.</p>
            <p><strong>10.3 Student Use of Content</strong></p>
            <p>Students may access, view, download, and use Content solely for personal, non-commercial, educational purposes. Students must not:</p>
            <ul>
              <li>Redistribute, resell, or sublicense Content</li>
              <li>Remove copyright notices or attribution</li>
              <li>Use Content for commercial purposes without explicit permission</li>
            </ul>

            <h3>11. Content Moderation and Removal</h3>
            <p>
              VidyaSangrah employs a combination of automated tools and manual review to monitor Content. We reserve the right to:
            </p>
            <ul>
              <li>Remove, restrict, or refuse to publish any Content that violates these Terms, applicable laws, or community guidelines.</li>
              <li>Suspend or terminate accounts associated with prohibited Content.</li>
              <li>Report illegal Content (especially child exploitation material) to the National Crime Records Bureau (NCRB), Cyber Crime Cell, and other authorities.</li>
            </ul>
            <p>VidyaSangrah is not responsible for reviewing all User-generated Content prior to publication but will act promptly on violations brought to our attention.</p>

            <h3>12. Disclaimer of Warranties</h3>
            <p>
              The Platform is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. VidyaSangrah makes no warranties or representations, express or implied, including but not limited to:
            </p>
            <ul>
              <li><strong>Accuracy or Completeness:</strong> We do not guarantee the accuracy, completeness, reliability, or quality of Content uploaded by Teachers.</li>
              <li><strong>Educational Outcomes:</strong> We do not guarantee specific learning outcomes, grades, exam results, or career success resulting from Platform usage.</li>
              <li><strong>Availability:</strong> We do not guarantee uninterrupted, error-free, or secure access to the Platform. Technical issues, maintenance, or third-party failures may cause downtime.</li>
              <li><strong>Third-Party Content:</strong> We are not responsible for Content, links, or services provided by third parties.</li>
            </ul>
            <p>Users acknowledge and accept these limitations when using the Platform.</p>

            <h3>13. Limitation of Liability</h3>
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>VidyaSangrah, its directors, officers, employees, affiliates, and partners shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages arising from:
                <ul>
                  <li>Use or inability to use the Platform</li>
                  <li>Unauthorized access to or alteration of your data</li>
                  <li>Loss of data, revenue, or profits</li>
                  <li>Errors, omissions, or inaccuracies in Content</li>
                  <li>Conduct of other Users or third parties</li>
                </ul>
              </li>
              <li>VidyaSangrah&apos;s total liability for any claim arising from these Terms or Platform use shall not exceed the amount paid by you to VidyaSangrah in the 12 months preceding the claim, or ₹5,000, whichever is lower.</li>
            </ul>
            <p>This limitation applies even if VidyaSangrah has been advised of the possibility of such damages.</p>

            <h3>14. Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold harmless VidyaSangrah, its affiliates, officers, directors, employees, agents, and partners from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees) arising out of or related to:
            </p>
            <ul>
              <li>Your use or misuse of the Platform</li>
              <li>Your violation of these Terms or applicable laws</li>
              <li>Your Content or any claim that your Content infringes third-party rights</li>
              <li>Your violation of the rights of any third party</li>
            </ul>

            <h3>15. Data Breach Notification</h3>
            <p>In compliance with Rule 10 of the DPDP Rules, 2025, VidyaSangrah will:</p>
            <ul>
              <li>Notify the Data Protection Board of India within 72 hours of becoming aware of a data breach that is likely to harm Data Principals.</li>
              <li>Notify affected Users within 7 days of confirming the breach, providing:
                <ul>
                  <li>Nature of the breach</li>
                  <li>Data categories affected</li>
                  <li>Remedial actions taken</li>
                  <li>Steps Users can take to protect themselves</li>
                </ul>
              </li>
              <li>Maintain detailed records of all breaches and responses for regulatory review.</li>
            </ul>

            <h3>16. Termination</h3>
            <p><strong>16.1 Termination by User</strong></p>
            <p>You may terminate your account at any time by:</p>
            <ul>
              <li>Using the account deletion feature within the Platform</li>
              <li>Contacting our Grievance Officer at the email provided below</li>
            </ul>
            <p>Upon termination:</p>
            <ul>
              <li>Your access to the Platform will cease immediately.</li>
              <li>Your Personal Data will be deleted within 48 hours, unless retention is required by law.</li>
              <li>Paid subscriptions are non-refundable except as stated in Section 7.3.</li>
            </ul>
            <p><strong>16.2 Termination by VidyaSangrah</strong></p>
            <p>We reserve the right to suspend or terminate your account immediately, without prior notice, if:</p>
            <ul>
              <li>You violate these Terms</li>
              <li>Your actions harm or threaten other Users or the Platform</li>
              <li>Required by law or legal authority</li>
              <li>Your account remains inactive for more than 24 months (with prior notice)</li>
            </ul>

            <h3>17. Data Retention and Deletion</h3>
            <p>In compliance with the DPDP Act, 2023 and DPDP Rules, 2025:</p>
            <p><strong>17.1 General Retention Policy</strong></p>
            <p>VidyaSangrah retains Personal Data only for as long as necessary to:</p>
            <ul>
              <li>Fulfill the specified purpose for which it was collected</li>
              <li>Comply with legal, regulatory, or contractual obligations</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p><strong>17.2 Specific Retention Periods</strong></p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="border border-gray-200 px-4 py-2 text-left font-bold">Data Type</th><th className="border border-gray-200 px-4 py-2 text-left font-bold">Retention Period</th><th className="border border-gray-200 px-4 py-2 text-left font-bold">Legal Basis</th></tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-200 px-4 py-2">User account and profile data</td><td className="border border-gray-200 px-4 py-2">Until account deletion or 24 months of inactivity</td><td className="border border-gray-200 px-4 py-2">Service provision</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Consent records (including parental consent)</td><td className="border border-gray-200 px-4 py-2">Minimum 7 years</td><td className="border border-gray-200 px-4 py-2">DPDP Act compliance</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Payment and transaction records</td><td className="border border-gray-200 px-4 py-2">5 years from transaction date</td><td className="border border-gray-200 px-4 py-2">Income Tax Act, RBI guidelines</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Content uploaded by Teachers</td><td className="border border-gray-200 px-4 py-2">Until deleted by Teacher or account termination</td><td className="border border-gray-200 px-4 py-2">IP licensing agreement</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Content access logs</td><td className="border border-gray-200 px-4 py-2">1 year</td><td className="border border-gray-200 px-4 py-2">Security and analytics</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Communication records (emails, messages)</td><td className="border border-gray-200 px-4 py-2">3 years</td><td className="border border-gray-200 px-4 py-2">Dispute resolution</td></tr>
                  <tr><td className="border border-gray-200 px-4 py-2">Grievance and complaint records</td><td className="border border-gray-200 px-4 py-2">7 years</td><td className="border border-gray-200 px-4 py-2">Regulatory compliance</td></tr>
                </tbody>
              </table>
            </div>
            <p><strong>17.3 Deletion Process</strong></p>
            <ul>
              <li>Upon consent withdrawal or purpose fulfillment, data will be deleted from live systems within 48 hours (unless legal retention applies).</li>
              <li>Users will receive 48 hours advance notice before data erasure, unless the User requests immediate deletion.</li>
              <li>Data in encrypted, immutable backups may persist until the next backup cycle (maximum 90 days) but will not be accessible or used.</li>
            </ul>

            <h3>18. Governing Law and Jurisdiction</h3>
            <p>These Terms and any disputes arising from them shall be governed by and construed in accordance with the laws of India, including but not limited to:</p>
            <ul>
              <li>Digital Personal Data Protection Act, 2023</li>
              <li>Information Technology Act, 2000</li>
              <li>Indian Contract Act, 1872</li>
              <li>Consumer Protection Act, 2019</li>
            </ul>
            <p><strong>Jurisdiction:</strong> Any disputes, claims, or controversies shall be subject to the exclusive jurisdiction of the courts located in [City, State], India.</p>
            <p><strong>Dispute Resolution:</strong> Before initiating legal proceedings, parties agree to attempt good-faith negotiations and mediation to resolve disputes amicably.</p>

            <h3>19. Grievance Redressal Mechanism</h3>
            <p>In compliance with Rule 9 of the DPDP Rules, 2025, VidyaSangrah has appointed a Grievance Officer to address User complaints and data-related grievances.</p>
            <p><strong>Grievance Officer Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> [Grievance Officer Name]</li>
              <li><strong>Designation:</strong> Grievance Officer, VidyaSangrah</li>
              <li><strong>Email:</strong> grievance@vidyasangrah.app</li>
              <li><strong>Phone:</strong> [Phone Number]</li>
              <li><strong>Address:</strong> [Complete Registered Office Address]</li>
            </ul>
            <p><strong>Grievance Redressal Process:</strong></p>
            <ol>
              <li><strong>Filing a Complaint:</strong> Users may file complaints via email or through the grievance form on the Platform.</li>
              <li><strong>Acknowledgment:</strong> All complaints will be acknowledged within 24-72 hours with a unique tracking number.</li>
              <li><strong>Resolution Timeline:</strong> Grievances will be resolved within 7 working days from the date of receipt, unless exceptional circumstances require an extension (with written justification).</li>
              <li><strong>Denial of Request:</strong> If a request is denied, the User will receive a detailed explanation citing the specific legal basis under the DPDP Act.</li>
              <li><strong>Escalation:</strong> If unsatisfied with the resolution, Users may escalate the matter to the Data Protection Board of India via the official online portal.</li>
            </ol>
            <p><strong>Record-Keeping:</strong> VidyaSangrah maintains detailed logs of all grievances, including dates, actions taken, and outcomes, for a minimum of 7 years.</p>

            <h3>20. Amendments and Updates</h3>
            <p>
              VidyaSangrah reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on the Platform. Material changes will be communicated via:
            </p>
            <ul>
              <li>In-app notifications</li>
              <li>Email to registered Users</li>
              <li>Prominent banner on the Platform homepage</li>
            </ul>
            <p>Continued use of the Platform after changes constitutes acceptance of the revised Terms.</p>

            <h3>21. Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be severed, and the remaining provisions shall continue in full force and effect.
            </p>

            <h3>22. Entire Agreement</h3>
            <p>
              These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and VidyaSangrah regarding the use of the Platform, superseding any prior agreements or understandings.
            </p>

            <h3>23. Contact Information</h3>
            <p>For any questions, concerns, or requests regarding these Terms, please contact us:</p>
            <p>
              <strong>VidyaSangrah</strong><br />
              Email: <a href="mailto:support@vidyasangrah.app">support@vidyasangrah.app</a><br />
              Website: <a href="https://www.vidyasangrah.app" target="_blank" rel="noopener noreferrer">https://www.vidyasangrah.app</a><br />
              Registered Office: [Complete Address]
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}