var Gobal_channels = new Array();
var Gobal_isInSchool ="";
var Gobal_courseForm = {};
var Gobal_currentChannel ="";
var Gobal_isAutoSelectCourse = false;
var loginWindowId ;
var isPlayAudio = false;

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
  'http://jxufexk.duapp.com/getSuccessIcon.php',  // icon url - can be relative
  '酱菜选课友情提示：',  // notification title
  '恭喜你！成功进入选课系统，进行选课！祝你选课愉快！'  // notification body text
);

chrome.extension.onRequest.addListener(
    function (request,  sender,sendResponse) {
        if (request.preIsOk == "yes") {
            sendResponse({farewell: "is recevied!"});
            Gobal_isInSchool = request.isInSchool;
            var channelStr = request.channelStr;
            console.log(channelStr);
            Gobal_channels = channelStr.split("&");
            console.log(Gobal_channels);
            showLogin();
        }
		else if(request.loginIsOk == "yes"){
		    sendResponse({farewell: "is recevied!"});
			chrome.windows.remove(loginWindowId, function(){

			   chrome.tabs.create({url:Gobal_currentChannel+"studentSelectSubject.htm"}, function(){
			        //alert("恭喜你！登陆成功！");
				    // 显示通知
				    successNotification.show();
					
				    setTimeout(function () {
						successNotification.close();
				    },10000);
					isPlayAudio = true;
                  

			   }); 
			});
		}
		
		else if(request.getAuto == "yes"){
		    if(Gobal_isAutoSelectCourse){
				sendResponse({autoSelect: true,courseForm:Gobal_courseForm,currentChannel:Gobal_currentChannel});
		    }
			else {
			    sendResponse({autoSelect: false});
			}
		}
		else if(request.deleteAuto == "yes"){
		    Gobal_isAutoSelectCourse = false;
			Gobal_courseForm = "";
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
     });
