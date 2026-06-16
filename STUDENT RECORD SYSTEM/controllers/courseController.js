const Course = require('../models/Course');

exports.createCourse = async (req, res, next) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (error) { next(error); }
};

exports.getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find()
            .populate('department', 'departmentName')
            .populate('instructor', 'name email');
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) { next(error); }
};

exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('department')
            .populate('instructor');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ success: true, data: course });
    } catch (error) { next(error); }
};

exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ success: true, data: course });
    } catch (error) { next(error); }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
};