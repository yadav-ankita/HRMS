import axios from 'axios'
import '../axios'
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();
const AppContextProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [TotalEmployees, setEmployees] = useState([]);
    const [EmpStates, setEmpStates] = useState('');
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [weeklyAttendance, setWeeklyAttendance] = useState([]);
    const [todayAttendanceAll, setTodayAttendanceAll] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState(null);
    const [todayLeaveCnt, setTodayLeaveCount] = useState(0);
    // Add new state
    const [todayAbsentCnt, setTodayAbsentCnt] = useState(0);
    

    // register
    const register = async ({ companyName, name, email, phone, password, confirmPassword }) => {
        try {
            const { data } = await axios.post
                (`/auth/signup`,
                    {
                        companyName: companyName, name: name, email: email, phone: phone, password: password, confirmPassword: confirmPassword
                    })
            return data;
            // dispatch({ type: 'REGISTER_USER_SUCCESS', payload: data.user.name })
            // localStorage.setItem(
            //     'user',
            //     JSON.stringify({ name: data.user.name, token: data.token })
            // )
        } catch (error) {
            // dispatch({ type: 'REGISTER_USER_ERROR' })
            throw error;
        }
    }
    // login
    const login = async ({ loginId, password }) => {
        try {
            const { data } = await axios.post(`/auth/login`,
                {
                    loginId: loginId, password: password
                })
            console.log("the data which we got from backend login is", data);

            setUserData(data.userInfo);
            localStorage.setItem(
                'user',
                JSON.stringify({ username: data.userInfo.username, token: data.token, role: data.userInfo.role })
            )

            return data;

        } catch (error) {
            // dispatch({ type: 'REGISTER_USER_ERROR' })
            throw error;
        }
    }
    // logout
    const logout = () => {
        localStorage.removeItem('user')
        setUserData(null);
    }
    const applyForLeave = async (leaveData) => {
        //console.log("the leave data in context is", leaveData);
        try {
            const { data } = await axios.post('/leave/apply',
                leaveData
            )
            //console.log("the data from the backend on applyforleave is", data);
            return data;
        } catch (error) {
            throw error;
        }
    }
    const getAllEmployeesLeaves = async () => {
        try {
            const { data } = await axios.get('/leave/')
            //console.log("the data from backend for all employees leaves is", data);
            return data;
        } catch (error) {
            throw error;
        }
    }
    const getMyLeaves = async () => {
        try {
            const { data } = await axios.get('/leave/my')
            //console.log("the data from backend for my leaves is", data);
            return data;
        } catch (error) {
            throw error;
        }
    }
    const manageLeaveByAdmin = async (leaveId, status, reviewComment = '') => {
        try {
            const { data } = await axios.patch(`/leave/${leaveId}/status`, {
                status,        // 'approved' or 'rejected'
                reviewComment
            });
            //console.log("leave update response:", data);
            return data;
        } catch (error) {
            throw error;
        }
    }
    const todayLeaveCount = async () => {
        try {
            const { data } = await axios.get('/leave/today-leave');
            //console.log("today leave count data", data);
            setTodayLeaveCount(data.totalLeaveCountToday)
        } catch (error) {
            throw error;
        }
    }
    const AddEmployee = async (empData) => {
        try {
            const { data } = await axios.post('/employee', empData);
            //console.log("the data of all the employess is", data);
            return data;
        } catch (error) {
            throw error
        }
    }
    const getAllEmployees = async () => {
        try {
            const { data } = await axios.get('/employee');
            //console.log("the data of all the employess is", data);
            setEmployees(data.Employees);
        } catch (error) {
            throw error
        }
    }
    const getEmpById = async (empId) => {
        try {
            const { data } = await axios.get(`/employee/${empId}`);
            //console.log("the data of one the employess is", data);
        } catch (error) {
            throw error
        }
    }
    const updateEmpDetails = async (empId, updatedData) => {
        try {
            const { data } = await axios.patch(`/employee/${empId}`, updatedData);
            //console.log("the updated employee data is", data);
            return data;
        } catch (error) {
            throw error
        }
    }
    // Add new function
    const getTodayAbsentCnt = async () => {
        try {
            const { data } = await axios.get('/attendance/today-absent');
            setTodayAbsentCnt(data.absentCount);
        } catch (error) {
            throw error;
        }
    };
    const getTodaysAttendance = async () => {
        try {
            const { data } = await axios.get('/attendance/my-today');
            setTodayAttendance(data.Attendance);
            return data.Attendance;
        } catch (error) {
            throw error;
        }
    }

    const getTotalStatusAttendance = async () => {
        try {
            const { data } = await axios.get('/attendance/my-stats');
            setEmpStates(data.stats); // ← fix: it's data.stats not data
        } catch (error) {
            throw error;
        }
    }
    const getWeeklyAttendanceEmp = async () => {
        try {
            const { data } = await axios.get('/attendance/my-weekly');
            setWeeklyAttendance(data.AttendanceRecords);
            return data.AttendanceRecords;
        } catch (error) {
            throw error;
        }
    }
    const checkIn = async () => {
        try {
            const { data } = await axios.post('/attendance/check-in');
            setTodayAttendance(data.User_Attendance);
            return data.User_Attendance;
        } catch (error) {
            throw error;
        }
    }
    const checkOut = async () => {
        try {
            const { data } = await axios.post('/attendance/check-out');
            setTodayAttendance(data.User_Attendance);
            return data.User_Attendance;
        } catch (error) {
            throw error;
        }
    }
    const getTodaysAllEmp = async () => {
        setAttendanceLoading(true);
        setAttendanceError(null);
        try {
            const { data } = await axios.get('/attendance/today');
            //console.log("the data on getTodayAllEmp is",data);
            setTodayAttendanceAll(data.AttendanceRecords || []);
        } catch (error) {
            setAttendanceError(error);
            throw error;
        } finally {
            setAttendanceLoading(false);
        }
    };
    const EmpsTodayLeave=async()=>{
        try {
            const { data } = await axios.get('/leave/today-leave-employees');
            return data.todayLeaveEmployees || [];
        }
        catch (error) {
            throw error;
        }
    }
    useEffect(() => {
        const user = localStorage.getItem('user')
        if (user) {
            const newUser = JSON.parse(user)
            //console.log("the new User data is", newUser)
            setUserData(newUser);
        }
    }, [])

    return (
        <AppContext.Provider
            value={
                {

                    userData,
                    register,
                    login,
                    logout,
                    applyForLeave,
                    getAllEmployeesLeaves,
                    getMyLeaves,
                    todayLeaveCount,
                    todayLeaveCnt,
                    manageLeaveByAdmin,
                    TotalEmployees,
                    AddEmployee,
                    getAllEmployees,
                    getEmpById,
                    updateEmpDetails,
                    todayAttendance,
                    weeklyAttendance,
                    getTotalStatusAttendance,
                    EmpStates,
                    getWeeklyAttendanceEmp,
                    checkOut,
                    checkIn,
                    getTodaysAttendance,
                    getTodaysAllEmp,
                    todayAttendanceAll,
                    attendanceLoading,
                    attendanceError,
                    getTodayAbsentCnt,
                    todayAbsentCnt,
                    EmpsTodayLeave
                }
            }
        >
            {children}
        </AppContext.Provider >
    )
}
const useGlobalContext = () => {
    return useContext(AppContext)
}
export { useGlobalContext, AppContextProvider }
