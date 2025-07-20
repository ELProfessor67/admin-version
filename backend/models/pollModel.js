import mongoose from 'mongoose';

const eventScheme = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    title: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('poll', eventScheme);