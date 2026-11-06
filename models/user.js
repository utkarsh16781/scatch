
const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: String,
    password: String,
    cart: {
        type: Array,
        default: []
    },
    isadmin: Boolean,
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        }
    ],
    contact: Number,
    picture: String
});

module.exports = mongoose.model("user", userSchema);
