const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

// Standard CRUD operations...
exports.createStudent = async (req, res, next) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, data: student });
    } catch (error) { next(error); }
};

exports.getStudents = async (req, res, next) => {
    try {
        const students = await Student.find().populate('department', 'departmentName');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) { next(error); }
};

// Feature: View full academic transcript by student & Calculate CGPA
exports.getStudentTranscript = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        // 1. Fetch student info
        const student = await Student.findById(studentId).populate('department', 'departmentName');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // 2. Fetch all enrollments with course details
        const transcript = await Enrollment.find({ student: studentId })
            .populate('course', 'courseTitle courseCode credits');

        // 3. Calculate CGPA and SGPA using MongoDB Aggregation
        const gpaData = await Enrollment.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId), status: 'Completed' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseData'
                }
            },
            { $unwind: '$courseData' },
            {
                $group: {
                    _id: '$semester', // Group by semester for SGPA
                    totalPoints: { $sum: { $multiply: ['$gradePoints', '$courseData.credits'] } },
                    totalCredits: { $sum: '$courseData.credits' }
                }
            },
            {
                $project: {
                    semester: '$_id',
                    sgpa: { $divide: ['$totalPoints', '$totalCredits'] },
                    totalPoints: 1,
                    totalCredits: 1,
                    _id: 0
                }
            }
        ]);

        // Calculate overall CGPA from the SGPA data
        let cumulativePoints = 0;
        let cumulativeCredits = 0;
        gpaData.forEach(sem => {
            cumulativePoints += sem.totalPoints;
            cumulativeCredits += sem.totalCredits;
        });
        const cgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                studentInfo: student,
                cgpa: parseFloat(cgpa),
                semesterPerformance: gpaData,
                detailedTranscript: transcript
            }
        });
    } catch (error) { next(error); }
};

// Feature: Generate Academic Summary Report (Top Students)
exports.getTopStudents = async (req, res, next) => {
    try {
        const topStudents = await Enrollment.aggregate([
            { $match: { status: 'Completed' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseData'
                }
            },
            { $unwind: '$courseData' },
            {
                $group: {
                    _id: '$student',
                    totalPoints: { $sum: { $multiply: ['$gradePoints', '$courseData.credits'] } },
                    totalCredits: { $sum: '$courseData.credits' }
                }
            },
            {
                $project: {
                    cgpa: { $divide: ['$totalPoints', '$totalCredits'] }
                }
            },
            { $sort: { cgpa: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentDetails'
                }
            },
            { $unwind: '$studentDetails' },
            {
                $project: {
                    _id: 0,
                    name: '$studentDetails.name',
                    enrollmentId: '$studentDetails.enrollmentId',
                    cgpa: { $round: ['$cgpa', 2] }
                }
            }
        ]);

        res.status(200).json({ success: true, data: topStudents });
    } catch (error) { next(error); }
};