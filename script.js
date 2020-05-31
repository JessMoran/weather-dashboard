//Global variables
let cities;
let dateTxt;
let icon;
let iconsURL;
let city;
let lat;
let lon;
let uvValue;

$( window ).on( "load", setCities );

function setCities() {
  //Get cities array and parse in an object
  cities = JSON.parse(localStorage.getItem('cities'));
  //Iterate the cities array
  if (cities === null){
    return;
  }else {
    displayHistory ();
  }
}

// When the user clicks the srchBtn this function starts running
$('#srchBtn').on("click", function() {
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
    let cityDiv = $('<div>');

    $(cityDiv).addClass( "shadow-xl text-green-900 bg-white p-2 my-3" );
    $(cityDiv).attr('id', 'cityDiv');

    $(cityDiv).text(e);

    $('#srchArea').append(cityDiv);
  });
}

function searchCityData () {
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
    let temperature = currentDay.main.temp;
    let humidity = currentDay.main.humidity;
    let windSpeed = currentDay.wind.speed;

    daysList.forEach (e => {
      let comlpeteDate =  e.dt_txt; // Get complete date
      dateTxt = comlpeteDate.slice(0, 11); //Take out time
      icon = e.weather[0].icon; // Get icon code

      iconsURL = "http://openweathermap.org/img/wn/"+ icon + "@2x.png"

    });

    $('#country').text(cityName);
    $('#currentDate').text(dateTxt);
    $('#temperature').text(temperature);
    $('#humidity').text(humidity);
    $('#windSpeed').text(windSpeed);

    getUVIndex();

    $('#weatherImg').attr("src", iconsURL);

    $('#currentDate').addClass('text-green-900');
  });
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
