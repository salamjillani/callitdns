import React, { useEffect, useRef, useState } from "react";
import {
  Brain,
  Shield,
  Zap,
  ChevronRight,
  Code,
  Globe,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";
import * as THREE from "three";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  const canvasRef = useRef(null);
  const sectionCanvasRef = useRef(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [dnsResponse, setDnsResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  const userPromptText =
    '"Point my domain to Vercel and set up Google Workspace email."';
  const dnsResponseText =
    "Generating 4 records... [A, CNAME, MX, TXT]... Configuration complete.";

  // Typing animation effect
  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < userPromptText.length) {
        setUserPrompt(userPromptText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowResponse(true);
          let j = 0;
          const responseInterval = setInterval(() => {
            if (j < dnsResponseText.length) {
              setDnsResponse(dnsResponseText.substring(0, j + 1));
              j++;
            } else {
              clearInterval(responseInterval);
            }
          }, 40);
        }, 1000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, []);

  // Advanced Three.js particle system for hero background
  useEffect(() => {
    if (!canvasRef.current) return;

    let scene, camera, renderer, particles, lines, group;
    const particleCount = 150;
    const particlesData = [];
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const linePositions = new Float32Array(particleCount * particleCount * 3);
    const lineColors = new Float32Array(particleCount * particleCount * 3);
    const color = new THREE.Color();
    const minDistance = 100;
    let mouseX = 0,
      mouseY = 0;

    function init3D() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      camera.position.z = 400;

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x020617, 1);

      group = new THREE.Group();
      scene.add(group);

      const pMaterial = new THREE.PointsMaterial({
        size: 4,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
        vertexColors: true,
      });

      const particleGeometry = new THREE.BufferGeometry();

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 800 - 400;
        const y = Math.random() * 800 - 400;
        const z = Math.random() * 800 - 400;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Solar flare colors: Hue from 0.05 (red-orange) to 0.15 (yellow)
        color.setHSL(0.05 + 0.1 * Math.random(), 1.0, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        particlesData.push({
          velocity: new THREE.Vector3(
            -1 + Math.random() * 2,
            -1 + Math.random() * 2,
            -1 + Math.random() * 2
          ).multiplyScalar(0.2),
        });
      }

      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
      );
      particles = new THREE.Points(particleGeometry, pMaterial);
      group.add(particles);

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.3,
      });
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(linePositions, 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      lineGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(lineColors, 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      animate();
    }

    function animate() {
      if (!renderer || !scene || !camera) return;

      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;

      for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i];
        positions[i * 3] += particleData.velocity.x;
        positions[i * 3 + 1] += particleData.velocity.y;
        positions[i * 3 + 2] += particleData.velocity.z;

        if (positions[i * 3 + 1] < -400 || positions[i * 3 + 1] > 400)
          particleData.velocity.y *= -1;
        if (positions[i * 3] < -400 || positions[i * 3] > 400)
          particleData.velocity.x *= -1;
        if (positions[i * 3 + 2] < -400 || positions[i * 3 + 2] > 400)
          particleData.velocity.z *= -1;

        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < minDistance) {
            linePositions[vertexpos++] = positions[i * 3];
            linePositions[vertexpos++] = positions[i * 3 + 1];
            linePositions[vertexpos++] = positions[i * 3 + 2];

            linePositions[vertexpos++] = positions[j * 3];
            linePositions[vertexpos++] = positions[j * 3 + 1];
            linePositions[vertexpos++] = positions[j * 3 + 2];

            const alpha = 1.0 - dist / minDistance;

            lineColors[colorpos++] = colors[i * 3] * alpha;
            lineColors[colorpos++] = colors[i * 3 + 1] * alpha;
            lineColors[colorpos++] = colors[i * 3 + 2] * alpha;

            lineColors[colorpos++] = colors[j * 3] * alpha;
            lineColors[colorpos++] = colors[j * 3 + 1] * alpha;
            lineColors[colorpos++] = colors[j * 3 + 2] * alpha;

            numConnected++;
          }
        }
      }

      if (lines && lines.geometry) {
        lines.geometry.setDrawRange(0, numConnected * 2);
        lines.geometry.attributes.position.needsUpdate = true;
        lines.geometry.attributes.color.needsUpdate = true;
      }

      if (particles && particles.geometry) {
        particles.geometry.attributes.position.needsUpdate = true;
      }

      if (group) {
        group.rotation.y += 0.0005;
      }

      if (camera) {
        camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    function onMouseMove(event) {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
    }

    function onWindowResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    init3D();

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <>
      {/* Background Animation Canvas - Solution 1: Use absolute positioning */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ background: "#020617" }}
      />

      <Layout>
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-white">
            Stop Configuring.{" "}
            <span
              style={{
                background: "linear-gradient(to right, #fbbf24, #ef4444)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              Start Calling.
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 mb-8">
            CallitDNS is the first AI-native DNS provider that predicts threats,
            prevents downtime, and writes its own records. Tell it your goal,
            and our AI, Dotty, does the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition transform hover:scale-105">
              Get Started for Free
            </button>
            <button className="bg-slate-800/50 backdrop-blur hover:bg-slate-700/50 text-white font-bold text-lg px-8 py-4 rounded-lg transition border border-slate-700">
              Watch Demo
            </button>
          </div>

          {/* Interactive Dotty Demo */}
          <div className="mt-16 max-w-2xl mx-auto p-6 rounded-xl bg-slate-900/50 backdrop-blur-lg border border-slate-800 text-left font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-slate-400 text-xs ml-2">
                Dotty AI Terminal
              </span>
            </div>
            <div>
              <span className="text-green-400">User:</span>
              <span className="text-slate-300 ml-2">{userPrompt}</span>
              <span className="inline-block w-2 h-5 bg-amber-500 ml-1 animate-pulse"></span>
            </div>
            {showResponse && (
              <div className="mt-2 text-orange-400">
                <span>&gt; Dotty:</span>
                <span className="ml-2">{dnsResponse}</span>
              </div>
            )}
          </div>
        </section>

        {/* AI Features Highlight Section */}
        <section className="py-20 relative z-10">
          <canvas
            ref={sectionCanvasRef}
            className="absolute top-0 left-0 w-full h-full -z-10 opacity-50"
          />
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
              This isn't just DNS.
            </h2>
            <h3
              className="text-4xl md:text-5xl font-bold tracking-tighter"
              style={{
                background: "linear-gradient(to right, #fbbf24, #ef4444)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              It's intelligent infrastructure.
            </h3>
            <p className="mt-4 text-lg text-slate-300">
              Powered by cutting-edge AI to make DNS management effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition transform hover:-translate-y-1">
              <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
                <Brain className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">
                Dotty AI Command
              </h4>
              <p className="text-slate-400">
                Describe your goal in plain English—like "Point to my new
                Shopify store"—and our AI configures the optimal records
                instantly.
              </p>
              <Link
                to="/features#dotty-ai"
                className="text-amber-400 hover:text-amber-300 text-sm mt-4 inline-block"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition transform hover:-translate-y-1">
              <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">
                AI Health Scan
              </h4>
              <p className="text-slate-400">
                Automatically detect common errors, security gaps like missing
                email records, and performance issues with a single click.
              </p>
              <Link
                to="/features#health-scan"
                className="text-amber-400 hover:text-amber-300 text-sm mt-4 inline-block"
              >
                Learn more →
              </Link>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-8 rounded-xl hover:border-amber-500/20 transition transform hover:-translate-y-1">
              <div className="bg-amber-500/10 inline-flex p-3 rounded-lg mb-4 border border-amber-500/20">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-white">
                One-Click Fixes
              </h4>
              <p className="text-slate-400">
                When our AI finds an issue, you can resolve it instantly with a
                single button click. No more manual troubleshooting.
              </p>
              <Link
                to="/features#one-click-fixes"
                className="text-amber-400 hover:text-amber-300 text-sm mt-4 inline-block"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section with Video */}
        <section className="py-20 border-t border-slate-800 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-slate-300">
              Watch how easy DNS management can be with AI
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-2">
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                <button className="bg-amber-500 hover:bg-amber-600 text-black rounded-full p-6 transition transform hover:scale-110">
                  <Play className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/20">
                  <span className="text-2xl font-bold text-amber-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Add Your Domain
                </h3>
                <p className="text-slate-400">Connect your domain in seconds</p>
              </div>

              <div className="text-center">
                <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/20">
                  <span className="text-2xl font-bold text-amber-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Tell Dotty Your Goal
                </h3>
                <p className="text-slate-400">Use natural language commands</p>
              </div>

              <div className="text-center">
                <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/20">
                  <span className="text-2xl font-bold text-amber-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI Does the Rest
                </h3>
                <p className="text-slate-400">
                  Automatic configuration & monitoring
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-20 border-t border-slate-800 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                Built for Those{" "}
                <span
                  style={{
                    background: "linear-gradient(to right, #fbbf24, #ef4444)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Who Build.
                </span>
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                A beautiful UI is great, but a flawless API is non-negotiable.
                Our entire platform is built API-first. Integrate, automate, and
                manage your DNS as part of your CI/CD pipeline.
              </p>
              <Link
                to="/docs"
                className="mt-8 inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                View API Docs
              </Link>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-lg p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">api.js</span>
              </div>
              <pre className="text-slate-300">
                <code>{`// Create a new A record via the API
        await callitdns.records.create({
          domain: 'example.com',
          type: 'A',
          name: '@',
          value: '76.76.21.21',
          ttl: 'auto'
        });`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 border-t border-slate-800 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              Trusted by Developers Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Full Stack Developer",
                text: "Dotty saved me hours of configuration time. I just told it to set up my Vercel deployment and email, and it was done in seconds.",
              },
              {
                name: "Mike Rodriguez",
                role: "DevOps Engineer",
                text: "The AI Health Scan caught security issues I didn't even know existed. Fixed them all with one click. Amazing!",
              },
              {
                name: "Alex Thompson",
                role: "Startup Founder",
                text: "Finally, a DNS provider that speaks human. No more cryptic record types and confusing configurations.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 p-6 rounded-xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-slate-800 relative z-10">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
              Ready to Experience{" "}
              <span
                style={{
                  background: "linear-gradient(to right, #fbbf24, #ef4444)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Intelligent DNS?
              </span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who've already simplified their DNS
              management with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition transform hover:scale-105 inline-block"
              >
                Start Today
              </Link>
              <Link
                to="/contact?type=sales"
                className="bg-slate-800/50 backdrop-blur hover:bg-slate-700/50 text-white font-bold text-lg px-8 py-4 rounded-lg transition inline-block border border-slate-700"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
