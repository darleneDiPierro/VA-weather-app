let city = document.querySelector('.weather__city'),
    day = document.querySelector('.weather__day'),
    humidity = document.querySelector('.weather__indicator--humidity>.value'),
    wind = document.querySelector('.weather__indicator--wind>.value'),
    pressure = document.querySelector('.weather__indicator--pressure>.value'),
    forecastBlock = document.querySelector('.weather__forecast'),
    searchInp = document.querySelector('.weather__search'),
    image = document.querySelector('.weather__image'),
    temperature  = document.querySelector('.weather__temperature>.value'),
    weatherAPIKey = '42cd84302218efd562e8c0f68cc1dc1a',
    weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey,
    forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey,
    geocodingBaseEndpoint = 'http://api.openweathermap.org/geo/1.0/direct?&limit=5&appid='+weatherAPIKey+'&q=',
    datalist = document.getElementById('suggestions'),
    weatherImages = [
        {
            url : 'assets/images/clear-sky.png',
            ids : [800]
        },
        {
            url : 'assets/images/clear-sky.png',
            ids : [803, 804]
        },
        {
            url : 'assets/images/few-clouds.png',
            ids : [801]
        },
        {
            url : 'assets/images/mist.png',
            ids : [701, 711, 721, 731, 741, 751, 761, 762, 771, 781]
        },
        {
            url : 'assets/images/rain.png',
            ids : [500, 501, 502, 503, 504] 
        },
        {
            url : 'assets/images/scattered-clouds.png',
            ids : [802]
        },
        {
            url : 'assets/images/shower-rain.png',
            ids : [520, 521, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321]
        },
        {
            url : 'assets/images/snow.png',
            ids : [511, 600, 601, 602, 611, 612, 613, 615, 620, 621, 622]
        },
        {
            url : 'assets/images/thunderstorm.png',
            ids : [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
        }
    ]


getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndpoint + '&q=' + city,
        response = await fetch(endpoint),
        weather = await response.json()

        return weather
}

let getForecastByCityID = async (id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id,
    result = await fetch(endpoint),
    forecast = await result.json(),
    forecastList = forecast.list,
    daily = []

    forecastList.forEach(day => {
        let date = new Date(day.dt_txt.replace(' ', 'T')),
            hours = date.getHours()
        if(hours === 12) {
            daily.push(day)
        }
    })
    return daily
}

let weatherForCity = async (city) => {
    let weather = await getWeatherByCityName(city)
    if(weather.cod === '404'){
        return
    }
    let cityID = weather.id
    forecast = await getForecastByCityID(cityID)
    updateCurrentWeather(weather)
    updateForecast(forecast)
}

searchInp.addEventListener('keydown', async (e) => {
    if(e.keyCode === 13){
        weatherForCity(searchInp.value)
    }
})

searchInp.addEventListener('input', async () => {
    if(searchInp.value.length <= 2) {
        return
    }

    let endpoint = geocodingBaseEndpoint + searchInp.value,
        result = await(await fetch(endpoint)).json()

    datalist.innerHTML = '';
    result.forEach((city) => {
        let option = document.createElement('option');
        option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        datalist.appendChild(option);
    })
})

updateCurrentWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country
    day.textContent = dayOfWeek()
    humidity.textContent = data.main.humidity
    pressure.textContent = data.main.pressure
    let windDirection,
    deg = data.wind.deg
    if(deg > 45 && deg <= 225){
        windDirection = 'East'
    } else if(deg > 135 && deg <= 225){
        windDirection = 'South'
    } else if(deg > 225 && deg <= 315){
        windDirection = 'West'
    } else {
        windDirection = 'North'
    }

    wind.textContent = windDirection + ', ' + data.wind.speed

    temperature.textContent = data.main.temp > 0 ? '+' + Math.round(data.main.temp) : Math.round(data.main.temp)

    let imgID = data.weather[0].id
    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgID)) {
            image.src = obj.url
        }
    })
}

let updateForecast = (forecast) => {
    forecastBlock.innerHTML = ''
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png',
        dayName = dayOfWeek(day.dt * 1000),
        temperature = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp),
        forecastItem = `
            <article class="weather__forecast__item">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather__forecast__icon">
                <h3 class="weather__forecast__day">${dayName}</h3>
                <p class="weather__forecast__temperature"><span class="value">${temperature}</span> &deg;C</p>
            </article>
        `
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem)
    })
}

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'})  
}

let init = async () => {
    await weatherForCity('Bekasi')
    document.body.style.filter = 'blur(0)'
}

init()