import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { useGlobalContext } from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const {login}=useGlobalContext();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
    //   const res = await axios.post('/api/auth/login', formData)
    //   const { token, userInfo } = res.data

      // Save token to localStorage
     // localStorage.setItem('token', token)

      // Set user in global context
     // setUserData(userInfo)

      // Redirect based on role
      await login(formData);
      navigate('/Dashboard')
    } catch (err) {
      setError(err?.response?.data?.msg || err?.response?.data?.message || 'Invalid credentials. Please try again.')
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

      <div className="w-full max-w-md fade-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-blue-400 to-sky-400" />

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <FiTrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900">Dayflow</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm mb-8">Sign in with your Employee ID.</p>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Login ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Login ID
                </label>
                <input
                  type="text"
                  name="loginId"
                  value={formData.loginId}
                  onChange={handleChange}
                  placeholder="Employee ID"
                  className="input-field"
                  required
                  autoFocus
                />
                
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  {/* <a href="#" className="text-xs text-blue-500 hover:text-blue-700 font-medium no-underline!">
                    Forgot password?
                  </a> */}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
              </div>

              {/* Role hint */}
              {/* <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">A</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Admin / HR</p>
                    <p className="text-[10px] text-slate-400">Email login</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 text-xs font-bold shrink-0">E</div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Employee</p>
                    <p className="text-[10px] text-slate-400">EMP ID login</p>
                  </div>
                </div>
              </div> */}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">New to Dayflow?</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Register link */}
            <Link to="/Signup">
              <button className="w-full border-2 border-blue-100 text-blue-600 font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 hover:border-blue-300 transition-all">
                Register your Company
              </button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login