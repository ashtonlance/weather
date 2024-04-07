import Button from "@/components/Button";
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
    id: number | string;
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
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=currently,minutely,alerts,current&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    );
    if (!weatherResponse.ok) {
      throw new Error(
        `OneCall API call failed with status: ${weatherResponse.status}`,
      );
    }
    const weatherData = await weatherResponse.json(); // Log for debugging
    // Define a type for the forecast items
    type ForecastItem = {
      dt: number;
      main: {
        temp: number;
      };
      temp: {
        max: number;
      };
    };

    // Convert temperature from Kelvin to Fahrenheit for each forecast
    weatherData.list = weatherData.daily.map((forecast: ForecastItem) => {
      const forecastItem = {
        ...forecast,
        main: {
          ...forecast.main,
          temp:
            Math.round((((forecast.temp.max - 273.15) * 9) / 5 + 32) * 10) / 10, // Convert to Fahrenheit and round to nearest 10th
        },
      }; // Console log the forecast item for debugging
      console.log(forecastItem, "forecastItem");
      return forecastItem;
    });
    // Add city name to the weatherData
    weatherData.cityName = geoData[0].name;
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null; // Return null or a default object to handle errors gracefully
  }
}

interface Forecast {
  city: {
    id: string | number;
    name: string;
  };
  lat?: number;
  cityName?: string;
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
  }>;
}
interface LineGraphData {
  id: string | number;
  data: Array<{ x: string; y: number }>;
}

// Abstracted function to find the highest temperature for each day
function getDailyHighs(
  list: Array<{ dt: number; main: { temp: number } }> = [],
) {
  const groupedByDay = list.reduce(
    (acc, forecast) => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(forecast);
      return acc;
    },
    {} as Record<string, typeof list>,
  );

  return Object.keys(groupedByDay).map((date) => {
    const forecasts = groupedByDay[date];
    const highestTempForecast = forecasts.reduce((prev, current) => {
      return prev.main.temp > current.main.temp ? prev : current;
    });
    return {
      x: new Date(highestTempForecast.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      y: highestTempForecast.main.temp,
    };
  });
}

export default function Index() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<string[]>([""]);
  const [showSevenDays, setShowSevenDays] = useState(false); // State to toggle forecast duration
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph"); // New state to toggle between graph and table view

  const toggleViewMode = () => {
    setViewMode(viewMode === "graph" ? "table" : "graph");
  };
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
      const dailyHighs = getDailyHighs(cityData?.list);
      // Filter based on toggle state (show 3 or 7 days)
      const filteredData = dailyHighs.filter((_, index) =>
        showSevenDays ? index < 7 : index < 3,
      );
      return {
        id: cityData?.cityName as string,
        data: filteredData,
      };
    });
  }, [forecastData, showSevenDays]);
  return (
    <div className="container">
      <h1 className="py-4 text-4xl font-bold lg:font-extrabold">
        Forecast Analyzer
      </h1>
      <form
        className="flex flex-wrap gap-2 lg:flex-nowrap"
        onSubmit={handleSubmit}
      >
        {cities.map((city, index) => (
          <input
            key={index}
            type="text"
            name={`city${index}`}
            value={city}
            onChange={(e) => updateCity(index, e.target.value)}
            placeholder="Enter city name"
            className="flex h-9 w-full max-w-60 rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        ))}
        <Button
          type="button"
          onClick={addCityInput}
          extraClasses="mr-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-secondary-foreground/90"
        >
          Add City
        </Button>
        <Button type="submit">Fetch Forecast</Button>
      </form>
      <div className="flex gap-4">
        <Button
          extraClasses="mt-4"
          type="button"
          onClick={toggleForecastDuration}
        >
          {showSevenDays ? "Show 3 Days" : "Show 7 Days"}
        </Button>
        <Button extraClasses="mt-4" type="button" onClick={toggleViewMode}>
          {viewMode === "graph" ? "Show Table View" : "Show Graph View"}
        </Button>
      </div>
      <div className="h-96">
        {forecastData.length > 0 &&
          (viewMode === "graph" ? (
            <LineChart data={lineGraphData} />
          ) : (
            <table className="mt-4 w-full">
              <thead>
                <tr>
                  <th className="text-left">City</th>
                  {showSevenDays ? (
                    <>
                      <th className="text-left">Day 1</th>
                      <th className="text-left">Day 2</th>
                      <th className="text-left">Day 3</th>
                      <th className="text-left">Day 4</th>
                      <th className="text-left">Day 5</th>
                      <th className="text-left">Day 6</th>
                      <th className="text-left">Day 7</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left">Day 1</th>
                      <th className="text-left">Day 2</th>
                      <th className="text-left">Day 3</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {forecastData.map((cityData) => {
                  const dailyHighs = getDailyHighs(cityData.list);
                  const filteredHighs = dailyHighs.filter((_, index) =>
                    showSevenDays ? index < 7 : index < 3,
                  );
                  return (
                    <tr key={cityData?.lat}>
                      <td>{cityData.cityName}</td>
                      {showSevenDays
                        ? // Render all 7 days if showSevenDays is true
                          Array.from({ length: 7 }).map((_, index) => (
                            <td key={index}>
                              {filteredHighs[index]
                                ? `${filteredHighs[index].y}°F`
                                : "-"}
                            </td>
                          ))
                        : // Render 3 days if showSevenDays is false
                          Array.from({ length: 3 }).map((_, index) => (
                            <td key={index}>
                              {filteredHighs[index]
                                ? `${filteredHighs[index].y}°F`
                                : "-"}
                            </td>
                          ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ))}
      </div>
    </div>
  );
}
