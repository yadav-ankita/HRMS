import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiTrendingUp, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import axios from 'axios'

const Signup = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[@#$%^&+=]/.test(pass)) score++
    if (pass.length >= 12) score++
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' }
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-400' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength(formData.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      
      setSuccess(res.data.message || 'Company registered successfully!')
      setTimeout(() => navigate('/Login'), 1800)
    } catch (err) {
      setError(err?.response?.data?.msg || err?.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center px-4 py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .input-field {
          width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem;
          border: 1.5px solid #e2e8f0; background: white; font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s; outline: none; color: #1e293b;
        }
        .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .input-field::placeholder { color: #94a3b8; }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transition: all 0.2s ease;
        }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.3); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div className="w-full max-w-lg fade-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-blue-400 to-sky-400" />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <FiTrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900">Dayflow</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm mb-7">Register your company and get started as admin.</p>

            {/* Error / Success */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5">
                <FiCheckCircle className="w-4 h-4 shrink-0" />
                <span>{success} Redirecting to login...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  className="input-field"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@acme.com"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars, upper, number, symbol"
                    className="input-field pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-100'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Strength: <span className={`font-semibold ${strength.score <= 1 ? 'text-red-500' : strength.score <= 3 ? 'text-amber-500' : 'text-green-600'}`}>{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="input-field pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white font-bold py-3.5 rounded-xl text-sm mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Registering...
                  </>
                ) : 'Create Account →'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/Login" className="text-blue-600 font-semibold hover:text-blue-700 no-underline!">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Signup