const citySearchInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const currentWeatherSection = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast');
const chartContainer = document.getElementById('chart-container');
const historySection = document.getElementById('history');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const forecastContainer = document.querySelector('.forecast-container');
const historyContainer = document.getElementById('history-container');

const mockWeatherData = {
  'New York': {
    current: {
      city: 'New York',
      date: '2025-05-02',
      temp: 72,
      humidity: 65,
      windSpeed: 8,
      description: 'Partly Cloudy',
      icon: 'fa-cloud-sun'
    },
    forecast: [
      { date: '2025-05-03', high: 75, low: 60, icon: 'fa-cloud-sun', description: 'Partly Cloudy' },
      { date: '2025-05-04', high: 78, low: 62, icon: 'fa-sun', description: 'Sunny' },
      { date: '2025-05-05', high: 80, low: 65, icon: 'fa-sun', description: 'Sunny' },
      { date: '2025-05-06', high: 77, low: 68, icon: 'fa-cloud-rain', description: 'Light Rain' },
      { date: '2025-05-07', high: 74, low: 65, icon: 'fa-cloud', description: 'Cloudy' }
    ]
  },
  'London': {
    current: {
      city: 'London',
      date: '2025-05-02',
      temp: 60,
      humidity: 75,
      windSpeed: 12,
      description: 'Light Rain',
      icon: 'fa-cloud-rain'
    },
    forecast: [
      { date: '2025-05-03', high: 62, low: 52, icon: 'fa-cloud-rain', description: 'Light Rain' },
      { date: '2025-05-04', high: 65, low: 54, icon: 'fa-cloud', description: 'Cloudy' },
      { date: '2025-05-05', high: 67, low: 53, icon: 'fa-cloud-sun', description: 'Partly Cloudy' },
      { date: '2025-05-06', high: 63, low: 50, icon: 'fa-cloud-rain', description: 'Showers' },
      { date: '2025-05-07', high: 60, low: 48, icon: 'fa-cloud', description: 'Cloudy' }
    ]
  }
};

let searchHistory = [];
let tempChart = null;

function init() {
  loadSearchHistory();
  displaySearchHistory();
  searchBtn.addEventListener('click', handleSearch);
  citySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

function handleSearch() {
  const city = citySearchInput.value.trim();
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  const formattedCity = formatCityName(city);
  const weatherData = mockWeatherData[formattedCity];
  if (!weatherData) {
    showError(`Weather data not found for "${city}".`);
    return;
  }
  errorContainer.classList.add('hidden');
  if (!searchHistory.includes(formattedCity)) {
    searchHistory.push(formattedCity);
    saveSearchHistory();
    displaySearchHistory();
  }
  displayCurrentWeather(weatherData.current);
  displayForecast(weatherData.forecast);
  displayTemperatureChart(weatherData.forecast);
  currentWeatherSection.classList.remove('hidden');
  forecastSection.classList.remove('hidden');
  chartContainer.classList.remove('hidden');
  historySection.classList.remove('hidden');
  citySearchInput.value = '';
}

function formatCityName(city) {
  const lowercaseCity = city.toLowerCase();
  for (const key in mockWeatherData) {
    if (key.toLowerCase() === lowercaseCity) return key;
  }
  return city.charAt(0).toUpperCase() + city.slice(1);
}

function displayCurrentWeather(data) {
  document.getElementById('city-name').textContent = data.city;
  document.getElementById('current-date').textContent = formatDate(data.date);
  document.getElementById('temperature').textContent = `Temperature: ${data.temp}°F`;
  document.getElementById('humidity').textContent = `Humidity: ${data.humidity}%`;
  document.getElementById('wind-speed').textContent = `Wind: ${data.windSpeed} mph`;
  document.getElementById('description').textContent = data.description;
  const weatherIcon = document.getElementById('weather-icon');
  weatherIcon.className = 'fas ' + data.icon;
}

function displayForecast(forecast) {
  forecastContainer.innerHTML = '';
  forecast.forEach(day => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-date">${formatDate(day.date)}</div>
      <div class="forecast-icon"><i class="fas ${day.icon}"></i></div>
      <div class="forecast-temp"><span>H: ${day.high}°F</span><span>L: ${day.low}°F</span></div>
      <div>${day.description}</div>
    `;
    forecastContainer.appendChild(card);
  });
}

function displayTemperatureChart(forecast) {
  const ctx = document.getElementById('temp-chart').getContext('2d');
  if (tempChart) tempChart.destroy();
  const labels = forecast.map(day => formatDate(day.date));
  const highs = forecast.map(day => day.high);
  const lows = forecast.map(day => day.low);
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'High', data: highs, borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', tension: 0.3, fill: true },
        { label: 'Low', data: lows, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.1)', tension: 0.3, fill: true }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: false, title: { display: true, text: 'Temperature (°F)' } } }
    }
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function showError(message) {
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
}

function loadSearchHistory() {
  const savedHistory = localStorage.getItem('weatherSearchHistory');
  if (savedHistory) searchHistory = JSON.parse(savedHistory);
}

function saveSearchHistory() {
  if (searchHistory.length > 5) searchHistory = searchHistory.slice(-5);
  localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
}

function displaySearchHistory() {
  historyContainer.innerHTML = '';
  if (searchHistory.length === 0) {
    historySection.classList.add('hidden');
    return;
  }
  historySection.classList.remove('hidden');
  searchHistory.forEach(city => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `<span>${city}</span><button class="history-button"><i class="fas fa-search"></i></button>`;
    historyItem.addEventListener('click', () => {
      citySearchInput.value = city;
      handleSearch();
    });
    historyContainer.appendChild(historyItem);
  });
}

init();