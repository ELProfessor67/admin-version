import mongoose from 'mongoose';

const roomPropertySchema = new mongoose.Schema({
    session_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    property: { type: Object },
    date_time: { type: Date, required: true, default: Date.now }
}, {
    timestamps: true
});

const roomPropertyModel = mongoose.model('room_property', roomPropertySchema);
export default roomPropertyModel;