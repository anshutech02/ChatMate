import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { asyncRegisterUser } from "../store/actions/userAction";
import { useDispatch } from "react-redux";

const Register = () => {
  const { register, reset, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerHandler = async (data) => {
    setError("");
    setLoading(true);
    const user = {
      fullName: {
        firstName: data?.firstName,
        lastName: data?.lastName,
      },
      email: data?.email,
      password: data?.password,
    };
    try {
      const success = await dispatch(asyncRegisterUser(user));
      if (success) {
        reset();
        navigate("/auth/dashboard");
      } else {
        setError("Registration could not be completed. Please try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create account.");
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
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-500/30">
            <i className="ri-user-add-line" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Get started with context-aware AI conversations
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs mb-5 flex items-center gap-2">
            <i className="ri-error-warning-line text-sm shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(registerHandler)} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="register-fname">
                First Name
              </label>
              <input
                id="register-fname"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                {...register("firstName", { required: true })}
                type="text"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="register-lname">
                Last Name
              </label>
              <input
                id="register-lname"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                {...register("lastName", { required: true })}
                type="text"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="register-email">
              Email Address
            </label>
            <input
              id="register-email"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              {...register("email", { required: true })}
              type="email"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              {...register("password", { required: true })}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line ri-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
