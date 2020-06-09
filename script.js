//Global variables
let citiesCont = $('#cities-container');
let clickedBtn;
let cities;
let city;
let lat;
let lon;
let uvValue;
let tempFharenheit;

$( window ).on( "load", setCities );

function setCities () {
  //Get cities array and parse in an object
  cities = JSON.parse(localStorage.getItem('cities'));
  //Iterate the cities array
  if (cities === null){
    return;
  }else {
    displayHistory ();
  }
}

$("#userCity").keypress(function () {
  let text = $("#userCity").val();
  let stLetter = text.charAt(0).toUpperCase() + text.slice(1);
  $("#userCity").val(stLetter);
});

// When the user clicks the srchBtn this function starts running
$('#srchBtn').on("click", function() {

  // Clean the area
  cleanArea();

  // Get the city value
  city = $('#userCity').val();

  if (city === ''){
    return;
  }

  //Save data in localStorage
  //If localstorage is empty creates new array and save the first city
  if ( localStorage.getItem('cities') === null){
    cities = [];
    cities.push(city);
    localStorage.setItem('cities', JSON.stringify(cities));
  } else { //If the array exist just push the city
    cities = JSON.parse(localStorage.getItem('cities'));
    cities.push(city); //Add to the array
    localStorage.setItem('cities', JSON.stringify(cities));
  }

  //Clear input
  $('#userCity').val('');

  displayHistory ();

  searchCityData ();
});

function displayHistory() {
  cities.forEach(e => {
    let cityBtn = $('<button>');

    $(cityBtn).addClass( "shadow-xl text-green-900 bg-white p-2 my-3 block city-btn w-3/4 text-left");
    $(cityBtn).text(e);

    $('#cities-container').append(cityBtn);
  });
}

$( "body" ).click(function( event ) {
  city =  $(event.target).text();

  searchCityData ();
});

function searchCityData () {
  //Set the URL
  let queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=2fd0e654691a40253ac45f69c92607c9";

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response){
    let cityName = response.city.name;
    let daysList = response.list;
    lat = response.city.coord.lat;
    lon = response.city.coord.lon;
    let currentDay = daysList[0];
    let completeDate = (currentDay.dt_txt).slice(0, 11); // Get complete date
    let tempKlv = currentDay.main.temp;
    let humidity = currentDay.main.humidity;
    let windSpeed = currentDay.wind.speed;
    let icon = currentDay.weather[0].icon;

    kelvinToFharenheit(tempKlv);

    let iconsURL = "http://openweathermap.org/img/wn/"+ icon + "@2x.png";

    $('#country').text(cityName);
    $('#currentDate').text(completeDate);
    $('#temperature').text(tempFharenheit);
    $('#humidity').text(humidity);
    $('#windSpeed').text(windSpeed);

    getUVIndex();

    $('#weatherImg').attr("src", iconsURL);

    $('#currentDate').addClass('text-green-900');

    display5DayForecast(response);

  });
}

function display5DayForecast(response) {
  let daysList = response.list;
  $( daysList ).each(function( i, e ) {
    if( i === 7 ) {
      console.log(e)
    }
  });

}

function kelvinToFharenheit (tempKlv) {
  let result = (tempKlv - 273.15) * 9/5 + 32;
  tempFharenheit = result.toFixed(2);
}

function getUVIndex() {
  // Get UV index
  let uvURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon="+ lon + "&" +
    "exclude=hourly,daily&appid=2fd0e654691a40253ac45f69c92607c9";
  $.ajax({
    url: uvURL,
    method: "GET"
  }).then(function(response){
    uvValue = response.current.uvi;
    $('#uvIndex').text(uvValue);

    if ( uvValue <= 2 ) {
      $('#uvIndex').addClass('bg-green-200');
    }else if ( uvValue <= 5) {
      $('#uvIndex').addClass('bg-yellow-200');
    }else {
      $('#uvIndex').addClass('bg-red-200');
    }
  });
}

function cleanArea(){
  if (citiesCont.children()) {
    $(citiesCont.children()).remove();
  }
}
