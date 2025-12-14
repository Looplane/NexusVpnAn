import React from 'react';
import { Card } from '../components/UI';
import { Smartphone, Monitor, Terminal, HelpCircle, ChevronRight } from 'lucide-react';

export const Help: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How can we help?</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          NexusVPN uses the modern WireGuard® protocol. It's lighter, faster, and easier to set up than older VPNs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Mobile Guide */}
        <Card className="p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-brand-500/10 rounded-xl mr-4">
              <Smartphone className="text-brand-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mobile Setup</h2>
              <p className="text-sm text-slate-500">Android & iOS</p>
            </div>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {[
              { title: "Install App", desc: "Search for 'WireGuard' in the App Store or Play Store." },
              { title: "Generate Config", desc: "Log in to NexusVPN Dashboard and generate a config for your desired location." },
              { title: "Scan QR", desc: "Open WireGuard app, tap (+), and select 'Scan from QR code'." },
              { title: "Connect", desc: "Toggle the switch to activate your secure tunnel." }
            ].map((step, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                  {i + 1}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Desktop Guide */}
        <Card className="p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl mr-4">
              <Monitor className="text-indigo-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Desktop Setup</h2>
              <p className="text-sm text-slate-500">Windows, macOS & Linux</p>
            </div>
          </div>
           <div className="space-y-4">
             <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
               <h3 className="font-semibold text-slate-900 dark:text-white flex items-center">
                 <span className="bg-slate-200 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">1</span>
                 Download Client
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-9">
                 Visit <a href="https://www.wireguard.com/install/" target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">wireguard.com/install</a> and download the official client for your OS.
               </p>
             </div>
             <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
               <h3 className="font-semibold text-slate-900 dark:text-white flex items-center">
                 <span className="bg-slate-200 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">2</span>
                 Get Configuration
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-9">
                 On your Dashboard, click "Generate Configuration" and then "Download .conf File".
               </p>
             </div>
             <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
               <h3 className="font-semibold text-slate-900 dark:text-white flex items-center">
                 <span className="bg-slate-200 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">3</span>
                 Import & Activate
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-9">
                 Open the WireGuard app, click "Import tunnel(s) from file", select your file, and click "Activate".
               </p>
             </div>
           </div>
        </Card>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: "Is WireGuard better than OpenVPN?", a: "Generally, yes. WireGuard is much faster, uses less battery on mobile, and connects instantly." },
            { q: "Do you keep logs?", a: "No. We have a strict no-logs policy. We do not track the websites you visit or your IP address." },
            { q: "Can I use it on multiple devices?", a: "Yes! Depending on your plan, you can connect up to 10 devices simultaneously." },
            { q: "What happens if the connection drops?", a: "The WireGuard protocol handles drops gracefully, often reconnecting before you even notice." }
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start">
                <HelpCircle size={18} className="text-brand-500 mr-2 mt-0.5 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 ml-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};