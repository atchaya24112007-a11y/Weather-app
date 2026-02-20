const http = require("http");
const axios = require("axios");
require("dotenv").config();

const apiKey = process.env.API_KEY;
const PORT = process.env.PORT || 5000;

// Weather condition to image mapping
const weatherImages = {
  sunny: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&auto=format&fit=crop",
  clear: "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&auto=format&fit=crop",
  rainy: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800&auto=format&fit=crop",
  rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=800&auto=format&fit=crop",
  cloudy: "https://images.unsplash.com/photo-1611928482473-7b27d24eab80?w=800&auto=format&fit=crop",
  overcast: "https://images.unsplash.com/photo-1611928482473-7b27d24eab80?w=800&auto=format&fit=crop",
  snowy: "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=800&auto=format&fit=crop",
  snow: "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=800&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&auto=format&fit=crop"
};

// Text-based weather symbols
const weatherSymbols = {
  sunny: "SUNNY",
  clear: "CLEAR",
  rainy: "RAINY",
  rain: "RAINY",
  cloudy: "CLOUDY",
  overcast: "CLOUDY",
  snowy: "SNOWY",
  snow: "SNOWY",
  default: "---"
};

function getWeatherType(condition) {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes("sunny") || conditionLower.includes("clear")) return "sunny";
  if (conditionLower.includes("rain")) return "rainy";
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) return "cloudy";
  if (conditionLower.includes("snow")) return "snowy";
  return "default";
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const city = url.searchParams.get("city");

  // Home Page
  if (req.url === "/" || !city) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Weather App</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 100%;
    }
    h1 { color: #333; margin-bottom: 30px; text-align: center; font-size: 2.2em; }
    .search-form { display: flex; gap: 10px; margin-bottom: 30px; }
    .search-input {
      flex: 1; padding: 15px; font-size: 16px;
      border: 2px solid #e0e0e0; border-radius: 10px; outline: none;
    }
    .search-btn {
      padding: 15px 30px; background: #667eea; color: white;
      border: none; border-radius: 10px; font-size: 16px; cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌤️ Weather App</h1>
    <form class="search-form" method="GET">
      <input type="text" name="city" class="search-input" placeholder="Enter city name" required>
      <button type="submit" class="search-btn">Search</button>
    </form>
  </div>
</body>
</html>
`);
    return;
  }

  try {
    console.log(`🔍 Searching for: ${city}`);
    console.log(`📡 Calling API with key: ${apiKey ? apiKey.substring(0, 5) + "..." : "MISSING"}`);

    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
    const response = await axios.get(weatherUrl);
    const data = response.data;

    const temperature = data.current.temp_c;
    const feelsLike = data.current.feelslike_c;
    const description = data.current.condition.text;
    const humidity = data.current.humidity;
    const windSpeed = data.current.wind_kph;
    const country = data.location.country;
    const localtime = data.location.localtime;

    const weatherType = getWeatherType(description);
    const backgroundImage = weatherImages[weatherType] || weatherImages.default;
    const weatherSymbol = weatherSymbols[weatherType] || weatherSymbols.default;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Weather in ${data.location.name}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      background-image: url('${backgroundImage}');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }
    .container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>${data.location.name}, ${country}</h2>
    <h1>${temperature}°C</h1>
    <p>${description}</p>
    <p>Feels like: ${feelsLike}°C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind: ${windSpeed} km/h</p>
    <p>Local time: ${localtime}</p>
    <p>[ ${weatherSymbol} ]</p>
    <br>
    <a href="/">← Search Another City</a>
  </div>
</body>
</html>
`);
  } catch (error) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
  <meta charset="UTF-8">
</head>
<body style="font-family:Arial; text-align:center; padding:40px;">
  <h2>Error</h2>
  <p>${error.message}</p>
  <p>API Key: ${apiKey ? apiKey.substring(0, 5) + "..." : "MISSING"}</p>
  <a href="/">Try Again</a>
</body>
</html>
`);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Weather App running at http://localhost:${PORT}`);
});

