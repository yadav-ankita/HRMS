import React, { useState, useMemo, useEffect } from 'react'
import {
  FiUsers, FiCalendar, FiClock, FiDollarSign, FiCheckSquare,
  FiLogOut, FiMenu, FiX, FiBell, FiSearch, FiTrendingUp,
  FiCheck, FiXCircle, FiMessageSquare, FiEdit2, FiPlus,
  FiChevronRight, FiAlertCircle, FiEye, FiRefreshCw
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../../context/AppContext'
//import { transformAttendanceRecord } from '../../utils/attendanceUtils'
const statusStyle = {
  pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  Present: 'bg-green-100 text-green-700', Absent: 'bg-red-100 text-red-700', 'On Leave': 'bg-amber-100 text-amber-700', 'Half-day': 'bg-blue-100 text-blue-700',
}
const leaveTypeStyle = {
  paid: 'bg-blue-50 text-blue-600 border border-blue-100',
  sick: 'bg-rose-50 text-rose-600 border border-rose-100',
  unpaid: 'bg-slate-100 text-slate-600 border border-slate-200',
}
const avatarColor = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-teal-100 text-teal-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700']
// Backend populates user_id as { firstName, lastName, email, loginId }
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
  { key: 'overview', label: 'Overview', icon: FiTrendingUp },
  { key: 'employees', label: 'Employees', icon: FiUsers },
  { key: 'attendance', label: 'Attendance', icon: FiClock },
  { key: 'leaves', label: 'Leave Approvals', icon: FiCalendar },
]
export default function AdminDashboard() {
  const formatTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateHours = (inTime, outTime) => {
  if (!inTime || !outTime) return '—';
  const diff = (new Date(outTime) - new Date(inTime)) / (1000 * 60 * 60);
  return diff.toFixed(1) + 'h';
};

const transformAttendance = (data) => {
  return data.map((a) => {
    const name = `${a.user_id?.firstName || ''} ${a.user_id?.lastName || ''}`.trim();

    return {
      _id: a._id,
      employee: name || 'Unknown',
      avatar: name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U',
      checkIn: formatTime(a.checkIn),
      checkOut: formatTime(a.checkOut),
      hours: calculateHours(a.checkIn, a.checkOut),

      // 🔥 normalize status for UI
      status:
        a.status === 'present' ? 'Present' :
        a.status === 'absent' ? 'Absent' :
        a.status === 'leave' ? 'On Leave' :
        a.status === 'halfday' ? 'Half-day' :
        'Absent',
    };
  });
};
  const navigate = useNavigate()
  const { userData, logout, getAllEmployeesLeaves, manageLeaveByAdmin, TotalEmployees, getAllEmployees,
    AddEmployee, updateEmpDetails,
    todayAttendanceAll,
    attendanceLoading,
    attendanceError,
    getTodaysAllEmp,
      todayAbsentCnt, getTodayAbsentCnt
  } = useGlobalContext()
   console.log("today attendance all is",todayAttendanceAll);
  // Transform once, use everywhere (memoised so it only recalculates when data changes):
  // const attendanceData = useMemo(
  //   () => todayAttendanceAll.map(transformAttendanceRecord),
  //   [todayAttendanceAll]
  // );
  //console.log("the attendance data is",attendanceData);
  const attendanceData = useMemo(
  () => transformAttendance(todayAttendanceAll),
  [todayAttendanceAll]
);
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leaveData, setLeaveData] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [leaveError, setLeaveError] = useState('')
  const [commentModal, setCommentModal] = useState(null)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedEmp, setSelectedEmp] = useState(null)

  // ── FIX 1: getAllEmployeesLeaves now returns data.Leaves array ─────────────
  const fetchLeaves = async () => {
    setLeaveLoading(true); setLeaveError('')
    try {
      const data = await getAllEmployeesLeaves();
     // console.log("API response:", data);
      setLeaveData(Array.isArray(data?.Leaves) ? data.Leaves : []);
    } catch (err) {
      setLeaveError('Failed to load leave requests.')
      console.error(err)
    } finally { setLeaveLoading(false) }
  }
  useEffect(
    () => {
      fetchLeaves();
        getAllEmployees();
        getTodaysAllEmp();
        getTodayAbsentCnt(); // ← add this
    }, [])
  //console.log("total Employees",TotalEmployees)
  const handleLogout = () => { logout(); navigate('/') }
  const handleLeaveAction = (id, action) => { setCommentModal({ id, action }); setComment('') }
  const confirmLeaveAction = async () => {
    setCommentLoading(true)
    try {
      const status = commentModal.action === 'approve' ? 'approved' : 'rejected'
      await manageLeaveByAdmin(commentModal.id, status, comment)
      // Optimistic local update
      setLeaveData(prev => prev.map(l =>
        l._id === commentModal.id ? { ...l, status, reviewComment: comment, reviewedAt: new Date().toISOString() } : l
      ))
      setCommentModal(null)
    } catch (err) { console.error(err) }
    finally { setCommentLoading(false) }
  }
  const pendingCount = leaveData.filter(l => l.status === 'pending').length
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', val: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', val: 'text-green-700' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', val: 'text-amber-700' },
    rose: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', val: 'text-rose-700' },
  }
  // Replace the attendanceData references in stats:
  const stats = [
    {
      label: 'Total Employees',
      value: TotalEmployees.length,
      icon: FiUsers,
      color: 'blue',
    },
    {
      label: 'Present Today',
      value: attendanceData.filter(a => a.status === 'Present').length,
      icon: FiCheck,
      color: 'green',
    },
    {
      label: 'On Leave',
      value: attendanceData.filter(a => a.status === 'On Leave').length,
      icon: FiCalendar,
      color: 'amber',
    },
    {
      label: 'Absent Today',
      value: todayAbsentCnt,
      icon: FiXCircle,
      color: 'rose',
    },
    {
      label: 'Pending Approvals',
      value: pendingCount,
      icon: FiAlertCircle,
      color: 'rose',
    },
  ];
  //TODO: add search filter for employees list use the usestate instead of this
  const filteredEmployees = TotalEmployees.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.Department || '').toLowerCase().includes(search.toLowerCase())
  )
  // ── ADD EMPLOYEE MODAL ──────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', Department: '', Role: '', joinDate: '' })
  const [addErrors, setAddErrors] = useState({})
  const [addLoading, setAddLoading] = useState(false)
  const [addResult, setAddResult] = useState(null) // { Emp_loginId, Emp_password }
  const [addApiError, setAddApiError] = useState('')

  const validateAdd = () => {
    const e = {}
    if (!addForm.firstName.trim()) e.firstName = 'First name is required'
    if (!addForm.lastName.trim()) e.lastName = 'Last name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) e.email = 'Valid email is required'
    if (addForm.phone.replace(/\D/g, '').length < 10) e.phone = 'Phone must be at least 10 digits'
    setAddErrors(e)
    return Object.keys(e).length === 0
  }
  const handleAddChange = (e) => {
    const { name, value } = e.target
    setAddForm(f => ({ ...f, [name]: value }))
    if (addErrors[name]) setAddErrors(er => ({ ...er, [name]: '' }))
  }
  const handleAddSubmit = async () => {
    if (!validateAdd()) return
    setAddLoading(true); setAddApiError('')
    try {
      const result = await AddEmployee(addForm)
      setAddResult(result)
      getAllEmployees()
    } catch (err) {
      setAddApiError(err?.response?.data?.message || 'Failed to add employee. Please try again.')
    } finally { setAddLoading(false) }
  }
  const closeAddModal = () => {
    setShowAddModal(false)
    setAddForm({ firstName: '', lastName: '', email: '', phone: '', Department: '', Role: '', joinDate: '' })
    setAddErrors({}); setAddResult(null); setAddApiError('')
  }
  // ── EDIT EMPLOYEE MODAL ─────────────────────────────────────────────────────
  const [editEmp, setEditEmp] = useState(null) // employee object being edited
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editApiError, setEditApiError] = useState('')
  const openEditModal = (emp) => {
    setEditEmp(emp)
    setEditForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      phone_number: emp.phone_number || '',
      Department: emp.Department || '',
      Role: emp.Role || '',
    })
    setEditErrors({}); setEditApiError('')
  }
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(f => ({ ...f, [name]: value }))
    if (editErrors[name]) setEditErrors(er => ({ ...er, [name]: '' }))
  }
  const validateEdit = () => {
    const e = {}
    if (!editForm.firstName.trim()) e.firstName = 'Required'
    if (!editForm.lastName.trim()) e.lastName = 'Required'
    if (editForm.phone_number.replace(/\D/g, '').length < 10) e.phone_number = 'Min 10 digits'
    setEditErrors(e)
    return Object.keys(e).length === 0
  }
  const handleEditSubmit = async () => {
    if (!validateEdit()) return
    setEditLoading(true); setEditApiError('')
    try {
      await updateEmpDetails(editEmp._id, editForm)
      getAllEmployees()
      // Update selectedEmp panel if open
      if (selectedEmp?._id === editEmp._id) setSelectedEmp(prev => ({ ...prev, ...editForm, name: `${editForm.firstName} ${editForm.lastName}` }))
      setEditEmp(null)
    } catch (err) {
      setEditApiError(err?.response?.data?.message || 'Failed to update. Please try again.')
    } finally { setEditLoading(false) }
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

  const Sidebar = () => (
    <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col w-64 bg-white border-r border-slate-100 shadow-lg transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none`}>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <FiTrendingUp className="text-white w-4 h-4" />
        </div>
        <div><p className="text-base font-bold text-slate-900 leading-none">Dayflow</p><p className="text-[10px] text-slate-400 font-medium mt-0.5">Admin Panel</p></div>
        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400"><FiX className="w-5 h-5" /></button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setActive(key); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left
              ${active === key ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Icon className="w-4 h-4 shrink-0" />{label}
            {key === 'leaves' && pendingCount > 0 && (
              <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active === 'leaves' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-600'}`}>{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
            {userData?.username?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{userData?.username || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{userData?.role || 'admin'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
          <FiLogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  )

  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => {
          const c = colorMap[color]
          return (
            <div key={label} className={`${c.bg} rounded-2xl p-5 border border-white`}>
              <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center mb-4`}><Icon className="w-5 h-5" /></div>
              <p className={`text-3xl font-extrabold ${c.val} mb-0.5`}>{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          )
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Today's Attendance</h3>
            <button onClick={() => setActive('attendance')} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">View all <FiChevronRight className="w-3 h-3" /></button>
          </div>
          {/* Loading state */}
          {attendanceLoading && (
            <div className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-32" />
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                  </div>
                  <div className="h-5 w-14 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          )}
          {/* Error state */}
          {!attendanceLoading && attendanceError && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <FiAlertCircle className="w-8 h-8 mb-2 text-red-400" />
              <p className="text-sm font-medium">Failed to load attendance</p>
              <button
                onClick={getTodaysAllEmp}
                className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Data state */}
          {!attendanceLoading && !attendanceError && (
            <div className="divide-y divide-slate-50">
              {attendanceData.slice(0, 5).map((a, i) => (
                <div key={a._id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor[i % avatarColor.length]}`}
                  >
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.employee}</p>
                    <p className="text-[11px] text-slate-400">
                      {a.checkIn !== '—' ? `In: ${a.checkIn}` : 'Not checked in'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}

              {attendanceData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FiUsers className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">No attendance records yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Leaves — REAL DATA */}
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
                      {getInitials(l.user_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{getDisplayName(l.user_name)}</p>
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
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">Employee Directory</h3>
          <button onClick={() => setActive('employees')} className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">View all <FiChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          
          {TotalEmployees.map((e, i) => (
            <div key={e._id} onClick={() => { setSelectedEmp(e); setActive('employees') }}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor[i % avatarColor.length]}`}> {`${e.firstName?.[0] ?? ''}${e.lastName?.[0] ?? ''}`.toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{e.name}</p><p className="text-[11px] text-slate-400 truncate">{e.role}</p></div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusStyle[e.status]}`}>{e.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const Employees = () => (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search by name or department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white" />
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 whitespace-nowrap">
          <FiPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>
      {selectedEmp && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-lg shadow-blue-50">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-extrabold">
                {((selectedEmp.firstName?.[0] || '') + (selectedEmp.lastName?.[0] || '')).toUpperCase() || '??'}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{selectedEmp.name}</h3>
                <p className="text-sm text-slate-500">{selectedEmp.Role || '—'} · {selectedEmp.Department || '—'}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mt-1 inline-block ${statusStyle[selectedEmp.attendance_status === 'present' ? 'Present' : selectedEmp.attendance_status === 'leave' ? 'On Leave' : 'Absent'] || 'bg-slate-100 text-slate-600'}`}>
                  {selectedEmp.attendance_status || 'absent'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal(selectedEmp)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <FiEdit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-600 p-1"><FiX className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ['Email', selectedEmp.email],
              ['Phone', selectedEmp.phone_number],
              ['Login ID', selectedEmp.loginId],
              ['Join Date', selectedEmp.joinDate ? new Date(selectedEmp.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[11px] text-slate-400 font-medium mb-1">{k}</p>
                <p className="font-semibold text-slate-800 text-xs break-all">{v || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {['Employee', 'Department', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No employees found</td></tr>
              ) : filteredEmployees.map((e, i) => {
                const initials = ((e.firstName?.[0] || '') + (e.lastName?.[0] || '')).toUpperCase() || '??'
                const statusKey = e.attendance_status === 'present' ? 'Present' : e.attendance_status === 'leave' ? 'On Leave' : 'Absent'
                return (
                  <tr key={e._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor[i % avatarColor.length]}`}>{initials}</div>
                        <div><p className="font-semibold text-slate-800">{e.name}</p><p className="text-[11px] text-slate-400">{e.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{e.Department || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{e.Role || '—'}</td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[statusKey] || 'bg-slate-100 text-slate-600'}`}>{statusKey}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedEmp(e)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="View"><FiEye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEditModal(e)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors" title="Edit"><FiEdit2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )


  const Attendance = () => {
    const [filter, setFilter] = useState('All')
    console.log("the attendance Data is",attendanceData);
    const filters = ['All', 'Present','Half-day']
    const filtered = filter === 'All' ? attendanceData : attendanceData.filter(a => a.status === filter)
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all
                ${filter === f ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}>
              {f} <span className="ml-1.5 opacity-70">{f === 'All' ? attendanceData.length : attendanceData.filter(a => a.status === f).length}</span>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Attendance Records</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {['Employee', 'Check In', 'Check Out', 'Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a, i) => (
                  <tr key={a._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor[i % avatarColor.length]}`}>{a.avatar}</div>
                        <span className="font-semibold text-slate-800">{a.employee}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{a.checkIn}</td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{a.checkOut}</td>
                    <td className="px-5 py-3.5 text-slate-600">{a.hours}</td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[a.status]}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ── LEAVE APPROVALS — FULLY REAL DATA ──────────────────────────────────────
  const Leaves = () => {
    const [tab, setTab] = useState('pending')
    const tabs = [{ key: 'pending', label: 'Pending' }, { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' }]
    const filtered = leaveData.filter(l => l.status === tab)

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all
                  ${tab === t.key ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}>
                {t.label} <span className="ml-1.5 opacity-75">{leaveData.filter(l => l.status === t.key).length}</span>
              </button>
            ))}
          </div>
          <button onClick={fetchLeaves} disabled={leaveLoading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 px-3 py-2 rounded-xl hover:border-blue-300 transition-all disabled:opacity-50">
            <FiRefreshCw className={`w-3.5 h-3.5 ${leaveLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {leaveLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100"><LeaveLoadingState /></div>
        ) : leaveError ? (
          <div className="bg-white rounded-2xl border border-slate-100"><LeaveErrorState /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-16 text-slate-400">
            <FiCheckSquare className="w-10 h-10 mb-3 text-green-400" />
            <p className="font-semibold">No {tab} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l, i) => {
              // FIX 2: user_id is populated object { firstName, lastName, email, loginId }
              const name = getDisplayName(l.user_name)
              const initials = getInitials(l.user_name)
              return (
                <div key={l._id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-100 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor[i % avatarColor.length]}`}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <p className="font-bold text-slate-800">{name}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[l.status]}`}>{l.status}</span>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${leaveTypeStyle[l.leaveType] || 'bg-slate-100 text-slate-600'}`}>{l.leaveType} leave</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{formatDate(l.startDate)} → {formatDate(l.endDate)}</span>
                        <span className="font-semibold text-slate-700">{l.days} day{l.days > 1 ? 's' : ''}</span>
                        {l.user_id?.loginId && <span className="text-slate-400">ID: {l.user_id.loginId}</span>}
                      </div>
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 italic mb-2">"{l.reason}"</p>
                      {/* FIX 3: was l.comment — correct field is l.reviewComment */}
                      {l.reviewComment && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                          <FiMessageSquare className="w-3 h-3 shrink-0" /> Admin comment: {l.reviewComment}
                        </p>
                      )}
                      {l.reviewedAt && <p className="text-[11px] text-slate-400 mt-1">Reviewed on {formatDate(l.reviewedAt)}</p>}
                    </div>
                    {l.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <button onClick={() => handleLeaveAction(l._id, 'approve')} className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                          <FiCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => handleLeaveAction(l._id, 'reject')} className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-sm">
                          <FiXCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }


  const panels = { overview: Overview, employees: Employees, attendance: Attendance, leaves: Leaves }
  const ActivePanel = panels[active]
  const pageTitle = navItems.find(n => n.key === active)?.label || 'Dashboard'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 p-1"><FiMenu className="w-5 h-5" /></button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">{pageTitle}</h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
              <FiBell className="w-5 h-5" />
              {pendingCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              {userData?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 fade-up"><ActivePanel /></main>
      </div>

      {commentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-1">{commentModal.action === 'approve' ? '✅ Approve Leave' : '❌ Reject Leave'}</h3>
            <p className="text-xs text-slate-400 mb-4">Add a comment (optional) before confirming.</p>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Add a comment..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setCommentModal(null)} disabled={commentLoading}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={confirmLeaveAction} disabled={commentLoading}
                className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60
                  ${commentModal.action === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {commentLoading && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                Confirm {commentModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── ADD EMPLOYEE MODAL ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && closeAddModal()}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl shadow-slate-900/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <FiUsers className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Add New Employee</h2>
                  <p className="text-xs text-slate-400">Fill in details to onboard a team member</p>
                </div>
              </div>
              <button onClick={closeAddModal} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"><FiX className="w-4 h-4" /></button>
            </div>
            {addResult ? (
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold">✓</div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">Employee added successfully!</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-mono font-semibold">ID: {addResult.Emp_loginId}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-mono font-semibold">Pass: {addResult.Emp_password}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1.5">Share these credentials with the employee securely.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={closeAddModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Close</button>
                  <button onClick={() => { setAddResult(null); setAddForm({ firstName: '', lastName: '', email: '', phone: '', Department: '', Role: '', joinDate: '' }) }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                    <FiPlus className="w-4 h-4" /> Add Another
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  {addApiError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-xl">{addApiError}</div>}
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Personal Info</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[['firstName', 'First Name', 'e.g. Ravi'], ['lastName', 'Last Name', 'e.g. Sharma']].map(([name, label, ph]) => (
                      <div key={name} className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500">{label} <span className="text-red-500">*</span></label>
                        <input name={name} value={addForm[name]} onChange={handleAddChange} placeholder={ph}
                          className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all bg-slate-50 focus:bg-white ${addErrors[name] ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`} />
                        {addErrors[name] && <span className="text-xs text-red-500">{addErrors[name]}</span>}
                      </div>
                    ))}</div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Email <span className="text-red-500">*</span></label>
                    <input name="email" type="email" value={addForm.email} onChange={handleAddChange} placeholder="ravi.sharma@company.com"
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all bg-slate-50 focus:bg-white ${addErrors.email ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`} />
                    {addErrors.email && <span className="text-xs text-red-500">{addErrors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Phone <span className="text-red-500">*</span></label>
                    <input name="phone" type="tel" value={addForm.phone} onChange={handleAddChange} placeholder="+91 98765 43210"
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all bg-slate-50 focus:bg-white ${addErrors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`} />
                    {addErrors.phone && <span className="text-xs text-red-500">{addErrors.phone}</span>}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1">Work Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500">Department</label>
                      <select name="Department" value={addForm.Department} onChange={handleAddChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                        <option value="">Select...</option>
                        {['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-500">Role / Designation</label>
                      <input name="Role" value={addForm.Role} onChange={handleAddChange} placeholder="e.g. Frontend Dev"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Joining Date</label>
                    <input name="joinDate" type="date" value={addForm.joinDate} onChange={handleAddChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                </div>
                <div className="px-6 pb-5 flex gap-3 border-t border-slate-100 pt-4">
                  <button onClick={closeAddModal} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                  <button onClick={handleAddSubmit} disabled={addLoading}
                    className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                    {addLoading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Adding...</>
                      : <><FiPlus className="w-4 h-4" /> Add Employee</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* ── EDIT EMPLOYEE MODAL ─────────────────────────────────────────────── */}
      {editEmp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditEmp(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl shadow-slate-900/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FiEdit2 className="text-slate-600 w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Edit Employee</h2>
                  <p className="text-xs text-slate-400 truncate max-w-50">{editEmp.name}</p>
                </div>
              </div>
              <button onClick={() => setEditEmp(null)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {editApiError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2.5 rounded-xl">{editApiError}</div>}
              <div className="grid grid-cols-2 gap-3">
                {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([name, label]) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{label} <span className="text-red-500">*</span></label>
                    <input name={name} value={editForm[name]} onChange={handleEditChange}
                      className={`w-full px-3 py-2 rounded-xl border text-sm outline-none bg-slate-50 focus:bg-white transition-all ${editErrors[name] ? 'border-red-400' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                    {editErrors[name] && <span className="text-xs text-red-500">{editErrors[name]}</span>}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Phone <span className="text-red-500">*</span></label>
                <input name="phone_number" type="tel" value={editForm.phone_number} onChange={handleEditChange}
                  className={`w-full px-3 py-2 rounded-xl border text-sm outline-none bg-slate-50 focus:bg-white transition-all ${editErrors.phone_number ? 'border-red-400' : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`} />
                {editErrors.phone_number && <span className="text-xs text-red-500">{editErrors.phone_number}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Department</label>
                  <select name="Department" value={editForm.Department} onChange={handleEditChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">Select...</option>
                    {['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <input name="Role" value={editForm.Role} onChange={handleEditChange} placeholder="e.g. Frontend Dev"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3 border-t border-slate-100 pt-4">
              <button onClick={() => setEditEmp(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleEditSubmit} disabled={editLoading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {editLoading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Saving...</>
                  : <><FiCheck className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

