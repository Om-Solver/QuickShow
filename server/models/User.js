import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    _name: { type: String, required: true },
    _email: { type: String, required: true },
    _image: { type: String, required: true },
})

const User = mongoose.model('User', userSchema)

export default User;