import mongoose from 'mongoose';

const eventLanguageScheme = new mongoose.Schema({
    language_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "language"
    },
    title: { type: String, default: '' },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
}, {
    timestamps: true
});

const eventLanguageModel = mongoose.model('event_language', eventLanguageScheme);
export default eventLanguageModel;