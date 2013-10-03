////////////////各种参数设置////////////////////////
var channels = chrome.extension.getBackgroundPage().Global_channels; //获取得到的通道列表
var isInSchool = chrome.extension.getBackgroundPage().Global_isInSchool; //获取是否在校内
var channel = ""; //当前通道
var isAutoIdentify = true;
var isAutoSelectCourse = false;
var autoSelectCourseForm = {};
var isStopFinding = false;
var currentJ = 0;
$.ajaxSetup(
{
    timeout : 2000
}
);
//////////////////////////////////////////////////

/////////////一些接口/////////////////////////
var loginCodeUrl = 'loginCode.jsp'; // 用来检查通道人数是否已满，返回结果为空则表示未满，非空已满
var certUrl = 'cert.jsp'; //用来认证信息的第一步
var confirmStudentInfoUrl = 'confirmStudentInfo.jsp'; //用来确认学生个人信息
var permissionUrl = 'permission.jsp'; //用来检查学生是否用权限选课，如未评教 ，未交学费等
var loginSignUrl = 'loginSign.jsp'; //用来获取该通道的验证码
var studentSelectSubjectUrl = "./studentSelectSubject.htm"; //选课界面
var logoutUrl = "lightSelectSubject/logout.jsp"; //用来注销用户

var getNotificationUrl = "http://jxufexk.duapp.com/getNotification.php"; //获取最新通知
///////////////////////////////////////////////////////


function myAjax(method, url, isAsync, parameters, channelI, callback)
{
    
    $.ajax(
    {
        type : method,
        url : url,
        data : parameters,
        async : isAsync, //同步或异步
        success : function (data)
        {
            callback(channelI, data);
        }
    }
    );
}

/*
function findAGoodChannel()  //该方法对服务器压力过大不建议使用，随机获取已经很好了
{
var url = loginCodeUrl;
for (var i = 0; i < channels.length; i++)
{
if (isStopFinding)
{
//$("#signBtn").disabled = false;
return;
}
currentJ = i;
channel = channels[i];
myAjax("get", channel + url, false, "", currentJ + 1, forAChannel);
}
if (!isStopFinding)
{ //如果一遍下来全满了，就随机找一个通道
$("#myMesgBox").html("唉！所有通道都满啦！(@^_^@)所以帮你随机选择了一个，或者你可以再试试？");
$("#myMesgBox").show();
randomAChannel();
}
}*/

function randomAChannel()
{ //随机选择一个通道
    var url = loginCodeUrl;
    var randomI = parseInt(Math.random() * (channels.length - 1));
    currentJ = randomI;
    channel = channels[randomI];
    //alert("当前使用通道:" + channel);
    myAjax("get", channel + url, true, "", currentJ + 1, forAChannel); //currentJ+1  表示显示的通道序号 从1开始
    $("#signBtn").disabled = false;
}

function forAChannel(channelI, data)
{
    
    if (data == "")
    { //表示这个通道没满！
        channel = channels[currentJ];
        isStopFinding = true;
        $("#myMesgBox").html(" (*^__^*)恭喜你！RP不错！一下就找到了一个没满的通道，赶紧填验证码");
        $("#myMesgBox").show();
        document.getElementById("signBtn").disabled = true;
        $("#authImg").html("<img id='loginImg' src='" + channel +
            loginSignUrl + "' border=0>");
        
    }
    else
    {
        document.getElementById("signBtn").disabled = false;
        $("#authImg").html("<img id='loginImg' src='" + channel +
            loginSignUrl + "' border=0>");
        $("#codePanel").html("<tr><td colspan='2'><span style='font-size:12px;color:#cc0000'>随机获取到了通道" + channelI + ",但这个通道人数已满!建议重新选择通道!</span></td></tr>");
    }
    
}
function searchFruit()
{
    
    var url = certUrl;
    var form = $("#loginForm").serialize();
    myAjax("post", channel + url, true, form, currentJ + 1, showResponse);
    
}

function showResponse(channelI, data)
{
    
    if (isAutoIdentify)
    {
        if (data.match(loginForm.stuname.value) != null)
        {
            //alert("认证成功！");
            
            checkUserInfo();
            return;
        }
        var ttt = data.replace(/<\/?.+?>/g, ""); //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('#tips').html(ttt);
        $("#tips").show();
        $("#authImg").html("<img id='loginImg' src='" + channel + loginSignUrl + "?tempTime='" + Math.random() + " border=0>");
        loginForm.loginButton.disabled = false;
    }
    else
    {
        $('#tips').html(data);
        $("#tips").show();
        loginForm.loginButton.disabled = false;
        //$("#authImg").html("<img id='loginImg' src='loginSign.jsp?tempTime='" + Math.random() + " border=0>");
    }
}

//1.结束-------------------------------------------------------------------------


//2.ajax学生信息认证函数---------------------------------------------------------
function checkUserInfo()
{
    var url = confirmStudentInfoUrl;
    myAjax("post", channel + url, true, "", currentJ + 1, showResponse2);
    
}
function showResponse2(channelI, data)
{
    if (isAutoIdentify)
    {
        if (data.match(loginForm.stuname.value) != null)
        {
            //alert("认证成功！");
            checkPermit();
            return;
        }
        var ttt = data.replace(/<\/?.+?>/g, ""); //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('#tips').html(ttt);
        $("#tips").show();
        loginForm.loginButton.disabled = false;
    }
    else
    {
        $('#tips').html(data);
        $("#tips").show();
    }
    
}
//2.结束-------------------------------------------------------------------------


//3.ajax学生是否有权利选课-------------------------------------------------------
function checkPermit()
{
    
    var url = permissionUrl;
    myAjax("post", channel + url, true, "", currentJ + 1, showResponse3);
    
}
function showResponse3(channelI, data)
{
    
    if (data.match("所有条件均符合选课条件") != null)
    { //可改
        var url = studentSelectSubjectUrl;
        chrome.extension.getBackgroundPage().Global_currentChannel = channel;
        if (isAutoSelectCourse)
        {
            chrome.extension.getBackgroundPage().Global_isAutoSelectCourse = true;
            
            chrome.extension.getBackgroundPage().Global_courseForm = autoSelectCourseForm;
        }
        
        chrome.extension.sendRequest(
        {
            loginIsOk : "yes"
        }, function (response)
        {
            console.log(response.farewell);
        }
        );
        //window.location.href = url;
    }
    else
    {
        var ttt = data.replace(/<\/?.+?>/g, ""); //去掉得到的html标签
        ttt = ttt.replace(/&nbsp;/g, "");
        $('#tips').html(ttt);
        $("#tips").show();
        loginForm.loginButton.disabled = false;
    }
}

//3.结束-------------------------------------------------------------------------


function changeImage()
{
    document.getElementById("loginImg").src = channel + loginSignUrl + "?temptime=" + Math.random();
}

function changeBox()
{
    
    $("#mesPanel").css("display", "none");
    
    loginForm.loginButton.disabled = false;
    $('#codePanel').html("");
    var url = loginSignUrl;
    
    userName = loginForm.username.value;
    pwd = loginForm.password.value;
    if (loginForm.username.value.length != 10 || loginForm.password.value.length == 0)
    {
        alert("亲，你的卡号应该为10位，密码不能为空哦");
        return false;
    }
    else if (loginForm.username.value.indexOf(loginForm.password.value) != -1)
    {
        alert("亲，你的填写的密码为弱口令，不能登录哦");
        return false;
    }
    else if (isAutoIdentify && loginForm.stuname.value.length < 7)
    {
        alert("亲，你选择了自动认证模式，所以你填写的学号不能为空或少于7位哦！再检查下！");
        return false;
    }
    else
    {
        localStorage.setItem("ecardNum", loginForm.username.value);
        localStorage.setItem("ecardPwd", loginForm.password.value);
        localStorage.setItem("stuNum", loginForm.stuname.value);
        document.getElementById("signBtn").disabled = true;
        randomAChannel();
        
    }
}

function formatCourses(str)
{
    
    var args = str.split("&");
    for (var i = 0; i < args.length; i++)
    {
        var arg = args[i].split("=");
        this[arg[0]] = arg[1];
    }
}

function checkForm()
{
    
    if (isAutoSelectCourse)
    {
        var autoSelectCourseFormStr = $("#autoSelectCourseForm").serialize(); //先序列化
        //alert(autoSelectCourseFormStr);
        autoSelectCourseForm = new formatCourses(autoSelectCourseFormStr); //再格式化成对象数组
        var flagForAllEmpty = false;
        for (var i = 1; i <= 5; i++)
        { //保存自动选课表
            if (autoSelectCourseForm["courseId" + i] != "")
            {
                flagForAllEmpty = true; //表示不全为空
                if (autoSelectCourseForm["classId" + i] == "")
                {
                    alert(autoSelectCourseForm["courseId" + i] + "的班号为空哦！请重新填写！");
                    return;
                }
            }
        }
        if (!flagForAllEmpty)
        {
            alert("温馨提醒:由于发现你开启了自动选课模式，但是提交的预选课表是空的，不建议你酱紫！这样会使你只有五分钟的选课时间！如果不想自动选课，请点击预选课表右上角那个小叉叉哦！");
            return;
        }
    }
    //alert(autoSelectCourseForm["courseId1"]);
    
    if (loginForm.username.value.length != 10 || loginForm.password.value.length == 0)
    {
        alert("亲，你的卡号应该为10位，密码不能为空哦");
        return false;
    }
    else if (loginForm.username.value.indexOf(loginForm.password.value) != -1)
    {
        alert("亲，你填写的密码为弱口令，不能登录哦");
        return false;
    }
    else if (loginForm.signImg.value.length == 0)
    {
        alert("亲，校验码不得为空哦");
        return false;
    }
    else if (isAutoIdentify && loginForm.stuname.value.length < 7)
    {
        alert("亲，你选择了自动认证模式，所以你填写的学号不能为空或少于7位哦！再检查下！");
        return false;
    }
    else
    {
        $('#mesPanel').show();
        localStorage.setItem("ecardNum", loginForm.username.value);
        localStorage.setItem("ecardPwd", loginForm.password.value);
        localStorage.setItem("stuNum", loginForm.stuname.value);
        loginForm.loginButton.disabled = true;
        $('#tips').css("display", "none");
        searchFruit();
    }
}

function readLocalStore()
{
    var ecardNum = localStorage.getItem("ecardNum");
    var ecardPwd = localStorage.getItem("ecardPwd");
    var stuNum = localStorage.getItem("stuNum");
    $("#username").val(ecardNum);
    $("#password").val(ecardPwd);
    $("#stuname").val(stuNum);
    if (ecardNum != null && ecardPwd != null && stuNum != null)
    {
        randomAChannel(); // 如果信息已经有了就直接随机一个通道
        $("#signImg").focus();
    }
    else
    {
        $("#username").focus();
    }
}
function getNotification(i, data)
{
    
    if (data.substr(0, 1) == "@")
    { //@开始表示非更新消息  更新消息只针对ie版
        $("#NotificationBarText").html(data.substr(1, data.length - 1));
    }
    
}
window.onload = function forOnLoad() //载入页面就执行
{
    var myInterval = '';
    //ajax 全局事件
    $(document).ajaxStart(function ()
    {
        var remainTime = 1000;
        var processI = 50;
        $("#Loadingimg").show();
        $("#processBarText").attr("style", "width: 50%;");
        myInterval = setInterval(function ()
            {
                //alert(remainTime +"   "+processI);
                if (remainTime == 0)
                {
                    clearInterval(myInterval);
                    return;
                }
                remainTime -= 100;
                processI += 5;
                $("#processBarText").attr("style", "width: " + processI + "%;");
            }, 100);
        
    }
    )
    .ajaxSuccess(function (evt, request, settings)
    {
        clearInterval(myInterval);
        $("#processBarText").attr("style", "width:100%;");
        $("#Loadingimg").hide();
        
    }
    )
    .ajaxError(function (event, request, settings)
    {
        document.getElementById("signBtn").disabled = false;
        $("#Loadingimg").html("啊哦！网络请求出错!可能是服务器崩溃咯！");
    }
    );
    
    document.onkeydown = function ()
    { //监听键盘回车事件
        if (event.keyCode == 13)
        {
            checkForm();
        }
    }
    
    $("#openAuto").bind("click", function () //自动选课确认
    {
        $("#showTextForAuto").html("<p>你选中了自动选课模式，需要填写左下角那张预选课表</p><p><font style='color:red'>而且需要注意的是，为了公平起见，自动选课模式，进去只有五分钟的选课时间</font></p>" +
            "<p>时间到了会自动退出！！需要重新登陆哦！详细问题见[常见问题及回答]</p>");
        $('#myModal').modal('show');
        $("#autoOk").bind("click", function ()
        {
            isAutoSelectCourse = true;
            $("#loginPanel").attr("class", "span5");
            $("#autoSelect").attr("class", "span4");
            $("#showText").attr("class", " ");
            $("#showText").hide();
            $("#autoSelect").fadeIn("slow");
            
        }
        );
        
    }
    );
    
    $("#closeForm").bind("click", function () //关闭预选课表
    {
        isAutoSelectCourse = false;
        $("#loginPanel").attr("class", "span9");
        $("#autoSelect").hide();
        
    }
    );
    
    $("#signBtn").bind("click", function () //随机通道和验证码
    {
        changeBox();
    }
    );
    
    $("#closeTips").bind("click", function () //关闭提示
    {
        $("#myTips").fadeOut("slow");
    }
    );
    
    $("#closeMesPanel").bind("click", function () //关闭消息面板
    {
        $("#mesPanel").fadeOut("fast");
    }
    );
    
    $("#loginBtn").bind("click", function () //登陆
    {
        document.getElementById("signBtn").disabled = false;
        checkForm();
    }
    );
    $("#changeCode").bind("click", function () //换验证码
    {
        changeImage();
    }
    );
    
    $("#signImg").keyup(function () //检查验证码是否4位
    {
        if (document.getElementById("signImg").value.length == 4)
            checkForm();
    }
    );
    
    if (isInSchool)
    {
        $("#showXnXwText").html("校内");
    }
    else
    {
        $("#showXnXwText").html("校外");
    }
    $("#showXnXwText").show();
    
    readLocalStore(); //读取上次存到本地的个人信息
    
    myAjax("get", getNotificationUrl, true, "", 0, getNotification);
}
