/*
 *
 *  CONFIGURATION PART
 *
 */



var RAPID_API_KEY = "YOUR_RAPID_APIKEY";
var AUTOLOGIN = true; // you can set this to true to allow autologin upon finishing gcash payment

var siteMap = {
  "default" : "f827df7d-bf5d-4ba9-bbf0-2825b74d62a5",
  "bicol" : "ede8b0b6-9331-4424-a5b8-5d211cff130e",
  "home" : "5570cb3c-5011-4fb1-abec-08b7e76aa310",
  "maharlika" : "a4e86d5e-bc21-4ceb-9300-4d1557593d05",
  "aduas" : "ec18639a-42fb-4158-b51c-a34fb2d54252",
  "test" : "aef7cc5e-533c-435e-ac32-fa6f8e6f73a8",
  "arclem_test": "9a631594-f4e8-4e6a-8b75-f7b698d26421"
}

var cashlessPaymentMap = [
  {"amount" : "10", "time" : "6 hours"},
  {"amount" : "20", "time" : "16 hours"},
  {"amount" : "50", "time" : "2 days"},
  {"amount" : "100", "time" : "5 days"},
];


var timeRatesMap = [
    {"amount" : "10", "time" : "6 hours"},
    {"amount" : "20", "time" : "16 hours"},
    {"amount" : "50", "time" : "2 days"},
    {"amount" : "100", "time" : "5 days"},
];
  

/*
 *
 *  OMADA CONTROLLER JAVASCRIPT CODES
 * 
 */

var errorHintMap = {
    "0": "ok",
    "-1": "General error.",
    "-41500": "Invalid authentication type.",
    "-41501": "Failed to authenticate.",
    "-41502": "Voucher code is incorrect.",
    "-41503": "Voucher is expired.",
    "-41504": "Voucher traffic has exceeded the limit.",
    "-41505": "The number of users has reached the limit.",
    "-41506": "Invalid authorization information.",
    "-41507": "Your authentication times out. You can get authenticated again until the next day.",
    "-41508": "Local User traffic has exceeded the limit.",
    "-41512": "Local User is expired.",
    "-41513": "Local User is disabled.",
    "-41514": "MAC address is incorrect.",
    "-41515": "Local User Quota has exceeded the limit.",
    "-41516": "The number of users has reached the limit.",
    "-41517": "Incorrect password.",
    "-41518": "This SSID does not exist.",
    "-41519": "Invalid code.",
    "-41520": "The code is expired.",
    "-41521": "The number of users has reached the limit.",
    "-41522": "Failed to validate the code.",
    "-41523": "Failed to send verification code.",
    "-41524": "Authentication failed because the username does not exist.",
    "-41525": "Authentication failed because of wrong password.",
    "-41526": "Authentication failed because the client is invalid.",
    "-41527": "Authentication failed because the local user is invalid.",
    "-41528": "Failed to decrypt data.",
    "-41529": "Incorrect username or password.",
    "-41530": "Connecting to the RADIUS server times out.",
    "-41531": "Your code have reached your Wi-Fi data limit.",
    "-41532": "Your account have reached your Wi-Fi data limit.",
    "-41533": "Form authentication request is invalid.",
    "-43408": "Invalid LDAP configuration.",
    "-43409": "Invalid LDAP credentials.",
    "-41538": "Voucher is not effective."
};

var Ajax = {
    post: function (url, data, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send(data);
    }
};

function getQueryStringKey (key) {
  return getQueryStringAsObject()[key];
}
function getQueryStringAsObject () {
  var b, cv, e, k, ma, sk, v, r = {},
      d = function (v) { return decodeURIComponent(v); }, //# d(ecode) the v(alue)
      q = window.location.search.substring(1), //# suggested: q = decodeURIComponent(window.location.search.substring(1)),
      s = /([^&;=]+)=?([^&;]*)/g //# original regex that does not allow for ; as a delimiter:   /([^&=]+)=?([^&]*)/g
  ;
  ma = function(v) {
      if (typeof v != "object") {
          cv = v;
          v = {};
          v.length = 0;
          if (cv) { Array.prototype.push.call(v, cv); }
      }
      return v;
  };
  while (e = s.exec(q)) {
      b = e[1].indexOf("[");
      v = d(e[2]);
      if (b < 0) {
          k = d(e[1]);
          if (r[k]) {
              r[k] = ma(r[k]);
              Array.prototype.push.call(r[k], v);
          }
          else {
              r[k] = v;
          }
      }
      else {
          k = d(e[1].slice(0, b));
          sk = d(e[1].slice(b + 1, e[1].indexOf("]", b)));
          r[k] = ma(r[k]);
          if (sk) { r[k][sk] = v; }
          else { Array.prototype.push.call(r[k], v); }
      }
  }
  return r;
}

/*
 *
 *  OMADA DATA INITIALIZATIONS
 * 
 */


var data = {};
var globalConfig = {};
var submitUrl;
var clientMac = getQueryStringKey("clientMac");
var apMac = getQueryStringKey("apMac");
var gatewayMac = getQueryStringKey("gatewayMac") || undefined;
var ssidName = getQueryStringKey("ssidName") || undefined;
var radioId = !!getQueryStringKey("radioId")? Number(getQueryStringKey("radioId")) : undefined;
var vid = !!getQueryStringKey("vid")? Number(getQueryStringKey("vid")) : undefined;
var originUrl = getQueryStringKey("originUrl");
var previewSite = getQueryStringKey("previewSite");


var timerS
var mac = "None";
var uname = "None";
var sessiontime = "";
var uptime = "";
var validity ="";
var voucher = "";

var site = getQueryStringKey("site") || "default" ;
var action = getQueryStringKey("action") || "None" ;
var transaction_id = getQueryStringKey("transaction_id") || "None" ;

console.log("site >>>> " + site);
/*
 *
 *  ARCLEM X OMADA JAVASCRIPT CODES
 * 
 */


/*
 *
 * This function will login the code based on voucher code type
 * 
 */

function handleSubmit(){
    var submitData = {};
    submitUrl  = "/portal/auth";
    submitData['authType'] = 3;
    submitData['voucherCode'] = document.getElementById("voucher_user").value;
  
    submitData['clientMac'] = clientMac;
    submitData['apMac'] = apMac;
    submitData['gatewayMac'] = gatewayMac;
    submitData['ssidName'] = ssidName;
    submitData['radioId'] = radioId;
    submitData['vid'] = vid;
    submitData['originUrl'] = originUrl;
    
    function doAuth () {
        Ajax.post(submitUrl, JSON.stringify(submitData).toString(), function(data){
            data = JSON.parse(data);
            if(!!data && data.errorCode === 0) {
                isCommited = true;
                window.location.href = landingUrl;
                document.getElementById("validity").innerHTML = errorHintMap[data.errorCode];
            } else{
                document.getElementById("validity").innerHTML = errorHintMap[data.errorCode];
            }
        });
    }
    doAuth();
}


function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}
    
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
    

var timerInterval = null; 

function runtimer(remainingseconds) {
    timerS = remainingseconds;
    if (timerInterval != null) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(function() {
        timerS = timerS - 1;
        var daysS = Math.floor (timerS/(3600*24));
        var hoursS = Math.floor (timerS/3600)%24;
        var minutesS = Math.floor (timerS/60)%60;
        var secondsS = Math.floor (timerS)%60;
        
        if(timerS >= 86400){
            var resS = "<div id='clockdiv'><div><span style='font-size:24px;'>"+daysS+"</span><div class='smalltext'>DAYS</div></div>&nbsp;<div><span style='font-size:24px;'>"+hoursS+"</span><div class='smalltext'>HOURS</div></div>&nbsp;<div><span style='font-size:24px;'>"+minutesS+"</span><div class='smalltext'>MINS</div></div>&nbsp;<div><span style='font-size:24px;'>"+secondsS+"</span><div class='smalltext'>SECS</div></div></div>";
        } else if (timerS >= 3600 && timerS <= 86400){
            var resS = "<div id='clockdiv'><div><span style='font-size:24px;'>"+hoursS+"</span><div class='smalltext'>HOURS</div></div>&nbsp;<div><span style='font-size:24px;'>"+minutesS+"</span><div class='smalltext'>MINS</div></div>&nbsp;<div><span style='font-size:24px;'>"+secondsS+"</span><div class='smalltext'>SECS</div></div></div>";
        } else if (timerS >= 10 && timerS <= 3600){
            var resS = "<div id='clockdiv'><div><span style='font-size:24px;'>"+minutesS+"</span><div class='smalltext'>MINS</div></div>&nbsp;<div><span style='font-size:24px;'>"+secondsS+"</span><div class='smalltext'>SECS</div></div></div>";
        } else if (timerS >= 1 && timerS <= 9) {
            var resS = "<div id='clockdiv'><div><span style='font-size:24px;'>"+secondsS+"</span><div class='smalltext'>SECS</div></div></div>";
        } else if (timerS == 0) {
            var resS = "<div id='clockdiv'><div><span style='font-size:24px;'>"+secondsS+"</span><div class='smalltext'>SECS</div></div></div>";
            window.location = "/login";
        } else {
            var resS = "--";
        }
            
        document.getElementById("displayTimeStatus").innerHTML = resS;
    },1000);
}

/*
 *
 *  This will create the table for cashless payments which is based on cashlessPaymetnsMap
 *  you can edit this based on your design
 * 
 */

function create_cashless_rates_table() {
    // populate cashless payments table
    var cashless_rates = document.getElementById("cashless_rates_table");
    tables_string = "<table class='rates table table-striped table-bordered table-sm' align='center'>";
    tables_string += "<tr><td>Amount</td><td>Time</td><td>Action</td></tr>";
    cashlessPaymentMap.forEach(rates => {
        tables_string += "<tr><td>Php " + rates.amount + "</td>";
        tables_string += "<td>"+ rates.time  +"</td>";
        tables_string += "<td>"
        tables_string += "<button onclick='payment(" + rates.amount + ",1)' type='button' class='btn btn-primary'>Gcash</button>";
        tables_string += "&nbsp<button onclick='payment(" + rates.amount + ",2)' type='button' class='btn btn-success'>PayMaya</button>";
        tables_string += "</td>"

    })
    tables_string += "</table>";
    tables_string += "<hr class='prettyline'>";
    tables_string += "<button type='button' class='cancel_button btn btn-danger' id='insert_cancel'  data-dismiss='modal'>Cancel</button>";
    cashless_rates.innerHTML = tables_string;
}

function create_time_rates_table() {
    // populate timerates table
    var time_rates = document.getElementById("time_rates_table");
    tables_string = "<table class='rates table table-striped table-bordered table-sm' align='center'>";
    tables_string += "<tr><td>Amount</td><td>Time</td></tr>";
    timeRatesMap.forEach(rates => {
        tables_string += "<tr><td>Php " + rates.amount + "</td>";
        tables_string += "<td>"+ rates.time  +"</td>";
    })
    tables_string += "</table>";
    tables_string += "<hr class='prettyline'>";
    tables_string += "<button type='button' class='cancel_button btn btn-danger' id='insert_cancel'  data-dismiss='modal'>Cancel</button>";
    time_rates.innerHTML = tables_string;
}




function update_voucher(_voucher) {
    voucher = _voucher;
}
/*
 *
 *  API CALLS to RAPID API
 * 
 */


/*
 *
 * This code is reponsible for checking voucher on the server, it needs the voucher code and the sitename
 * 
 */

function checkVoucher() {
    const data = JSON.stringify({
        voucher: voucher,
        account: siteMap[site]
    });
    console.log("data to send to rapidapi" + data);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener('readystatechange', function () {
        runtimer("");
        if (this.readyState === this.DONE) {
            var voucherdata = JSON.parse(this.responseText);
            console.log(this.responseText);
            console.log(voucherdata);
            sessiontime = voucherdata.remainingTime;
            console.log("sessiontime " + sessiontime);
            document.getElementById("ipaddress").innerHTML = voucherdata.ip;
            document.getElementById("vouchercode").innerHTML = voucherdata.voucherCode;
            document.getElementById("macaddress").innerHTML = voucherdata.mac;
            document.getElementById("download").innerHTML = formatBytes(voucherdata.download);
            document.getElementById("upload").innerHTML = formatBytes(voucherdata.upload);
            document.getElementById("wifiname").innerHTML = "Connected to " + voucherdata.ssid;

            if (voucherdata.valid == false) {
                document.getElementById("validity").innerHTML = "Voucher Expired";
            } else {
                document.getElementById("validity").innerHTML = "";
                sessiontime = voucherdata.remainingTime;
                runtimer(sessiontime);
            }

            if (voucherdata.status == "error") {
                document.getElementById("validity").innerHTML = voucherdata.msg ;
            }
        } else {
            var voucherdata = JSON.parse(this.responseText);
            if (voucherdata.message == "You have exceeded the DAILY quota for Requests on your current plan, BASIC. Upgrade your plan at https://rapidapi.com/mcandres888-0d-S2XDAipF/api/omadavoucherapi") {
                document.getElementById("validity").innerHTML  = "Daily quota reached. Please ask your administrator.";		
            }
        }
    });
  
    xhr.open('POST', 'https://omadavoucherapi.p.rapidapi.com/');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('X-RapidAPI-Key', RAPID_API_KEY);
    xhr.setRequestHeader('X-RapidAPI-Host', 'omadavoucherapi.p.rapidapi.com');
    xhr.send(data);
}
  
/*
 *
 * CASHLESS PAYMENTS API
 * 
 */


function payment( amount, payment_code ) {
    payment_channel = "PH_GCASH";
    if (payment_code == 2 ) {
        payment_channel = "PH_PAYMAYA";
    }

    const data = JSON.stringify({
        amount: amount,
        account: siteMap[site],
        redirect_url: window.location.href,
        payment_channel: payment_channel
    });
    console.log("data to send to rapidapi" + data);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener('readystatechange', function () {
  
        if (this.readyState === this.DONE) {
            var result = JSON.parse(this.responseText);
            console.log(this.responseText);
            if (result.status == "ok") {
                redirect_url = result.response.actions.mobile_web_checkout_url;
                window.location.href = redirect_url;
            } else {
                document.getElementById("validity").innerHTML = result.msg;
                $('#cashless').modal('hide');
            }
        }
    });
  
    xhr.open('POST', 'https://arclem-cashless-voucher-payment.p.rapidapi.com/payment');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('X-RapidAPI-Key', RAPID_API_KEY);
    xhr.setRequestHeader('X-RapidAPI-Host', 'arclem-cashless-voucher-payment.p.rapidapi.com');
    xhr.send(data);
}
  
/*
 *
 * GET VOUCHER API - this will be called after the cashless transaction has been made
 * 
 */

GETVOUCHER_TRIES = 5

function getvoucher() {
    const data = JSON.stringify({
        transaction_id: transaction_id
    });
  
    console.log("data to send to rapidapi" + data);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === this.DONE) {
            var result = JSON.parse(this.responseText);
            console.log(this.responseText);
            if ( result.code === undefined ) {
                console.log("get voucher error");
                if (GETVOUCHER_TRIES > 0) {
                    setTimeout(getvoucher(), 2000);
                }
                GETVOUCHER_TRIES = GETVOUCHER_TRIES - 1;
            }

            document.getElementById("validity").innerHTML = result.msg;
            document.getElementById("voucher_user").value = result.code;
            document.getElementById("checkButton").innerHTML = "Login";
            document.getElementById("checkButton").addEventListener("click", handleSubmit); 
            // add flutter call here
            sendStatus("True", ssidName ,clientMac,result.code, result.duration + "m", transaction_id);
            // autologin is set call the handleSubit
            if (AUTOLOGIN == true) {
                document.getElementById("validity").innerHTML = result.msg + ". Autologging you in.";
                handleSubmit();
            } else {
                document.getElementById("validity").innerHTML = result.msg + ". Press login to continue.";
            }
        }
    });
    xhr.open('POST', 'https://arclem-cashless-voucher-payment.p.rapidapi.com/getvoucher');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('X-RapidAPI-Key', RAPID_API_KEY);
    xhr.setRequestHeader('X-RapidAPI-Host', 'arclem-cashless-voucher-payment.p.rapidapi.com');
    xhr.send(data);
}
  
function enableCheckVoucher() {

    var element1 = document.getElementById("checkButton");
    if (element1.addEventListener) {  // all browsers except IE before version 9
            element1.addEventListener("click", checkVoucher, false);
    } else {
        if (element1.attachEvent) {   // IE before version 9
            element1.attachEvent("click", checkVoucher);
        }
    }
    element1.innerHTML = "Check Voucher";

}


var onready = function () {

    // enable login
    document.getElementById("checkButton").innerHTML = "Login";
    document.getElementById("checkButton").addEventListener("click", handleSubmit); 

    create_cashless_rates_table();
    create_time_rates_table();
    checkflutter();
  
    // check if transaction id exists
    if (action == "success" && transaction_id != "None") {
        document.getElementById("validity").innerHTML = "Checking transaction please wait.";
        setTimeout(getvoucher(), 2000);
    }
};

/*
 *
 * ARCLEM WIFI APP SUPPORT
 * 
 */

var isFlutterInAppWebViewReady = false;
function checkflutter() {
    window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
    isFlutterInAppWebViewReady = true;
    // disable autologin when flutter is enabled
    AUTOLOGIN = false;
    window.flutter_inappwebview
        .callHandler('useVoucher')
        .then( function (result) {
            if (result.username != 'none') {
                document.getElementById("voucher_user").value = result.username;
                document.getElementById("validity").innerHTML = "Autologging you in.";
                setTimeout(function(){
                    handleSubmit();
                }, 1000);
            }
        });
    });
}

function sendStatus(logged_in, ip, mac, username, session_time_left, uptime) {
    if (isFlutterInAppWebViewReady) {
        window.flutter_inappwebview.callHandler('userStatus', logged_in, ip, mac, username, session_time_left, uptime);
    }
}


onready();













