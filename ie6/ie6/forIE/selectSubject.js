//document.getElementById('username').focus();
//1.AJAX,显示已选课程界面--------------------------------------------------
function getarg() {
    var url = unescape(window.location.href);
    var allargs = url.split("?")[1];
    var args = allargs.split("&");
    for (var i = 0; i < args.length; i++) {
        var arg = args[i].split("=");
        this[arg[0]] = arg[1];
    }
}
var autoSelectCourseForm = {}; //保存自动选课表的对象
var urlarg = new getarg();
var channel = urlarg["channel"];
if (urlarg["isAutoSelectCourse"]) {
    autoSelectCourse();
}

var currentCourseId = 1;

function autoSelectCourse() {

    for (var i = 1; i <= 5; i++) {     //保存自动选课表


        if (urlarg["courseId" + i] != "" && urlarg["classId" + i] != "") {

            var course = {
                courseId: urlarg["courseId" + i],
                classId: urlarg["classId" + i],
                isNeedBook: urlarg["isNeedBook" + i],
                isRetaken:urlarg["isRetaken"+i]
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
            var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showStatus, asynchronous: true});
        }

    }
}

function showStatus(originalRequest) {   //自动选课成功一门就显示成功否则失败
    if (originalRequest.responseText.match("您选择的课程已交给服务器处理,请继续选择下一门课程") != null) {
        $("showStatus").innerHTML += "您选择的第"+currentCourseId+"门课程已交给服务器处理！<br>";
    }
    else {
        $("showStatus").innerHTML += "您选择的第"+currentCourseId+"门课程没能成功提交服务器处理！可能是有冲突，请手动选择！<br>";
    }
    currentCourseId++;
}
function viewData() {

    var url = 'predataList.jsp';
    var myAjax = new Ajax.Request(channel + url, {parameters: "", method: "post", onComplete: showResponse, asynchronous: true});
    waitTime = 10000; //10 秒
    timer = setInterval("OnTimer()", 1000);
}

function showResponse(originalRequest) {

    $('selectCourseInfoPanel').innerHTML = originalRequest.responseText;

}
var myGlobalHandlers =
{
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
Ajax.Responders.register(myGlobalHandlers);//ajax事件绑定
//1.结束-------------------------------------------------------------------------

//2.打开课程选择界面
function viewCourse(courseCode, classNO) {

    var url = 'listSubject.jsp';
    var params = "courseCode=" + courseCode + '&classNO=' + classNO;
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse2, asynchronous: true});
}

function showResponse2(originalRequest) {

    var resText = originalRequest.responseText;
    var reg = /<script[^>]*>((.|\n)+)<\/script>/i;
    var match = resText.match(reg);
    var MyScript = "";
    var Html = resText.replace(reg, "");
    if (match != null) {
        MyScript = match[1];
        eval(MyScript);
    }
    var Html = resText.replace(reg, "");
    $('listCoursePanel').innerHTML = Html;

}
//2.结束-------------------------------------------------------------------------

//3.1 确认课程信息(教材信息)-------------------------------------------------------------------------
function checkSelectCourse(courseCode, classNO, isRetaken) {
    var url = 'checkSelectCourse.jsp';
    var params = "courseCode=" + courseCode + '&classNO=' + classNO + '&isRetaken=' + isRetaken;
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse2, asynchronous: true});
}

//3.1结束-------------------------------------------------------------------------

//3.2 确认课程信息(是否重修，是否已选)-------------------------------------------------------------------------
function checkSelectCourse2(courseCode, classNO) {
    var url = 'checkSelectCourse2.jsp';
    var params = "courseCode=" + courseCode + '&classNO=' + classNO
    //alert(bookFlag);
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse2, asynchronous: true});
}
//3.2结束-------------------------------------------------------------------------

//3.3 确认课程信息(看是否符合校区，性别，最大学分，时间冲突等条件)-------------------------------------------------------------------------
function checkSelectCourse3(courseCode, classNO, isRetaken) {
    var url = 'checkSelectCourse3.jsp';
    var params = "courseCode=" + courseCode + '&classNO=' + classNO + '&isRetaken=' + isRetaken;
    //alert(bookFlag);
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse2, asynchronous: true});
}
function checkSelectCourse4(courseCode, classNO, bookFlag) {

    var url = 'checkSelectCourse4.jsp';
    var params = "courseCode=" + courseCode + '&classNO=' + classNO + '&book=' + bookFlag;
    //alert(bookFlag);
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse2, asynchronous: true});
}

//3.2结束-------------------------------------------------------------------------
//操作函数(退选，删除，订购教材)
function postRequest(object, postRequest, postID, msg, courseCode) {
    if (postRequest == "delete") {
        msg = "确实要退选 " + msg + " 吗？";
    }
    if (postRequest == "book") {
        msg = "确实要改变 " + msg + " 的教材需求吗？";
    }
    if (confirm(msg)) {
        object.disabled = true;
        var url = 'doAction.jsp';
        var params = "postRequest=" + postRequest + '&postID=' + postID + '&courseCode=' + courseCode;
        //alert(bookFlag);
        var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", onComplete: showResponse3, asynchronous: true});
    }
}
function showResponse3(originalRequest) {
    var resText = originalRequest.responseText;
    resText = resText.replace(/\r\n/ig, "")
    if (resText.indexOf("退选") != -1) {
        alert(resText);
    }
}
//确认选择了课程　
function postCourseCode(courseCode, classNO, courseCaption, isMainCourse) {
    var message = "课程列表信息如下:\r\n";
    message = message + "-----------------------------\r\n";
    message = message + "■ 课程代码:" + courseCode + "\r\n";
    message = message + "■ 课程名称:" + courseCaption + "\r\n";
    message = message + "■ 班号:" + classNO + "\r\n";
    message = message + "-----------------------------\r\n";
    if (isMainCourse == "1") {
        message = message + "*****注意:********\r\n此课程为主干课程,请注意与自已的教学计划相匹配!" + "\r\n";
        message = message + "********************\r\n";
    }

    message = message + "您确认要选择这门课吗!?" + "\r\n";

    if (confirm(message)) {
        checkSelectCourse2(courseCode, classNO);
    }
}

function OnTimer() {
    //alert('ok2');
    $('viewBtn').value = "您于[" + waitTime / 1000 + "]秒后可以点击此按扭查看您的选课结果！";
    waitTime = waitTime - 1000;

    if (waitTime == 0) {
        $('viewBtn').disabled = false;
        clearInterval(timer);
        $('viewBtn').value = "请点击这里查看您的选课结果！"
    }
}


function mouseover(id) {
    id.className = "mouseover";
}
function mouseout(id) {
    id.className = "mouseout";
}
//用于关闭SESSION---------------------------------------------
function removeline() {//清除session

    var url = '/lightSelectSubject/logout.jsp';
    var params = "";
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", asynchronous: true});

    //alert("您已退出选课！");
}

function logout() {//退出
    var url = '/lightSelectSubject/logout.jsp';
    var params = "";
    var myAjax = new Ajax.Request(channel + url, {parameters: params, method: "post", asynchronous: true});
    alert("您已退出选课！");
    window.location.href = "./index.htm";
}
function viewDataNoTime() {

    var url = 'predataList.jsp';
    var myAjax = new Ajax.Request(channel + url, {parameters: "", method: "post", onComplete: showResponse, asynchronous: true});
}

//-------------------------------------------------------
