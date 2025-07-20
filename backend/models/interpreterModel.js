import mongoose from 'mongoose';

const assignmentScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event_language"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event_language"
    },
    session: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "session"
    }],
    two_way: { type: Boolean, default: false },
    show_video: { type: Boolean, default: false },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
}, {
    timestamps: true
});

const interpreterModel = mongoose.model('interpreter', assignmentScheme);
export default interpreterModel;