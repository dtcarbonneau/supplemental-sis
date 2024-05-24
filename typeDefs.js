export const typeDefs = `#graphql

    input AttendanceTimeStampInput {
      attId: Int
      mhs_class: String
      time_class_start: Int
      time_class_end: Int
      student: String
      time_in: Int
      time_out: Int
    }

    input AssignmentInput {
      courseId:String
      assignId:String
      title:String
      pointsAvail:Int
      dueDate:String
      gradeCatName:String
      gradeCatWeight:String
    }

    type Query {
      apiStatus: ApiStatus
      student(email:String):Student
      students(courseId:String): [Student]
      support: [Supporter]
      mhsClasses(qtr:String):[MhsClass]
      attendanceInClass(mhsClassName:String, aRstartDate:Int, aRendDate: Int):[AttendanceInClass]
      submissions(courseId:String, assignments:[AssignmentInput]):[Submission]
      assignments(courseId:String,qtr:String):[Assignment]
    }
    type Mutation {
      createAttendanceTimeStamp(
      attId: Int,
      mhs_class: String,
      time_class_start: Int,
      time_class_end: Int,
      student: String,
      time_in: Int,
      time_out: Int):AttendanceTimeStamp
      createAttendanceTimeStamps(AttendanceTimeStamps:[AttendanceTimeStampInput]):AttendanceTimeStamp
    }
    type Assignment {
      courseId:String
      assignId:String
      title:String
      dueDate:String
      pointsAvail:Int
      gradeCatName:String
      gradeCatWeight:String
    }

    type Submission {
      courseId:String
      assignId:String
      studentId:String
      lastTurnIn:String
      pointsEarned:Float
      retries: Int
    }


    type AttendanceInClass {
      student: String,
      attIntervals: [AttInterval]
    }

    type AttInterval {
      month: Int,
      day: Int,
      hour: Int,
      minute: Int,
      classDuration: Int,
      durationOuts: [DurationOut]
    }

    type DurationOut {
      timeIn: Int,
      timeOut:Int
    }

    type AttendanceTimeStamps {
      AttendanceTimeStamps:[AttendanceTimeStamp]}

    type AttendanceTimeStamp {
      attId: Int
      mhs_class: String
      time_class_start: Int
      time_class_end: Int
      student: String
      time_in: Int
      time_out: Int
    }

    type ApiStatus {
      status: String
    }

    input UserInput {
      firstName:String
      lastName: String
      email: String
      password: String
    }

    type User {
      firstName: String
      lastName: String
      email: String
    }

    type Student {
      courseId:String
      studentId:String
      email: String
      first_name: String
      last_name: String
      ${/*supporter: [Supporter]*/''}
    }

    type Students {
      students:[Student]
    }

    type MhsClass {
      id: String
      name: String
      gradeCategories:[gradeCategory]

    }

    type gradeCategory {
      id:String
      name:String
      weight:Int
      defaultGradeDenominator: Int
    }

    type Supporter {
      sup_role: String
      sup_email: String
      first_name: String
      last_name: String
      salutation: String
      support: [Support]
    }

    type Support {
      student: Student
      supporter: Supporter
      sup_role: String
    }
  `