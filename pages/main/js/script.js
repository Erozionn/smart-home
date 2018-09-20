var states = {
    buzzer: "off",
    ac: "off",
    garage: "off"
}
var autoOff;

var ac_temp = 0;

//Insert Video feed if available

$.ajax({
    url: 'http://192.168.2.231:8080/stream',
    timeout: 8,
    method: 'GET',
    success: function(response){
        console.log("working");
        $(".camera-wrap .feed").attr("src", "http://192.168.2.231:8080/stream/video.mjpeg")
    }, error: function(error){
        console.log("not working");
        $(".camera-wrap .feed").attr("src", "main/images/offlineVideo.jpg")
    }
});




$(document).on("click", ".button.buzz", function(e){
    e.preventDefaults;
    $.ajax({
        url: '../launcher',
        timeout: 30,
        data: {'buzz': 'toggle'},
        dataType: 'json',
        method: 'POST',
        success: function(response) {
            clearTimeout(autoOff);

            var data = response;
            console.log(data);
            states["buzzer"] = data.state;
            if(data.state == "on"){
                $(".buzzer #buzz").html("<i class='material-icons'>lock_open</i> Unlocked")
                $(".buzzer #buzz").addClass("btn-danger")
                $(".buzzer #buzz").removeClass("btn-primary");

            } else if (data.state == "off") {
                $(".buzzer #buzz").html("<i class='material-icons'>lock_open</i> Locked")
                $(".buzzer #buzz").addClass("btn-primary")
                $(".buzzer #buzz").removeClass("btn-danger");
            }
            autoOff = setTimeout(function(){
                $(".buzzer #buzz").html("<i class='material-icons'>lock</i> Locked")
                $(".buzzer #buzz").addClass("btn-primary")
                $(".buzzer #buzz").removeClass("btn-danger");
            }, 10000);
        }
    });
});


//AC Button
$(document).on("click", ".ac button", function(e){
    e.preventDefaults;
    $.ajax({
        url: '../launcher',
        timeout: 5000,
        data: {'ac': 'toggle'},
        dataType: 'json',
        method: 'POST',
        success: function(response) {

            var data = JSON.parse(response);
            console.log(data);
            states["ac"] = data.state;
            if(data.state == "on"){
                $(".ac #air").toggleClass("bw");

            } else if (data.state == "off") {
                $(".ac #air").toggleClass("bw");
            }
        }
    });
});

$(document).on("click", ".garageStatus", function(e){
    e.preventDefaults;
    $.ajax({
        url: '../launcher',
        timeout: 5000,
        data: {'garage': 'toggle'},
        dataType: 'json',
        method: 'POST',
        success: function(response) {

            var data = JSON.parse(response);
            console.log(data);

            states["garage"] = "on";
                
            $(".garage .garageStatus i").css({"transform": "rotateZ(180deg)"});
            $(".garageStatus .info-wrap .info").html("Open");

            for (var i = 15; i >= 0; i--) {
                (function(index) {
                    setTimeout(function() {
                        $(".garage .button-garage h6").html(15-index);
                        console.log(index >= 10 && index < 15)
                        if(index >= 10 && index < 15){
                            $(".garage .garageStatus i").css({"background-color": "#e92059"});
                            //$(".garage .garageStatus .button>h6").html("Closing");
                        } else if(index >= 15) {
                            $(".garage .garageStatus i").css({"transform": "rotateZ(0deg)", "background-color": "#01ebc2"});
                            states["garage"] = "off";
                            $(".garage .button-garage h6").html("Open");
                            $(".garageStatus .info-wrap .info").html("Closed");
                        }
                    }, i*1000);
                })(i);
            }
        }
    });
});



function buzzer(){
    
}

//Carousel
$('.carousel').carousel({
    interval: 0
});

//Nav
var itemIndexOld = 0;
$(document).on("click", ".nav-item", function(e){
    e.preventDefaults;
    var item = $(this);
    var itemIndex = $(".nav-item").index(item);
    if($(this).children("a").hasClass("disabled") == true){
        return;
    }
    //console.log("Old: " +itemIndexOld + " New: " +itemIndex);
    direction = "";
    direction2 = "";
    if(itemIndex > itemIndexOld){
        direction = "uk-animation-slide-left-medium";
        direction2 = "uk-animation-slide-right-medium";
        //console.log("right");
    } else if(itemIndex < itemIndexOld){
        direction = "uk-animation-slide-right-medium";
        direction2 = "uk-animation-slide-left-medium";
        //console.log("left");
    }

    
    $(".pages-item.active").toggleClass("active " + direction);
    $(".pages-item:eq("+itemIndex+")").toggleClass("active " + direction2);
    $(".pages-item:eq("+itemIndexOld+")").removeClass(direction).removeClass(direction2);
    itemIndexOld = itemIndex;
    $(".nav-item.active").toggleClass("active");
    $(this).toggleClass("active");
    

    

    if($(".navbar-collapse").hasClass("show")){
       $(".navbar-collapse").removeClass("show");
    }
});



//Clock
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
		var months = ["January ", "February", "Mach", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// getTime - The Gathering
function getTime() {
    var date = new Date(),
        hour = date.getHours();
        if(hour > 12){
            ampm = "PM";
            hour = hour - 12;
        } else {
            ampm = "AM";
        }
    return {
        day: weekdays[date.getDay()],
        date: date.getDate(),
        month: months[date.getMonth()],
        hour: appendZero(hour),
        minute: appendZero(date.getMinutes()),
        second: appendZero(date.getSeconds()),
        year: date.getFullYear(),
        ampm: ampm
    };
}

// appendZero - If the number is less than 10, add a leading zero. 
function appendZero(num) {
    if (num < 10) {
        return "0" + num;
    }
    return num;
}

// refreshTime - Build the clock.
function refreshTime() {
    var now = getTime();
    $('.date').html(now.date + ' ' + now.month + " " + now.year);
    $(".clock .hour").html(now.hour);
    $(".clock .minute").html(now.minute +ampm);
    //$(".clock .colon").toggleClass("invisible");
}

// Tick tock - Run the clock.
refreshTime();
setInterval(refreshTime, 1000);
        
//Weather
function refreshWeather(){
    $.ajax({
        url: '../weather',
        dataType: 'json',
        method: 'GET',
        success: function(response) {

            var data = JSON.parse(response);
            console.log(data);
            $(".outside-temp h1.temp").html(Math.round(data.currently.temperature) + "<sup>°</sup>");
            $(".outside-temp .feels-like-temp").html(Math.round(data.currently.apparentTemperature) + "<sup>°</sup>");
            $(".outside-temp img").attr("src", "main/images/weather/" + data.currently.icon + ".svg");
            var hourlyData = {};
            hourlyData["temp"] = [];
            hourlyData["time"] = [];
            for (var i = 0; i < data.hourly.data.length; i++){
                hourlyData["temp"].push(Math.round(data.hourly.data[i].temperature));
                hourlyData["time"].push(moment.unix(data.hourly.data[i].time).format("ddd, h A"));
            }
            var gradient = $('#hourly-weather-chart')[0].getContext('2d').createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgb(0, 184, 153,1)');   
            gradient.addColorStop(1, 'rgb(0, 255, 212,0.5)');
            console.log(hourlyData);
            var myLineChart = new Chart($('#hourly-weather-chart')[0].getContext('2d'), {
                type: 'line',
                data: {
                    labels: hourlyData["time"],
                    datasets: [{
                        label: "48 Hour Temperature",
                        //backgroundColor: '#01ebc2',
                        borderColor: '#00ba9a',
                        data: hourlyData["temp"],
                        backgroundColor : gradient, // Put the gradient here as a fill color
                    }],
                },
                options: {
                    tooltips: {
                        mode: 'index',
                        position: 'cursor',
                        intersect: false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return value + "°C";
                                }
                            }
                        }]
                    }
                }
                //options: options
            });
            if(data.alerts){
                $(".weather-alert").fadeIn(1000);
                $(".weather-alert h6").html("<b>"+data.alerts[0].title+" ("+moment.unix(data.alerts[0].time).fromNow()+"):</b> "+data.alerts[0].description.replace(/#/gi, ''));
                $(".weather-alert h6").marquee({
                    pauseOnHover: true,
                    duration: 12000
                  });
                // $(".alert h6").mouseover(function () {     
                //     $(this).removeAttr("style");
                // }).mouseout(function () {
                //     $(this).marquee();
                // });
            } else {
                
                $(".weather-alert").fadeOut(1000, function(){
                    $(".weather-alert h6").marquee('destroy');
                });
            }
        }
    });
}

refreshWeather()
setInterval(refreshWeather, 200000);

$(window).on("load", function(){
    $(".loading-screen").fadeOut(1000);
});

var limit = 60;
for(var i =0; i < limit; i++){
    var angle = (360/limit)*i;

    $(".circle .dots").append("<div class='dot' style='transform: rotate("+angle+"deg)'><div class='dot-inner animate'><div class='dot-inner-inner animate'></div></div></div>");
}

$(document).on("mouseenter touchenter", ".dot-inner", function(e){
    var elements = $(".dot-inner").index($(this));

    for(var i = 0; i <= elements; i++){
        // var back = limit-i;
        if (i > limit*0.73){
            $(".dot>.dot-inner:eq("+i+")").addClass("yellow");
        } else {
            $(".dot>.dot-inner:eq("+i+")").addClass("green");
        }
    }    
    

    for(var j = 0; j <= limit-elements-1; j++){
        // var back = limit-i;
        $(".dot>.dot-inner:eq("+(limit-j)+")").removeClass("green").removeClass("yellow");
    }

    if (elements < 1){
        $(".circle .ac-temp").html("Off");
        ac_temp = 0;
    } else {
        ac_temp = 30 - Math.round(($(".dot-inner.green, .dot-inner.yellow").length/limit)*15);
        $(".circle .ac-temp").html(ac_temp + "<sup>°</sup>");
    }
    
    //console.log($(".dot-inner.green, .dot-inner.yellow").length);
});

$(document).on("mouseleave touchleave", ".dot-inner", function(e){
    var elements = $(".dot-inner").index($(this));
    if (elements < 1){
        $(".dot>.dot-inner").removeClass("green").removeClass("yellow");
        $(".circle .ac-temp").html("Off");
    } else{
        
    }
    
});

// var counter = 0;
// var region = new ZingTouch.Region($(".circle"));
// var target = $(".dot-inner");

// region.bind(target, 'pan', function(e){
//   counter++;
//   console.log(counter);
// });


//Refresh who is online
Chart.defaults.global.defaultFontColor = "#fff";
Chart.defaults.global.defaultFontFamily = "Lato";

function refreshPeopleOnline(){
    $.ajax({
        url: '../launcher',
        timeout: 25000,
        data: {'whoisonline': 'toggle'},
        dataType: 'json',
        method: 'POST',
        success: function(response) {
            console.log(response);
            $(".people").html("");
            for(var i = 0; i <= Object.keys(response["offline"]).length-1; i++){
                console.log(moment(response["offline"][i]["time"]).fromNow());
                $(".people").prepend("<div class='person offline'><div class='person-image'><div class='overlay'></div><img src='main/images/people/"+response["offline"][i]["name"].toLowerCase()+".jpg'></div><div class='info'><h5 class='name'>"+response["offline"][i]["prettyName"]+"</h5><h6 class='out'>Out</h6><h6 class='last-time'>for "+moment(response["offline"][i]["time"]).fromNow(true)+"</h6></div></div>");
            }

            for(var j = 0; j <= Object.keys(response["online"]).length-1; j++){
                console.log(response["online"][j]["name"]);
                $(".people").prepend("<div class='person online'><div class='person-image'><div class='overlay invisible'></div><img src='main/images/people/"+response["online"][j]["name"].toLowerCase()+".jpg'></div><div class='info'><h5 class='name'>"+response["online"][j]["prettyName"]+"</h5><h6 class='in'>In</h6><h6 class='last-time'>for "+moment(response["online"][j]["time"]).fromNow(true)+"</h6></div></div>");
            }
        }
    });    
}
var garageInfo = {};
function refreshGarageInfo(){
    $.ajax({
        url: '../garage',
        dataType: 'json',
        method: 'GET',
        success: function(response) {

            var data = JSON.parse(response);

            //console.log(data[1].button);
            
            garageInfo["button"] = [];
            garageInfo["remote"] = [];
            garageInfo["web"] = [];
            garageInfo["time"] = [];
            //Each Array
            for (var i = 0; i < data[0].length; i++){
                
                garageInfo["button"].push(data[0][i].button);
                garageInfo["remote"].push(data[0][i].remote)
                garageInfo["web"].push(data[0][i].web)
                garageInfo["time"].push(moment(data[0][i].datetime).format("ddd"));
                
            }
            console.log(garageInfo);
            $(".garageStatus .lastOnline h6").html("Last Opened: " + moment(data[1][0].datetime).fromNow())

            var myLineChart2 = new Chart($('#garage-chart')[0].getContext('2d'), {
                type: 'line',
                data: {
                    labels: garageInfo["time"],
                    datasets: [{
                        label: "Garage Door Remote",
                        backgroundColor: 'hsl(170, 100%, 46%, 0.8)',
                        data: garageInfo["remote"],
                    }, {
                        label: "Physical Button",
                        backgroundColor: 'hsl(170, 100%, 34%, 0.8)',
                        data: garageInfo["button"],
                    }, {
                        label: "Smart Home App",
                        backgroundColor: 'hsl(170, 100%, 22%, 0.8)',
                        data: garageInfo["web"],
                    }]
                },
                options: {
                    legend: {
                        labels: {
                          fontColor: '#fff'
                        }
                    },
                    scales: {
                        xAxes: [{
                            //stacked: true,
                            ticks: {
                            fontColor: '#fff'
                          }
                        }],
                        yAxes: [{
                            //stacked: true,
                            ticks: {
                                fontColor: '#fff'
                              }
                        }]
                    }
                }
                //options: options
            });
        }
    });
}

function refreshDeviceState(){
    $.ajax({
        url: '../state',
        dataType: 'json',
        method: 'GET',
        success: function(response){
            //console.log(Object.keys(response)[0]);
            $(".status .items").html("");
            $(".status h6").html("Status ("+ moment().format("h:mm A") +")");
            for(var i = 0; i < Object.keys(response).length; i++){
                $(".status .items").append("<div class='item " + response[Object.keys(response)[i]] + "'><h6>" + Object.keys(response)[i] + "</h6><span>" + response[Object.keys(response)[i]] + "</span></div>")
                console.log(Object.keys(response)[i] + ": " + response[Object.keys(response)[i]])
            }
        }
    });
} 

refreshDeviceState();
refreshPeopleOnline();
refreshGarageInfo();
setInterval(function(){
    refreshDeviceState();
    refreshPeopleOnline();
    refreshGarageInfo();
}, 120000);



var socket = io("http://192.168.2.208:80");

var oldRect = {"x": 0, "y": 0};
socket.on('faceRecognition', function (data) {
    //console.log(data["rect"]);
    if (data.prediction.className != "noface"){

        if (Math.abs(oldRect["x"] - data["rect"]["x"]) >= 5 && Math.abs(oldRect["y"] - data["rect"]["y"]) >= 5){
            $(".stream-wrap .overlay .face").show().animate({"left": (data["rect"]["x"] - 200) + "px", "top": (data["rect"]["y"] - 20) + "px"}, 50);
            oldRect = {"x": data["rect"]["x"], "y": data["rect"]["y"]};
        }
        
        $(".stream-wrap .overlay .face .name").html(data.prediction.className);
    } else {
        $(".stream-wrap .overlay .face .name").html("");
        $(".stream-wrap .overlay .face").hide();
    }
    
});

$(document).on("click", "#refreshApi", function(e){
    e.preventDefaults;
    $.ajax({
        url: '../api/' + api_key + '/api_key',
        timeout: 5000,
        data: {refresh: true},
        dataType: 'json',
        method: 'GET',
        success: function(response) {
            api_key = response["new_key"]

            $(".apiInfo input").attr("value", api_key);
        }
    });
});

(function () {
    var min = 0;
    var max = 1;
    var num = Math.floor(Math.random()*(max-min+1)+min);
$(".pages").css({"background-image": "url('../main/images/background" + num + ".jpg')"})    
})();
