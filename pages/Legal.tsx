
import React from 'react';
import { useParams } from 'react-router-dom';

const PrivacyContent = () => (
    <div className="prose dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="lead">At NexusVPN, your privacy is our core mission. We do not collect, store, or sell your data.</p>
        <h3>1. Data We Do Not Collect</h3>
        <p>We strictly do not log traffic data, DNS queries, or IP addresses of your connection history.</p>
        <h3>2. Data We Collect</h3>
        <p>We only collect minimal data required to operate the service: Email address (for account management) and Payment data (handled by Stripe).</p>
        <h3>3. Data Retention</h3>
        <p>If you delete your account, your email and account details are permanently scrubbed from our active databases immediately.</p>
    </div>
);

const TermsContent = () => (
    <div className="prose dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <h3>1. Acceptance</h3>
        <p>By using NexusVPN, you agree to these terms. If you do not agree, do not use our services.</p>
        <h3>2. Acceptable Use</h3>
        <p>You may not use NexusVPN for illegal activities, including but not limited to hacking, spamming, or distributing malware. We reserve the right to terminate accounts found in violation.</p>
        <h3>3. Refunds</h3>
        <p>We offer a 30-day money-back guarantee. Contact support for a full refund if you are not satisfied.</p>
    </div>
);

export const Legal: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {type === 'privacy' ? <PrivacyContent /> : <TermsContent />}
            </div>
        </div>
    );
};
