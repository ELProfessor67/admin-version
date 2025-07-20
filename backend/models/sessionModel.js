import mongoose from 'mongoose';

const sessionScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    date: { type: Date, default: '' },
    start_time: { type: Date, default: '' },
    end_time: { type: Date, default: '' },
    start_date_time: { type: Date, default: '' },
    end_date_time: { type: Date, default: '' },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room"
    },
    private: { type: Boolean, default: false },
    description: { type: String, default: '' },
    floor_title: { type: String, default: '' },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    },
    session_id: { type: String, default: '' },
    publisher_token: { type: String, default: '' },
    listener_token: { type: String, default: '' }
}, {
    timestamps: true
});

const sessionModel = mongoose.model('session', sessionScheme);
export default sessionModel;