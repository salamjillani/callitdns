// client/src/pages/Cancellation.jsx
import React from "react";
import Layout from "../components/Layout";
import {
  XCircle,
  Calendar,
  Download,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

export default function Cancellation() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <XCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cancellation Policy
          </h1>
          <p className="text-slate-400">We're sorry to see you go</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              How to Cancel
            </h2>
            <p className="text-slate-300 mb-4">
              You can cancel your CallitDNS subscription at any time through
              your account dashboard:
            </p>
            <ol className="list-decimal list-inside text-slate-300 space-y-2">
              <li>Log in to your CallitDNS dashboard</li>
              <li>Navigate to the Subscription section</li>
              <li>Click "Manage Subscription"</li>
              <li>Select "Cancel Subscription"</li>
              <li>Follow the prompts to confirm cancellation</li>
            </ol>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-semibold text-white">
                When Cancellation Takes Effect
              </h2>
            </div>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>
                Your subscription remains active until the end of your current
                billing period
              </li>
              <li>
                You retain access to all paid features until the period ends
              </li>
              <li>No further charges will be made after the current period</li>
              <li>
                You can reactivate your subscription at any time before the
                period ends
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Download className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-semibold text-white">
                Data Retention
              </h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>After cancellation:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>30 days:</strong> Your DNS records remain active and
                  accessible
                </li>
                <li>
                  <strong>60 days:</strong> Your account data is archived but
                  recoverable
                </li>
                <li>
                  <strong>90 days:</strong> All data is permanently deleted
                </li>
              </ul>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-4">
                <p className="text-amber-400">
                  <strong>Important:</strong> Export your DNS records before
                  cancellation to avoid data loss.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-semibold text-white">
                Refund Policy
              </h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>We offer refunds under the following conditions:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>First-time subscribers:</strong> 30-day money-back
                  guarantee
                </li>
                <li>
                  <strong>Annual plans:</strong> Pro-rated refund within first
                  30 days
                </li>
                <li>
                  <strong>Technical issues:</strong> Full refund if we cannot
                  resolve service problems
                </li>
                <li>
                  <strong>Billing errors:</strong> Full refund for any
                  overcharges
                </li>
              </ul>
              <p className="mt-4">
                To request a refund, contact our support team at{" "}
                <a
                  href="mailto:billing@callitdns.com"
                  className="text-amber-400 hover:text-amber-300"
                >
                  billing@callitdns.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-semibold text-white">
                Before You Cancel
              </h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>Please consider:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Downgrading to a lower tier instead of canceling</li>
                <li>Pausing your subscription if you need a temporary break</li>
                <li>Contacting support if you're experiencing issues</li>
              </ul>
              <div className="mt-6 p-6 bg-slate-800/50 rounded-lg">
                <h3 className="font-semibold text-white mb-3">Need Help?</h3>
                <p className="mb-4">
                  Our team is here to help resolve any issues you're
                  experiencing.
                </p>
                <div className="flex gap-4">
                  <a
                    href="/contact?type=support"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-lg transition"
                  >
                    Contact Support
                  </a>
                  <a
                    href="tel:703-831-7181"
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-lg transition"
                  >
                    Call Us
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-700 pt-8">
            <p className="text-slate-400 text-sm">
              This cancellation policy is part of our Terms of Service. For
              questions, contact{" "}
              <a
                href="mailto:hello@callitdns.com"
                className="text-amber-400 hover:text-amber-300"
              >
                hello@callitdns.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:703-831-7181"
                className="text-amber-400 hover:text-amber-300"
              >
                703-831-7181
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
