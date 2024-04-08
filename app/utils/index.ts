// Abstracted function to find the highest temperature for each day
export function getDailyHighs(
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
      x: new Date(highestTempForecast.dt * 1000).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      y: highestTempForecast.main.temp,
    };
  });
}
