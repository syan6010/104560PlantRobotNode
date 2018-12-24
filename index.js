var linebot = require('linebot');
var express = require('express');
var translate = require('google-translate-api');

var bot = linebot({
  channelId: '1627664670',
  channelSecret: '391b4c997a9923bc2e1d484ad2e99fce',
  channelAccessToken: 'PatWWFB9frLn/SApYvru/vyfmH+vv44D03A1XQOfq5E982ap0ZOdVLA1EwUBKR0bnQm4Ob3zJvEkTdgAFV+cFbNidJyWUpK+SRslvqiONOfMNQgs1Qm61MpLts/6MiIi1EaI9QelogaUzcECqxRU6AdB04t89/1O/w1cDnyilFU='
});

const app = express();
const linebotParser = bot.parser();
app.post('/linewebhook', linebotParser);

var users=[];

var defaultLangNum=2;

var languages=[
    {language: '繁體中文', code: 'zh-tw'},
    {language: '簡體中文', code: 'zh-cn'},
    {language: '英文', code: 'en'},
    {language: '日文', code: 'ja'},
    {language: '韓文', code: 'ko'},
    {language: '德文', code: 'de'},
    {language: '法文', code: 'fr'},
];

var welcomeStr=getWelcomeStr();

bot.on('message', function(event) {
   var myReply='';
   var myId = event.source.userId;
   if (event.message.type === 'text') {
      if (users[myId]===undefined){
         users[myId]=[];
         users[myId].userId=myId;
         users[myId].defaultLangNum=defaultLangNum;
         myReply=welcomeStr+'目前的設定的翻譯語言為：'+languages[users[myId].defaultLangNum].language;
      }else if(event.message.text==='?'){
         myReply=welcomeStr+'目前的設定的翻譯語言為：'+languages[users[myId].defaultLangNum].language;
      }else if(!isNaN(event.message.text)){
         if (Number(event.message.text)<languages.length)
            setLanguage(myId,Number(event.message.text));
      }else{
         translate(event.message.text, {to: 'ru'}).then(res => {
         bot.push(myId,res.text);
         }).catch(err => {
            console.error(err);
         });
      }
      event.reply(myReply).then(function(data) {
         // success 
         console.log(myReply);
      }).catch(function(error){   
         // error 
         console.log('error');
      });
   }
});


//傳送訊息的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}

//此為設定翻譯語言之函式
function setLanguage(userId,myLangNum){
   users[userId].defaultLangNum=myLangNum;
   bot.push(userId,'翻譯的語言已設定為：'+languages[myLangNum].language);
}

//此為處理語言設定字串之函式
function getWelcomeStr(){
   var myResult='您好，歡迎來到即時翻譯LineBot，讓您用Line就可以翻譯各國語言。您可以輸入各國語言，轉換成您想要翻譯的語言，所以，請先設定您想要轉換成的語言，輸入數字即可設定完成：\n';
   for(var i=0;i<languages.length;i++){
      myResult+=(i+'：'+languages[i].language+'\n');
   }
   myResult+='?：列出語言設定指令\n';
   return myResult;
}

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});