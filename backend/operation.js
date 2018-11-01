
let Promise = require('promise');
let chatModel = require('./chatModel')

//To save Chat to MongoDb
let saveChat = (parameter) => {
    return new Promise((resolve, reject) => {
        if (parameter) {
            let mychat = chatModel(parameter);
            mychat.save()
                .then(function (data) {
                    if (data) {
                        resolve(data);
                    }
                });
        }
    });
}

//To get Chats from MongoDb
let getChats = () => {
    return new Promise((resolve, reject) => {
        chatModel.find()
            .exec()
            .then((ChatsFromDB) => {
                if (ChatsFromDB) {
                    resolve(ChatsFromDB);
                }
            });
    });
}

//To get The room Name
let getName = (parameter) => {
    return new Promise((resolve, reject) => {
        chatModel.find({ 'chat_room': 'parameter' })
            .exec()
            .then((CompanyDetailsFromDB) => {
                if (CompanyDetailsFromDB) {
                    resolve(CompanyDetailsFromDB);
                }
            });
    });
}

module.exports = {
    saveChat: saveChat,
    getChats: getChats,
    getName: getName
}