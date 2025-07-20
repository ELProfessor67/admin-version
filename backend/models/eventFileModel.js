import mongoose from 'mongoose';

const EventFilesScheme = new mongoose.Schema({
    title: { type: String, default: '' },
    fileName: { type: String, default: '' },
    url: { type: String, default: '' },
    originalpath: { type: String, default: '' },
    job_id: { type: String, default: '' },
    converted_status: { type: String, default: '0' },
    type: { type: String, default: '' },
    status: { type: String, default: '' },
    is_deleted: { type: Boolean, default: 0 },
    content_type_updated: { type: String, default: '0' },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
}, {
    timestamps: true
});

const eventFilesModel = mongoose.model('event_files', EventFilesScheme);
export default eventFilesModel;