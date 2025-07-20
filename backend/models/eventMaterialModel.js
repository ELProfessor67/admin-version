import mongoose from 'mongoose';

const eventMaterialScheme = new mongoose.Schema({
    filename: { type: String, default: '' },
    originalFilename: { type: String, default: '' },
    mime: { type: String, default: '' },
    path: { type: String, default: '' },
    extension: { type: String, default: '' },
    status: { type: String, default: '' },
    size: { type: String, default: '' },
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "event"
    }
}, {
    timestamps: true
});

export default mongoose.model('event_material', eventMaterialScheme);