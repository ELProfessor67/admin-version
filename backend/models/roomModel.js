import mongoose from 'mongoose';

const roomScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
}, {
    timestamps: true
});

export default mongoose.model('room', roomScheme);