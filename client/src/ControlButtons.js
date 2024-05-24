import { BaseButton, ModalStyle, ModalOverlayStyle } from './StyledComponents.js';
import { createPortal } from 'react-dom';
import {useAttendanceMutation,useStudentsQuery, useMhsClassesQuery} from './serverStateQueries.js';
import { useEffect, useState } from 'react';
import { useClientContext } from './clientState.js';

export function UserStatus() {
    const { state, dispatch } = useClientContext();
    //545176888048
    useEffect(() => {
        fetch('/api/user')
            .then(res => res.json())
            .then(data => dispatch({
                type: 'USER_INFO',
                payload: data.user_email,
            }))
            .catch(error => { dispatch({ type: 'FETCH_ERROR' }) })
    }, [])
    if (state.user_email) {
        return (
            <>
                {state.user_email} <br />
                <BaseButton onClick={() =>
                    dispatch({
                        type: 'USER_INFO',
                        payload: '',
                    })}> Sign out </BaseButton>
                </>
            )
        }
        return (<>
                Not signed in <br />
                    <BaseButton onClick={()=>window.location.href='/api/login'}>Sign In</BaseButton>
                </>
        );
}

export function HomeButton() {
    const { state, dispatch } = useClientContext();
    return (
    <BaseButton onClick={() => dispatch({
        type: 'CHANGE_MODE',
        payload: 'InitialOptions'
    })}>Back</BaseButton>)
}

export function TakeAttendanceButton() {
    const { state, dispatch } = useClientContext();
    return (
    <BaseButton onClick={() => dispatch({
        type: 'CHANGE_MODE',
        payload: 'TakeAttendance'
    })}>Take Attendance</BaseButton>)
}

export function ReportAttendanceButton(){
    const { dispatch } = useClientContext();
    return (
        <BaseButton onClick={() => dispatch({
            type: 'CHANGE_MODE',
            payload: 'ReportAttendance'
        })}>
            Report Attendance
        </BaseButton>
    )
}
export function ReportSubmittalsButton(){
    const { dispatch } = useClientContext();
    return (
        <BaseButton onClick={() => dispatch({
            type: 'CHANGE_MODE',
            payload: 'ReportSubmittals'
        })}>
            Report Assignments
        </BaseButton>
    )
}

export function ReportAttStartDateInput() {
    const [aRstartDate, setaRstartDate] = useState()
    const [aRendDate, setaRendDate] = useState()
    const { dispatch } = useClientContext();

    function handleChangeSd(e) {
        setaRstartDate(e.target.value)
    }

    function handleChangeEd(e) {
        setaRendDate(e.target.value)
    }

    function handleUpdate() {
        dispatch({
            type: 'aRdateChange',
            aRstartDate: Date.parse(new Date(aRstartDate).toLocaleDateString('fr-CA'))/1000,
            aRendDate: Date.parse(new Date(aRendDate).toLocaleDateString('fr-CA'))/1000
        })
    }

    return (<>
        <label>Start Date: <input type="date" value={aRstartDate} onChange={handleChangeSd}></input> </label>
        <label>End Date: <input type="date" value={aRendDate} onChange={handleChangeEd}></input> </label>
        <BaseButton onClick={handleUpdate}>Update</BaseButton></>)
}

export function StartEndClassButton() {
    const { state, dispatch } = useClientContext();

    const handleStartEnd = () => {
        if (!state.classInSession) {

            dispatch({
                type: 'CLASS_START',
            })
        }
        else {
            dispatch({
                type: 'CLASS_END',
                timeClassEnd: Math.floor(Date.now() / 1000)
            })
            dispatch({
                type: 'CHANGE_MODE',
                payload: 'SaveAttendance'
            })
        }
    }
    return (
        <BaseButton onClick={handleStartEnd}>
            {!state.classInSession ? "Start Class" : "End Class"}</BaseButton>
        )
}

export function SaveAttendanceButton() {
    const { state, dispatch } = useClientContext();
    const { status: statusMhsClasses, data: serverStateMhsClasses } = useMhsClassesQuery();

    const {
        status,
         data: serverStateStudents
     } = useStudentsQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.id)
    //cobine attendance timestamps with serverState
    const namedAttendance = (status === 'success') ?
        state.attendance.map((timestamp) => {
            return {
                mhs_class: serverStateMhsClasses[timestamp.mhsClassIndex].name,
                time_class_start: timestamp.time_class_start,
                time_class_end: timestamp.time_class_end,
                student: serverStateStudents.students[timestamp.studentIndex].email,
                time_in: timestamp.time_in,
                time_out: timestamp.time_out
            }
        }) : null

    const { isLoading, isSuccess, error, mutate } = useAttendanceMutation({ attendanceTimeStamps: namedAttendance });

    return (
        createPortal(<ModalOverlayStyle>
                <ModalStyle>
                <BaseButton onClick={() => {
                    mutate()
                    dispatch({
                        type: 'ATTENDANCE_SAVED',
                    })
                    dispatch({
                        type: 'CHANGE_MODE',
                        payload: 'NoClass'
                    })
                    }}>
                    Save Attendance
                </BaseButton>
                    <BaseButton onClick={() => {
                    dispatch({
                        type: 'CHANGE_MODE',
                        payload: 'NoClass'
                    })
                    }}>
                    Cancel
                </BaseButton>

        </ModalStyle></ModalOverlayStyle>, document.getElementById('portal')
    ))
}
