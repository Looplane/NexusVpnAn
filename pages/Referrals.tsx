
import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Gift, Copy, Check, Users, DollarSign, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth, useToast } from '../contexts';
import { apiClient } from '../services/apiClient';
import { ReferralStats, Referral } from '../types';

export const Referrals: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.getReferralStats().then(setStats).catch(() => {});
    apiClient.getReferralList().then(setReferrals).catch(() => {});
  }, []);

  const referralLink = `https://nexusvpn.com/invite/${user?.referralCode || '...'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addToast('success', 'Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Invite Friends, Earn Free Months</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Give your friends 30 days of NexusVPN Pro for free. When they subscribe, you get $10 in credit.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 flex items-center border-l-4 border-l-brand-500">
          <div className="p-4 bg-brand-500/10 rounded-full mr-4"><Users className="text-brand-500" size={28} /></div>
          <div><p className="text-sm text-slate-500">Total Invited</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalInvited || 0}</p></div>
        </Card>
        <Card className="p-6 flex items-center border-l-4 border-l-emerald-500">
          <div className="p-4 bg-emerald-500/10 rounded-full mr-4"><DollarSign className="text-emerald-500" size={28} /></div>
          <div><p className="text-sm text-slate-500">Credits Earned</p><p className="text-2xl font-bold text-slate-900 dark:text-white">${((stats?.totalEarned || 0) / 100).toFixed(2)}</p></div>
        </Card>
        <Card className="p-6 flex items-center border-l-4 border-l-amber-500">
          <div className="p-4 bg-amber-500/10 rounded-full mr-4"><ArrowRight className="text-amber-500" size={28} /></div>
          <div><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.pendingInvites || 0}</p></div>
        </Card>
      </div>

      {/* Link Section */}
      <Card className="p-8 mb-12 bg-slate-900 border-slate-800 text-center">
        <Gift className="mx-auto text-brand-400 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Your Unique Referral Link</h2>
        <p className="text-slate-400 mb-6">Share this link via email, social media, or text.</p>
        
        <div className="flex max-w-lg mx-auto bg-slate-800 rounded-lg p-2 border border-slate-700">
          <input type="text" readOnly value={referralLink} className="bg-transparent border-none text-slate-300 w-full px-4 focus:ring-0" />
          <Button onClick={copyToClipboard} size="sm" className="shrink-0">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
        </div>
      </Card>

      {/* Referral History List */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Referral History</h2>
        <Card className="overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <UserPlus className="mx-auto mb-3 opacity-20" size={48} />
              <p>You haven't invited anyone yet. Get started above!</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {referrals.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">{r.email}</td>
                    <td className="p-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><Badge variant={r.isActive ? 'success' : 'warning'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="p-4"><Badge variant="neutral" className="uppercase">{r.plan}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: '1. Send Invitation', desc: 'Share your unique link with friends or family.' },
                { title: '2. They Join', desc: 'They get a free month of Pro Privacy when they sign up.' },
                { title: '3. You Earn', desc: 'Once they pay their first bill, you get $10 credit.' }
            ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-4xl font-bold text-brand-100 dark:text-slate-800 mb-4 block">{i + 1}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
