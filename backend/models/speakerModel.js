import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    role: { type: String, default: '' },
    logo: { type: String, default: '' },
    status: { type: Boolean, default: true },
    speaker_status: { type: String, default: '' },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event_users"
    }
}, {
    timestamps: true
});

const SpeakerModel = mongoose.model('speaker', speakerSchema);
export default SpeakerModel;