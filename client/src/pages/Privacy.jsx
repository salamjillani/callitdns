// client/src/pages/Privacy.jsx
import React from "react";
import Layout from "../components/Layout";
import { Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last updated: January 2025</p>
        </div>

        {/* Content sections continue... */}
      </div>
    </Layout>
  );
}
