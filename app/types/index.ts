export interface Forecast {
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
export interface LineGraphData {
  id: string | number;
  data: Array<{ x: string; y: number }>;
}
export interface WeatherData {
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
