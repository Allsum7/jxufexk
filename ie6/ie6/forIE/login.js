//1.AJAX,统一身份认证登陆函数--------------------------------------------------
waitTime = 10000;
var channel = "";  //当前通道
//var channels = ["http://172.31.5.72", "http://172.31.5.74", "http://172.31.5.75", "http://172.31.5.76", "http://172.31.5.173",
//   "http://172.31.5.68", "http://172.31.5.195", "http://172.31.5.139", "http://210.35.207.150"];      //通道列表
var channels = new Array();
var currentJ = 0; //当前通道下标

var isAutoIdentify = "";
var isAutoSelectCourse = "";
var isInSchool = "";
var autoSelectCourseForm = "";

function findAChannel() {      //随机选择一个通道,这里可以优化，但是考虑到服务器的承受能力不建议那么做
    var url = 'loginCode.jsp';
    var randomI = parseInt(Math.random() * (channels.length - 1));
    currentJ = randomI;
    channel = channels[randomI] + "/lightSelectSubject/";
    //alert("当前使用通道:" + channel);
    var myAjax = new Ajax.Request(channel + url, {
        parameters: "",
        method: "post",
        onComplete: forAChannel,
        asynchronous: true
    });
    $('signBtn').disabled = false;
}
function forAChannel(originalRequest) {

    if (originalRequest.responseText == "") {
        channel = channels[currentJ] + "/lightSelectSubject/";
        isFindAChannel = true;
        document.getElementById('authImg').innerHTML = "<img id='loginImg' src='" + channel + "loginSign.jsp' border=0 onclick='javascript:changeImage()'>";
    }
    else {
        document.getElementById('authImg').innerHTML = "<img id='loginImg' src=''";
        $('codePanel').innerHTML = "<tr><td colspan='2'><span style='color:red'>此通道人数已满!请重新选择通道!</span></td></tr>";
    }

}
function searchFruit() {

    var url = 'cert.jsp';
    var form = Form.serialize('loginForm');
    var myAjax = new Ajax.Request(channel + url, {
        parameters: form,
        method: "post",
        onComplete: showResponse,
        asynchronous: true
    });

}

function showResponse(originalRequest) {


    if (isAutoIdentify) {
        if (originalRequest.responseText.match(loginForm.stuname.value) != null) {
            //alert("认证成功！");
            checkUserInfo();
            return;
        }
        var ttt = originalRequest.responseText.replace(/<\/?.+?>/g, "");    //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('tips').innerHTML = ttt;
        Element.show('tips');
        document.getElementById('authImg').innerHTML = "<img id='loginImg' src='loginSign.jsp?tempTime='" + Math.random() + " border=0 onclick='javascript:changeImage()'>";
    }
    else {
        $('tips').innerHTML = originalRequest.responseText;
        Element.show('tips');
        document.getElementById('authImg').innerHTML = "<img id='loginImg' src='loginSign.jsp?tempTime='" + Math.random() + " border=0 onclick='javascript:changeImage()'>";
    }
}
var myGlobalHandlers = {
    onCreate: function () {
        Element.show('Loadingimg');
    },
    onFailure: function () {
        alert('对不起!\n页面加载出错!');
    },
    onComplete: function () {
        if (Ajax.activeRequestCount == 0) {
            Element.hide('Loadingimg');
        }
    }
};
Ajax.Responders.register(myGlobalHandlers); //ajax事件绑定
//1.结束-------------------------------------------------------------------------
//2.ajax学生信息认证函数---------------------------------------------------------
function checkUserInfo() {
    var url = 'confirmStudentInfo.jsp';
    var myAjax = new Ajax.Request(channel + url, {
        parameters: "",
        method: "post",
        onComplete: showResponse2,
        asynchronous: true
    });

}
function showResponse2(originalRequest) {
    if (isAutoIdentify) {
        if (originalRequest.responseText.match(loginForm.stuname.value) != null) {
            //alert("认证成功！");
            checkPermit();
            return;
        }
        var ttt = originalRequest.responseText.replace(/<\/?.+?>/g, "");    //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('tips').innerHTML = ttt;
        Element.show('tips');
    }
    else {
        $('tips').innerHTML = originalRequest.responseText;
        Element.show('tips');
    }

}

//2.结束-------------------------------------------------------------------------
//3.ajax学生是否有权利选课-------------------------------------------------------
function checkPermit() {

    var url = 'permission.jsp';
    var myAjax = new Ajax.Request(channel + url, {
        parameters: "",
        method: "post",
        onComplete: showResponse3,
        asynchronous: true
    });

}
function showResponse3(originalRequest) {

    if (originalRequest.responseText.replace("所有条件均符合选课条件") != null) {     //可改
        var url = "./studentSelectSubject.htm" + "?channel=" + channel;
        if (isAutoSelectCourse) {
            url += "&isAutoSelectCourse=" + document.getElementById("isAutoSelectCourse").checked;
            url += "&" + autoSelectCourseForm;
        }
        window.location.href = url;
    }
    $('tips').innerHTML = originalRequest.responseText;
    Element.show('tips');
}

//3.结束-------------------------------------------------------------------------


function changeImage() {
    document.getElementById("loginImg").src = channel + "loginSign.jsp?temptime=" + Math.random();
}

function changeBox() {

    isInSchool = document.getElementById("isInSchool").checked;
    isAutoIdentify = document.getElementById("isAutoIdentify").checked;

    if (isInSchool) {
        var j = 0;
        for (var i = 1; i <= 8; i++) {      //8个通道数        可改
            var idname = "channel" + i;
            var obj = document.getElementById(idname);
            if (obj.value != "") {
                channels[j++] = obj.value;
            }
        }
    }
    loginForm.loginButton.disabled = false;
    $('codePanel').innerHTML = "";
    var url = 'loginSign.jsp';
    var buttonHtml = "<input type=button onclick=\"document.getElementById('loginImg').src='" + url + "'\" value=换一张>";
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
        $('signBtn').disabled = true;
        if (isInSchool) {
            findAChannel();

        }
        else {
            channel = document.getElementById("channel9").value + "/lightSelectSubject/"; //        校外通道
        }

    }
}

function checkForm() {


    isAutoSelectCourse = document.getElementById("isAutoSelectCourse").checked;
    autoSelectCourseForm = Form.serialize("autoSelectCourseForm");

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
        Element.show('mesPanel');
        loginForm.loginButton.disabled = true;
        $('tips').style.display = "none";
        searchFruit();

    }
}
function AutoSelectCourseInfo() {
    alert("选中了自动选课模式，需要填写左下角那张预选课表，而且需要注意的是，为了公平起见，自动选课模式，进去只有五分钟的选课时间" +
        "，时间到了会自动退出！！需要重新登陆哦！详细问题见[常见问题及回答]");
}

document.onkeydown = function () {  //监听键盘回车事件
    if (event.keyCode == 13) {
        checkForm();
    }
}
