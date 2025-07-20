import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    username: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    profile_pic: { type: String, default: "" },
    role_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User_roles"
    }
}, {
    timestamps: true
});

const userModel = mongoose.model('user', userSchema);
export default userModel;