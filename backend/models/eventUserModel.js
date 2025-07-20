import mongoose from 'mongoose';

const eventUsersScheme = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' },
    start_time: { type: Date, default: '' },
    end_time: { type: Date, default: '' },
    language: { type: String, default: '' },
    speaker_logo: { type: String, default: '' },
    speaker_name: { type: String, default: '' },
    speaker_role: { type: String, default: '' },
    speaker_status: { type: Boolean, default: true },
    listener_status: { type: Boolean, default: true },
    back_end_user: { type: Boolean, default: false },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, {
    timestamps: true
});

const eventUsersModel = mongoose.model('event_users', eventUsersScheme);
export default eventUsersModel;