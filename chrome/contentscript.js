var channelIn = new Array(); //校内
var channelOut = new Array(); //校外

////////////////各种参数设置////////////////////////
var userIsInSchool = true;
var projectName = "酱菜选课（Chrome插件版）";
var currentVersion = "0.2.3"; //当前版本号
var inStr = "";
var outStr = "";
var channel = "";
var autoSelectCourseForm = {}; //保存自动选课表的对象
var isAutoSelect = false;
var urlarg = "";
var speed = 1000;
var remainTime = 5 * 60 //为了公平起见   如果是自动选课模式只有5分钟选课时间
$.ajaxSetup(
{
    timeout : 500
}
);
///////////////////////////////////////////

/////////////一些接口/////////////////////////
var checkUpdateUrl = "http://jxufexk.duapp.com/check-update.php";//云端检查更新页面
var xkHomeUrl1 = "http://xk.jxufe.edu.cn/"; //学校选课主页
var xkHomeUrl2 = "http://xk.jxufe.cn/"; //学校选课主页
var logoutUrl = "lightSelectSubject/logout.jsp";
///////////////////////////////////////////////////////

forOnload();//入口函数
function forOnload()
{
    if (window.location.href == xkHomeUrl1 || window.location.href == xkHomeUrl2)
    {
        var s = document.createElement("style");
        s.id = "jxufexk";
        s.type = "text/css";
        s.textContent = "body{background-color:#99cccc;margin:auto;width:980px;text-align :center;}";
        document.head.appendChild(s);
        var trends_dom = document.createElement('div');
        var bo = document.body; //获取body对象.
        //动态插入到body中
        bo.insertBefore(trends_dom, bo.firstChild);
        //确认是否在校内 弹出对话框
        $('<div id="forInOut" class="modal hide fade"  data-backdrop="static" data-keyboard="false" tabindex="100" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-header">' +
            ' <h3 id="myModalLabel">你是在校内还是在校外？</h3>' +
            '</div>' +
            '<div id="showChannels" class="modal-body">' +
            '</div>' +
            '<div  id = "modal-footer" class="modal-footer">' +
            ' <button id="isAllOk" class="btn btn-inverse" data-dismiss="modal" aria-hidden="true">判断正确直接进入</button>' +
            ' <button id="isInSchool" class="btn  btn-success" data-dismiss="modal" aria-hidden="true">应该是校内</button>' +
            ' <button id="isOutSchool" class="btn btn-warning" data-dismiss="modal" aria-hidden="true">应该是校外</button>' +
            '</div>' +
            '</div>').appendTo(trends_dom);
			
		if(checkUpdate()){
		    return;
		};
        getChannel();
        isInSchool(channelIn[0]);
    }
    else if (window.location.href.match("studentSelectSubject") != null)
    { //匹配选课页面
        showUI();
        
        $("#logoutBtn").bind("click", function ()
        {
            logout();
        }
        );
        
        $("#reviseBtn").bind("click", function ()
        { // 修正网页chrome的兼容性问题
            if ($("table")[1].innerHTML.match("请完成教材选购") != null)
            {
                //alert( $("table tr:nth-child(3) td:nth-child(1)").text());
                //alert($("table tr:nth-child(3) td:nth-child(3)").text());
                var bookInput = document.getElementsByName("book");
                bookInput[0].setAttribute("id", "book"); //chrome 严格区分getElementsByName 和getElementById  而ie不区分 所以导致不兼容！
                //alert(bookInput[0].getAttribute("id"));
                alert("'酱菜选课（chrome插件版）'已帮你了修正网页中对chrome内核的不兼容问题，请你重新选择是否要订购教材！谢谢！");
            }
            else
            {
                alert("不要顽皮哦！说了请到了确认是否教材选购那步再来点击我哦！否则是无效的啦！");
            }
            
        }
        );
        
        chrome.extension.sendRequest(
        {
            getAuto : "yes"
        }, function (response)
        {
            if (response.autoSelect)
            {
                isAutoSelect = true;
                channel = response.currentChannel;
                urlarg = response.courseForm;
                //alert(channel+"  "+urlarg["courseId" + 1]);
                autoSelectCourse();
                remainT();
                
            }
            
        }
        );
    }
    else
    {
        location.href = xkHomeUrl1;
    }
    
    var myaudio = document.getElementById("myaudio");
    
    chrome.extension.sendRequest(
    {
        getPlay : true
    }, function (response)
    { //playAudio
        if (response.playAudio)
        {
            myaudio.play();
        }
    }
    );
}

function getChannel()
{ //从页面中得到目前开放的通道
    
    var InI = 0;
    var OutI = 0;
    var oInput = document.body.getElementsByTagName("A"); //取道页面所有链接
    for (var j = 0; j < oInput.length; j++)
    {
        
        if (oInput[j].innerHTML.match(/(.*)选课通道(.*)校内(.*)/) != null)
        {
            channelIn[InI++] = oInput[j].href;
            inStr += oInput[j].href + "&";
        }
        else if (oInput[j].innerHTML.match(/(.*)选课通道(.*)校外(.*)/) != null)
        {
            channelOut[OutI++] = oInput[j].href;
            outStr += oInput[j].href + "&";
        }
    }
    
}

function dealAfter(xnwStr, str, isIn)
{
    if (channelIn.length == 0 && channelOut.length == 0)
    {
        $("#myModalLabel").html("酱菜选课（chrome）插件版");
        $("#showChannels").html("<p><font style='color:red'>检测不到有效通道，可能是这次选课还没开始，或者已经结束！</font></p>");
        $("#modal-footer").html('<button  class="btn btn-success" data-dismiss="modal" aria-hidden="true">关闭</button>');
        $('#forInOut').modal('show');
        return;
    }
    $("#showChannels").html("<p>自动匹配到了目前开放的通道列表,校内:" + channelIn.length + "个,校外:" + channelOut.length + "个<p>并检测到你现在在" + xnwStr + "选课," +
        "自动为你设置了" + xnwStr + "选课模式，祝你选课愉快^_^</p><p><font style='color:red'>如果发现校内校外判断不正确，请在手动修正！</font></p>");
    $('#forInOut').modal('show');
    
    document.onkeydown = function ()
    { //监听键盘回车事件
        if (event.keyCode == 13)
        {
            chrome.extension.sendRequest(
            {
                preIsOk : "yes",
                channelStr : str,
                isInSchool : isIn
            }, function (response)
            {
                console.log(response.farewell);
            }
            );
        }
    }
    $('#isAllOk').bind('click', function ()
    {
        chrome.extension.sendRequest(
        {
            preIsOk : "yes",
            channelStr : str,
            isInSchool : isIn
        }, function (response)
        {
            console.log(response.farewell);
        }
        );
    }
    );
    
    $('#isInSchool').bind('click', function ()
    {
        chrome.extension.sendRequest(
        {
            preIsOk : "yes",
            channelStr : inStr,
            isInSchool : true
        }, function (response)
        {
            console.log(response.farewell);
        }
        );
        
    }
    );
    
    $('#isOutSchool').bind('click', function ()
    {
        chrome.extension.sendRequest(
        {
            preIsOk : "yes",
            channelStr : outStr,
            isInSchool : false
        }, function (response)
        {
            console.log(response.farewell);
        }
        );
    }
    );
    
}

function isInSchool(url)
{ //判断是否在校内
    $.ajax(
    {
        type : "get",
        url : url,
        data : "",
        async : true,
        success : function (data)
        {
            userIsInSchool = true;
            var xnwStr = "校内";
            dealAfter(xnwStr, inStr, true);
        },
        error : function ()
        {
            userIsInSchool = false;
            var xnwStr = "校外";
            dealAfter(xnwStr, OutStr, true);
        }
        
    }
    );
}

function checkUpdate()
{
    var isUpdate = false;
    $.ajax(
    {
        type : "get",
        url : checkUpdateUrl,
        data : "currentVersion=" + currentVersion + "&clientType=crx",
        async : true,
        dataType : "json",
        success : function (data)
        {
            
            var data = eval(data);
            var serverVer = data[0].crxVersion;
            var crxDownloadUrl = data[0].crxDownloadUrl;
            var crxUpdateDate = data[0].crxUpdateDate;
            if (serverVer != currentVersion)
            { //需要更新
                $("#myModalLabel").html("软件更新提醒");
                $("#showChannels").html("<p><small>酱菜选课chrome插件版</small></p><p><font style='color:red'>当前版本号:v" + currentVersion + "  官网最新版本号:v" + serverVer + "</font></p>" +
                    "<p>最新版更新日期:" + crxUpdateDate + "  最新版下载地址:<a class='btn btn-success' href='" + crxDownloadUrl + "'>点击下载!</a></p>");
                $("#modal-footer").html('');
                $('#forInOut').modal('show');
                isUpdate  = true;
            }
        },
        error : function ()
        {
            //
        }
        
    }
    );
	if(isUpdate)
      return true;
	else return false;
}

//用于关闭SESSION---------------------------------------------
function removeline()
{ //清除session
    
    var url = logoutUrl;
    $.ajax(
    {
        type : "post",
        url : channel + url,
        data : "",
        async : true //同步或异步
    }
    );
    
    //alert("您已退出选课！");
}

function logout()
{ //退出
    removeline();
    alert("您已退出选课！");
    window.location.href = xkHomeUrl1;
}

function remainT()
{
    if (remainTime == 0)
    {
        logout(); //退出
    }
    else
    {
        $('#remainTime').val("请注意：因为你选择了自动选课模式，为了公平起见，所以你现在只剩下" + remainTime / 60 + "分钟的选课时间了！时间到了会自动退出哦!");
        remainTime -= 60;
        window.setTimeout("remainT()", speed * 60);
    }
}

///////////////////////////////////////////////////////////
function myAjax(method, url, isAsync, parameters, Ci, callback)
{
    
    $.ajax(
    {
        type : method,
        url : url,
        data : parameters,
        async : isAsync, //同步或异步
        success : function (data)
        {
            callback(true, Ci, data);
        },
        error : function ()
        {
            callback(false, Ci, "");
            //alert("error");
        }
    }
    );
}

function autoSelectCourse()
{
    
    for (var i = 1; i <= 5; i++)
    { //保存自动选课表
        
        if (urlarg["courseId" + i] != "" && urlarg["classId" + i] != "")
        {
            
            var course =
            {
                courseId : urlarg["courseId" + i],
                classId : urlarg["classId" + i],
                isNeedBook : urlarg["isNeedBook" + i]
            }
            autoSelectCourseForm["courseId" + i] = course;
            
            var url = 'checkSelectCourse4.jsp';
            var params = "courseCode=" + autoSelectCourseForm["courseId" + i].courseId + '&classNO=' + autoSelectCourseForm["courseId" + i].classId;
            if (autoSelectCourseForm["courseId" + i].isNeedBook == "on")
            {
                params += '&book=1';
            }
            else
            {
                params += '&book=0';
            }
            myAjax("get", channel + url, true, params, urlarg["courseId" + i], showStatus);
            
        }
        
    }
    chrome.extension.sendRequest(
    {
        deleteAuto : "yes"
    }, function (response)  {}
    
    );
    
}

function showUI()
{
    
    var songUrl = chrome.extension.getURL("/song/song.ogg");
    var s = document.createElement("style");
    s.id = "jxufexk";
    s.type = "text/css";
    s.textContent = "body{background-color:#99cccc;margin:auto;width:980px;text-align :center;}";
    document.head.appendChild(s);
    
    $(":button").attr("class", "btn btn-success");
    var trends_dom = document.createElement('div');
    var bo = document.body; //获取body对象.
    //动态插入到body中
    bo.insertBefore(trends_dom, bo.firstChild);
    $("<div id='jxufexkMain'  style='color: red; border:dotted 2px green'><center><h3>酱菜选课（chrome插件版）</h3> <INPUT TYPE=\"button\" value=\"安全退出请点击这里!!!!!!!\" id=\"logoutBtn\" class='btn btn-warning'></center>" +
        "<br><br><INPUT TYPE=\"button\" id=\"remainTime\" value=\"\" class='btn btn-danger'><br> <div id='showStatus'></div>" +
        "<audio id=\"myaudio\" style='display:none' controls src='" + songUrl + "'></audio> </div>").appendTo(trends_dom);
    $("#divFlyBar").attr("style", "");
    $('input[name="classNO"]').val("");
    $("table").attr("border", "0");
    $("<input type='button' id='reviseBtn' class='btn  btn-danger' value='确认教材的时候按钮无效？请先点击下这里吧！！！'>").appendTo("table");
    $("#viewBtn").attr("disabled", false);
    
}

function showStatus(isSuccess, Ci, data)
{ //自动选课成功一门就显示成功或者失败
    if (isSuccess && data.match("您选择的课程已交给服务器处理,请继续选择下一门课程") != null)
    {
        document.getElementById("showStatus").innerHTML += "您选择的" + Ci + "课程已成功交给服务器处理！<br><br>";
    }
    else
    {
        document.getElementById("showStatus").innerHTML += "您选择的" + Ci + "课程没能成功提交服务器处理！可能是有冲突，请手动选择！<br>";
    }
}

function forReviseLoginPage()
{ // 本想修正login页面的兼容性问题，发现问题太多，还是算了！学校尼玛写得代码太操蛋了！！
    var signBtn = document.getElementsByName("signBtn");
    var loginButton = document.getElementsByName("loginButton");
    var loginForm = document.getElementsByName("loginForm");
    signBtn[0].setAttribute("id", "signBtn"); // 添加id属性
    loginButton[0].setAttribute("id", "loginButton");
    loginForm[0].setAttribute("id", "loginForm");
}
