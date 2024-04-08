import { json, LinksFunction, SerializeFrom } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "@/globals.css?url";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export function loader() {
  const ENV = {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,
  };
  return json({ ENV });
}
export type LoaderData = SerializeFrom<typeof loader>;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
