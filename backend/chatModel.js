let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let newChatSchema = Schema({
    chat_room: {
        type: String,
        require: true
    },
    chat_name: {
        type: String,
        require: true
    },
    chat_message: {
        type: String,
        required: true
    },
    chat_date: {
        type: Date,
        require: true
    }
});

module.exports = mongoose.model('Chat', newChatSchema);