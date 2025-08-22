// client/src/pages/Features.jsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  Brain,
  Shield,
  Zap,
  Play,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function Features() {
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = [
    {
      id: "signup",
      title: "How to Sign Up and Add a Domain",
      duration: "2:30",
      thumbnail: "/video-thumb-1.jpg",
    },
    {
      id: "dotty",
      title: "Using Dotty AI Commands",
      duration: "3:15",
      thumbnail: "/video-thumb-2.jpg",
    },
    {
      id: "scan",
      title: "Running an AI Health Scan",
      duration: "2:45",
      thumbnail: "/video-thumb-3.jpg",
    },
  ];

  return (
    <Layout>
      <div className="py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful AI Features for Modern DNS
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Experience the future of DNS management with our AI-powered tools
          </p>
        </div>

        {/* Core AI Features */}
        <section id="dotty-ai" className="mb-20">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-amber-400" />
                  <h2 className="text-3xl font-bold text-white">
                    Dotty AI Command
                  </h2>
                </div>
                <p className="text-lg text-slate-300 mb-6">
                  Our revolutionary AI assistant understands natural language
                  commands and automatically configures your DNS records
                  perfectly every time.
                </p>
                <ul className="space-y-3">
                  {[
                    "Natural language processing",
                    "Intelligent record generation",
                    "Automatic optimization",
                    "Multi-provider support",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-slate-300"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="font-mono text-sm">
                  <p className="text-green-400">// Example Dotty Commands:</p>
                  <p className="text-slate-300 mt-2">
                    "Set up email for Gmail"
                  </p>
                  <p className="text-slate-300">"Point to Vercel deployment"</p>
                  <p className="text-slate-300">"Add subdomain for blog"</p>
                  <p className="text-slate-300">"Enable DNSSEC"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Health Scan Feature */}
        <section id="health-scan" className="mb-20">
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-2xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">
                    Issues Detected:
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                      <div>
                        <p className="text-white font-medium">
                          Missing SPF Record
                        </p>
                        <p className="text-slate-400 text-sm">
                          Email spoofing vulnerability detected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-2"></div>
                      <div>
                        <p className="text-white font-medium">
                          No DMARC Policy
                        </p>
                        <p className="text-slate-400 text-sm">
                          Email authentication incomplete
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-amber-400" />
                  <h2 className="text-3xl font-bold text-white">
                    AI Health Scan
                  </h2>
                </div>
                <p className="text-lg text-slate-300 mb-6">
                  Our AI continuously monitors your DNS configuration for
                  security vulnerabilities, performance issues, and best
                  practice violations.
                </p>
                <ul className="space-y-3">
                  {[
                    "Real-time security monitoring",
                    "Performance optimization tips",
                    "Compliance checking",
                    "Automated alerts",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-slate-300"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorials Section
        <section id="video-tutorials" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How-To Videos</h2>
            <p className="text-slate-300">Learn how to use CallitDNS in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/20 transition">
                <div className="aspect-video bg-slate-800 relative group cursor-pointer" onClick={() => setActiveVideo(video)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-amber-500/20 backdrop-blur rounded-full p-4 group-hover:bg-amber-500/30 transition">
                      <Play className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section> */}

        {/* How It Works */}
        <section id="how-it-works" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-300">Get started in three simple steps</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Connect Your Domain",
                  description:
                    "Add your domain to CallitDNS with our simple setup wizard. We automatically import your existing records.",
                },
                {
                  step: 2,
                  title: "Tell Dotty Your Goal",
                  description:
                    'Use natural language to describe what you want. Dotty understands commands like "Set up email for Gmail" or "Point to Shopify".',
                },
                {
                  step: 3,
                  title: "Let AI Handle the Rest",
                  description:
                    "Dotty configures your DNS records automatically, monitors for issues, and keeps everything optimized 24/7.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
