import { Cell, ReportStyle } from './StyledComponents.js';
import { useEffect } from 'react';
import { useStudentsQuery, useMhsClassesQuery, useAttendanceInClassQuery } from './serverStateQueries.js';
import { useClientContext } from './clientState.js';
import { Stopwatch } from './Stopwatch.js';

export function TakeRepAttendance() {
    const { state, dispatch } = useClientContext();
    const { data: serverStateMhsClasses } = useMhsClassesQuery();
    const {
        status,
         data: serverStateStudents
     } = useStudentsQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.id)

    //the following puts the student index in the clientState. The remaining student info stays
    //in the serverState
    useEffect(() => {
        if (status === 'success') {
            dispatch({
                type: 'FETCH_STUDENTS',
                payload: serverStateStudents.students,
            });
        }
    },[status, serverStateStudents])

    const { status: statusAttendanceInClass,
    data: serverStateAttendanceInClass
     } = useAttendanceInClassQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.name, state.aRstartDate, state.aRendDate );

    if (!state?.students?.[0]?.inClass) return "Loading...";

    console.log(serverStateAttendanceInClass)

    return (
        <ReportStyle arcols={state?.mode === "TakeAttendance" ? "140px 25px 65px" : "140px 50px repeat(" +
            serverStateAttendanceInClass?.attendanceInClass[0]?.attIntervals.length + ",minmax(40px, 1fr))"}>
            {/* Column headers */}
            <Cell>Student</Cell>
            {state?.mode === "TakeAttendance" ?
                <><Cell>P/A</Cell>
                <Cell>In/Out</Cell></>
                :
                <>
                    <Cell>Total</Cell>

                    {serverStateAttendanceInClass?.attendanceInClass[0]?.attIntervals?.map((d, index) => {
                        return <Cell key={index}>  {d.month}/{d.day}</Cell>
                    }
                    )}</>}
            {/* Report body */}
            {/* Attendance Taking Coding */}
            {serverStateStudents?.students.map((s, index) => (<>
                {/* <Cell width='300px' backgroundcolor='##555555' height='28px' */}
                <Cell key= {'s'+ s.id} border={!state.students[index]?.inClass ? "3px solid #AB2328" : ""}
                    opacity={state.students[index]?.inSchool ? 1 : .5}
                    color={state.students[index]?.inClass ? '#4d4d4d' : '#AB2328'}
                >
                    {s.first_name} {s.last_name}</Cell>
                {state?.mode === "TakeAttendance" ? <>
                    <Cell key= {'pa'+ s.id} onClick={() => {
                        dispatch({
                            type: 'TOGGLE_ABSENCE',
                            studentIndexSelected: index
                        })
                    }}> {state.students[index]?.inSchool ? "P" : "A"} </Cell>
                    <Cell  key= {'so'+ s.id} onClick={() => {
                        if (state.students[index].inClass && state.students[index].inSchool) {
                            dispatch({
                                type: 'STUDENT_OUT',
                                studentIndexSelected: index,
                            }
                            )
                        }
                        else if (!state.students[index].inClass && state.students[index].inSchool) {
                            dispatch({
                                type: 'STUDENT_IN',
                                studentIndexSelected: index,
                            }
                            )
                        };
                    }}
                    >
                        {state.students[index]?.inSchool ? <Stopwatch index={index} /> : "-------"}</Cell>
                </> :
                    <>
                        <Cell> {serverStateAttendanceInClass?.attendanceInClass[serverStateAttendanceInClass.attendanceInClass.
                            findIndex(stu => stu.student === s.email)]
                            ?.attIntervals.reduce((acc, sd) =>
                                acc + sd.durationOuts.reduce((accst, int) => accst - int.timeOut + int.timeIn,sd.classDuration),0
                            )}
                            {/* (sd.durationOuts.reduce((accst, at) => accst - at.timeOut + at.timeIn, sd.classDuration)), 0 })} */}
                        </Cell>
                {/* // Attendance Reporting Coding */}
                        {serverStateAttendanceInClass?.attendanceInClass[serverStateAttendanceInClass.attendanceInClass.
                            findIndex(stu => stu.student === s.email)]
                            ?.attIntervals.sort((ai1, ai2) => (ai1.day > ai2.day) ? -1 : 1).map((sd, index) => {
                                return <Cell key={index}>
                                    {sd.durationOuts.reduce((acc, at) => acc - at.timeOut + at.timeIn, sd.classDuration)}
                                </Cell>
                            })}
                </>}
            </>
            ))}

            </ReportStyle>
        )
    };