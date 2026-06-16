const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    credits: { type: Number, required: true, min: 1, max: 5 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }, // Many-to-One
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' } // Many-to-One
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);