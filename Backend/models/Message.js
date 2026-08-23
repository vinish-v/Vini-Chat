import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
})

export default mongoose.model("Message", messageSchema)