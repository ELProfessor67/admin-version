import mongoose from 'mongoose';

const eventScheme = new mongoose.Schema({
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "poll-questions"
    },
    answer: { type: String, default: '' },
    user_id: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('poll-question', eventScheme);