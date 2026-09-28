import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { asyncLoginUser } from "../store/actions/userAction";
import { useDispatch } from "react-redux";

const Login = () => {
  const { register, reset, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginHandler = async (user) => {
    setError("");
    setLoading(true);
    try {
      const success = await dispatch(asyncLoginUser(user));
      if (success) {
        reset();
        navigate("/auth/dashboard");
      } else {
        setError("Invalid credentials. Please verify your email and password.");
      }
    } catch (err) {
      setError("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-[#07070d] text-white p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,106,238,0.12)_0%,transparent_40%),radial-gradient(circle_at_85%_85%,rgba(157,133,251,0.08)_0%,transparent_40%)]" />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-500/30">
            <i className="ri-brain-line" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Sign in to access your ContextGPT sessions
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-5 flex items-center gap-2">
            <i className="ri-error-warning-line text-sm shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(loginHandler)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              {...register("email", { required: true })}
              type="email"
              placeholder="you@domain.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              {...register("password", { required: true })}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line ri-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-zinc-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
