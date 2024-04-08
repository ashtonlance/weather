import useWindowSize from "@/hooks/useWindowsize"; // Assuming you have a custom hook for getting window size
import { ResponsiveLine, Serie } from "@nivo/line";

interface LineChartProps {
  data: Serie[];
}

export default function LineChart({ data }: LineChartProps) {
  const { width } = useWindowSize(); // Get the window width
  const isMobile = width < 800; // Check if the screen is mobile

  return (
    <div className="h-[500px]">
      <ResponsiveLine
        data={data}
        animate
        enableSlices="x"
        margin={{
          top: 50,
          right: isMobile ? 25 : 150,
          bottom: isMobile ? 200 : 50,
          left: 30,
        }}
        xFormat="time:%Y-%m-%d"
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day",
          useUTC: false,
        }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        axisBottom={{
          format: "%b %d",
          legend: "Date",
          legendOffset: -12,
          tickSize: 5,
          tickPadding: 5,
          tickValues: "every 1 day",
        }}
        axisLeft={{
          legend: "Temperature (°F)",
          legendOffset: 12,
        }}
        colors={{ scheme: "nivo" }}
        theme={{
          tooltip: {
            container: {
              color: "var(--background)",
            },
          },
          labels: {
            text: {
              color: "var(--background)",
            },
          },
          text: {
            fontSize: 14,
          },
          axis: {
            domain: {
              line: {
                stroke: "var(--accent)",
              },
            },
            ticks: {
              line: {
                stroke: "var(--accent)",
              },
              text: {
                color: "var(--foreground)",
              },
            },
            legend: {
              text: {
                color: "var(--primary)",
              },
            },
          },
        }}
        curve="monotoneX"
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        useMesh={true}
        legends={[
          {
            anchor: isMobile ? "bottom" : "bottom-right", // Adjust anchor based on screen width
            direction: isMobile ? "column" : "column",
            translateX: isMobile ? -100 : 100,
            translateY: isMobile ? 150 : 0,
            itemsSpacing: 2,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
}
