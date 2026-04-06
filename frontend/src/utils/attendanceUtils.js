// utils/attendanceUtils.js  (new file)
// export const transformAttendanceRecord = (record) => {
//   const user = record.user_id; // populated object
//   const fullName = user
//     ? `${user.firstName} ${user.lastName}`.trim()
//     : 'Unknown';
//   const avatar = user
//     ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
//     : '??';
//   const fmt = (dateVal) => {
//     if (!dateVal) return '—';
//     return new Date(dateVal).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//   };
//   const calcHours = (checkIn, checkOut) => {
//     if (!checkIn || !checkOut) return '—';
//     const diff = (new Date(checkOut) - new Date(checkIn)) / 36e5; // ms → hours
//     return `${diff.toFixed(1)}h`;
//   };
//   const statusMap = {
//     present:  'Present',
//     absent:   'Absent',
//     leave:    'On Leave',
//     halfday:  'Half-day',
//   };
//   return {
//     id:       record._id,
//     userId:   record.user_id?._id?.toString() ?? record.user_id?.toString(), // ← add this
//     employee: fullName,
//     avatar,
//     checkIn:  fmt(record.checkIn),
//     checkOut: fmt(record.checkOut),
//     hours:    calcHours(record.checkIn, record.checkOut),
//     status:   statusMap[record.status] ?? record.status,
//   };
// };