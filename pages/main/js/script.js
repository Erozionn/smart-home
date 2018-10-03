var states = {
    buzzer: "off",
    ac: "off",
    garage: "off",
    video: "offline"
}
var autoOff;

var ac_temp = 0;

// =====================================
// Device Detection ====================
// =====================================



var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}




if(!isMobile) {
    $(window).on('resize load',function(){

            var header_height = $(".header").height();
            var footer_height = $("#footer").height();
            var body_height = $(document).height();
            $(".pages-inner").css({"height": body_height - footer_height - header_height});    
        
    });

    $('.pages-inner').mCustomScrollbar({

    });
}


//Insert Video feed if available

$.ajax({
    url: 'http://192.168.2.231:8080/stream',
    timeout: 8,
    method: 'GET',
    success: function(response){
        states["video"] = "online";
        $(".camera-wrap .feed").attr("src", "http://192.168.2.231:8080/stream/video.mjpeg")
    }, error: function(error){
        states["video"] = "offline";
        $(".camera-wrap .feed").attr("src", "main/images/offlineVideo.jpg")
    }
});

// =====================================
// Clock ==============================
// =====================================

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




// =====================================
// Buzzer Button =======================
// =====================================

$(document).on("click", ".button.buzz", function(e){
    e.preventDefault();
    $.ajax({
        url: '../api/'+api_key+'/front_door',
        timeout: 30,
        data: {'action': 'open'},
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


// =====================================
// AC  =================================
// =====================================
$(document).on("click", ".ac button", function(e){
    e.preventDefault();
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

$(document).on("mouseleave touchleave", ".dot-inner", function(e){
    var elements = $(".dot-inner").index($(this));
    if (elements < 1){
        $(".dot>.dot-inner").removeClass("green").removeClass("yellow");
        $(".circle .ac-temp").html("Off");
    } else{
        
    }
    
});


// =====================================
// Garage Button =======================
// =====================================

$(document).on("click", ".garageStatus", function(e){
    e.preventDefault();
    $.ajax({
        url: '../api/'+api_key+'/garage',
        timeout: 5000,
        data: {'action': 'open'},
        dataType: 'json',
        method: 'POST',
        success: function(response) {

            var data = response;

            states["garage"] = "on";
                
            $(".garage .garageStatus i").css({"transform": "rotateZ(180deg)"});
            $(".garageStatus .info-wrap .info").html("Open");

            for (var i = 15; i >= 0; i--) {
                (function(index) {
                    setTimeout(function() {
                        $(".garage .button-garage h6").html(15-index);
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


// =====================================
// Navigation ==========================
// =====================================

$('.carousel').carousel({
    interval: false
  }).on('slide.bs.carousel', function (e) {
    console.log(e.to)
    $(".nav-item.active").toggleClass("active");
    $(".nav-item:eq(" + e.to + ")").toggleClass("active");

    $(".pages-inner").mCustomScrollbar("scrollTo", "top", {scrollInertia: 300});
});


if (isMobile){
    $(window).swipe( {
            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
            
                if(direction == null){
                return;
            }
            
            switch(direction){
                case "left": {
                    $('.carousel').carousel('next');
                }

                case "right": {
                    $('.carousel').carousel('prev');
                }
            }
            
        }
    });    
}

// var itemIndexOld = 0;
// $(document).on("click", ".nav-item", function(e){
//     e.preventDefault();
//     var item = $(this);
//     var itemIndex = $(".nav-item").index(item);
//     if($(this).children("a").hasClass("disabled") == true){
//         return;
//     }
//     //console.log("Old: " +itemIndexOld + " New: " +itemIndex);
//     direction = "";
//     direction2 = "";
//     if(itemIndex > itemIndexOld){
//         direction = "uk-animation-slide-left-medium";
//         direction2 = "uk-animation-slide-right-medium";
//         //console.log("right");
//     } else if(itemIndex < itemIndexOld){
//         direction = "uk-animation-slide-right-medium";
//         direction2 = "uk-animation-slide-left-medium";
//         //console.log("left");
//     }

    
//     $(".pages-item.active").toggleClass("active " + direction);
//     $(".pages-item:eq("+itemIndex+")").toggleClass("active " + direction2);
//     $(".pages-item:eq("+itemIndexOld+")").removeClass(direction).removeClass(direction2);
//     itemIndexOld = itemIndex;
//     $(".nav-item.active").toggleClass("active");
//     $(this).toggleClass("active");
    

    

//     if($(".navbar-collapse").hasClass("show")){
//        $(".navbar-collapse").removeClass("show");
//     }
// });

// //Enable swiping...
// var old_page;
// $(window).swipe( {
//     swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
//         $(".pages-item").css({"left": 0}); 
//     console.log(event)
//     if(direction == null){
//         return;
//     }
//     var new_page

//     old_page = $(".nav-item").index($(".nav-item.active"));

//     if (direction == "left"){

//         if (old_page >= $('.nav-item').length - 1){
//             new_page = 0;
//         } else {
//             new_page = old_page + 1;
//         }
        

//         direction_animation = "uk-animation-slide-left";
//         direction_animation2 = "uk-animation-slide-right";
//     } else if (direction == "right"){
//         if (old_page > 0){
//             new_page = old_page - 1;
//         } else {
//             new_page = $('.nav-item').length - 1;
//         }
//             direction_animation = "uk-animation-slide-right";
//             direction_animation2 = "uk-animation-slide-left";
//     }

//     $(".nav-item.active").toggleClass("active");
//     $(".nav-item:eq(" + new_page + ")").toggleClass("active");
//     $(".pages-item.active").toggleClass("active " + direction_animation);

//     $(".pages-item:eq("+new_page+")").toggleClass("active " + direction_animation2);
//     $(".pages-item:eq("+old_page+")").removeClass(direction_animation).removeClass(direction_animation2);
//     old_page = new_page;


//     //console.log("Swipping to page " + new_page + " from " + old_page + " page.");
//   },
//   swipeStatus: function(event, phase, direction, distance, duration, fingers, fingerData, currentDirection){
    
//     if(direction == "right"){
//         $(".pages-item.active").css({"left": distance});
//     } else if(direction == "left") {
//         $(".pages-item.active").css({"left": -distance});
//     } else {
//         return;
//     }
    
//     console.log(direction + ": " + distance);
//   },
//   threshold:100,
//   //maxTimeThreshold: 500,
//   fingers:'all'
// });
        
// =====================================
// Weather =============================
// =====================================
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
            $(".welcome h5").html('It will be '+data.hourly["summary"].toLowerCase().replace(".","")+' with a high of '+parseInt(data.daily.data[0].temperatureMax)+'<sup>°</sup> and a low of '+parseInt(data.daily.data[0].temperatureMin)+'<sup>°</sup>.')
            
            var hourlyData = {};
            hourlyData["temp"] = [];
            hourlyData["time"] = [];
            for (var i = 0; i < data.hourly.data.length; i++){
                hourlyData["temp"].push(Math.round(data.hourly.data[i].temperature));
                hourlyData["time"].push(moment.unix(data.hourly.data[i].time).format("ddd, h A"));
            }
            var gradient = $('#hourly-weather-chart')[0].getContext('2d').createLinearGradient(0, 0, 0, 400);
            //gradient.addColorStop(0, 'rgb(0, 184, 153,1)');   
            //gradient.addColorStop(1, 'rgb(0, 255, 212,0.5)');
            console.log(hourlyData);
            var myLineChart = new Chart($('#hourly-weather-chart')[0].getContext('2d'), {
                type: 'line',
                data: {
                    labels: hourlyData["time"],
                    datasets: [{
                        label: "48 Hour Outside Temperature",
                        //backgroundColor: '#01ebc2',
                        borderColor: '#00ba9a',
                        data: hourlyData["temp"],
                        backgroundColor : "#00AD91", // Put the gradient here as a fill color
                    }],
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                // Include a dollar sign in the ticks
                                callback: function(value, index, values) {
                                    return value + "°";
                                }
                            }
                        }]
                    },
                    elements: { 
                        point: { 
                            radius: 0 
                        } 
                    }
                }
                //options: options
            });
            if(data.alerts){
                var alert = "";
                for (var i = 0; i < data.alerts.length; i++){
                    alert = alert + "<b>"+data.alerts[i].title+" ("+moment.unix(data.alerts[i].time).fromNow()+"):</b> "+data.alerts[i].description.replace(/(?:\r\n|\r|\n|#)/g, ' ') + " ";
                }

                $(".weather-alert").fadeIn(1000);
                $(".weather-alert h6").html(alert);
                $(".weather-alert h6").marquee({
                    pauseOnHover: true,
                    speed: 5,
                    duplicated: true,
                    startVisible: true
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

    $(".circle .dots").append("<div class='dot' id='dot-"+i+"' style='transform: rotate("+angle+"deg)'><div class='dot-inner animate'><div class='dot-inner-inner animate'></div></div></div>");
}

$(document).on("mouseenter touchenter", ".dot-inner", function(e){
    var elements = $(".dot-inner").index($(this));

    for(var i = 0; i <= elements; i++){
        // var back = limit-i;
        //if (i > limit*0.73){
            $(".dot>.dot-inner:eq("+i+")").addClass("yellow");
        //} else {
            $(".dot>.dot-inner:eq("+i+")").addClass("green");
        //}
    }    
    

    for(var j = 0; j <= limit-elements-1; j++){
        // var back = limit-i;
        $(".dot>.dot-inner:eq("+(limit-j)+")").removeClass("green");//.removeClass("yellow");
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

$(document).on("click", ".ac-wrapper h1", function(e){
    e.preventDefault();
    var dots_enabled = $(".dot .green, .dot .yellow").length;

    //if (dots_enabled > limit*0.73){
        //$(".dot:nth-child(n+"+(dots_enabled+6)+")>.dot-inner").addClass("yellow");
    //} else {
        $(".dot:nth-child(-n+"+(dots_enabled+6)+")>.dot-inner").addClass("green");
    //}
    
    if (dots_enabled < 1){
        $(".circle .ac-temp").html("Off");
        ac_temp = 0;
    } else {
        ac_temp = 30 - Math.round((dots_enabled/limit)*15);
        $(".circle .ac-temp").html(ac_temp + "<sup>°</sup>");
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
            console.log(response["offline"]);
            $(".people").html("");
            for(var i = 0; i < response["offline"].length; i++){
                //console.log(moment(response["offline"][i]["time"]).fromNow());
                $(".people").prepend("<div class='person offline'><div class='person-image'><div class='overlay'></div><img src='main/images/people/"+response["offline"][i]["name"].toLowerCase()+".jpg'></div><div class='info'><h5 class='name'>"+response["offline"][i]["name"]+"</h5><h6 class='out'>Out</h6><h6 class='last-time'>for "+moment(response["offline"][i]["time"]).fromNow(true)+"</h6></div></div>");
            }

            for(var j = 0; j < response["online"].length; j++){
                console.log(response["online"][j]);
                $(".people").prepend("<div class='person online'><div class='person-image'><div class='overlay invisible'></div><img src='main/images/people/"+response["online"][j]["name"].toLowerCase()+".jpg'></div><div class='info'><h5 class='name'>"+response["online"][j]["name"]+"</h5><h6 class='in'>In</h6><h6 class='last-time'>for "+moment(response["online"][j]["time"]).fromNow(true)+"</h6></div></div>");
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
                garageInfo["time"].push(moment(data[0][i].datetime, "MM-DD-YYYY").format("ddd"));
                
            }
            $(".garageStatus .lastOnline h6").html("Last Opened: " + moment(data[1][0].datetime).fromNow())

            var myLineChart2 = new Chart($('#garage-chart')[0].getContext('2d'), {
                type: 'line',
                data: {
                    labels: garageInfo["time"],
                    datasets: [{
                        label: "Physical Button",
                        backgroundColor: 'rgba(0, 173, 145, 0.8)',
                        data: garageInfo["button"],
                    }, {
                        label: "Smart Home App",
                        backgroundColor: 'rgba(0, 112, 94, 0.8)',
                        data: garageInfo["web"],
                    }, {
                        label: "Garage Door Remote",
                        backgroundColor: 'rgba(0, 235, 196, 0.8)',
                        data: garageInfo["remote"],
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
                var item = Object.keys(response)[i];
                var item_state = response[item];
                $(".status .items").append("<div class='item " + response[item] + "'><h6>" + item + "</h6><span>" + response[item] + "</span></div>")
                states[item] = item_state;
            }
            console.log(states);
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
    e.preventDefault();
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

// =====================================
// Home Page ===========================
// =====================================
function refreshHomePage(){
    var welcomeMessage = "";
    var hours = new Date().getHours();
    if (hours < 12){
        //Morning
        welcomeMessage = "Good morning " + first_name;
    } else if (hours >= 12 && hours < 17){
        //Afternoon
        welcomeMessage = "Good afternoon " + first_name;
    } else if (hours >= 17 && hours < 20){
        //Evening
        welcomeMessage = "Good evening " + first_name;
    } else {
        //Night
        welcomeMessage = first_name;
    }

    $(".welcome h4").html(welcomeMessage + ",");
}

refreshHomePage()

// $(".dimmer").on({
//     mousedown : function () {
//       var el = $(this);
//       console.log("hi")
//       interval = window.setInterval(function(){
//         el.children().css({"top": "80px"});
//         console.log("hi")
//       }, 200);
//     },
//     mouseup : function () {
//       window.clearInterval(interval);
//     }
//   });



// noUiSlider.create($("#alex_room .dimmer")[0], {
//     start: 10,
//     range: {
//         'min': 0,
//         'max': 255
//     }
// });
var rooms = {};

var lights_first = true;


function refreshLights(){
    $.ajax({
        url: '../api/'+api_key+'/lights',
        timeout: 5000,
        //data: {'brightness': this.get(), 'room': 'alex_room'},
        dataType: 'json',
        method: 'GET',
        success: function(response) {
            for (var i = 0; i < Object.keys(response.lights).length; i++){
                var room_name = Object.keys(response.lights)[i]
                //console.log(response.lights[room_name].brightness);


                if (lights_first){
                    rooms[room_name] = $("#"+room_name+" .dimmer")[0];
                    noUiSlider.create(rooms[room_name], {
                        start: response.lights[room_name].brightness,
                        connect: [true, false],
                        direction: 'rtl',
                        orientation: "vertical",
                        behaviour: 'snap',
                        range: {
                            'min': 0,
                            'max': 255
                        },
                        format: wNumb({
                            decimals: 0
                        })
                    });

                    rooms[room_name].noUiSlider.on("end", function(){

                        if (this.get() < 20){
                            this.set(0);
                        }

                        if (this.get() >= 225){
                            this.set(255);
                        }

                        //console.log(this.get());

                        $.ajax({
                            url: '../api/'+api_key+'/lights',
                            timeout: 5000,
                            data: {'brightness': this.get(), 'room': 'alex_room'},
                            dataType: 'json',
                            method: 'POST',
                            success: function(response) {

                            }
                        });
                    });

                    //end of first load.
                    lights_first = false;

                } else {

                    //Update sliders periodically.
                    rooms[room_name].noUiSlider.set(response.lights[room_name].brightness);
                }
            }
        }
    });    
}

refreshLights();
setInterval(refreshLights(), 60000);





// $("#alex_room .dimmer").each(function(id, element){
//     element.noUiSlider.on("set", function ( values, handle ) {
//         console.log(values);
//     });
// });