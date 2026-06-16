const Enrollment = require('../models/Enrollment');

// Feature: Enroll student in multiple courses
exports.enrollCourses = async (req, res, next) => {
    try {
        const { studentId, courses, semester } = req.body;
        // courses is an array of course IDs
        const enrollmentsToCreate = courses.map(courseId => ({
            student: studentId,
            course: courseId,
            semester: semester
        }));

        const enrollments = await Enrollment.insertMany(enrollmentsToCreate);
        res.status(201).json({ success: true, message: 'Successfully enrolled', data: enrollments });
    } catch (error) {
        // Handle unique constraint errors (duplicate enrollments)
        if(error.code === 11000) return res.status(400).json({ message: 'Duplicate enrollment detected.'});
        next(error); 
    }
};

// Feature: Record/Update grades
exports.updateGrade = async (req, res, next) => {
    try {
        const { grade } = req.body;
        // Updating via document save to trigger the pre('save') middleware for gradePoints
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        enrollment.grade = grade;
        await enrollment.save();

        res.status(200).json({ success: true, data: enrollment });
    } catch (error) { next(error); }
};

// Feature: Drop course
exports.dropCourse = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findByIdAndUpdate(
            req.params.id, 
            { status: 'Dropped', grade: null, gradePoints: 0 }, 
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Course dropped', data: enrollment });
    } catch (error) { next(error); }
};

// Feature: View course roster
exports.getCourseRoster = async (req, res, next) => {
    try {
        const { courseId, semester } = req.query;
        let query = { course: courseId, status: { $ne: 'Dropped' } };
        if (semester) query.semester = semester;

        const roster = await Enrollment.find(query)
            .populate('student', 'name enrollmentId email')
            .select('student status grade semester');

        res.status(200).json({ success: true, count: roster.length, data: roster });
    } catch (error) { next(error); }
};