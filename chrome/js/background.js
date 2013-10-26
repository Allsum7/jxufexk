var Global_channels = new Array();
var Global_isInSchool ="";
var Global_courseForm = {};
var Global_currentChannel ="";
var Global_isAutoSelectCourse = false;
var loginWindowId ;
var isPlayAudio = false;
var Global_ecardNum = "";

function showLogin() {
    var loginUrl = chrome.extension.getURL('login.html');
    var loginWidth = 1000;
    var loginHeight = 800;
    chrome.windows.create({
        url: loginUrl,
        left: parseInt(screen.availWidth / 2 - loginWidth / 2),
        top: parseInt(screen.availHeight / 2 - loginHeight / 2),
        width: loginWidth,
        height: loginHeight,
        type: 'popup'
    },function (window){
         loginWindowId = window.id;
    });
}

// 创建一个简单的文字通知：
var successNotification = webkitNotifications.createNotification(
  'img/icon-48.png',  // icon url - can be relative
  '酱菜选课友情提示：',  // notification title
  '恭喜你！成功进入选课系统，进行选课！祝你选课愉快！'  // notification body text
);

chrome.extension.onRequest.addListener(
    function (request,  sender,sendResponse) {
        if (request.preIsOk == "yes") {
            sendResponse({farewell: "is recevied!"});
            Global_isInSchool = request.isInSchool;
            var channelStr = request.channelStr;
            console.log(channelStr);
            Global_channels = channelStr.split("&");
            console.log(Global_channels);
            showLogin();
        }
		else if(request.loginIsOk == "yes"){
		    sendResponse({farewell: "is recevied!"});
			chrome.windows.remove(loginWindowId, function(){

			   chrome.tabs.create({url:Global_currentChannel+"studentSelectSubject.htm"}, function(){
			        //alert("恭喜你！登陆成功！");
				    // 显示通知
				    // 创建一个简单的文字通知：
				    var successNotification = webkitNotifications.createNotification(
					'img/icon-48.png',  // icon url - can be relative
					'酱菜选课友情提示：',  // notification title
					'恭喜你！成功进入选课系统，进行选课！祝你选课愉快！'  // notification body text
			            );
				    successNotification.show();
					
				    setTimeout(function () {
						successNotification.close();
				    },10000);
					isPlayAudio = true;
                  

			   }); 
			});
		}
		
		else if(request.getAuto == "yes"){
		    if(Global_isAutoSelectCourse){
				sendResponse({autoSelect: true,courseForm:Global_courseForm,currentChannel:Global_currentChannel});
		    }
			else {
			    sendResponse({autoSelect: false});
			}
		}
		else if(request.deleteAuto == "yes"){
		    Global_isAutoSelectCourse = false;
			Global_courseForm = "";
		}
		else if(request.getPlay){  //是否播放音乐
		    if(isPlayAudio){
			    sendResponse({playAudio: true});
				isPlayAudio = false;
			}
			else {
			    sendResponse({playAudio: false});
			}
		}
		
		else if(request.getEcardNum){
		    sendResponse({ecardNum: Global_ecardNum});
		}
     });
