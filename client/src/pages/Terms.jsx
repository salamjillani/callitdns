// client/src/pages/Terms.jsx
import React from "react";
import Layout from "../components/Layout";
import {
  FileText,
  Scale,
  AlertCircle,
  Ban,
  DollarSign,
  Shield,
} from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <FileText className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-400">Effective Date: January 1, 2025</p>
        </div>
        {/* Terms content... */}
      </div>
    </Layout>
  );
}
