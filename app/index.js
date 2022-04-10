import document from "document";
import clock from "clock";
import userActivity from "user-activity";
import { display } from "display";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import * as battery from "./battery";
import * as heartMonitor from "./hrm";
import * as util from "../common/utils";
import { locale } from "user-settings";
import { me } from "appbit";
import { today } from "user-activity";
import { goals } from "user-activity";
import { vibration } from "haptics";

if (me.appTimeoutEnabled) {
 console.log("Timeout is enabled");
}

clock.ontick = clockTick;
clock.granularity = "seconds";

// Set up all necessary variables
let clockTextH   = document.getElementById("clockTextH");
let clockTextM   = document.getElementById("clockTextM");
let clockTextS   = document.getElementById("clockTextS");
let ampmCircle   = document.getElementById("ampmCircle");
let stepProg1    = document.getElementById("stepProg1");
let stepProg2    = document.getElementById("stepProg2");
let date         = document.getElementById("date");
let Batt         = document.getElementById("Batt");
let Data         = document.getElementById("Data");
let AOD          = document.getElementById("AOD");
let steps             = document.getElementById("steps");
let distance          = document.getElementById("distance");
let calories          = document.getElementById("calories");
let elevationGain     = document.getElementById("elevationGain");
let activeZoneMinutes = document.getElementById("activeZoneMinutes");

let dataTypes    = [ "steps", "distance", "calories",
                      "elevationGain", "activeZoneMinutes" ];
let dataProgress = [];
let days         = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let whiteCounter = -1;
let displayItem  = "steps";

var bgImage      = document.getElementById("bgImage");
bgImage.href     = "bgBlack.jpg";

clockTextH.onclick = (e) => {
  if (display.aodActive == false)
  {
    console.log("hour clicked");
    flipDisplay();
  }
}

if ( display.aodAvailable) {
  if ( display.aodEnabled) {
    console.log(me.permissions.granted("access_aod"));
    display.aodAllowed = true;
  }
}

display.addEventListener("change", () => {
  console.log("aodActive: " + display.aodActive);
   if (display.aodActive) {
       console.log ("Always on Enabled")
       bgImage.href = "bgBlack.jpg";
       clockTextH.style.fill = "white";
       clockTextM.style.fill = "white";
       whiteCounter = -1;
       Batt.style.display = "none";
       Data.style.display = "none";
       AOD.style.display = "inline";
       clock.granularity = 'minutes';
       date.style.fill = "white";
       display.brightnessOverride = "dim";
   } else {
       console.log ("Always on Disabled")
       Batt.style.display = "inline";
       Data.style.display = "inline";
       clock.granularity = "seconds";
       display.brightnessOverride = "normal";
       date.style.fill = "yellow";
       AOD.style.display = "none";
   }
});

steps.onclick = (e) => {
    console.log("steps clicked");
    displayItem = "steps";
    vibration.start("nudge");
}

distance.onclick = (e) => {
    console.log("distance clicked");
    displayItem = "distance";
    vibration.start("nudge");
}

calories.onclick = (e) => {
    console.log("calories clicked");
    displayItem = "calories";
    vibration.start("nudge");
}

elevationGain.onclick = (e) => {
    console.log("elevationGain clicked");
    displayItem = "elevationGain";
    vibration.start("nudge");
}

activeZoneMinutes.onclick = (e) => {
    console.log("activeZoneMinutes clicked");
    displayItem = "activeZoneMinutes";
    vibration.start("nudge");
}

function flipDisplay() {
  if (bgImage.href === "bgBlack.jpg") {
      bgImage.href = "bgWhite.jpg";
      clockTextH.style.fill = "black";
      clockTextM.style.fill = "black";
      whiteCounter = 10;
  } else {
      bgImage.href = "bgBlack.jpg";
      clockTextH.style.fill = "white";
      clockTextM.style.fill = "white";
      whiteCounter = -1;
  }  
}

let getCurrentDataProgress = function(dataType) {
  let dataContainer = document.getElementById(dataType);
  return {
    dataType: dataType,
    dataContainer: dataContainer,
    arcBack: dataContainer.getElementById("arcBack"),
    arcFront: dataContainer.getElementById("arcFront"),
    arcSel: dataContainer.getElementById("arcSel"),
    dataCount: dataContainer.getElementById("dataCount"),
    dataIcon: dataContainer.getElementById("dataIcon"),
    suffix: dataContainer.getElementById("suffix"),
  }
}

for(var i=0; i < dataTypes.length; i++) {
  var currentData = dataTypes[i];
  dataProgress.push(getCurrentDataProgress(currentData));
}

// Refresh data, all other logic is in separate files
function refreshData(type) {
  let currentType = type.dataType;
  let dataValid = 1;
  let currentDataProg = today.adjusted[currentType];
  if (currentType == "activeZoneMinutes") {currentDataProg = currentDataProg.total; }
  if (currentDataProg == undefined) currentDataProg = (today.adjusted[currentType] || 0);
  let currentDataGoal = goals[currentType];
  if (currentType == "activeZoneMinutes") {currentDataGoal = currentDataGoal.total; }
  if (currentDataGoal == undefined) currentDataGoal = goals[currentType];
  //console.log(currentType + ": " + currentDataProg + " | " + currentDataGoal );
  /*
  for (var key in userActivity) {
      if (userActivity.hasOwnProperty(key)) {
          console.log(key + " -> " + JSON.stringify(userActivity[key]));
      }
  }
  */
  
  let currentDataArc = (currentDataProg / currentDataGoal) * 360;
  let myunit = "";
  if (currentType==="distance") { myunit = " mi" }
  if (currentType==="calories") {myunit = " cal" }
  if (currentType==="elevationGain") {myunit = " flrs" }
  if (currentType==="activeZoneMinutes") {myunit = " mins" }
  type.suffix.text = myunit;
  console.log (currentType + ":" + myunit)
  if (currentDataArc >= 360) {
    currentDataArc = 360;
    type.arcFront.style.fill = "lightgreen";
    type.dataCount.style.fill = "lightgreen"
    type.arcFront.arcWidth = 5;
  } else {
    if(currentType==="steps") {
      type.arcFront.style.fill = "lightblue";  
      //currentDataProg = 2;
    }
    if(currentType==="distance") {
      type.arcFront.style.fill = "green";  
      //currentDataProg = 2;
    }
    if(currentType==="calories") {
      type.arcFront.style.fill = "orange";
      //currentDataProg = 100;
    }
    if(currentType==="elevationGain") {
      type.arcFront.style.fill = "red";
      //currentDataProg = 5;
    }
    if(currentType==="activeZoneMinutes") {
      type.arcFront.style.fill = "yellow";   
      //currentDataProg = 105;
    }
    type.dataCount.style.fill = "lightblue";
  }
  if (isNaN(currentDataArc)) {
    currentDataArc = 0
  }
  type.arcFront.sweepAngle = currentDataArc;
  
  if(currentType==="distance") {
    currentDataProg = (currentDataProg * 0.000621371192).toFixed(1);
  }
  if(currentType==="calories") {
    if (currentDataProg >= 1000) {
      currentDataProg = (currentDataProg / 1000).toFixed(1);
      currentDataProg = `${currentDataProg}K`;
    }
  }
  if(currentType==="steps") {
    if (currentDataProg >= currentDataGoal) {
      if (currentDataProg >= (currentDataGoal * 2)) {
        //currentDataProg = currentDataProg - userActivity.goals[currentType];
        //currentDataProg = `+${currentDataProg}`;
        stepProg1.width = 276;
        stepProg2.width = 276;
        stepProg1.style.fill = "lightgreen";
        stepProg2.style.fill = "lightgreen";
      }
      else {
        let currentDataProg1 = currentDataProg;
        if (goals[currentType] != undefined)
        {
          currentDataProg1 = currentDataProg1 - goals[currentType];
        }
        
        //currentDataProg = `+${currentDataProg}`;
        stepProg1.width = 276;
        stepProg2.width = (currentDataProg1 / currentDataGoal) * 276;
        stepProg1.style.fill = "lightgreen";
        stepProg2.style.fill = "lightblue";
      }
    }
    else {
      stepProg1.width = (currentDataProg / currentDataGoal) * 276;
      stepProg1.style.fill = "lightblue";
      stepProg2.width = (currentDataProg / currentDataGoal) * 276;
      stepProg2.style.fill = "lightblue";
    }
  }
  if (dataValid == 1)
  {
    //console.log(currentType + ": " + currentDataProg)
    type.dataCount.text = "";
    type.arcSel.sweepAngle = 0;
    if (currentType == displayItem) {
       type.dataCount.text = currentDataProg + type.suffix.text;
       type.arcSel.sweepAngle = 360;
    }
  }
  else
  {
     type.dataCount.text = "";
  }
  //console.log (currentType);
}

function refreshAllData() {
  for(var i=0; i<dataTypes.length; i++) {
    refreshData(dataProgress[i]);
  }
}

function clockTick() {
  let rn = new Date();
  let hours = rn.getHours();
  let mins  = util.zeroPad(rn.getMinutes());
  let secs  = util.zeroPad(rn.getSeconds()); 
  if (whiteCounter >= 0) {
      whiteCounter = whiteCounter -1;
      //console.log (whiteCounter);
  }
  if (whiteCounter == 0)
  {
      bgImage.href = "bgBlack.jpg";
      clockTextH.style.fill = "white";
      clockTextM.style.fill = "white";
  }
  
  if (preferences.clockDisplay == "12h") {
    if (hours < 12) {
      ampmCircle.style.fill = 'yellow';
    } else {
      ampmCircle.style.fill = 'orange';
    }
    if (hours > 12) {hours -= 12;}
    if (hours == 0) {hours = 12;}
  } else {
    ampmCircle.style.fill = 'black';
  }
  
  clockTextH.text = `${hours}`;
  clockTextM.text = `${mins}`;
  clockTextS.text = `${secs}`;
  let day      = rn.getDate();
  let dow      = days[rn.getDay()];
  date.text = dow + '   ' + day;  

  if (display.aodActive == false) {
    refreshAllData();
  }
  battery.setLevel();  
}

heartMonitor.initialize();
