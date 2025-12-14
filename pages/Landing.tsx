
import React from 'react';
import { Shield, Zap, Globe, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/UI';
import { PLANS } from '../types';

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 text-xs font-medium mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span>Now Available in 20+ Regions</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-500 dark:from-brand-400 dark:to-indigo-400">Digital Life</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Experience the next generation of VPN technology. Blazing fast speeds, military-grade encryption, and zero logs. Powered by WireGuard®.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg group shadow-xl shadow-brand-500/20">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why choose NexusVPN?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">We've built a VPN that we actually want to use. No bloatware, just pure performance and privacy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-amber-500 dark:text-amber-400" />,
                title: "Blazing Fast",
                desc: "Built on WireGuard®, our servers deliver up to 10Gbps speeds with minimal latency."
              },
              {
                icon: <Lock className="h-8 w-8 text-brand-500 dark:text-brand-400" />,
                title: "Bank-Grade Encryption",
                desc: "Your data is secured with state-of-the-art ChaCha20 encryption. Unbreakable security."
              },
              {
                icon: <Globe className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />,
                title: "Global Network",
                desc: "Access content from anywhere. Servers in 20+ countries optimized for streaming."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="bg-slate-100 dark:bg-slate-800/50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
         <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/20 skew-y-3 transform origin-top-left -z-10"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-xl transition-shadow bg-white dark:bg-slate-900">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-300">Starter</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="ml-1 text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Perfect for testing the waters.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  { text: "10GB Monthly Data", included: true },
                  { text: "1 Device", included: true },
                  { text: "3 Server Locations", included: true },
                  { text: "Standard Support", included: true },
                  { text: "Streaming Optimized", included: false },
                ].map((item, i) => (
                   <li key={i} className={`flex items-start ${item.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                    <CheckCircle2 className={`h-5 w-5 mr-3 shrink-0 ${item.included ? 'text-brand-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </Card>

            {/* Basic */}
            <Card className="p-6 md:p-8 border-brand-500/30 bg-white dark:bg-slate-900/80 relative flex flex-col shadow-2xl shadow-brand-500/10 md:transform md:scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-3 py-1 rounded-b-lg text-xs font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-brand-600 dark:text-brand-400">Basic Secure</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$5</span>
                  <span className="ml-1 text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Everything you need for daily security.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                 {[
                  { text: "Unlimited Data", included: true },
                  { text: "5 Devices", included: true },
                  { text: "All Server Locations", included: true },
                  { text: "Priority Support", included: true },
                  { text: "Streaming Optimized", included: true },
                ].map((item, i) => (
                   <li key={i} className="flex items-start text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 mr-3 shrink-0 text-brand-500" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="primary" className="w-full">Choose Basic</Button>
              </Link>
            </Card>

            {/* Pro */}
             <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 flex flex-col hover:shadow-xl transition-shadow bg-white dark:bg-slate-900">
              <div className="mb-8">
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">Pro Privacy</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$10</span>
                  <span className="ml-1 text-slate-500">/mo</span>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">For power users and teams.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                 {[
                  { text: "Unlimited Data", included: true },
                  { text: "10 Devices", included: true },
                  { text: "Dedicated IP Address", included: true },
                  { text: "24/7 Dedicated Support", included: true },
                  { text: "Multi-hop Connections", included: true },
                ].map((item, i) => (
                   <li key={i} className="flex items-start text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 mr-3 shrink-0 text-indigo-500" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full">Choose Pro</Button>
              </Link>
            </Card>
          </div>
         </div>
      </section>
    </div>
  );
};
