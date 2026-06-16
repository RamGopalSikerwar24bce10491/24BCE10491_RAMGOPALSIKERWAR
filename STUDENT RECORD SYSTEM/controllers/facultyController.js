const Faculty = require('../models/Faculty');

exports.createFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.create(req.body);
        res.status(201).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.getFaculties = async (req, res, next) => {
    try {
        const faculties = await Faculty.find().populate('department', 'departmentName departmentCode');
        res.status(200).json({ success: true, count: faculties.length, data: faculties });
    } catch (error) { next(error); }
};

exports.getFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.findById(req.params.id).populate('department');
        if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
        res.status(200).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.updateFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
        res.status(200).json({ success: true, data: faculty });
    } catch (error) { next(error); }
};

exports.deleteFaculty = async (req, res, next) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Faculty member not found' });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
};