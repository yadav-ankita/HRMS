import React, { useState, useEffect } from 'react'
import { FiUsers, FiCalendar, FiCheck, FiTrendingUp, FiClock, FiShield } from 'react-icons/fi'
import { Link, Navigate } from 'react-router-dom'

const Home = () => {
 
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Employee Management",
      description: "Centralized profiles, documents, and job details — all in one place.",
      color: "blue",
    },
    {
      icon: <FiCalendar className="w-6 h-6" />,
      title: "Leave Management",
      description: "Apply for paid, sick, or unpaid leave. Track approvals in real time.",
      color: "indigo",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Attendance Tracking",
      description: "Daily & weekly check-in/out logs with present, absent, half-day statuses.",
      color: "sky",
    },
    {
      icon: <FiCheck className="w-6 h-6" />,
      title: "Approval Workflows",
      description: "Streamlined HR and admin approval flows with comment support.",
      color: "indigo",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Role-Based Access",
      description: "Separate dashboards and permissions for Admins and Employees.",
      color: "sky",
    },
  ]

  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
      border: "hover:border-blue-300",
      dot: "bg-blue-500",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "bg-indigo-100 text-indigo-600",
      border: "hover:border-indigo-300",
      dot: "bg-indigo-500",
    },
    sky: {
      bg: "bg-sky-50",
      icon: "bg-sky-100 text-sky-600",
      border: "hover:border-sky-300",
      dot: "bg-sky-500",
    },
  }

  const benefits = [
    { title: "Save Time", desc: "Automate repetitive HR tasks and focus on strategic initiatives." },
    { title: "Improve Accuracy", desc: "Eliminate manual errors with automated processes and validations." },
    { title: "Better Insights", desc: "Access real-time analytics for data-driven decision making." },
    { title: "Secure & Compliant", desc: "Enterprise-grade security with the latest compliance standards." },
    { title: "Easy to Use", desc: "Intuitive interface designed for all levels of tech proficiency." },
    { title: "24/7 Access", desc: "Access Dayflow from anywhere, on any device, at any time." },
  ]

  const stats = [
    { value: "10x", label: "Faster Onboarding" },
    { value: "99%", label: "Attendance Accuracy" },
    { value: "0", label: "Paperwork Needed" },
    { value: "24/7", label: "Always Accessible" },
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .anim-1 { animation: fadeUp 0.6s ease both 0.05s; }
        .anim-2 { animation: fadeUp 0.6s ease both 0.15s; }
        .anim-3 { animation: fadeUp 0.6s ease both 0.25s; }
        .anim-4 { animation: fadeUp 0.6s ease both 0.35s; }
        .float { animation: float 5s ease-in-out infinite; }
        .hero-bg {
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #e0f2fe 100%);
        }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(59,130,246,0.12); }
        .btn-primary {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transition: all 0.2s ease;
        }
        .btn-primary:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,0.3); }
        .btn-primary:active { transform: translateY(0); }
        .section-divider { background: linear-gradient(90deg, transparent, #bfdbfe, transparent); height: 1px; }
        .feature-card { border: 1.5px solid #e2e8f0; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(59,130,246,0.1); }
        .stats-section { background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0284c7 100%); }
        .cta-section { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); }
      `}</style>

      {/* {userData && <Navigate to="/Dashboard" />} */}

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <FiTrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Dayflow</span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
              <a href="#features" className="hover:text-blue-600 transition-colors no-underline!">Features</a>
              <a href="#benefits" className="hover:text-blue-600 transition-colors no-underline!">Benefits</a>
              <a href="#cta" className="hover:text-blue-600 transition-colors no-underline!">Get Started</a>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/Login">
                <button className="text-sm font-medium text-slate-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
                  Sign In
                </button>
              </Link>
              <Link to="/Login">
                <button className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-200">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-slate-600 p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100 px-6 py-4 flex flex-col gap-3 text-sm shadow-lg">
            <a href="#features" className="text-slate-600 hover:text-blue-600 py-1 no-underline!" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#benefits" className="text-slate-600 hover:text-blue-600 py-1 no-underline!" onClick={() => setMenuOpen(false)}>Benefits</a>
            <a href="#cta" className="text-slate-600 hover:text-blue-600 py-1 no-underline!" onClick={() => setMenuOpen(false)}>Get Started</a>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <Link to="/Login"><button className="w-full text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium">Sign In</button></Link>
              <Link to="/Login"><button className="btn-primary w-full text-white px-4 py-2.5 rounded-xl font-semibold">Get Started</button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero-bg pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="anim-1 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Modern HRMS Solution
            </div>

            <h1 className="anim-2 text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Every Workday,
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-sky-500">
                Perfectly Aligned.
              </span>
            </h1>

            <p className="anim-3 text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Streamline your HR operations with Dayflow — a comprehensive HRMS designed to digitize employee management, attendance, leave .
            </p>

            <div className="anim-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/Login">
                <button className="btn-primary w-full sm:w-auto text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-blue-200">
                  Get Started Today →
                </button>
              </Link>
              <a href="#features">
                <button className="w-full sm:w-auto text-slate-600 font-semibold px-8 py-4 rounded-xl text-base border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  Explore Features
                </button>
              </a>
            </div>
          </div>

          {/* Floating Dashboard Preview */}
          <div className="mt-20 max-w-3xl mx-auto float">
            <div className="bg-white rounded-2xl shadow-2xl shadow-blue-100 border border-blue-100 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-yellow-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
                <div className="ml-4 flex-1 bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-400">
                  app.dayflow.io/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-slate-400">Good morning,</p>
                    <p className="font-bold text-slate-800 text-sm">HR Dashboard</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Present Today", val: "42", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
                    { label: "On Leave", val: "5", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                    { label: "Pending Approvals", val: "3", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                  ].map(({ label, val, color, bg, border }) => (
                    <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                      <p className="text-xs text-slate-400 mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* Employee rows */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["Alice Johnson", "Present", "bg-green-100 text-green-700"],
                    ["Bob Smith", "On Leave", "bg-amber-100 text-amber-700"],
                    ["Carol White", "Present", "bg-green-100 text-green-700"],
                    ["David Lee", "Absent", "bg-red-100 text-red-700"],
                  ].map(([name, status, cls]) => (
                    <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-blue-200 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-blue-100">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Powerful HR Features</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">Everything you need to manage your workforce effectively, all in one place.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const c = colorMap[f.color]
              return (
                <div key={i} className={`feature-card bg-white rounded-2xl p-7 cursor-default ${c.border}`}>
                  <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* Benefits */}
      <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-blue-100">
              Why Dayflow
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Built for modern teams</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500 transition-colors">
                  <svg className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">{b.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 border border-blue-100">
              Access Control
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Built for everyone</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Employee Card */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-8 card-hover">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                <FiUsers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Employee</h3>
              <p className="text-slate-500 text-sm mb-6">Self-service access to everything that matters to you.</p>
              <ul className="space-y-3">
                {["View & edit your profile", "Daily check-in / check-out", "Apply for leave & track status"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Card */}
            <div className="bg-linear-to-br from-blue-600 to-blue-800 border-2 border-blue-500 rounded-2xl p-8 card-hover text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider">
                Admin / HR
              </div>
              <div className="w-12 h-12 bg-white/15 text-white rounded-xl flex items-center justify-center mb-6">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Admin / HR Officer</h3>
              <p className="text-blue-100 text-sm mb-6">Full control over your organization's HR operations.</p>
              <ul className="space-y-3">
                {["Manage all employee profiles", "View & manage all attendance", "Approve or reject leave requests", "Add comments to approvals"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-blue-50">
                    <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="cta-section py-24 px-4 border-t border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
            Ready to transform your<br />HR operations?
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            Join teams that trust Dayflow for their HR management needs.
          </p>
          <Link to="/Login">
            <button className="btn-primary text-white font-bold px-10 py-4 rounded-xl text-lg shadow-xl shadow-blue-200">
              Get Started Today →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-white">Dayflow</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Every workday, perfectly aligned.</p>
            </div>

            {[
              { title: "Product", links: ["Features", "Security", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors no-underline!">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home