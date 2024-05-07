import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gql, request} from 'graphql-request';

export const useMhsClassesQuery = (qtr) => {
    return useQuery({
        queryKey: ['mhsClasses'],
        queryFn: async () => {
            const { mhsClasses } = await
                request('./api/graphql',
                gql`
                    query MhsClasses($qtr: String) {
                    mhsClasses(qtr: $qtr) {
                        id
                        name
                        gradeCategories {
                            defaultGradeDenominator
                            weight
                            name
                            id
                    }
                }
            }`,
                { qtr: qtr }
            );
            return mhsClasses;
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false
    });
}

export const useStudentsQuery = (courseId) => {
    return useQuery({
        queryKey: ["students", courseId],
        queryFn: async () => {
            const { students } = await
                request(
                    './api/graphql',
                    gql`
                    query Students($courseId: String) {
                    students(courseId: $courseId) {
                    studentId
                    email
                    first_name
                    last_name
                    }
                }`,
                    { courseId: courseId }
                );
            return { students };
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!courseId,
    }
    );
}

export const useAssignmentsQuery = (courseId, qtr) => {
    return useQuery({
        queryKey: ["assignments", courseId],
        queryFn: async () => {
            const assignments = await
                request(
                    './api/graphql',
                    gql`
                    query Assignments($courseId: String, $qtr: String) {
                        assignments(courseId: $courseId, qtr: $qtr) {
                        title
                        assignId
                        gradeCatWeight
                        gradeCatName
                        pointsAvail
                        dueDate
                        courseId
                        }
                    }`,
                    { courseId: courseId, qtr: qtr }
                );
            return assignments
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!courseId,
    }
    );
}

export const useSubmissionsQuery = (courseId, assignments) => {
    return useQuery({
        queryKey: ["submissions", courseId, assignments],
        queryFn: async () => {
            const { submissions } = await
                request(
                    './api/graphql',
                    gql`
                    query Submissions($courseId: String, $assignments: [AssignmentInput]) {
                        submissions(courseId: $courseId, assignments: $assignments) {
                        studentId
                        retries
                        assignId
                        pointsEarned
                        lastTurnIn
                        courseId
                        }
                    }`,
                    { courseId: courseId, assignments: assignments }
                );
            return { submissions };
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!assignments,
    }
    );
}

export const useAttendanceMutation = (attendanceTimeStamps) =>{ //{mhsClass, timeClassStart, timeClassEnd, student, timeIn, timeOut } ) => {
    return useMutation({
        //queryKey: ['mhsClasses'],
        mutationFn: async () => {
            const { savedAttenance } = await
                request('./api/graphql',
                gql`
                mutation CreateAttendanceTimeStamps($attendanceTimeStamps: [AttendanceTimeStampInput]) {
                        createAttendanceTimeStamps(AttendanceTimeStamps: $attendanceTimeStamps) {
                        student
                }
                }`,
                    attendanceTimeStamps
                )
            return savedAttenance;
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!attendanceTimeStamps
    });
}

export const useAttendanceInClassQuery = (mhsClassName) => {
    return useQuery({
        queryKey: ["attendanceInClass", mhsClassName],
        queryFn: async () => {
            const { attendanceInClass } = await
                request(
                    './api/graphql',
                    gql`
                    query AttendanceInClass($mhsClassName: String) {
                        attendanceInClass(mhsClassName: $mhsClassName) {
                        student
                        attIntervals {
                            month
                            minute
                            hour
                            classDuration
                            day
                            durationOuts {
                                timeOut
                                timeIn
                            }
                        }
                    }
                    }`,
                    { mhsClassName: mhsClassName }
                );
            return { attendanceInClass };
        },
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!mhsClassName,
    })
}
