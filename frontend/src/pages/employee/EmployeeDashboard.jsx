import { useState } from "react";
import {
  FiTrendingUp, FiGrid, FiUser, FiClock, FiCalendar,
  FiDollarSign, FiLogOut, FiMenu, FiX, FiBell,
  FiCheck, FiXCircle, FiChevronRight, FiEdit2,
  FiCheckSquare, FiAlertCircle, FiDownload, FiMessageSquare
} from "react-icons/fi";
import { useGlobalContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const employee = {
  name: "Arjun Mehta", id: "EMP-2041", role: "Senior Frontend Engineer",
  dept: "Engineering", email: "arjun.mehta@dayflow.io",
  phone: "+91 98765 43210", address: "12, Satellite Road, Ahmedabad, Gujarat",
  joinDate: "Jan 15, 2022", avatar: "AM",
};
const leaveBalance = [
  { label: "Paid Leave", total: 15, used: 3, color: "blue" },
  { label: "Sick Leave", total: 10, used: 1, color: "green" },
  { label: "Unpaid Leave", total: 5, used: 2, color: "amber" },
];

const colorMap = {
  blue: { bg: "bg-blue-50", val: "text-blue-700", icon: "bg-blue-100 text-blue-600", bar: "bg-blue-500" },
  green: { bg: "bg-green-50", val: "text-green-700", icon: "bg-green-100 text-green-600", bar: "bg-green-500" },
  amber: { bg: "bg-amber-50", val: "text-amber-700", icon: "bg-amber-100 text-amber-600", bar: "bg-amber-500" },
  rose: { bg: "bg-rose-50", val: "text-rose-700", icon: "bg-rose-100 text-rose-600", bar: "bg-rose-500" },
};

const statusStyle = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-600",
  "Half-day": "bg-amber-100 text-amber-700",
  Leave: "bg-blue-100 text-blue-700",
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
};
const avatarColor = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700']

const getDisplayName = (user) => {
  if (!user) return 'Unknown'
  if (typeof user === 'object') {
    const full = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return full || user.email || user.loginId || 'Unknown'
  }
  return String(user)
}
const getInitials = (user) => {
  if (!user) return '??'
  if (typeof user === 'object') {
    const f = user.firstName?.[0] || ''; const l = user.lastName?.[0] || ''
    if (f || l) return (f + l).toUpperCase()
    return (user.loginId || user.email || 'U').substring(0, 2).toUpperCase()
  }
  return String(user).substring(0, 2).toUpperCase()
}
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'


const navItems = [
  { key: "dashboard", label: "Dashboard", icon: FiGrid },
  { key: "profile", label: "Profile", icon: FiUser },
  { key: "attendance", label: "Attendance", icon: FiClock },
  { key: "leaves", label: "Leave", icon: FiCalendar },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [leaveData, setLeaveData] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [leaveError, setLeaveError] = useState('')
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: "paid", startDate: "", endDate: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: employee.phone, address: employee.address });
  // Add state for loading/error on check-in
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const { applyForLeave, logout, userData, getMyLeaves,
    EmpStates, getTotalStatusAttendance,
    todayAttendance, getTodaysAttendance,
    weeklyAttendance, getWeeklyAttendanceEmp,
    checkIn: apiCheckIn, checkOut: apiCheckOut,getMyProfile,
                    empData } = useGlobalContext();
  // ── FIX 1: getAllEmployeesLeaves now returns data.Leaves array ─────────────
  const fetchLeaves = async () => {
    setLeaveLoading(true); setLeaveError('')
    try {
      const data = await getMyLeaves();
      console.log("API response:", data);
      setLeaveData(Array.isArray(data?.Leaves) ? data.Leaves : []);
    } catch (err) {
      setLeaveError('Failed to load leave requests.')
      console.error(err)
    } finally { setLeaveLoading(false) }
  }
  useEffect(() => {
    fetchLeaves();
    getTotalStatusAttendance();
    getTodaysAttendance();
    getWeeklyAttendanceEmp();
    getMyProfile();
  }, [])
  // Derive checkedIn from real data
  const checkedIn = todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const checkedOut = todayAttendance?.checkIn && todayAttendance?.checkOut;
  // console.log("the userData is this",userData);
  const pendingLeaves = leaveData.filter(l => l.status === 'pending').length
  const handleLogout = () => {
    logout();
    navigate('/')
  }
  async function handleLeaveSubmit() {
    setSubmitted(true);
    await applyForLeave(leaveForm);
    setTimeout(() => { setShowLeaveModal(false); setSubmitted(false); setLeaveForm({ leaveType: "Paid", startDate: "", endDate: "", reason: "" }); }, 1800);
  }
  const handleAttendance = async () => {
    setAttendanceLoading(true);
    try {
      if (!todayAttendance?.checkIn) {
        await apiCheckIn();
      } else if (!todayAttendance?.checkOut) {
        await apiCheckOut();
      }
    } catch (err) {
      console.error('Attendance action failed:', err);
    } finally {
      setAttendanceLoading(false);
    }
  }
  const LeaveLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-14 text-slate-400">
      <div className="w-7 h-7 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium">Loading leave requests...</p>
    </div>
  )
  const LeaveErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
      <FiAlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm font-medium text-red-500">{leaveError}</p>
      <button onClick={fetchLeaves} className="flex items-center gap-2 text-xs bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
        <FiRefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  )
  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className={`
      fixed top-0 left-0 h-full z-40 flex flex-col
      bg-white border-r border-slate-100 shadow-lg shadow-slate-100
      transition-transform duration-300 w-64
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:static lg:shadow-none
    `}>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <FiTrendingUp className="text-white w-4 h-4" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900 leading-none">Dayflow</p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Employee Portal</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setActive(key); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
              ${active === key ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            {key === "leaves" && pendingLeaves > 0 && (
              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === "leaves" ? "bg-white/25 text-white" : "bg-rose-100 text-rose-600"}`}>
                {pendingLeaves}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
            {empData.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{empData?.name}</p>
            <p className="text-[10px] text-slate-400">Employee</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  const Dashboard = () => {
    // ✅ Compute directly from weeklyAttendance (same logic, just used for pct)
    const mappedWeekData = weeklyAttendance.map(record => ({
      day: new Date(record.date).toLocaleDateString("en-IN", { weekday: "short" }),
      date: new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      status: record.status === "present" ? "Present"
        : record.status === "halfday" ? "Half-day"
          : record.status === "leave" ? "Leave"
            : "Absent",
      checkIn: record.checkIn
        ? new Date(record.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
        : null,
      checkOut: record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
        : null,
      hours: record.checkIn && record.checkOut
        ? (() => {
          const diff = new Date(record.checkOut) - new Date(record.checkIn);
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          return `${h}h ${m}m`;
        })()
        : record.checkIn ? "Active" : "—",
    }));

    const presentDays = mappedWeekData.filter(d => d.status === "Present" || d.status === "Half-day").length;
    const pct = mappedWeekData.length > 0 ? Math.round((presentDays / mappedWeekData.length) * 100) : 0;

    return (
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Attendance", value: `${pct}%`, icon: FiClock, color: "blue" },
            { label: "Leave Balance", value: "12 days", icon: FiCalendar, color: "green" },
            { label: "Pending Requests", value: pendingLeaves, icon: FiAlertCircle, color: "amber" },
            { label: "Net Salary", value: "₹1,21,500", icon: FiDollarSign, color: "rose" },
          ].map(({ label, value, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <div key={label} className={`${c.bg} rounded-2xl p-5 border border-white`}>
                <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`text-3xl font-extrabold ${c.val} mb-0.5`}>{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Check-in card - replace the button and status display */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Today's Check-In</h3>
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 
            ${todayAttendance?.checkIn
                  ? checkedOut ? "bg-slate-50 border-slate-200" : "bg-green-50 border-green-300"
                  : "bg-slate-50 border-slate-200"}`}>
                <FiCheck className={`w-7 h-7 mb-1 ${todayAttendance?.checkIn && !checkedOut ? "text-green-500" : "text-slate-300"}`} />
                <span className={`text-[10px] font-bold 
                ${todayAttendance?.checkIn && !checkedOut ? "text-green-600" : "text-slate-400"}`}>
                  {todayAttendance?.checkIn && !checkedOut ? "IN" : checkedOut ? "OUT" : "—"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">
                  Check-in: <span className="font-semibold text-slate-800">
                    {todayAttendance?.checkIn
                      ? new Date(todayAttendance.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
                </p>
                <p className="text-sm text-slate-500 mb-1">
                  Check-out: <span className="font-semibold text-slate-800">
                    {todayAttendance?.checkOut
                      ? new Date(todayAttendance.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                      : todayAttendance?.checkIn ? "Active" : "—"}
                  </span>
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Status: <span className={`font-semibold ${todayAttendance?.status === "present" ? "text-green-600" : "text-red-500"}`}>
                    {todayAttendance?.status
                      ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1)
                      : "Absent"}
                  </span>
                </p>
                {!checkedOut && (
                  <button
                    onClick={handleAttendance}
                    disabled={attendanceLoading}
                    className={`text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-colors shadow-md disabled:opacity-60
                        ${todayAttendance?.checkIn
                        ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}>
                    {attendanceLoading ? "Please wait..." : todayAttendance?.checkIn ? "Check Out" : "Check In Now"}
                  </button>
                )}
                {checkedOut && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    ✓ Done for today
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Week snapshot */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">This Week</h3>
              <button onClick={() => setActive("attendance")} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                View all <FiChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2 p-4">
              {mappedWeekData.map(d => (
                <div key={d.day} className={`flex-1 rounded-xl p-2.5 text-center ${statusStyle[d.status].replace("text-", "").split(" ")[0] === "bg-green-100" ? "bg-green-50" : d.status === "Half-day" ? "bg-amber-50" : "bg-slate-50"}`}>
                  <p className="text-[10px] font-bold text-slate-500">{d.day}</p>
                  <p className="text-[9px] text-slate-400 mb-2">{d.date}</p>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${d.status === "Present" ? "bg-green-500" : d.status === "Half-day" ? "bg-amber-500" : "bg-slate-300"}`} />
                  <p className={`text-[9px] font-bold ${d.status === "Present" ? "text-green-600" : d.status === "Half-day" ? "text-amber-600" : "text-slate-400"}`}>{d.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent leaves */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Pending Leaves</h3>
              <button onClick={() => setActive('leaves')} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">Manage <FiChevronRight className="w-3 h-3" /></button>
            </div>
            {leaveLoading ? <LeaveLoadingState /> : leaveError ? <LeaveErrorState /> :
              leaveData.filter(l => l.status === 'pending').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FiCheckSquare className="w-8 h-8 mb-2 text-green-400" /><p className="text-sm font-medium">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {leaveData.filter(l => l.status === 'pending').map((l, i) => (
                    <div key={l._id} className="flex items-center gap-3 px-5 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor[i % avatarColor.length]}`}>
                        {getInitials(l.user_id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName(l.user_id)}</p>
                        <p className="text-[11px] text-slate-400 capitalize">{l.leaveType} leave · {l.days} day{l.days > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleLeaveAction(l._id, 'approve')} className="w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"><FiCheck className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleLeaveAction(l._id, 'reject')} className="w-7 h-7 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors"><FiXCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Apply for Leave", icon: FiCalendar, action: () => { setActive("leaves"); setShowLeaveModal(true); } },
                // { label: "View Payslip", icon: FiDollarSign, action: () => setActive("payroll") },
                { label: "Edit Profile", icon: FiEdit2, action: () => { setActive("profile"); setEditMode(true); } },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <a.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                  <FiChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Profile ───────────────────────────────────────────────────────────────────
  const Profile = () => (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start gap-5 pb-6 mb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-extrabold shrink-0">
            {/* {empData.avatar} */}
             {((empData.firstName?.[0] || '') + (empData.lastName?.[0] || '')).toUpperCase() || '??'}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-slate-900">{empData?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{empData?.Role} · {empData?.Department}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{empData?.id}</span>
              <span className="text-[10px] text-slate-400">Joined {empData?.joinDate}</span>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${editMode ? "bg-green-500 text-white shadow-md shadow-green-200 hover:bg-green-600" : "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700"}`}>
            <FiEdit2 className="w-3.5 h-3.5" />
            {editMode ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Full Name", value: userData?.username, editable: false },
            { label: "Email", value: employee.email, editable: false },
            { label: "Employee ID", value: employee.id, editable: false },
            { label: "Department", value: employee.dept, editable: false },
            { label: "Phone", value: profileForm.phone, editable: true, key: "phone" },
            { label: "Address", value: profileForm.address, editable: true, key: "address" },
          ].map(f => (
            <div key={f.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">{f.label}</p>
              {editMode && f.editable
                ? <input value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                : <p className="text-sm font-semibold text-slate-800">{f.value}</p>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0">📁</div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Documents</p>
          <p className="text-xs text-slate-400">Offer letter, ID proof, and more — contact HR to manage documents.</p>
        </div>
      </div>
    </div>
  );

  // ── Attendance ────────────────────────────────────────────────────────────────
  const Attendance = () => {
    const [filter, setFilter] = useState("All");
    const filters = ["All", "Present", "Half-day", "Absent", "Leave"];
    // Map API records to display format
    const mappedWeekData = weeklyAttendance.map(record => ({
      day: new Date(record.date).toLocaleDateString("en-IN", { weekday: "short" }),
      date: new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      status: record.status === "present" ? "Present"
        : record.status === "halfday" ? "Half-day"
          : record.status === "leave" ? "Leave"
            : "Absent",
      checkIn: record.checkIn
        ? new Date(record.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
        : null,
      checkOut: record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
        : null,
      hours: record.checkIn && record.checkOut
        ? (() => {
          const diff = new Date(record.checkOut) - new Date(record.checkIn);
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          return `${h}h ${m}m`;
        })()
        : record.checkIn ? "Active" : "—",
    }));
    const filtered = filter === "All" ? mappedWeekData : mappedWeekData.filter(d => d.status === filter);
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Present", value: EmpStates?.presentDays, color: "green" },
            { label: "Half-day", value: EmpStates?.absentDays, color: "amber" },
            { label: "Absent", value: EmpStates?.leaveDays, color: "rose" },
            { label: "On Leave", value: EmpStates?.halfDayCount, color: "blue" },
          ].map(({ label, value, color }) => {
            const c = colorMap[color];
            return (
              <div key={label} className={`${c.bg} rounded-2xl p-5`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                <p className={`text-3xl font-extrabold ${c.val}`}>{value}</p>
              </div>
            );
          })}
        </div>

        {/* Check-in/out */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Today's Attendance</h3>
          <div className="flex items-center gap-4">

            {!checkedOut && (
              <button
                onClick={handleAttendance}
                disabled={attendanceLoading}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-colors shadow-md disabled:opacity-60
          ${todayAttendance?.checkIn
                    ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"}`}>
                {attendanceLoading
                  ? "Please wait..."
                  : todayAttendance?.checkIn
                    ? <><FiXCircle className="w-4 h-4" /> Check Out</>
                    : <><FiCheck className="w-4 h-4" /> Check In</>}
              </button>
            )}

            {checkedOut && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                ✓ Done for today
              </span>
            )}

            <p className="text-sm text-slate-500">
              {checkedOut
                ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · Checked out at ${new Date(todayAttendance.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                : todayAttendance?.checkIn
                  ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · Active`
                  : "Not yet checked in today"}
            </p>

          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all
                ${filter === f ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
              {f}
              <span className="ml-1.5 opacity-70">{f === "All" ? mappedWeekData.length : 0}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Weekly Records</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Day", "Date", "Check In", "Check Out", "Hours", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(d => (
                  <tr key={d.day} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{d.day}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.date}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{d.checkIn || "—"}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{d.checkOut || (d.status === "Present" ? "Active" : "—")}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.hours}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[d.status]}`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── Leaves ────────────────────────────────────────────────────────────────────
  const Leaves = () => {
    const [tab, setTab] = useState("Pending");
    const tabs = ["Pending", "Approved", "Rejected"];
    const filtered = leaveData.filter(l => l.status === tab.toLowerCase());

    return (
      <div className="space-y-5">
        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-4">
          {leaveBalance.map(lb => {
            const c = colorMap[lb.color];
            const remaining = lb.total - lb.used;
            const pct = (remaining / lb.total) * 100;
            return (
              <div key={lb.label} className={`${c.bg} rounded-2xl p-5`}>
                <p className="text-xs text-slate-500 font-medium mb-1">{lb.label}</p>
                <p className={`text-3xl font-extrabold ${c.val} mb-3`}>{remaining}<span className="text-sm font-medium opacity-60"> / {lb.total}</span></p>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">{lb.used} used · {remaining} remaining</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all
                  ${tab === t ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"}`}>
                {t} <span className="ml-1 opacity-70">{leaveData.filter(l => l.status === t.toLowerCase()).length}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            + Apply Leave
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
            <FiCheckSquare className="w-10 h-10 mb-3 text-green-400" />
            <p className="font-semibold">No {tab.toLowerCase()} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(l => (
              <div key={l._id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-100 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800">{l.leaveType}</p>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[l.status]}`}>{l.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {formatDate(l.startDate)} → {formatDate(l.endDate)}</span>
                      <span>{l.days} day{l.days > 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 italic">"{l.reason}"</p>
                    {l.reviewComment && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        <FiMessageSquare className="w-3 h-3 shrink-0" /> Admin comment: {l.reviewComment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const panels = { dashboard: Dashboard, profile: Profile, attendance: Attendance, leaves: Leaves };
  const ActivePanel = panels[active];
  const pageTitle = navItems.find(n => n.key === active)?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
      `}</style>

      <Sidebar />

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 p-1">
            <FiMenu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">{pageTitle}</h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <FiBell className="w-5 h-5" />
              {pendingLeaves > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingLeaves}</span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              {employee.avatar}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 fade-up" key={active}>
          <ActivePanel />
        </main>
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center mb-4">
                  <FiCheckSquare className="w-8 h-8" />
                </div>
                <p className="text-lg font-extrabold text-slate-900">Request Submitted!</p>
                <p className="text-sm text-slate-400 mt-1">Your leave request is pending HR approval.</p>
              </div>
            ) : (
              <>
                <h3 className="font-extrabold text-slate-900 mb-1">Apply for Leave</h3>
                <p className="text-xs text-slate-400 mb-5">Fill in the details for your leave request.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Leave Type</label>
                    <select value={leaveForm.leaveType} onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white appearance-none">
                      <option value="paid">Paid</option>
                      <option value="sick">Sick</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">From Date</label>
                      <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">To Date</label>
                      <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Remarks</label>
                    <textarea rows={3} value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
                      placeholder="Reason for leave..." style={{ resize: "none" }}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setShowLeaveModal(false)}
                      className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleLeaveSubmit}
                      className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                      Submit Request
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}