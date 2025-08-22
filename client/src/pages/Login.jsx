import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      // Navigation will be handled by useEffect when currentUser changes
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      setLoading(false);
    }
  }

  // Don't render the form if user is already logged in
  if (currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 sm:mt-16 px-4">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800 rounded-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Log In
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm sm:text-base">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm sm:text-base">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-black font-bold py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-400 text-sm sm:text-base">
            <p>
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-amber-400 hover:text-amber-300"
              >
                Sign up
              </Link>
            </p>
            <p className="mt-2">
              <Link
                to="/reset-password"
                className="text-amber-400 hover:text-amber-300"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
