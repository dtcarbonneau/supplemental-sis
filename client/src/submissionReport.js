import { useMhsClassesQuery, useSubmissionsQuery, useAssignmentsQuery, useStudentsQuery } from './serverStateQueries.js';
import { Cell, ReportStyle } from './StyledComponents.js';
import { useClientContext } from './clientState.js';

export function SubmissionReport() {

  const { state, dispatch } = useClientContext();
  const { status: statusMhsClasses, data: serverStateMhsClasses } = useMhsClassesQuery('Q2');
  const {
    status: studentStatus,
    data: serverStateStudents
  } = useStudentsQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.id)

  const { status: statusAssignments, data: serverStateAssignments } = useAssignmentsQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.id, 'Q2')

  console.log(serverStateAssignments)
  //use assignments to create a submission template for each student

  const { status: statusSubmissions,
    data: serverStateSubmissions
  } = useSubmissionsQuery(serverStateMhsClasses?.[state.mhsClassIndex]?.id,
    serverStateAssignments?.assignments)

  if (statusSubmissions !== 'success')
    return "Loading..."

  const submissionsRemapped = serverStateSubmissions.submissions.reduce(
    (acc, { studentId, lastTurnIn, assignId, pointsEarned, retries }) => {
      acc[studentId + '-' + assignId] =
        { lastTurnIn: lastTurnIn, pointsEarned: pointsEarned, retries: retries }
      return acc;
    },);
  //create student by assignment matrix and fill in with submissions
  const studentsAssigns = serverStateStudents?.students?.reduce((acc, student) => {
    serverStateAssignments.assignments.map(assign => {
      acc.push({
        name: student.last_name + ', ' + student.first_name,
        gradeCatName: assign.gradeCatName,
        gradeCatWeight: assign.gradeCatWeight,
        title: assign.title,
        dueDate: assign.dueDate,
        lastTurnIn: submissionsRemapped[student.studentId + '-' + assign.assignId]?.lastTurnIn,
        pointsAvail: assign.pointsAvail,
        pointsEarned: submissionsRemapped[student.studentId + '-' + assign.assignId]?.pointsEarned,
        retries: submissionsRemapped[student.studentId + '-' + assign.assignId]?.retries
      }
      )
      return acc
    })
    return acc
  }, []).
    //restructure studentAssign array elements to group by students
    reduce((acc, stuAssign) => {
      if (acc.map(stu => stu.name).indexOf(stuAssign.name) === -1) {
        acc.push({ name: stuAssign.name, work: [] })
      }
      acc[acc.findIndex(stu => stu.name === stuAssign.name)].
        work.push({
          gradeCatName: stuAssign.gradeCatName,
          gradeCatWeight: stuAssign.gradeCatWeight,
          title: stuAssign.title,
          dueDate: stuAssign.dueDate,
          lastTurnIn: stuAssign.lastTurnIn,
          pointsEarned: stuAssign.pointsEarned || 0,
          pointsAvail: stuAssign.pointsAvail,
          retries: stuAssign.retries
        })
      return acc;
    }, []).
    reduce((acc, student) => {
      acc.push({
        name: student.name,
        work: student.work.
          //restructure student array elements to group by grade categories
          reduce((workAcc, work) => {
            if (workAcc.map(accCat => accCat.gradeCatName).indexOf(work.gradeCatName) === -1) {
              workAcc.push({ gradeCatName: work.gradeCatName, gradeCatWeight: work.gradeCatWeight, assignments: [] })
            }
            workAcc[workAcc.findIndex(cat => cat.gradeCatName === work.gradeCatName)].
              assignments.push({
                title: work.title,
                dueDate: work.dueDate,
                lastTurnIn: work.lastTurnIn,
                pointsEarned: work.pointsEarned,
                pointsAvail: work.pointsAvail,
                retries: work.retries,
                rawGrade: work.pointsEarned * 100 / work.pointsAvail
              })
            workAcc[workAcc.findIndex(cat => cat.gradeCatName === work.gradeCatName)]
            ['gradeCatAvg'] =
              workAcc[workAcc.findIndex(cat => cat.gradeCatName === work.gradeCatName)].
                assignments.reduce((catAvg, assign) => {
                  return catAvg += assign.pointsAvail
                }, 0)
            return workAcc;
          }, []),
      })
      acc[acc.findIndex(stu => stu.name === student.name)].avg =
        acc[acc.findIndex(stu => stu.name === student.name)].work.
          reduce((acc, cat) => acc += cat.gradeCatAvg , 0)
      return acc
    }, [])

  console.log(studentsAssigns)

  return (
    <>
      <ReportStyle
        // Begin column headers
        cols={studentsAssigns[0].work.reduce((acc, cat) => {
          return acc += cat.assignments.length
        }, studentsAssigns[0].work.length + 1)}
        rows={studentsAssigns.length + 1}>
        <Cell
        bordercolor="blue" borderwidth= "0px 1px 2px 0px"> </Cell>
        <Cell writingmode='vertical-rl' transform='-1'
        bordercolor="blue" borderwidth= "2px 0px 0px 1px" fontweight="bold">Average Grade</Cell>
        {studentsAssigns[0].work.map(cat => {
          return (<><Cell key={cat.gradeCatName} bordercolor="blue" borderwidth= "2px 0px 0px 1px"
            writingmode='vertical-rl' fontweight="bold" transform='-1'>
            {cat.gradeCatName} Avg</Cell>
              {cat.assignments.map(assign => {
                return <Cell writingmode='vertical-rl' transform='-1'
                bordercolor="blue" borderwidth= "2px 0px 0px 1px">
                {assign.title}</Cell>
                }
                )
              }</>)
        })}
        {/* End column headers */}
        {/* Begin data */}
        {studentsAssigns.map((student,index) => {
          return (<><Cell backgroundcolor={index % 2 === 0 ? "#E0F8E6" : ""} justifyitems='start'
          bordercolor="blue" borderwidth= "0px 1px 0px 0px">{student.name}</Cell>
            <Cell backgroundcolor={index % 2 === 0 ? "#E0F8E6" : ""} bordercolor="blue" fontweight="bolder"
              justifyitems="center" borderwidth="0px 1px 0px 0px">{student.avg}</Cell>
            {student.work.map(cat => {
              return <><Cell backgroundcolor={index % 2 === 0 ? "#E0F8E6" : ""} fontweight="bold" bordercolor="blue"
                borderwidth="0px 1px 0px 0px" justifyitems="center">{cat.gradeCatAvg}</Cell>{
                cat.assignments.map(assign => {
                  return <Cell backgroundcolor={index % 2 === 0 ? "#E0F8E6" : ""} bordercolor="blue" borderwidth="0px 1px 0px 0px"
                  justifyitems="center">{assign.pointsEarned}</Cell>
                })}</>
            })}</>
          )
        })}
      </ReportStyle>
      </>)
}