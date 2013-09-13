var channelIn = new Array();   //校内
var channelOut = new Array();  //校外
var userIsInSchool = false;
var projectName = "酱菜选课（Chrome插件版）";
var inStr = "";
var outStr = "";

var channel = "";
var autoSelectCourseForm = {}; //保存自动选课表的对象
var isAutoSelect = false;
var urlarg ="";
var speed = 1000;
var remainTime = 5 * 60 //为了公平起见   如果是自动选课模式只有5分钟选课时间



$.ajaxSetup({
    timeout:500
});

   
	
if(window.location.href=="http://xk.jxufe.edu.cn/"||window.location.href=="http://xk.jxufe.cn/"){  
   getChannel();
   isInSchool(channelIn[0]);
}
else if(window.location.href.match("studentSelectSubject")!= null){  //匹配选课页面
   showUI();

   $("#logoutBtn").bind("click",function(){
       logout();
   });
   
   $("#reviseBtn").bind("click",function(){  // 修正网页chrome的兼容性问题
	if($("table")[1].innerHTML.match("请完成教材选购")!= null){
	   //alert( $("table tr:nth-child(3) td:nth-child(1)").text());
	   //alert($("table tr:nth-child(3) td:nth-child(3)").text());
	   var bookInput = document.getElementsByName("book");
	   bookInput[0].setAttribute("id","book");  //chrome 严格区分getElementsByName 和getElementById  而ie不区分 所以导致不兼容！
	   //alert(bookInput[0].getAttribute("id"));
	   alert("'酱菜选课（chrome插件版）'已帮你了修正网页中对chrome内核的不兼容问题，请你重新选择是否要订购教材！谢谢！"); 
	}
	else{
	   alert("不要顽皮哦！说了请到了确认是否教材选购那步再来点击我哦！否则是无效的啦！");
	}
	
   });
	
   chrome.extension.sendRequest({getAuto:"yes"}, function(response) {
     if(response.autoSelect){
	        isAutoSelect = true;
		    channel = response.currentChannel;
			urlarg  = response.courseForm;
			//alert(channel+"  "+urlarg["courseId" + 1]);
			autoSelectCourse();
			remainT();
			
		}
      
   });
}
else {
  location.href = "http://xk.jxufe.edu.cn";
}


var myaudio=document.getElementById("myaudio");
         
chrome.extension.sendRequest({getPlay:true}, function(response) {  //playAudio
    if (response.playAudio) {
        myaudio.play();
	}
});

function getChannel() {          //从页面中得到目前开放的通道

    var InI = 0;
    var OutI = 0;
    var oInput = document.body.getElementsByTagName("A");  //取道页面所有链接
    for (var j = 0; j < oInput.length; j++) {

        if (oInput[j].innerHTML.match(/(.*)选课通道(.*)校内(.*)/) != null) {
            channelIn[InI++] = oInput[j].href;
            inStr += oInput[j].href+"&";
        }
        else if (oInput[j].innerHTML.match(/(.*)选课通道(.*)校外(.*)/) != null) {
            channelOut[OutI++] = oInput[j].href;
            outStr += oInput[j].href+"&";
        }
    }

}

function isInSchool(url){ //判断是否在校内
    $.ajax({
        type:"get",
        url:url,
        data:"",
        async:true,
        success:function(data){
            userIsInSchool = true;
            alert(projectName+"自动匹配到了目前开放的通道列表并检测到你现在在校内选课，自动为你设置了校内选课模式，祝你选课愉快^_^");
            chrome.extension.sendRequest({preIsOk: "yes",channelStr:inStr,isInSchool:true}, function(response) {
                console.log(response.farewell);
            });
        },
        error:function(){
            userIsInSchool = false;
            alert(projectName+"自动匹配到了目前开放的通道列表并检测到你现在在校外选课，自动为你设置了校外选课模式，祝你选课愉快^_^");
            chrome.extension.sendRequest({preIsOk: "yes",channelStr:outStr,isInSchool:false}, function(response) {
                console.log(response.farewell);
            });
        }

    });
}

//用于关闭SESSION---------------------------------------------
function removeline() {//清除session

    var url = 'lightSelectSubject/logout.jsp';
    $.ajax({
        type: "post",
        url: channel+url,
        data: "",
        async: true  //同步或异步
    });

    //alert("您已退出选课！");
}

function logout() {//退出
    removeline();
    alert("您已退出选课！");
    window.location.href = "http://xk.jxufe.edu.cn";
}



function remainT() {
        if (remainTime == 0) {
            logout(); //退出
        }
        else {
            $('#remainTime').val("请注意：因为你选择了自动选课模式，为了公平起见，所以你现在只剩下" + remainTime / 60 + "分钟的选课时间了！时间到了会自动退出哦!");
            remainTime -= 60;
            window.setTimeout("remainT()", speed * 60);
        }
}

 
///////////////////////////////////////////////////////////
function myAjax(method, url, isAsync, parameters, Ci,callback) {

    $.ajax({
        type: method,
        url: url,
        data: parameters,
        async: isAsync,  //同步或异步
        success: function (data) {
            callback(true,Ci,data);
        },
		error:function(){ 
		    callback(false,Ci,"");
			//alert("error");
        }
    });
}

function autoSelectCourse() {
    
    for (var i = 1; i <= 5; i++) {     //保存自动选课表

        if (urlarg["courseId" + i] != "" && urlarg["classId" + i] != "") {

            var course = {
                courseId: urlarg["courseId" + i],
                classId: urlarg["classId" + i],
                isNeedBook: urlarg["isNeedBook" + i]
            }
            autoSelectCourseForm["courseId" + i] = course;

            var url = 'checkSelectCourse4.jsp';
            var params = "courseCode=" + autoSelectCourseForm["courseId" + i].courseId + '&classNO=' + autoSelectCourseForm["courseId" + i].classId;
            if (autoSelectCourseForm["courseId" + i].isNeedBook == "on") {
                params += '&book=1';
            }
            else {
                params += '&book=0';
            }
            myAjax("get",channel+url,true,params,urlarg["courseId" + i],showStatus);
			
        }

    }
	chrome.extension.sendRequest({deleteAuto:"yes"}, function(response) {
   });
	
}

function showUI(){
    
	var songUrl = chrome.extension.getURL("/song/song.ogg");
	var s = document.createElement("style");
    s.id = "jxufexk";
	s.type = "text/css";
	s.textContent = "body{background-color:#99cccc;margin:auto;width:980px;text-align :center;}";
	document.head.appendChild(s);
	
	$(":button").attr("class","btn btn-success");
    var trends_dom = document.createElement('div');
    var bo = document.body;//获取body对象.
    //动态插入到body中
    bo.insertBefore(trends_dom, bo.firstChild);
    $("<div id='jxufexkMain'  style='color: red; border:dotted 2px green'><center><h3>酱菜选课（chrome插件版）</h3> <INPUT TYPE=\"button\" value=\"安全退出请点击这里!!!!!!!\" id=\"logoutBtn\" class='btn btn-warning'></center>"+
	  "<br><br><INPUT TYPE=\"button\" id=\"remainTime\" value=\"\" class='btn btn-danger'><br> <div id='showStatus'></div>"+
	  "<audio id=\"myaudio\" style='display:none' controls src='"+songUrl+"'></audio> </div>").appendTo(trends_dom);
    $("#divFlyBar").attr("style","");
	$('input[name="classNO"]').val("");
	$("table").attr("border","0");
	$("<input type='button' id='reviseBtn' class='btn  btn-danger' value='确认教材的时候按钮无效？请先点击下这里吧！！！'>").appendTo("table");
	$("#viewBtn").attr("disabled",false);
	
	
}

function showStatus(isSuccess,Ci,data) {   //自动选课成功一门就显示成功或者失败
    if (isSuccess && data.match("您选择的课程已交给服务器处理,请继续选择下一门课程") != null) {
        document.getElementById("showStatus").innerHTML += "您选择的"+Ci+"课程已成功交给服务器处理！<br><br>";
    }
    else {
        document.getElementById("showStatus").innerHTML += "您选择的"+Ci+"课程没能成功提交服务器处理！可能是有冲突，请手动选择！<br>";
    }
}

function forReviseLoginPage(){  // 本想修正login页面的兼容性问题，发现问题太多，还是算了！学校尼玛写得代码太操蛋了！！
   var signBtn = document.getElementsByName("signBtn");
   var loginButton = document.getElementsByName("loginButton");
   var loginForm = document.getElementsByName("loginForm");
   signBtn[0].setAttribute("id","signBtn");  // 添加id属性
   loginButton[0].setAttribute("id","loginButton");
   loginForm[0].setAttribute("id","loginForm");
}




