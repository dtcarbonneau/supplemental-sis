import { useReducer, createContext, useContext, useEffect } from 'react';
export const ClientContext = createContext();

const clientContextReducer = (state, action) => {
    console.log('dispatch:', action);
    switch (action.type) {
        case 'USER_INFO':
            return {
                ...state,
                user_email: action.payload
            }
        case 'focusChange':
            return {...state, focusedInput: action.payload}
        case 'dateChange':
            return {
                ...state,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
            }
        case 'FETCH_CLASSES':
            return { ...state, mhsClasses: action.payload }

        case 'DISPLAY_MODE':
            return {
                ...state,
                display: action.display,
            }
        case 'SELECT_CLASS':
            return {
                ...state,
                mhsClassIndex: action.mhsClassIndex,
                mhsClassId: action.mhsClassId,
                mhsClassName: action.mhsClassName,
                attendanceReport:[]
            }

        case 'FETCH_STUDENTS':
            console.log(action.payload)
            return {
                ...state,
                students: action.payload.map((student, index) => {
                    return {
                        studentIndex:index,
                        inClass: true,
                        inSchool: true,
                        timeIn: Math.floor(Date.now() / 1000)
                    }
                })
            }

        case 'CLASS_START':
            return {
                ...state,
                attendance: [],
                classInSession: true,
                display: "students",
                timeClassStart: Math.floor(Date.now() / 1000),
                students: state.students.map((student) => {
                    return {
                        ...student,
                        inClass: true,
                        inSchool: true,
                        timeIn: Math.floor(Date.now() / 1000)
                    }
                }),
            }
        case 'TOGGLE_ABSENCE':
            return {
                ...state,
                students: state.students.map((student, i) => {
                    if (i !== action.studentIndexSelected) {
                        return student;
                    } else {
                        return {
                            ...student, inSchool: !student.inSchool,
                        };
                    }
                })
            }
        case 'CLASS_END':
            return {
                ...state,
                classInSession: false,
                display: "mhsClasses",
                timeClassEnd: action.timeClassEnd,
                //for students that are not present when class ends (absent or not returned)
                //update classEnd field. for students that are present update timeout and classEnd
                attendance: [...state.attendance.map((interval) => {
                    return { ...interval, time_class_end: action.timeClassEnd }
                            }),
                            ...state.students.filter((stu)=>stu.inClass).map((stu) => {
                                return {
                                    mhsClassIndex: state.mhsClassIndex,
                                    time_class_start: state.timeClassStart,
                                    studentIndex: stu.studentIndex,
                                    time_in: stu.timeIn,
                                    time_out: action.timeClassEnd,
                                    time_class_end: action.timeClassEnd
                                }
                        })
                    ],
                students: state.students.map((stu) => {
                    return { ...stu, inClass: false }}),
                mhsClassName: null,
                mhsClassId: null,
            }

        case 'STUDENT_OUT':
            return {
                ...state,
                studentIndexSelected: action.studentIndexSelected,
                attendance: [ ...state.attendance,
                    {
                        mhsClassIndex: state.mhsClassIndex,
                        time_class_start: state.timeClassStart,
                        studentIndex: action.studentIndexSelected,
                        time_in: state.students[action.studentIndexSelected].timeIn,
                        time_out: Math.floor(Date.now() / 1000)
                    }],
                students: state.students.map((student, i) => {
                    if (i !== action.studentIndexSelected) {
                        return student;
                    } else {
                        return {
                            ...student, inClass: false,
                            timeIn: null
                        };
                    }
                }),
            }
        case 'STUDENT_IN':
            return {
                ...state,
                studentIndexSelected: action.studentIndexSelected,
                students: state.students.map((student, i) => {
                    if (i !== action.studentIndexSelected) {
                        return student;
                    } else {
                        return {
                            ...student, inClass: true,
                            timeIn: Math.floor(Date.now() / 1000)
                        };
                    }
                }),
            }
        case 'ATTENDANCE_SAVED':
            return {
                ...state,
                attendance: [],
                mhsClassIndex: null,
            }
        case 'FETCH_ATTENDANCE':
            return {
                ...state,
                attendanceReport: action.payload
                //attendance:[]
            }
        case 'CHANGE_MODE':
            return {
                ...state,
                mode: action.payload
                //attendance:[]
            }
        default:
            return state
    }
}

export function ClientContextProvider({ children }) {
    const initialState = {
        user_email: null,
        mode: null,
        classInSession: false,
        timeClassStart: null,
        startDate: null,
        endDate: null,
        focusedInput: null,
        loading: true,
        display: 'mhsClasses',
        mhsClasses: [],
        mhsClassIndex: null,
        mhsClassId: null,
        mhsClassName: null,
        students: [],
        studentIndexSelected: null,
        attendance: [],
        attendanceReport: [],
        error: ''
        }
    const [state, dispatch] = useReducer(clientContextReducer, initialState);
    useEffect(() => {
        console.log('state:', state);
    }, [state]);

    return (
        <ClientContext.Provider value={{ state, dispatch }}>
                {children}
        </ClientContext.Provider>
    )
}

export function useClientContext() {
    return useContext(ClientContext)
}
