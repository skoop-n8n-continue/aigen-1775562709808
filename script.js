/**
 * SkyCast Weather App
 * Using Open-Meteo API (No API key required)
 */

const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    getLocationBtn: document.getElementById('get-location-btn'),
    weatherDisplay: document.getElementById('weather-display'),
    welcomeScreen: document.getElementById('welcome-screen'),
    loadingSpinner: document.getElementById('loading-spinner'),
    errorToast: document.getElementById('error-message'),

    cityName: document.getElementById('city-name'),
    currentDate: document.getElementById('current-date'),
    currentTemp: document.getElementById('current-temp'),
    weatherIcon: document.getElementById('weather-hero-img'),
    weatherDesc: document.getElementById('weather-desc'),

    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    feelsLike: document.getElementById('feels-like'),
    uvIndex: document.getElementById('uv-index'),
    unitC: document.getElementById('unit-c'),
    unitF: document.getElementById('unit-f'),

    forecastContainer: document.getElementById('forecast-container'),
    hourlyContainer: document.getElementById('hourly-container')
};

// State management
const state = {
    unit: localStorage.getItem('weather-unit') || 'C',
    weatherData: null,
    cityName: '',
    countryCode: ''
};

// Version for cache busting
const VERSION = 'w3a4b9';

// Background images mapping
const weatherBackgrounds = {
    sunny: 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fweather_app_background-1775574172739.png',
    cloudy: 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloudy_background-1775574172739.png', // Fallback if not exists
    rainy: 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frainy_background-1775574172739.png'  // Fallback if not exists
};

// Weather codes mapping for Open-Meteo
const weatherCodes = {
    0: { desc: 'Clear sky', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fsun_icon-1775574198376.png?v=${VERSION}` },
    1: { desc: 'Mainly clear', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fsun_icon-1775574198376.png?v=${VERSION}` },
    2: { desc: 'Partly cloudy', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    3: { desc: 'Overcast', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    45: { desc: 'Foggy', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    48: { desc: 'Depositing rime fog', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    51: { desc: 'Light drizzle', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    53: { desc: 'Moderate drizzle', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    55: { desc: 'Dense drizzle', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    56: { desc: 'Light freezing drizzle', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    57: { desc: 'Dense freezing drizzle', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    61: { desc: 'Slight rain', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    63: { desc: 'Moderate rain', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    65: { desc: 'Heavy rain', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    66: { desc: 'Light freezing rain', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    67: { desc: 'Heavy freezing rain', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    71: { desc: 'Slight snow fall', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    73: { desc: 'Moderate snow fall', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    75: { desc: 'Heavy snow fall', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    77: { desc: 'Snow grains', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    80: { desc: 'Slight rain showers', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    81: { desc: 'Moderate rain showers', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    82: { desc: 'Violent rain showers', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    85: { desc: 'Slight snow showers', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    86: { desc: 'Heavy snow showers', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fcloud_icon-1775574225915.png?v=${VERSION}` },
    95: { desc: 'Thunderstorm', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    96: { desc: 'Thunderstorm with slight hail', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` },
    99: { desc: 'Thunderstorm with heavy hail', icon: `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Frain_icon-1775574257622.png?v=${VERSION}` }
};

// Helper to get icon or a fallback
function getWeatherIcon(code) {
    return weatherCodes[code]?.icon || `https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1775562709808%2Fassets%2Fsun_icon-1775574198376.png?v=${VERSION}`;
}

function getWeatherDescription(code) {
    return weatherCodes[code]?.desc || 'Unknown';
}

// Temperature conversion
function convertTemp(celsius) {
    if (state.unit === 'C') return Math.round(celsius);
    return Math.round((celsius * 9/5) + 32);
}

// Background updater
function updateBackground(code) {
    let bgType = 'sunny';
    if ([2, 3, 45, 48].includes(code)) bgType = 'cloudy';
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) bgType = 'rainy';

    // We use a CSS variable or direct style
    const bgUrl = weatherBackgrounds[bgType] || weatherBackgrounds.sunny;
    document.body.style.backgroundImage = `linear-gradient(135deg, rgba(16, 24, 31, 0.7) 0%, rgba(0, 183, 175, 0.4) 100%), url('${bgUrl}')`;
}

// Format date
function formatDate(dateStr) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Geocoding function using Open-Meteo's geocoding API
async function getCoordinates(city) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }

        return data.results[0];
    } catch (error) {
        console.error('Geocoding error:', error);
        showError('City not found. Please check the spelling.');
        return null;
    }
}

// Fetch weather data
async function fetchWeather(lat, lon, cityName, countryCode) {
    showLoading(true);
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;

        const response = await fetch(url, { cache: 'no-store' });
        const data = await response.json();

        state.weatherData = data;
        state.cityName = cityName;
        state.countryCode = countryCode;

        // Save last search
        localStorage.setItem('last-weather-search', JSON.stringify({ lat, lon, cityName, countryCode }));

        updateUI();
        showLoading(false);
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data.');
        showLoading(false);
    }
}

// Update UI with data
function updateUI() {
    if (!state.weatherData) return;

    const data = state.weatherData;
    const cityName = state.cityName;
    const countryCode = state.countryCode;

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    // Header
    elements.cityName.textContent = `${cityName}${countryCode ? ', ' + countryCode : ''}`;
    elements.currentDate.textContent = formatDate(new Date());

    // Main stats
    elements.currentTemp.textContent = convertTemp(current.temperature_2m);
    const unitElement = elements.currentTemp.nextElementSibling;
    if (unitElement && unitElement.classList.contains('unit')) {
        unitElement.textContent = `°${state.unit}`;
    }
    elements.weatherDesc.textContent = getWeatherDescription(current.weather_code);
    elements.weatherIcon.src = getWeatherIcon(current.weather_code);
    updateBackground(current.weather_code);

    // Details
    elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    elements.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
    elements.feelsLike.textContent = `${convertTemp(current.apparent_temperature)}°${state.unit}`;
    elements.uvIndex.textContent = daily.uv_index_max[0];

    // Hourly Forecast (Next 12 hours)
    elements.hourlyContainer.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyStartIndex = currentHour;

    for (let i = hourlyStartIndex; i < hourlyStartIndex + 12; i++) {
        if (i >= hourly.time.length) break;

        const time = new Date(hourly.time[i]);
        const temp = convertTemp(hourly.temperature_2m[i]);
        const code = hourly.weather_code[i];
        const icon = getWeatherIcon(code);
        const displayTime = time.getHours() === currentHour ? 'Now' : time.toLocaleTimeString(undefined, { hour: 'numeric' });

        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <span class="time">${displayTime}</span>
            <img src="${icon}" alt="${getWeatherDescription(code)}">
            <span class="temp">${temp}°</span>
        `;
        elements.hourlyContainer.appendChild(item);
    }

    // Forecast
    elements.forecastContainer.innerHTML = '';

    // Next 7 days (starting from tomorrow)
    for (let i = 1; i < daily.time.length; i++) {
        const date = daily.time[i];
        const code = daily.weather_code[i];
        const max = convertTemp(daily.temperature_2m_max[i]);
        const min = convertTemp(daily.temperature_2m_min[i]);
        const icon = getWeatherIcon(code);

        const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <span class="day">${dayName}</span>
            <img src="${icon}" class="forecast-icon" alt="${getWeatherDescription(code)}">
            <div class="temp">
                <span class="temp-max">${max}°</span>
                <span class="temp-min">${min}°</span>
            </div>
        `;
        elements.forecastContainer.appendChild(card);
    }

    // Handle visibility
    elements.welcomeScreen.classList.add('hidden');
    elements.weatherDisplay.classList.remove('hidden');
}

// Utility functions
function showLoading(isLoading) {
    if (isLoading) {
        elements.loadingSpinner.classList.remove('hidden');
    } else {
        elements.loadingSpinner.classList.add('hidden');
    }
}

function showError(msg) {
    elements.errorToast.querySelector('p').textContent = msg;
    elements.errorToast.classList.remove('hidden');
    setTimeout(() => {
        elements.errorToast.classList.add('hidden');
    }, 3000);
}

// Event Listeners
elements.unitC.addEventListener('click', () => {
    if (state.unit === 'C') return;
    state.unit = 'C';
    localStorage.setItem('weather-unit', 'C');
    elements.unitC.classList.add('active');
    elements.unitF.classList.remove('active');
    updateUI();
});

elements.unitF.addEventListener('click', () => {
    if (state.unit === 'F') return;
    state.unit = 'F';
    localStorage.setItem('weather-unit', 'F');
    elements.unitF.classList.add('active');
    elements.unitC.classList.remove('active');
    updateUI();
});

elements.searchBtn.addEventListener('click', async () => {
    const city = elements.cityInput.value.trim();
    if (!city) return;

    const coords = await getCoordinates(city);
    if (coords) {
        fetchWeather(coords.latitude, coords.longitude, coords.name, coords.country_code);
    }
});

elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.searchBtn.click();
    }
});

elements.getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Current Location', '');
            },
            (err) => {
                showLoading(false);
                showError('Location access denied. Please search for a city.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
});

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    // Set active unit button
    if (state.unit === 'F') {
        elements.unitF.classList.add('active');
        elements.unitC.classList.remove('active');
    }

    // Try loading last search
    const lastSearch = localStorage.getItem('last-weather-search');
    if (lastSearch) {
        const { lat, lon, cityName, countryCode } = JSON.parse(lastSearch);
        fetchWeather(lat, lon, cityName, countryCode);
    }
});
