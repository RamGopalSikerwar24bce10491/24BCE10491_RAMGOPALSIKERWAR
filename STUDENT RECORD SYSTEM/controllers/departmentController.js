const Department = require('../models/Department');

exports.createDepartment = async (req, res, next) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) { next(error); }
};

exports.getDepartments = async (req, res, next) => {
    try {
        // Populate HOD details
        const departments = await Department.find().populate('hod', 'name email');
        res.status(200).json({ success: true, data: departments });
    } catch (error) { next(error); }
};

exports.getDepartment = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id).populate('hod');
        if (!department) return res.status(404).json({ message: 'Not found' });
        res.status(200).json({ success: true, data: department });
    } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: department });
    } catch (error) { next(error); }
};

exports.deleteDepartment = async (req, res, next) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) { next(error); }
};