let SCWorker = require('socketcluster/scworker');
let express = require('express');
let serveStatic = require('serve-static');
let path = require('path');
let morgan = require('morgan');
let mongoose = require('mongoose');
let bodyParser = require("body-parser");
let healthChecker = require('sc-framework-health-check');
let chatOperation = require('./backend/operation');

class Worker extends SCWorker {
  run() {

    console.log('   >> Worker PID:', process.pid);
    let environment = this.options.environment;
    let app = express();
    let httpServer = this.httpServer;
    let scServer = this.scServer;

    if (environment === 'dev') {
      // Log every HTTP request. See https://github.com/expressjs/morgan for other
      // available formats.
      app.use(morgan('dev'));
    }
    //Routing to Index Page (Public Folder)
    app.use(serveStatic(path.resolve(__dirname, 'public')));

    healthChecker.attach(this, app);
    httpServer.on('request', app);

    //Connecting to MongoDb
    mongoose.connect("mongodb://localhost:27017/ChatApp");
    mongoose.connection.on("connected", function (err) {
      if (err) {
        console.log("error in database connectivity" + err);
      } else {
        console.log('connected to database at port 27017');
      }
    });

    //MiddleWares for converting data into Json format
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser());


    //Routing for all requests from Client Side

    /*
    Saving all the Chat Data
    */
    app.post("/chats", function (req, res) {

      let name = req.body.name;
      let message = req.body.message;
      let record = {
        chat_room: "Rayyan",
        chat_name: name,
        chat_message: message,
        chat_date: new Date()
      }
      chatOperation.saveChat(record).then(function (savedData) {

        if (savedData) {
          res.send({ success: true, MSG: "Chat  Saved Successfully", data: savedData })
        } else {
          res.send({ success: false, MSG: "Chat Data is Not Saved" })
        }
      });
    });

    //Get Room Chats 

    app.get("/room?", function (req, res) {
      let param = req.query;
      console.log(param);
      chatOperation.getName(param).then(function (Result) {

        if (Result) {
          res.send({ success: true, result: Result })
        } else {
          res.send({ success: false, MSG: 'Chat Not Found' })
        }
      });
    });

    /*
    Get All old Chat Data
    */
    app.get("/getChats", function (req, res) {
      chatOperation.getChats().then(function (Result) {

        if (Result) {
          res.send({ success: true, result: Result })
        } else {
          res.send({ success: false, MSG: 'Chat Not Found' })
        }
      });
    });


    /*
      In here we handle our incoming realtime connections and listen for events.
    */
    scServer.on('connection', function (socket) {
      socket.on('chat', function (data) {
        scServer.exchange.publish('sample',
          {
            name: data.name,
            text: data.message
          });
      });

      socket.on('disconnect', function () {
        console.log('Disconected');
      });
    });

  }
}
new Worker();
