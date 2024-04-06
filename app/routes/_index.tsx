import LineChart from "@/components/LineChart";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Forecast Analyzer" },
    {
      name: "description",
      content: "Compare forecasted temperatures between cities",
    },
  ];
};

// Define your loader function
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const cities = url.searchParams.getAll("city");
  console.log("Requested cities:", cities); // Log for debugging
  const dataPromises = cities.map((city) => fetchWeather(city));
  const results = await Promise.all(dataPromises);
  return json(results);
};

interface WeatherData {
  // Define the structure of the weather data you expect to receive
  // Example structure, adjust according to the actual data received from the API
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      // Add other properties as needed
    };
    // Add other properties as needed
  }>;
  city: {
    id: number;
    name: string;
    // Add other properties as needed
  };
}

// Modify fetchWeather to convert temperature to Fahrenheit
async function fetchWeather(city: string): Promise<WeatherData | null> {
  try {
    // Step 1: Get latitude and longitude for the city
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    );
    if (!geoResponse.ok) {
      throw new Error(
        `Geocoding API call failed with status: ${geoResponse.status}`,
      );
    }
    const geoData = await geoResponse.json();
    if (geoData.length === 0) {
      throw new Error("City not found");
    }
    const { lat, lon } = geoData[0];
    // Step 2: Use latitude and longitude to fetch the weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    );
    if (!weatherResponse.ok) {
      throw new Error(
        `Weather API call failed with status: ${weatherResponse.status}`,
      );
    }
    const weatherData = await weatherResponse.json();
    // Define a type for the forecast items
    type ForecastItem = {
      dt: number;
      main: {
        temp: number;
      };
    };

    // Convert temperature from Kelvin to Fahrenheit for each forecast
    weatherData.list = weatherData.list.map((forecast: ForecastItem) => ({
      ...forecast,
      main: {
        ...forecast.main,
        temp:
          Math.round((((forecast.main.temp - 273.15) * 9) / 5 + 32) * 10) / 10, // Convert to Fahrenheit and round to nearest 10th
      },
    }));
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null; // Return null or a default object to handle errors gracefully
  }
}

interface Forecast {
  city: {
    id: number;
    name: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
  }>;
}

interface LineGraphData {
  id: string;
  data: Array<{ x: string; y: number }>;
}

export default function Index() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<string[]>([""]);
  const [showSevenDays, setShowSevenDays] = useState(false); // State to toggle forecast duration

  useEffect(() => {
    // Parse the current URL to check for 'city' query parameters
    const url = new URL(window.location.href);
    const cityParams = url.searchParams.getAll("city");
    if (cityParams.length > 0) {
      // If there are cities in the URL, update the state to reflect them
      setCities(cityParams);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    cities.filter(Boolean).forEach((city) => queryParams.append("city", city)); // Only add non-empty cities
    navigate(`/?${queryParams}`);
  };

  const addCityInput = () => {
    setCities([...cities, ""]); // Add another empty string to the array to render a new input field
  };

  const updateCity = (index: number, value: string) => {
    const newCities = [...cities];
    newCities[index] = value;
    setCities(newCities);
  };

  const toggleForecastDuration = () => {
    setShowSevenDays(!showSevenDays);
  };

  const forecastData = useLoaderData<Forecast[]>();
  // Adjust useMemo to filter based on toggle state
  const lineGraphData: LineGraphData[] = useMemo(() => {
    return forecastData.map((cityData) => {
      // Group forecasts by day
      const groupedByDay = cityData.list.reduce(
        (acc, forecast) => {
          const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US");
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(forecast);
          return acc;
        },
        {} as Record<string, typeof cityData.list>,
      );

      // For each day, find the forecast with the highest temperature
      const dailyHighs = Object.keys(groupedByDay).map((date) => {
        const forecasts = groupedByDay[date];
        const highestTempForecast = forecasts.reduce((prev, current) => {
          return prev.main.temp > current.main.temp ? prev : current;
        });
        return {
          x: new Date(highestTempForecast.dt * 1000).toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              month: "short",
              day: "numeric",
            },
          ),
          y: highestTempForecast.main.temp,
        };
      });

      // Filter based on toggle state (show 3 or 7 days)
      const filteredData = dailyHighs.filter((_, index) =>
        showSevenDays ? index < 7 : index < 3,
      );

      return {
        id: cityData.city.name,
        data: filteredData,
      };
    });
  }, [forecastData, showSevenDays]);
  return (
    <div>
      <h1 className="text-4xl font-bold lg:font-extrabold">
        Forecast Analyzer
      </h1>
      <form onSubmit={handleSubmit}>
        {cities.map((city, index) => (
          <input
            key={index}
            type="text"
            name={`city${index}`}
            value={city}
            onChange={(e) => updateCity(index, e.target.value)}
            placeholder="Enter city name"
            className="mb-2"
          />
        ))}
        <button type="button" onClick={addCityInput} className="mr-2">
          Add City
        </button>
        <button type="submit">Submit</button>
      </form>
      <button onClick={toggleForecastDuration} className="mb-4">
        {showSevenDays ? "Show 3 Days" : "Show 7 Days"}
      </button>
      <div className="h-96">
        {forecastData.length > 0 && <LineChart data={lineGraphData} />}
      </div>
    </div>
  );
}
