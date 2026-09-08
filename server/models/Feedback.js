import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
    {
        mentorId: { type: String, required: true },
        date: { type: String, required: true },
        q1: { type: Number, default: 0 },
        q2: { type: Number, default: 0 },
        q3: { type: Number, default: 0 },
        q4: { type: Number, default: 0 },
        comments: { type: String, default: '' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

feedbackSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
