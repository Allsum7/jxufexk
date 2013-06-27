var bIsCatchFlyBar = false;
var dragClickX = 0;
var dragClickY = 0;
function HideFlyBar() {
    divFlyBar.style.visibility = "hidden";
    myFlyBarRestorButton.style.display = '';
}

function openFlyBar() {
    myload_flybar();
    divFlyBar.style.visibility = "visible";
    myFlyBarRestorButton.style.display = "none";
}
function catchFlyBar(e) {
    bIsCatchFlyBar = true;
    var x = event.x + document.body.scrollLeft;
    var y = event.y + document.body.scrollTop;
    dragClickX = x - divFlyBar.style.pixelLeft;
    dragClickY = y - divFlyBar.style.pixelTop;
//divFlyBar.setCapture();
    document.onmousemove = moveFlyBar;
}
function releaseFlyBar(e) {
    bIsCatchFlyBar = false;
    divFlyBar.releaseCapture();
    document.onmousemove = null;
}
function moveFlyBar(e) {
    if (bIsCatchFlyBar) {
        divFlyBar.style.left = event.x + document.body.scrollLeft - dragClickX;
        divFlyBar.style.top = event.y + document.body.scrollTop - dragClickY;
    }
}
function myload_flybar() {
    divFlyBar.style.top = document.body.scrollTop;
    divFlyBar.style.left = document.body.offsetWidth - divFlyBar.clientWidth - 30 + document.body.scrollLeft;
}

//window.onresize = myload_flybar;
//window.onscroll = myload_flybar;
