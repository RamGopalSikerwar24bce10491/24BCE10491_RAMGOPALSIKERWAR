const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    enrollmentId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    currentSemester: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true }
});

// Virtual populate for enrollments (allows us to access a student's records easily)
studentSchema.virtual('academicRecords', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'student',
    justOne: false
});

module.exports = mongoose.model('Student', studentSchema);