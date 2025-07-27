import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Brain, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <section className="text-center py-20 md:py-32">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-white">
          Stop Configuring. <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">Start Calling.</span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-8">
          CallitDNS is the first AI-native DNS provider that predicts threats, prevents downtime, 
          and writes its own records. Tell it your goal, and our AI, Dotty, does the rest.
        </p>
        <Link 
          to="/signup" 
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition transform hover:scale-105 inline-block"
        >
          Get Started for Free
        </Link>
      </section>

      <section className="py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">This isn't just DNS.</h2>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
            It's intelligent infrastructure.
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition">
            <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
              <Brain className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">Dotty AI Command</h4>
            <p className="text-slate-400">
              Describe your goal in plain English and our AI configures the optimal records instantly.
            </p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition">
            <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">AI Health Scan</h4>
            <p className="text-slate-400">
              Automatically detect security gaps like missing email records and performance issues.
            </p>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition">
            <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-xl font-bold mb-2 text-white">One-Click Fixes</h4>
            <p className="text-slate-400">
              When our AI finds an issue, resolve it instantly with a single button click.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}