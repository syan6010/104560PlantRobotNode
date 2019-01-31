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

var users=[];
var totalSteps=3;
let deviceId;
let name;
let plantType;
let lineId;
let firebaseurl = 'https://mytest-5cc3f.firebaseio.com/.json';


bot.on('message', function (event) {
  // var myReply='';
  if (event.message.type === 'text') {
      if (event.message.type === 'text') {
          var myId=event.source.userId;
          if (users[myId]==undefined){
              users[myId]=[];
              users[myId].userId=myId;
              users[myId].step=0;
          }
          lineId = event.source.userId;
          var myStep=users[myId].step;
          if (myStep === 0 ) {
              event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！');
          }
          else if(myStep === 1) {
              event.reply('可以告訴我你的植物種類嗎？');
              deviceId = event.message.text;
          }
          else if(myStep === 2) {
              event.reply('謝謝！我們又邁進了一步！！可以讓我知道要怎麼稱呼你嗎？');
              plantType = event.message.text;
          }
          else if(myStep === 3) {
              event.reply('謝謝接下來我們馬上就可以開始使用了！！輸入OK取得資訊');
              name = event.message.text;
          }
          else if(myStep === 99) {
              writeUserData(deviceId, plantType, name);
              switch (event.message.text) {
                  case 'help' :
                      event.reply({
                          type: 'image',
                          originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
                          previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
                      });
                      break;
                  case 'ok' :
                      firebase.database().ref(`users/${lineId}/plantType`).once('value', function (snapshot) {
                          var data = snapshot.val();
                          event.reply(data);
                      });
                  case '重設' :
                      myStep = -1;
                      event.reply('ok輸入y開始重新設定');
                      break;
                  default:
                      event.reply('我不能這麼做');
              }
          }
          myStep++;
          users[myId].step=myStep;

          
          if(myStep > 3) {
              users[myId].step = 99;
          }
      }

  }
  // event.reply(myReply).then(function(data) {
  //   // success
  //   console.log(myReply);
  // }).catch(function(error) {
  //   // error
  //   console.log('error');
  // });
});

function sendMessage(eve,msg){
    eve.reply(msg).then(function(data) {
        // success
        return true;
    }).catch(function(error) {
        // error
        return false;
    });
}

function writeUserData(deviceId, plantType, name) {
    firebase.database().ref('users/' + lineId).set({
        deviceId: deviceId,
        plantType: plantType,
        name : name,
        dht : 0,
        temperature : 0
    });
}

// function processText(myMsg){
//   var myResult='';
//
//   if (myMsg==='led開' || myMsg==='LED開'){
//      if (!deviceIsConnected())
//         myResult='裝置未連接！';
//      else{
//         myResult='LED已打開！';
//         rgbled.setColor('#FFFFFF');
//      }
//   }
//   else if (myMsg==='led關' || myMsg==='LED關'){
//      if (!deviceIsConnected())
//         myResult='裝置未連接！';
//      else{
//         myResult='LED已關閉！';
//         rgbled.setColor('#000000');
//      }
//   }
//   else{
//      myResult='抱歉，我不懂這句話的意思！';
//   }
//   return myResult;
// }


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