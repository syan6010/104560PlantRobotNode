require('webduino-js');
require('webduino-blockly');

var linebot = require('linebot');
var express = require('express');
var firebase = require("firebase");
 // Initialize Firebase
var config = {
   apiKey: "AIzaSyAuYBBz0Lm2RJUA5b5BrDcLgZz6DsftlxY",
   authDomain: "mytest-5cc3f.firebaseapp.com",
   databaseURL: "https://mytest-5cc3f.firebaseio.com",
   projectId: "mytest-5cc3f",
   storageBucket: "mytest-5cc3f.appspot.com",
   messagingSenderId: "861511084672"
};

firebase.initializeApp(config);

var db = firebase.database();
var ref = db.ref("/");
var value = {
 Test1: "t1",
 Test2: "t2"
}

var bot = linebot({
  channelId: '1627664670',
  channelSecret: '391b4c997a9923bc2e1d484ad2e99fce',
  channelAccessToken: 'PatWWFB9frLn/SApYvru/vyfmH+vv44D03A1XQOfq5E982ap0ZOdVLA1EwUBKR0bnQm4Ob3zJvEkTdgAFV+cFbNidJyWUpK+SRslvqiONOfMNQgs1Qm61MpLts/6MiIi1EaI9QelogaUzcECqxRU6AdB04t89/1O/w1cDnyilFU='
});

var myBoard;
var rgbled;
var board_info = {board: 'Smart', device: '10Q4LapQ', transport: 'mqtt'};


boardReady(board_info, function (board) {
  myBoard = board;
  board.systemReset();
  board.samplingInterval = 50;
  rgbled = getRGBLedCathode(board, 15, 12, 13);
  rgbled.setColor('#000000');
 
});

const app = express();
const linebotParser = bot.parser();
app.post('/linewebhook', linebotParser);


bot.on('message', function (event) {
  var myReply='';
  if (event.message.type === 'text') {
     myReply=processText(event.message.text);
  }    

  event.reply(myReply).then(function(data) {
    // success 
    console.log(myReply);
  }).catch(function(error) {
    // error 
    console.log('error');
  });
});

function processText(myMsg){
  var myResult='';
  
  if (myMsg==='led開' || myMsg==='LED開'){
     if (!deviceIsConnected())
        myResult='裝置未連接！';
     else{
        myResult='LED已打開！';
        rgbled.setColor('#FFFFFF');
     }
  }
  else if (myMsg==='led關' || myMsg==='LED關'){
     if (!deviceIsConnected())
        myResult='裝置未連接！';
     else{
        myResult='LED已關閉！';
        rgbled.setColor('#000000');
     }
  }
  else{
     myResult='抱歉，我不懂這句話的意思！';
  }
  return myResult;
}


function deviceIsConnected(){
  if (myBoard===undefined)
     return false;
  else if (myBoard.isConnected===undefined)
     return false;
  else
     return myBoard.isConnected;
}
 

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});