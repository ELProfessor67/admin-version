import mongoose from 'mongoose';

const eventScheme = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    sender_name: { type: String, default: '' },
    sender_userid: { type: String, default: '' },
    sender_time: { type: String, default: '' },
    sender_role: { type: String, default: '' },
    message: { type: String, default: '' },
    sendto_group: { type: String, default: '' },
    utc_time: { type: String, default: '' },
    date_time: { type: Date, required: true, default: Date.now }
}, {
    timestamps: true
});

const chatModel = mongoose.model('chat', eventScheme);
export default chatModel;