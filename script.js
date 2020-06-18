//Global variables
let citiesCont = $('#cities-container');
let cardsContainer = $('#cards-container');
let cities;
let city;
let lat;
let lon;
let uvValue;
let tempFharenheit;

//Run setCities function
$(window).on("load", setCities);

//Show cities history
function setCities() {
  //Get cities array and parse in an object
  cities = JSON.parse(localStorage.getItem('cities'));

  //If cities array is null the function ends
  if (cities === null) {
    return;
  } else { //If cities array is not empty run the displayHistory function
    displayHistory();
  }
}

//Change the first letter on the input into capital letter
$("#userCity").keypress(function () {
  let text = $("#userCity").val();
  let stLetter = text.charAt(0).toUpperCase() + text.slice(1);
  $("#userCity").val(stLetter);
});

// When the user clicks the srchBtn this function starts running
$('#srchBtn').on("click", function () {

  // Clean the areas
  cleanArea(); // History area
  cleanCardsContainer(); // Five day forecast area

  // Get the city value
  city = $('#userCity').val();

  //If the user doesn't write something on the input take of the function
  if (city === '') {
    return;
  }

  //Save data in localStorage
  //If localstorage is empty creates new array and save the first city
  if (localStorage.getItem('cities') === null) {
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

  displayHistory();

  searchCityData();
});

function displayHistory() {
  //Iterate cities array create a button for each element,add  classes, text and append into the html
  cities.forEach(e => {
    let cityBtn = $('<button>');

    $(cityBtn).addClass("shadow-xl text-green-900 bg-white p-2 my-3 block city-btn w-3/4 text-left");
    $(cityBtn).text(e);

    $('#cities-container').append(cityBtn);
  });
}

//If user clicks on the city buttons the main functions run
$("body").click(function (event) {
  city = $(event.target).text();//Get the button's value

  cleanCardsContainer();
  searchCityData();
});

// Get weather data and inner the information into the html
function searchCityData() {
  //Set the URL
  let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=2fd0e654691a40253ac45f69c92607c9";

  //Request to get weather data according to the city that the user wants
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    // Get data
    let cityName = response.city.name;
    let daysList = response.list;
    lat = response.city.coord.lat;
    lon = response.city.coord.lon;
    let currentDay = daysList[0];
    let date = (currentDay.dt_txt).slice(0, 11);// Remove time
    let tempKlv = currentDay.main.temp;
    let humidity = currentDay.main.humidity;
    let windSpeed = currentDay.wind.speed;
    let icon = currentDay.weather[0].icon;

    kelvinToFharenheit(tempKlv);

    //Modify URL according to the icon code
    let iconsURL = "https://openweathermap.org/img/wn/" + icon + "@2x.png";

    //Inner text
    $('#country').text(cityName);
    $('#currentDate').text(date);
    $('#temperature').text(tempFharenheit);
    $('#humidity').text(humidity);
    $('#windSpeed').text(windSpeed);

    getUVIndex();

    //Add attribute
    $('#weatherImg').attr("src", iconsURL);

    //Add class
    $('#currentDate').addClass('text-green-900');

    display5DayForecast(response);
  });
}

// Get weather data for the next five days and create the cards into the html
function display5DayForecast(response) {
  let daysList = response.list;
  let elIdx = 7;

  $(daysList).each(function (i, e) {
    //Get the data if the index is equal to the elIdx number
    if (i === elIdx) {
      //Get data
      tempKlv = e.main.temp;
      let date = e.dt_txt.slice(0, 11);//Remove time
      let iconCode = e.weather[0].icon;

      kelvinToFharenheit(tempKlv);

      //Modify URL according to the icon code
      iconsURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";

      //Create elements
      let card = $('<div>');
      let dateP = $('<p>');
      let icon = $('<img>');
      let tempP = $('<p>');
      let humP = $('<p>');

      //Add classes
      $(card).addClass('row-start-1 row-end-4 shadow-xl p-5 text-green-900');
      $(dateP).addClass('mt-3');
      $(tempP).addClass('mt-3');
      $(humP).addClass('mt-3');

      //Add text
      $(dateP).text(date);
      $(tempP).text('Temp: ' + tempFharenheit + 'ºF');
      $(humP).text('Humidity: ' + e.main.humidity + '%');

      //Add attributes
      $(icon).attr("src", iconsURL);

      //Append to the cards container div
      $('#cards-container').append(card);
      $(card).append(dateP);
      $(card).append(icon);
      $(card).append(tempP);
      $(card).append(humP);

      //Sum 7 to the local variable
      elIdx += 7;
    }
  });
}

//Change Kelvin temperature to Fharenheit
function kelvinToFharenheit(tempKlv) {
  let result = (tempKlv - 273.15) * 9 / 5 + 32;
  tempFharenheit = result.toFixed(2);
}

//Get UV index data
function getUVIndex() {
  // Get UV index
  let uvURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&" +
    "exclude=hourly,daily&appid=2fd0e654691a40253ac45f69c92607c9";

  //Ajax request
  $.ajax({
    url: uvURL,
    method: "GET"
  }).then(function (response) {
    //Get data
    uvValue = response.current.uvi;
    //Inner text
    $('#uvIndex').text(uvValue);

    //Add a class according to the grade's uv index
    if (uvValue <= 2) {
      $('#uvIndex').addClass('bg-green-200');
    } else if (uvValue <= 5) {
      $('#uvIndex').addClass('bg-yellow-200');
    } else {
      $('#uvIndex').addClass('bg-red-200');
    }
  });
}

//Remove cities container's  children
function cleanArea() {
  if (citiesCont.children()) {
    $(citiesCont.children()).remove();
  }
}

//Remove cards container's  children
function cleanCardsContainer() {
  if (cardsContainer.children()) {
    $(cardsContainer.children()).remove();
  }
}
