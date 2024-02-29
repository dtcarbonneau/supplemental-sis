import { useMhsClassesQuery, useAttendanceInClassQuery } from './serverStateQueries.js';
import { Cell, ReportStyle } from './StyledComponents.js';
import { useClientContext } from './clientState.js';

export function AttendanceReport() {

  const { state, dispatch } = useClientContext();
  const { status: statusMhsClasses, data: serverStateMhsClasses } = useMhsClassesQuery();

  const { status: statusAttendanceInClass,
    data: serverStateAttendanceInClass
     } = useAttendanceInClassQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.name);

  if (statusAttendanceInClass !== 'success')
    return "Loading..."

  //return console.log(serverStateAttendanceInClass)
  return (
    <ReportStyle cols={serverStateAttendanceInClass.attendanceInClass[0].attIntervals.length + 1}>
      <Cell width="25" >  </Cell>
      {serverStateAttendanceInClass.attendanceInClass[0].attIntervals.map((d) => {
        return (<Cell>  {d.month}/{d.day}</Cell>)
      })}
      {serverStateAttendanceInClass.attendanceInClass.map((s, index) => {
        return <><Cell width="25" align='start'>
          {s.student.substring(0, s.student.indexOf("@"))} </Cell>
          {s.attIntervals.map(sd => {
            return <Cell>
              {sd.durationOuts.reduce((acc, at) => acc + at.timeOut - at.timeIn, 0)}
            </Cell>
          })}
        </>
      })}
      </ReportStyle>
     )
}
