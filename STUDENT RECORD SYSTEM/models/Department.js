const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true },
    departmentCode: { type: String, required: true, unique: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' } // One-to-One
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);