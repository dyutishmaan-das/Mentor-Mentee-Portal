import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        studentId: { type: String, required: true },
        mentorId: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, default: '' },
        type: { type: String, default: 'In Person' }, // 'In Person' or 'Phone Call'
        agenda: { type: String, default: '' },
        notes: { type: String, default: '' },
        actionItems: { type: String, default: '' },
        status: { type: String, default: 'Completed' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

sessionSchema.virtual('id').get(function () {
    return this._id.toString();
});

sessionSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
