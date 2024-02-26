//API KEY
const API_KEY = '333ef53700a6eb630340fb99f5a32f3a';


  const cityInput = document.getElementById('city-input');
  const cityOutput = document.getElementById('city-output');
  const currentTemp = document.getElementById('current-temperature');
  const currentWind = document.getElementById('current-wind');
  const currentHumidity = document.getElementById('current-humidity');
  const searchBtn = document.querySelector('.search-btn');
  const currentIcon = document.querySelector('.current-icon');
  const currentDescription = document.querySelector('.current-description');


let cityCoordinates = {
    name:"",
    lat: 0,
    lon: 0
};

  const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") {
        return Promise.reject("City name is required.");
    }

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    return fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            cityCoordinates = {name, lat, lon};

        getCityImage(name)
                .then(imageUrl => {
                setBackground(name, imageUrl);
                })
                .catch(error => {
                  console.error("Error fetching city image:", error);
                });    
          return cityCoordinates;
        })
        .catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
    }

    //Get current weather data 
    const getWeatherData = (coordinates) => {
        const { lat, lon } = coordinates;
        const weatherEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        return fetch(weatherEndpoint)
          .then(response => response.json())
          .then(weatherData => {
            // Process the weather data here
            return weatherData; // Resolve the promise with weatherData
          })
          .catch(error => {
            console.error("An error occurred while fetching the weather data:", error);
            throw error;
          });
      };
      
     //Get forecast data 
      const getForecastData = (coordinates) => {
        const { lat, lon } = coordinates;
        const forecastEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        return fetch(forecastEndpoint)
          .then(response => response.json())
          .then(forecastData => {
            // Process the forecast data here
            const forecastList = forecastData.list;
            const forecastItems = [];
            
            // Iterate through the forecast data
            let currentDate = null;
            for (let i = 0; i < forecastList.length; i++) {
              const forecast = forecastList[i];
              const date = forecast.dt_txt.split(' ')[0];
              
              // Check if the date is different from the current date
              if (date !== currentDate) {
                // Store the forecast data for the current date
                const temperature = forecast.main.temp;
                const weatherCondition = forecast.weather[0].main;
                const icon = forecast.weather[0].icon;
      
                forecastItems.push({
                  date,
                  temperature,
                  weatherCondition,
                  icon
                });
      
                // Check if we have collected enough forecast items
                if (forecastItems.length === 5) {
                  break;
                }
      
                // Update the current date
                currentDate = date;
              }
            }
            
            return forecastItems;
          })
          .catch(error => {
            console.error("An error occurred while fetching the forecast data:", error);
            throw error;
          });
      };

    //Get the city image 
    function getCityImage(city) {
      const accessKey = 'YYPyDWQIm_jkLUEu895Ja_sgp9hl0oTo1NqLceiLk94';
      const imageApiUrl = `https://api.unsplash.com/search/photos?query=${city}&client_id=${accessKey}`;
    
      return fetch(imageApiUrl)
        .then(response => response.json())
        .then(data => {
          if (data.results.length > 0) {
            const firstResult = data.results[0];
            const imageUrl = firstResult.urls.regular;
            return imageUrl;
          }
          // Handle if no image is found
          return null;
        })
        .catch(error => {
          console.log(error);
          return null;
        });
    }

    //Set the city image as background photo
    function setBackground(city, imageUrl) {
      const divElement = document.getElementById('cityBackground');
      // Set the background image of the div
      divElement.style.backgroundImage = `url('${imageUrl}')`;
      // Set any additional styling for the div
      divElement.style.backgroundSize = 'cover';
      divElement.style.backgroundPosition = 'center';
      divElement.style.backgroundRepeat = 'no-repeat';
      divElement.style.backgroundColor = 'rgba(10, 10, 10, 0.5'; // Set the desired background color with opacity
      // Adjust the background image opacity using background-blend-mode
      divElement.style.backgroundBlendMode = 'multiply'; // Adjust the blend mode as needed
    }

    

    //Activate the functions by adding EventListener to the search button
    searchBtn.addEventListener("click", () => {
      getCityCoordinates()
      .then(cityCoordinates => {
        return Promise.all([
          getWeatherData(cityCoordinates),
          getForecastData(cityCoordinates)
        ]);
      })
        .then(([weatherData, forecastData]) => {
          // Use weatherData here to update the UI or perform further operations
          console.log("Weather Data:", weatherData);
          console.log("Forecast Data:", forecastData);
          // Update the UI with weather data
          weatherInCelcius = weatherData.main.temp - 273.5;
          currentWeatherIcon = weatherData.weather[0].icon;
          cityOutput.textContent = weatherData.name;
          currentTemp.textContent = Math.ceil(weatherInCelcius);
          currentWind.textContent = weatherData.wind.speed;
          currentHumidity.textContent = weatherData.main.humidity;
          currentIcon.src = `https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`;
          currentDescription.textContent = weatherData.weather[0].description;
          
      // Update the UI with forecast data
      forecastData.forEach((forecast, index) => {
        const forecastItem = document.getElementsByClassName('forecast-item')[index];
        const forecastDate = forecastItem.getElementsByTagName('h3')[0];
        const forecastIcon = forecastItem.getElementsByTagName('img')[0];
        const forecastTemperature = forecastItem.getElementsByTagName('p')[0];

        forecastDate.textContent = forecast.date;
        forecastIcon.src = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`; 
        forecastTemperature.textContent = `${Math.ceil(forecast.temperature -273.5)}°C`;
      });
      
      getCityImage(cityOutput.textContent)
      .then(imageUrl => {
        setBackground(cityOutput.textContent, imageUrl);
      })
      .catch(error => {
        console.error("Error fetching city image:", error);
      });

      })
        .catch(error => {
          console.error("Error:", error);
        });
    });


//-------Default View------------//

    // Define a default city
const defaultCity = "London";

// Set the default city input value
cityInput.value = defaultCity;

// Fetch weather and forecast data for the default city
getCityCoordinates()
  .then(cityCoordinates => {
    return Promise.all([
      getWeatherData(cityCoordinates),
      getForecastData(cityCoordinates)
    ]);
  })
  .then(([weatherData, forecastData]) => {
    // Use weatherData and forecastData here to update the UI or perform further operations
    console.log("Weather Data:", weatherData);
    console.log("Forecast Data:", forecastData);
    // Update the UI with weather data and forecast data

    // Update the UI with weather data
    weatherInCelcius = weatherData.main.temp - 273.5;
    currentWeatherIcon = weatherData.weather[0].icon;
    cityOutput.textContent = weatherData.name;
    currentTemp.textContent = Math.ceil(weatherInCelcius);
    currentWind.textContent = weatherData.wind.speed;
    currentHumidity.textContent = weatherData.main.humidity;
    currentIcon.src = `https://openweathermap.org/img/wn/${currentWeatherIcon}@2x.png`;
    currentDescription.textContent = weatherData.weather[0].description;

    // Update the UI with forecast data
    forecastData.forEach((forecast, index) => {
      const forecastItem = document.getElementsByClassName('forecast-item')[index];
      const forecastDate = forecastItem.getElementsByTagName('h3')[0];
      const forecastIcon = forecastItem.getElementsByTagName('img')[0];
      const forecastTemperature = forecastItem.getElementsByTagName('p')[0];

      forecastDate.textContent = forecast.date;
      forecastIcon.src = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`; 
      forecastTemperature.textContent = `${Math.ceil(forecast.temperature -273.5)}°C`;
    });
  })
  .catch(error => {
    console.error("Error:", error);
  });




  // Get the search container element
const searchContainer = document.getElementById("search-container");

// Get the icon element that triggers the search section
const searchIcon = document.getElementById("search-icon");

// Add a click event listener to the search icon
searchIcon.addEventListener("click", function() {
    // Toggle the visibility of the search container
    searchContainer.style.display = searchContainer.style.display === "none" ? "block" : "none";
});










    