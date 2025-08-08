// client.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Client script loaded. Attaching event listeners...");

    // --- Global State ---
    const state = {
        serverUrl: 'http://localhost:3000'
    };

    // --- Element Selectors ---
    const pages = {
        login: document.getElementById('login-page'),
        signup: document.getElementById('signup-page'),
        weather: document.getElementById('weather-app-page')
    };

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginErrorEl = document.getElementById('login-error');
    const signupMessageEl = document.getElementById('signup-message');
    const logoutButton = document.getElementById('logout-button');
    const userEmailEl = document.getElementById('user-email');

    // --- Helper Functions ---
    const showPage = (pageName) => {
        Object.values(pages).forEach(page => page.classList.remove('active'));
        pages[pageName].classList.add('active');
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Loading...' : originalText;
    };

    // --- Event Listeners ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('signup');
        signupForm.reset();
        signupMessageEl.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
        loginForm.reset();
        loginErrorEl.textContent = '';
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Signup form submitted.");
        signupMessageEl.textContent = '';
        signupMessageEl.className = 'message';
        setButtonLoading(signupButton, true, 'Sign Up');

        try {
            const response = await fetch(`${state.serverUrl}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: signupForm.querySelector('#signup-email').value,
                    password: signupForm.querySelector('#signup-password').value
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            signupMessageEl.textContent = data.message;
            signupMessageEl.classList.add('success-message');
            signupForm.reset();
        } catch (error) {
            console.error("Signup Client Error:", error);
            signupMessageEl.textContent = error.message;
            signupMessageEl.classList.add('error-message');
        } finally {
            setButtonLoading(signupButton, false, 'Sign Up');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Login form submitted.");
        loginErrorEl.textContent = '';
        setButtonLoading(loginButton, true, 'Sign In');

        try {
            const response = await fetch(`${state.serverUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginForm.querySelector('#login-email').value,
                    password: loginForm.querySelector('#login-password').value
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            userEmailEl.textContent = data.user.email;
            showPage('weather');
            initializeWeatherApp();
        } catch (error) {
            console.error("Login Client Error:", error);
            loginErrorEl.textContent = error.message;
        } finally {
            setButtonLoading(loginButton, false, 'Sign In');
        }
    });

    logoutButton.addEventListener('click', () => {
        showPage('login');
        loginForm.reset();
        loginErrorEl.textContent = '';
    });

    // --- Weather App Logic ---
    function initializeWeatherApp() {
        console.log("Initializing Weather App logic...");
        const locationInput = document.getElementById('location-input');
        const searchButton = document.getElementById('search-button');
        const geolocationButton = document.getElementById('geolocation-button');
        const dismissErrorButton = document.getElementById('dismiss-error-button');
        
        const apiKey = "e9ee5766a9354a5378740036b37f6a87";
        const apiBaseUrl = "https://api.openweathermap.org/data/2.5/weather";

        const fetchWeatherData = async (url) => {
            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('error-message').classList.add('hidden');
            setWeatherButtonsDisabled(true);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("City not found. Please check spelling.");
                const data = await response.json();
                displayWeather(data);
            } catch (error) {
                showWeatherError(error.message);
            } finally {
                document.getElementById('loader').classList.add('hidden');
                setWeatherButtonsDisabled(false);
            }
        };

        const displayWeather = (data) => {
            document.getElementById('weather-display').classList.remove('hidden', 'opacity-0');
            document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
            document.getElementById('weather-description').textContent = data.weather[0].description;
            document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
            document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        };

        const showWeatherError = (message) => {
            document.getElementById('error-text').textContent = message;
            document.getElementById('error-message').classList.remove('hidden');
        };
        
        const setWeatherButtonsDisabled = (disabled) => {
            searchButton.disabled = disabled;
            geolocationButton.disabled = disabled;
        };

        searchButton.addEventListener('click', () => {
            const city = locationInput.value.trim();
            if (city) fetchWeatherData(`${apiBaseUrl}?q=${city}&appid=${apiKey}&units=metric`);
            else showWeatherError("Please enter a city name.");
        });

        geolocationButton.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeatherData(`${apiBaseUrl}?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`),
                () => showWeatherError("Geolocation permission denied.")
            );
        });

        dismissErrorButton.addEventListener('click', () => {
            document.getElementById('error-message').classList.add('hidden');
        });

        // Initial fetch for a default city
        fetchWeatherData(`${apiBaseUrl}?q=Bengaluru&appid=${apiKey}&units=metric`);
    }
});
