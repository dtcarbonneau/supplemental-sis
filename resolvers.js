/* eslint-disable no-multi-str */
import pg from 'pg';
import 'dotenv/config.js';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES,
  host: 'localhost',
  database: 'supplementalsis',
  password: process.env.DBPASSWORD,
  port: 5432,
})

export const resolvers = {
  Query: {
    apiStatus: (parent, args, context, info) => {
      return { status: 'The API is working correctly.' }
    },

    student: async (parent, { email }, context, info) => {
      const res = await pool.query(" \
      SELECT st.email, st.first_name, st.last_name, \
	      (SELECT json_agg(supports) supporter \
	      FROM (   \
	 	      SELECT \
	 	        su.sup_role, sp.first_name, sp.last_name, sp.email sup_email \
	 	        FROM support su \
	 	        JOIN supporters sp  \
	 	        ON sp.email = su.sup_email \
		        WHERE su.student_email = $1) \
		        AS supports)  \
	      FROM students st WHERE email = $1", [email])
    },

    attendanceInClass: async (parent, { mhsClassName }, context, info) => {
      const res = await pool.query("with q1 as \
          (select student,extract(MONTH from to_timestamp(time_class_start)) as month,\
          extract(DAY from to_timestamp(time_class_start)) as day,\
          extract(HOUR from to_timestamp(time_class_start)) as hour,\
          extract(MINUTE from to_timestamp(time_class_start)) as minute,\
          (time_class_end-time_class_start)/60 as classduration,\
          json_agg((select row_to_json(_) from \
          (select (a.time_in-a.time_class_start)/60 as \"timeIn\",\
          (a.time_out-a.time_class_start)/60 as \"timeOut\") as _)) as durationouts \
          from attendance as a \
          where mhs_class = $1 \
          group by student,month,day,hour,minute,classduration)\
          select student, json_agg(json_build_object('month', month,\
          'day', day, 'hour', hour, 'minute', minute,\
          'classDuration', classduration, 'durationOuts', durationouts)) as \"attIntervals\" from q1 \
          group by student", [mhsClassName])
      return res.rows // ...res3.rows } //,Support:res2 }
    },
    students: async (parent, args, context, info) => {
      //console.log(context)
      const access_token = context.token
      const gc_res = await fetch(`https://classroom.googleapis.com/v1/courses/${args.courseId}/students`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      }).then(gc_res => gc_res.json())
        .then(gc_res => {
          return gc_res.students.map(student => {
            return {
              'course_id': student.courseId, 'email': student.profile.emailAddress, 'studentId':student.userId,
              'first_name': student.profile.name.givenName, 'last_name': student.profile.name.familyName
            }
          })
        })
      //console.log(gc_res.sort((s1, s2)=>(s1.last_name > s2.last_name) ? 1 : (s1.last_name < s2.last_name) ? -1: 0 ))
      return gc_res.sort((s1, s2) => (s1.last_name > s2.last_name) ? 1 : (s1.last_name < s2.last_name) ? -1 : 0)//;
    },

    assignments: async (parent, args, context, info) => {
      //console.log(context)621213441263
      const access_token = context.token
      const gc_res = await fetch(`https://classroom.googleapis.com/v1/courses/${args.courseId}/courseWork`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }
        }).then(gc_res => gc_res.json())
        .then(gc_res => {
          console.log(JSON.stringify(gc_res))
          return gc_res.courseWork.filter((assign)=>assign?.gradeCategory?.name?.substring(0,2)===args.qtr).
            map(assign => {
              return {
                'courseId': assign.courseId,
                'assignId': assign.id,
                'pointsAvail':assign.maxPoints,
                'gradeCatName': assign?.gradeCategory?.name,
                'gradeCatWeight': assign?.gradeCategory?.weight,
                'title': assign.title,
                'dueDate': assign.dueDate.year + "-" + assign.dueDate.month + "-" + assign.dueDate.day +
                  "T" + assign.dueTime.hours + ":" + assign.dueTime.minutes + ":59.999Z"
                //'studentIds': assign.studentIds
              }
            })
        })
      return gc_res
    },

    submissions: async (parent, args, context, info) => {
      //console.log(context)621213441263
      const access_token = context.token
      const gc_res = await fetch(`https://classroom.googleapis.com/v1/courses/${args.courseId}/courseWork/-/studentSubmissions`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      }).then(gc_res => gc_res.json())
        .then(gc_res => {
          console.log(args.assignments.map(assign=>assign))
          return gc_res.studentSubmissions.filter(sub =>
              args.assignments.map(assign=>assign.assignId).includes(sub.courseWorkId)).
            map(sub => {
                return {
                  'courseId': sub.courseId,
                  'assignId': sub.courseWorkId,
                  'studentId': sub.userId,
                  'lastTurnIn': sub.submissionHistory.filter(subHist => 'stateHistory' in subHist).
                              filter(subHist => (subHist.stateHistory.state === 'TURNED_IN')).
                              map(subHist => subHist.stateHistory.stateTimestamp).slice(-1)[0],
                  'pointsEarned': sub.submissionHistory.filter(subHist => 'gradeHistory' in subHist).
                              map(subHist => subHist.gradeHistory.pointsEarned).slice(-1)[0],
                  'retries': sub.submissionHistory.filter(subHist => 'stateHistory' in subHist).
                              filter(subHist => subHist.stateHistory.state === 'RETURNED').length -1

                }
              })

    })
    return gc_res
      //console.log(gc_res.sort((s1, s2)=>(s1.last_name > s2.last_name) ? 1 : (s1.last_name < s2.last_name) ? -1: 0 ))
      //return gc_res.sort((s1, s2) => (s1.last_name > s2.last_name) ? 1 : (s1.last_name < s2.last_name) ? -1 : 0)//;
    }
    ,

    mhsClasses: async (parent, args, context, info) => {
      const access_token = context.token
      const gc_res = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      }).then(gc_res => gc_res.json())
        .then(gc_res => {
          return gc_res.courses.filter(course => course.courseState === 'ACTIVE')
            .map(course => {
              return {
                'id': course.id, 'name': course.name,
                'gradeCategories': course.gradebookSettings.gradeCategories?.
                    filter(cat => cat.name?.substring(0,2)===args.qtr)
              }
            })
        })
      return gc_res;
    }



    //'621213441263'
    // const res1 = await pool.query('SELECT email, first_name, last_name from students')
    // console.log(res1.rows)
    // const res2 = await pool.query("select first_name, last_name, email, sup_role \
    //   from supporters sr left join support su \
    //   on su.sup_email = sr.email where su.student_email = 'abigail.cooke@melroseschools.com'");
    // console.log(res2.rows)
    // //$1:: text',['oto.albanese@melroseschools.com'])
    // //  return {

    //return {
    ///  ...res1.rows, //support.sup_role: "test" }
    //supporter:{ first_name: "test", last_name: "test", sup_email: "test"  }

    //pool.query('SELECT $1::text as first_name', ['brianc'])
  },

  //Supporter: () => { return { first_name: "test", last_name: "test", sup_email: "test" } }

  //Support: {
  //   first_name: {//async(parent, args, context, info) => {
  //await pool.query("select first_name, last_name, email, sup_role \
  //from supporters sr left join support su \
  //on su.sup_email = sr.email where su.student_email = 'abigail.cooke@melroseschools.com'");
  //$1:: text',['oto.albanese@melroseschools.com'])
  //  return {
  //    first_name:"test",
  //    last_name: "test",
  //    sup_email: "test"
  // }
  // },

  Mutation: {
    createAttendanceTimeStamps: (parent, args, context, info) => {
      const dbInsert = pool.query("\
            INSERT INTO attendance (mhs_class, time_class_start, time_class_end, student, time_in, time_out) \
            SELECT mhs_class, time_class_start, time_class_end, student, time_in, time_out \
            FROM json_populate_recordset(null::attendance,$1) RETURNING student",
            [JSON.stringify(args.AttendanceTimeStamps)])
      },
    }
  }
