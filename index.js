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

var myBoardVars={board: 'Smart', device: '10Q4LapQ', transport: 'mqtt'};



const app = express();
const linebotParser = bot.parser();
app.post('/linewebhook', linebotParser);

var users=[];
var totalSteps=3;
let deviceId;
let name;
let plantType;
let lineId;
var qAndAStep;
let textFromUser;

boardReady(myBoardVars, true, function (board) {
    myBoard=board;
    board.systemReset();
    board.samplingInterval = 50;
    rgbled = getRGBLedCathode(board, 15, 12, 13);
    rgbled.setColor('#000000');
});



bot.on('message', function (event) {
  // var myReply='';
    if (event.message.type === 'text') {
        lineId = event.source.userId;


        firebase.database().ref(`users/${lineId}/steps`).on('value', async function (snapshot) {
            if(snapshot.exists()) {
                qAndAStep = snapshot.val();
                if (qAndAStep === 0 ) {
                    event.reply('你好!!歡迎來到plantRobot!!第一次設定需要輸入webduino裝置的ID才可以讓我順利上網歐！！');

                }
                else if(qAndAStep === 1) {
                    event.reply('可以告訴我你的植物種類嗎？');
                    await updateData(lineId, "deviceId", event.message.text);
                }
                else if(qAndAStep === 2) {
                    event.reply('謝謝！我們又邁進了一步！！可以讓我知道要怎麼稱呼你嗎？');
                    await updateData(lineId, "plantType", event.message.text);
                }
                else if(qAndAStep === 3) {
                    event.reply('謝謝接下來我們馬上就可以開始使用了！！輸入OK取得資訊');
                    await updateData(lineId, "name", event.message.text);
                }
                else if(qAndAStep === 99) {
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
                                switch (data) {
                                    case '薄荷' :
                                        return event.reply(['Line 1', {
                                            type: 'template',
                                            altText: 'Buttons alt text',
                                            template: {
                                                type: 'buttons',
                                                thumbnailImageUrl: 'https://i2.kknews.cc/SIG=m8bseq/o0p0008q8qoq4pn7493.jpg',
                                                title: 'My button sample',
                                                text: 'Hello, my button',
                                                actions: [
                                                    { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                                                    { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                                                    { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                                                    { label: 'Say message', type: 'message', text: 'Rice=米' },
                                                ],
                                            },
                                        }]);
        
                                    default :
                                        event.reply('這種植物我建議你還是別種了');
                                }
                            });
                            break;
                        case '重設' :
                            qAndAStep = -1; 
                            event.reply('ok輸入y開始重新設定');
                            break;
                        case 'led開' :
                            if (!deviceIsConnected())
                                event.reply('裝置未連接');
                            else{                       
                                myResult='LED已打開！';
                                rgbled.setColor('#ffffff');                   
                            }
                            break;
                        case 'led關' :
                            if (!deviceIsConnected())
                                event.reply('裝置未連接');
                            else{
                                myResult='LED已關閉！';
                                rgbled.setColor('#000000');
                            }
                            break;
                        default:
                            event.reply('我不能這麼做');
                      }
                }
            } 
            else {
                firebase.database().ref('users/' + lineId).set({
                    deviceId: 0,
                    plantType: 0,
                    name : 0,
                    dht : 0,
                    temperature : 0,
                    steps : 0
                });
                qAndAStep = 0;
            }
        });
       

        
          
        // firebase.database().ref('users/' + lineId).set({
        //     deviceId: 0,
        //     plantType: 0,
        //     name : 0,
        //     dht : 0,
        //     temperature : 0,
        //     steps : qAndAStep + 1
        // });

        await updateData(lineId, "steps" ,qAndAStep+1);
          
        if(qAndAStep > 3) {
            await updateData(lineId, "steps", 99);
        };
    }  
   
});



function deviceIsConnected(){
    if (myBoard===undefined){
        return 'false1';
    }
    else if (myBoard.isConnected===undefined) {
        return 'false2';
    }
    else
       return myBoard.isConnected;
 }

 let updateData = (lineId, postKey, postData) => {
      var updates = {};
      updates[`users/${lineId}/${postKey}`] = postData;
    
      return firebase.database().ref().update(updates);
 }
 
 
 

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});


