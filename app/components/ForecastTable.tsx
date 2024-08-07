import { Forecast } from "@/types";
import { getDailyHighs } from "@/utils";

interface ForecastTableProps {
  forecastData: Forecast[];
  showSevenDays: boolean;
}

export default function ForecastTable({
  forecastData,
  showSevenDays,
}: ForecastTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-4 w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              City
            </th>
            {showSevenDays ? (
              <>
                {forecastData[0]?.list.slice(0, 7).map((day, index) => (
                  <th
                    scope="col"
                    key={index}
                    className="px-6 py-3 pl-0 text-left"
                  >
                    {new Date(day?.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </>
            ) : (
              <>
                {forecastData[0]?.list.slice(0, 3).map((day, index) => (
                  <th
                    scope="col"
                    key={index}
                    className="px-6 py-3 pl-0 text-left"
                  >
                    {new Date(day?.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                ))}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {forecastData.map((cityData) => {
            const dailyHighs = getDailyHighs(cityData?.list);
            const filteredHighs = dailyHighs.filter((_, index) =>
              showSevenDays ? index < 7 : index < 3,
            );
            return (
              <tr key={cityData?.lat}>
                <th scope="row" className="px-6 py-4">
                  {cityData.cityName}
                </th>
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
    </div>
  );
}
