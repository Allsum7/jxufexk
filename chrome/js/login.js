var channels = chrome.extension.getBackgroundPage().Gobal_channels; //获取得到的通道列表
var isInSchool =  chrome.extension.getBackgroundPage().Gobal_isInSchool; //获取是否在校内
var channel =""; //当前通道
var isAutoIdentify = true;
var isAutoSelectCourse = "";
var autoSelectCourseForm = {};
var isFindAChannel  = false;

function myAjax(method, url, isAsync, parameters, channelI,callback) {

    $.ajax({
        type: method,
        url: url,
        data: parameters,
        async: isAsync,  //同步或异步
        success: function (data) {
            callback(channelI,data);
        }
    });
}

function findAChannel() {      //随机选择一个通道,这里可以优化，但是考虑到服务器的承受能力不建议那么做
    var url = 'loginCode.jsp';
    var randomI = parseInt(Math.random() * (channels.length - 1));
    currentJ = randomI;
    channel = channels[randomI];
    //alert("当前使用通道:" + channel);
    myAjax("post",channel+url,true,"",currentJ+1,forAChannel);
    $("#signBtn").disabled = false;
}
function forAChannel(channelI,data) {

    if (data == "") {
        channel = channels[currentJ];
        isFindAChannel = true;
        $("#authImg").html("<img id='loginImg' src='" + channel + 
		"loginSign.jsp' border=0>");
                                                       
    }
    else {
        $("#authImg").html("<img id='loginImg' src='" + channel + 
		"loginSign.jsp' border=0><INPUT id='changeCode' class='btn btn-warning' type=button value=我变！>");
        $("#codePanel").html("<tr><td colspan='2'><span style='color:red'>随机获取到了通道"+channelI+"但人数已满!请重新选择通道!</span></td></tr>");
    }

}
function searchFruit() {

    var url = 'cert.jsp';
    var form = $("#loginForm").serialize();
    myAjax("post",channel+url,true,form,currentJ+1,showResponse);

}

function showResponse(channelI,data) {


    if (isAutoIdentify) {
        if (data.match(loginForm.stuname.value) != null) {
            //alert("认证成功！");
			
            checkUserInfo();
            return;
        }
        var ttt = data.replace(/<\/?.+?>/g, "");    //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('#tips').html(ttt);
        $("#tips").show();
        $("#authImg").html("<img id='loginImg' src='"+channel+"loginSign.jsp?tempTime='" + Math.random() + " border=0>");
		loginForm.loginButton.disabled=false;
    }
    else {
        $('#tips').html(data);
        $("#tips").show();
		loginForm.loginButton.disabled=false;
        //$("#authImg").html("<img id='loginImg' src='loginSign.jsp?tempTime='" + Math.random() + " border=0>");
    }
}

//1.结束-------------------------------------------------------------------------


//2.ajax学生信息认证函数---------------------------------------------------------
function checkUserInfo() {
    var url = 'confirmStudentInfo.jsp';
    myAjax("post",channel+url,true,"",currentJ+1,showResponse2);

}
function showResponse2(channelI,data) {
    if (isAutoIdentify) {
        if (data.match(loginForm.stuname.value) != null) {
            //alert("认证成功！");
            checkPermit();
            return;
        }
        var ttt = data.replace(/<\/?.+?>/g, "");    //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('#tips').html(ttt);
        $("#tips").show();
    }
    else {
        $('#tips').html(data);
        $("#tips").show();
    }

}
//2.结束-------------------------------------------------------------------------


//3.ajax学生是否有权利选课-------------------------------------------------------
function checkPermit() {

    var url = 'permission.jsp';
    myAjax("post",channel+url,true,"",currentJ+1,showResponse3);

}
function showResponse3(channelI,data) {

    if (data.replace("所有条件均符合选课条件") != null) {     //可改
        var url = "./studentSelectSubject.htm";
        chrome.extension.getBackgroundPage().Gobal_currentChannel = channel;
        if (isAutoSelectCourse) {
            chrome.extension.getBackgroundPage().Gobal_isAutoSelectCourse = true;

            chrome.extension.getBackgroundPage().Gobal_courseForm = autoSelectCourseForm;
        }
		
		chrome.extension.sendRequest({loginIsOk: "yes"}, function(response) {
                console.log(response.farewell);
	    });
        //window.location.href = url;
    }
}

//3.结束-------------------------------------------------------------------------


function changeImage() {
    document.getElementById("loginImg").src = channel + "loginSign.jsp?temptime=" + Math.random();
}


function changeBox() {

    $("#mesPanel").css("display","none");

    loginForm.loginButton.disabled = false;
    $('#codePanel').html("");
    var url = 'loginSign.jsp';
   
    userName = loginForm.username.value;
    pwd = loginForm.password.value;
    if (loginForm.username.value.length != 10 || loginForm.password.value.length == 0) {
        alert("亲，你的卡号应该为10位，密码不能为空哦");
        return false;
    } else if (loginForm.username.value.indexOf(loginForm.password.value) != -1) {
        alert("亲，你的填写的密码为弱口令，不能登录哦");
        return false;
    } else if (isAutoIdentify&&loginForm.stuname.value.length < 7) {
        alert("亲，你选择了自动认证模式，所以你填写的学号不能为空或少于7位哦！再检查下！");
        return false;
    } else {
        localStorage.setItem("ecardNum",loginForm.username.value) ;
        localStorage.setItem("ecardPwd",loginForm.password.value) ;
        localStorage.setItem("stuNum",loginForm.stuname.value) ;
        $('#signBtn').disabled = true;
        findAChannel();

    }
}

function formatCourses(str) {

    var args = str.split("&");
    for (var i = 0; i < args.length; i++) {
        var arg = args[i].split("=");
        this[arg[0]] = arg[1];
    }
}

function checkForm() {


    isAutoSelectCourse = document.getElementById("isAutoSelectCourse").checked;
	if(isAutoSelectCourse){
    var autoSelectCourseFormStr = $("#autoSelectCourseForm").serialize();  //先序列化
    //alert(autoSelectCourseFormStr);
    autoSelectCourseForm  = new formatCourses(autoSelectCourseFormStr);  //再格式化成对象数组
    
    for (var i = 1; i <= 5; i++) {     //保存自动选课表

        if (autoSelectCourseForm["courseId" + i] != ""&& autoSelectCourseForm["classId" + i]=="") {
            alert(autoSelectCourseForm["courseId" + i]+"的班号为空哦！请重新填写！");
			return;
        }

    }
	}
    //alert(autoSelectCourseForm["courseId1"]);

    if (loginForm.username.value.length != 10 || loginForm.password.value.length == 0) {
        alert("亲，你的卡号应该为10位，密码不能为空哦");
        return false;
    } else if (loginForm.username.value.indexOf(loginForm.password.value) != -1) {
        alert("亲，你填写的密码为弱口令，不能登录哦");
        return false;
    } else if (loginForm.signImg.value.length == 0) {
        alert("亲，校验码不得为空哦");
        return false;
    } else if (isAutoIdentify&&loginForm.stuname.value.length < 7) {
        alert("亲，你选择了自动认证模式，所以你填写的学号不能为空或少于7位哦！再检查下！");
        return false;
    } else {
        $('#mesPanel').show();
        loginForm.loginButton.disabled = true;
        $('#tips').css("display","none");
        searchFruit();
    }
}

document.onkeydown = function () {  //监听键盘回车事件
    if (event.keyCode == 13) {
        checkForm();
    }
}

$("#isAutoSelectCourse").bind("click",function(){
    if($("#isAutoSelectCourse").is(":checked")){
      alert("选中了自动选课模式，需要填写左下角那张预选课表，而且需要注意的是，为了公平起见，自动选课模式，进去只有五分钟的选课时间" +
          "，时间到了会自动退出！！需要重新登陆哦！详细问题见[常见问题及回答]");
	  $("#loginPanel").attr("class","span5");
	  $("#autoSelect").fadeIn("slow");;
	  //$("#autoSelect").show();
    }
	else{
	  //$("#autoSelect").hide();
	  $("#autoSelect").slideUp("fast");;
	  $("#loginPanel").attr("class","span9");
	 
	}
    
});

$("#signBtn").bind("click",function(){
    changeBox();
});



$("#loginBtn").bind("click",function(){
    checkForm();
});
$("#changeCode").bind("click",function(){
   changeImage();
});

$("#signImg").keyup(function () {
		if (document.getElementById("signImg").value.length == 4) checkForm();
});
function  readLocalStore(){
    var ecardNum = localStorage.getItem("ecardNum");
    var ecardPwd =  localStorage.getItem("ecardPwd");
    var stuNum = localStorage.getItem("stuNum");
    $("#username").val(ecardNum);
    $("#password").val(ecardPwd);
    $("#stuname").val(stuNum);
}

readLocalStore();

