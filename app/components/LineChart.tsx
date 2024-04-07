import { ResponsiveLine, Serie } from "@nivo/line";

interface LineChartProps {
  data: Serie[];
}

export default function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveLine
      data={data}
      animate
      enableSlices="x"
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      axisBottom={{
        // format: "%b %d",
        legend: "Date",
        legendOffset: -12,
        tickValues: "every 2 days",
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
      curve="natural"
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabel="y"
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
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
  );
}
