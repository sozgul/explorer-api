
var retreivedCoordinates;
var countryCode;
var countryPhoneCodeInput;
var countryPhoneCode;
var phoneNumber;
var verificationToken;

window.onload = function(e){ 
  console.log("window.onload", e, Date.now() ,window.tdiff);
  retrieveCoordinatesFromIP();
  countryPhoneCodeInput = document.getElementById("CountryPhoneCode");
  phoneNumber = document.getElementById("PhoneNumber");
  verificationToken = document.getElementById("VerificationToken");
}

// function for CORS request on IP address as XML
function loadDoc(url, cFunction) {
  var xhttp;
  xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      XHTTPResultHelper(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function retrieveCoordinatesFromIP(){
  loadDoc('https://ipinfo.io/json', XHTTPResultHelper); 
}


// CORS response handler
function XHTTPResultHelper(xhttp) {

  console.log("### XHHTTP result ###")
  var locationSearchResult = JSON.parse(xhttp.responseText)["loc"];
  countryCode = JSON.parse(xhttp.responseText)["country"];
  if(locationSearchResult != null){
    //handle result
    console.log(countryCode);
    console.log(locationSearchResult);
    var resultLat = String(locationSearchResult).split(',')[0];
    var resultLng = String(locationSearchResult).split(',')[1];
    retreivedCoordinates = {lat: Number(resultLat), lng: Number(resultLng)};
    console.log(resultLng + " " + resultLat);
    
    try {
      // phone must begin with '+'
      countryPhoneCode = libphonenumber.getCountryCallingCode(countryCode);
      countryPhoneCodeInput.value = "+" + String(countryPhoneCode);
    } catch (e) {
      console.log("NumberParseException was thrown: " + e.toString());
    }
    
  } else {
    console.log("No matches found for location element");
  }
  console.log(xhttp.responseText); 
}

function handleCountryCodeChange(){
  console.log(countryPhoneCodeInput.value);
  var formattedCountryCode = countryPhoneCodeInput.value;
  countryPhoneCode = formattedCountryCode.substring(1);
  console.log(countryPhoneCode);
  //countryPhoneCodeInput.value = formattedCountryCode.substring(String(countryPhoneCode).length + 2);
  if(countryPhoneCodeInput.value[0] != "+"){
    countryPhoneCodeInput.value = "+" + countryPhoneCodeInput.value;
  }
}

function handlePhoneNumberChange(){
  console.log(phoneNumber.value);
  var formattedNumber = new libphonenumber.AsYouType().input("+" + String(countryPhoneCode) + phoneNumber.value);
  var newValue = formattedNumber.substring(String(countryPhoneCode).length + 1);
  if(newValue[0] == " "){
    newValue = newValue.substring(1);
  }
  phoneNumber.value = newValue;
  console.log(formattedNumber);
}

function requestPhoneVerification(){
  console.log("### PHONE INFORMATION ###");
  console.log(countryCode);
  console.log(countryPhoneCode);
  console.log(phoneNumber);
  console.log("+" + countryPhoneCode + phoneNumber.value);
  var parsedPhoneNumber = libphonenumber.parseNumber("+" + countryPhoneCode + " " + phoneNumber.value, {extended: "true"});
  console.log(parsedPhoneNumber);
  if(parsedPhoneNumber.valid == true){
    // post to request phone verification
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/request-verification", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        phoneDetails: parsedPhoneNumber
    }));
  }
  return false;
}

function verifyPhoneToken(){
  console.log("### PHONE INFORMATION ###");
  console.log(countryCode);
  console.log(countryPhoneCode);
  console.log(phoneNumber);
  console.log("+" + countryPhoneCode + phoneNumber.value);
  var parsedPhoneNumber = libphonenumber.parseNumber("+" + countryPhoneCode + " " + phoneNumber.value, {extended: "true"});
  console.log(parsedPhoneNumber);
  var parsedToken = verificationToken.value;
  if(parsedPhoneNumber.valid == true){
    // post request to start verification API
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/verify-token", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        phoneDetails: parsedPhoneNumber,
        verificationToken: parsedToken
    }));
  }
  return false;
}