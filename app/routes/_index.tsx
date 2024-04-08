import Button from "@/components/Button";
import ForecastTable from "@/components/ForecastTable";
import LineChart from "@/components/LineChart";
import { useEnv } from "@/hooks/useEnv";
import { LineGraphData, WeatherData } from "@/types";
import { getDailyHighs } from "@/utils";
import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import { FormEvent, useMemo, useState } from "react";
import { usePlacesWidget } from "react-google-autocomplete";
interface City {
  error?: string;
  lat?: number;
  lon?: number;
}
interface CityInputProps {
  index: number;
  city: City;
  onUpdate: (index: number, lat: number, lon: number) => void;
  onRemove: (index: number) => void;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  temp: {
    max: number;
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Forecast Analyzer" },
    {
      name: "description",
      content: "Compare forecasted temperatures between cities",
    },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const cities = url.searchParams.getAll("location");
  console.log("Requested cities:", cities); // Log for debugging
  const dataPromises = cities.map((city) => {
    const [lat, lon] = city.split(",");
    const cityObj: {
      lat?: string;
      lon?: string;
    } = {
      lat: lat,
      lon: lon,
    };
    return fetchWeather(
      parseFloat(cityObj.lat || "0"),
      parseFloat(cityObj.lon || "0"),
    ).catch((error) => {
      console.log(error, "error here");
      return null;
    });
  });
  const results = await Promise.all(dataPromises);
  return json({ results });
};

function CityInput({ index, onUpdate, onRemove }: CityInputProps) {
  const { ref: autocompleteRef } = useCityAutocomplete(index, onUpdate);

  return (
    <div className="relative flex items-center">
      <input
        id={`city${index}`}
        type="text"
        placeholder="Enter city and state"
        className="flex h-9 w-full max-w-60 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        //@ts-expect-error ref is not a valid prop for input
        ref={autocompleteRef}
        autoComplete="new-password"
      />
      <Button
        type="button"
        onClick={() => onRemove(index)}
        extraClasses="text-xs px-2 py-1 bg-secondary text-red-500 hover:text-red-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 12.586l-4.95 4.95-1.414-1.414L8.586 11 3.636 6.05l1.414-1.414L10 9.172l4.95-4.95 1.414 1.414L11.414 11l4.95 4.95-1.414 1.414L10 12.586z"
          />
        </svg>
      </Button>
    </div>
  );
}

// Use lat and lon to fetch weather data from the OpenWeather API
async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=currently,minutely,alerts,current&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    );
    if (!weatherResponse.ok) {
      throw new Error(
        `OneCall API call failed with status: ${weatherResponse.status}`,
      );
    }
    const weatherData = await weatherResponse.json();

    // Use reverse geocoding to get the city name for chart legend
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    );
    if (!geoResponse.ok) {
      throw new Error(`Geo API call failed with status: ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();

    // Convert temperature from Kelvin to Fahrenheit for each forecast
    weatherData.list = weatherData.daily.map((forecast: ForecastItem) => {
      const forecastItem = {
        ...forecast,
        main: {
          ...forecast.main,
          temp:
            Math.round((((forecast.temp.max - 273.15) * 9) / 5 + 32) * 10) / 10, // Convert to Fahrenheit and round to nearest 10th
        },
      };
      return forecastItem;
    });

    weatherData.cityName = geoData[0]?.name;
    console.log(weatherData, "weatherData");
    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null; // Return null or a default object to handle errors gracefully
  }
}

function useCityAutocomplete(
  index: number,
  updateCity: (index: number, lat: number, lon: number) => void,
) {
  const ENV = useEnv();
  return usePlacesWidget({
    apiKey: ENV.GOOGLE_MAPS_API_KEY,
    options: {
      types: ["locality"],
      fields: ["geometry.location"],
    },
    onPlaceSelected: (place) => {
      updateCity(
        index,
        place.geometry.location.lat(),
        place.geometry.location.lng(),
      );
    },
  });
}

export default function Index() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { results: forecastData } = useLoaderData<typeof loader>();
  const [cities, setCities] = useState<City[]>([
    { lat: 0, lon: 0 },
    { lat: 0, lon: 0 },
  ]);

  const [showSevenDays, setShowSevenDays] = useState(false); // State to toggle forecast duration
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph"); // State to toggle between graph and table view
  const toggleViewMode = () => {
    setViewMode(viewMode === "graph" ? "table" : "graph");
  };

  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const queryParams = new URLSearchParams();
  //   cities.forEach(({ lat, lon }) => {
  //     queryParams.append("location", `${lat},${lon}`);
  //   });
  //   navigate(`/?${queryParams}`);
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    let hasError = false;

    cities.forEach(({ lat, lon }, index) => {
      const cityInput = document.getElementById(
        `city${index}`,
      ) as HTMLInputElement;
      const cityValue = cityInput.value.trim();

      if (cityValue && cityValue.split(",").length < 2) {
        console.log(cityValue, "valuez");
        hasError = true;
        cityInput.setCustomValidity(
          "Please enter a valid city from the dropdown menu",
        );
      } else {
        queryParams.append("location", `${lat},${lon}`);
      }
    });

    if (hasError) {
      // Handle error display logic here
    } else {
      navigate(`/?${queryParams}`);
    }
  };

  const addCityInput = () => {
    const newCities = [...cities, { lat: 0, lon: 0 }];
    setCities(newCities);
  };

  const updateCity = (index: number, lat: number, lon: number) => {
    setCities((prevCities) => {
      const updatedCities = prevCities.map((city, cityIndex) => {
        if (cityIndex === index) {
          return { lat, lon };
        }
        return city;
      });
      return updatedCities;
    });
  };

  const removeCity = (index: number) => {
    const newCities = cities.filter((_, i) => i !== index);
    setCities(newCities);
  };

  const toggleForecastDuration = () => {
    setShowSevenDays(!showSevenDays);
  };

  // Process forecast data for the LineChart component
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
        Forecast Comparison
      </h1>
      <form
        className="flex flex-wrap gap-2 lg:flex-nowrap"
        onSubmit={handleSubmit}
      >
        {cities.map((city, index) => {
          return (
            <div key={index} className="relative flex items-center">
              <CityInput
                city={city}
                index={index}
                onUpdate={updateCity}
                onRemove={removeCity}
              />
            </div>
          );
        })}
        <Button
          type="button"
          onClick={addCityInput}
          extraClasses="mr-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-secondary-foreground/90"
        >
          Add City
        </Button>
        <Button
          extraClasses="bg-sky-600 hover:bg-sky-700"
          disabled={navigation.state === "loading"}
          type="submit"
        >
          {navigation.state === "loading" ? (
            <>
              Fetching
              <svg
                className="ml-2 h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"
                viewBox="0 0 24 24"
              ></svg>
            </>
          ) : (
            "Fetch Forecast"
          )}
        </Button>
      </form>

      <div className="flex gap-4 pb-2">
        <Button
          extraClasses="mt-4 bg-white text-secondary-foreground hover:bg-secondary"
          type="button"
          onClick={toggleForecastDuration}
        >
          {showSevenDays ? "Show 3 Days" : "Show 7 Days"}
        </Button>
        <Button
          extraClasses="mt-4 bg-white text-secondary-foreground hover:bg-secondary"
          type="button"
          onClick={toggleViewMode}
        >
          {viewMode === "graph" ? "Show Table View" : "Show Graph View"}
        </Button>
      </div>
      <div className="h-full">
        {forecastData.length > 0 &&
          (viewMode === "graph" ? (
            <LineChart data={lineGraphData} />
          ) : (
            <ForecastTable
              forecastData={forecastData}
              showSevenDays={showSevenDays}
            />
          ))}
      </div>
    </div>
  );
}
