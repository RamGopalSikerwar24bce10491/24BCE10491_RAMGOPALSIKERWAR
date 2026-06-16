const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: String, required: true }, // e.g., "Fall 2023"
    grade: { 
        type: String, 
        enum: ['A', 'B', 'C', 'D', 'F', null], 
        default: null 
    },
    gradePoints: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['Enrolled', 'Completed', 'Dropped'], 
        default: 'Enrolled' 
    }
}, { timestamps: true });

// Prevent a student from enrolling in the same course twice in the same semester
enrollmentSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Middleware to auto-calculate gradePoints before saving
enrollmentSchema.pre('save', function(next) {
    if (this.grade) {
        const gradeMap = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
        this.gradePoints = gradeMap[this.grade];
        this.status = 'Completed';
    }
    next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);