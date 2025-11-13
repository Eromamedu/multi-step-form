// weather.jsx
import React, { useEffect, useState } from "react";
import { ReactComponent as Logo } from "../assets/images/logo.svg";
import { ReactComponent as Units } from "../assets/images/icon-units.svg";
import Sunny from "../assets/images/icon-sunny.webp" ;
import { FaAngleDown } from "react-icons/fa";

/**
 * WeatherApp
 *
 * Requirements implemented:
 * - Search for a location (uses Open-Meteo geocoding);
 * - Fetch current, hourly, and daily data from Open-Meteo
 * - Toggle Metric/Imperial units
 * - Show current conditions + hourly + 7-day forecast
 * - Select a day to view hourly forecast for that day
 *
 * Note: Open-Meteo allows client-side calls (no API key). CORS is allowed.
 * Replace icons and fine-tune styling as needed.
 */

export default function WeatherApp() {
  // UI state
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState({ name: "Berlin, Germany", lat: 52.52, lon: 13.405 });
  const [units, setUnits] = useState("metric"); // "metric" | "imperial"
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Weather data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState([]); // [{time, temp, humidity, precipitation, wind, weathercode}]
  const [daily, setDaily] = useState([]);   // [{date, max, min, precipitation, weathercode}]
  // timezone we'll use for requests (browser timezone)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // helper for mapping Open-Meteo weathercode to emoji (swap for images/SVGs)
  const weatherCodeToEmoji = (code) => {
    // mapping simplified from Open-Meteo definitions
    if (code >= 0 && code <= 1) return "☀️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌧️";
    if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌤️";
  };

  // Convert temperature/wind/precip client-side when needed
  const toDisplayTemp = (celsius) => (units === "metric" ? round(celsius) : round(celsius * 9 / 5 + 32));
  const toDisplayWind = (mps) => {
    // Open-meteo returns windspeed_10m in m/s if not asked otherwise.
    // We'll assume m/s and convert: m/s -> km/h (= *3.6) or mph (= *2.23694)
    if (units === "metric") return `${round(mps * 3.6)} km/h`;
    return `${round(mps * 2.23694)} mph`;
  };
  const toDisplayPrecip = (mm) => (units === "metric" ? `${round(mm)} mm` : `${round(mm / 25.4)} in`);

  function round(n) {
    if (n === null || n === undefined) return "-";
    return Math.round(n);
  }

  // Build Open-Meteo forecast URL. We request hourly fields we need and daily summary.
  const buildForecastUrl = (lat, lon) => {
    // we request: temperature_2m, relativehumidity_2m, precipitation, weathercode, windspeed_10m
    // daily: temp max/min, weathercode, precipitation_sum
    const hourly = ["temperature_2m", "relativehumidity_2m", "precipitation", "weathercode", "windspeed_10m"].join(",");
    const dailyParams = ["weathercode", "temperature_2m_max", "temperature_2m_min", "precipitation_sum"].join(",");

    // Open-Meteo accepts temperature_unit and windspeed_unit query params; we'll still convert client-side to be safe.
    // But we include them to reduce conversions for current_weather when possible.
    const temperature_unit = units === "metric" ? "celsius" : "fahrenheit";
    const windspeed_unit = units === "metric" ? "kmh" : "mph";

    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${encodeURIComponent(tz)}&hourly=${hourly}&daily=${dailyParams}&current_weather=true&temperature_unit=${temperature_unit}&windspeed_unit=${windspeed_unit}`;
  };

  // Geocode helper: uses Open-Meteo geocoding API
  const geocodePlace = async (place) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error("Place not found");
    return data.results[0]; // take first result
  };

  const fetchWeather = async (lat, lon, displayName) => {
    // setLoading(true);
    // setError("");
    // try {
    //   const url = buildForecastUrl(lat, lon);
    //   const res = await fetch(url);
    //   if (!res.ok) throw new Error("Weather API error");
    //   const data = await res.json(); err

      // current
      const cw = data.current_weather || null;

      // hourly arrays — convert into objects keyed by ISO time for easier slicing
      const h = [];
      if (data.hourly) {
        const { time = [], temperature_2m = [], relativehumidity_2m = [], precipitation = [], weathercode = [], windspeed_10m = [] } = data.hourly;
        for (let i = 0; i < time.length; i++) {
          h.push({
            time: time[i],
            tempC: temperature_2m[i],
            humidity: relativehumidity_2m[i],
            precipitation: precipitation[i],
            weathercode: weathercode[i],
            wind: windspeed_10m[i],
          });
        }
      }

      // daily arrays
      const d = [];
      if (data.daily) {
        const { time = [], temperature_2m_max = [], temperature_2m_min = [], precipitation_sum = [], weathercode = [] } = data.daily;
        for (let i = 0; i < time.length; i++) {
          d.push({
            date: time[i],
            maxC: temperature_2m_max[i],
            minC: temperature_2m_min[i],
            precipitationSum: precipitation_sum[i],
            weathercode: weathercode[i],
          });
        }
      }

      setCurrent({
        ...cw,
        displayName,
        // if API provided temperature in chosen units we can keep numeric C? we'll store Celsius value if available or compute:
        tempC: cw && cw.temperature !== undefined && units === "metric" ? cw.temperature : (cw && cw.temperature !== undefined && units === "imperial" ? (cw.temperature - 32) * (5 / 9) : null),
        weathercode: cw ? cw.weathercode : null,
        wind_mps: cw && cw.windspeed !== undefined ? (units === "metric" ? cw.windspeed / 3.6 : cw.windspeed / 2.23694) : null, // normalize to m/s
      });

      setHourly(h);
      setDaily(d);
      setSelectedDayIndex(0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch for default location
  useEffect(() => {
    fetchWeather(location.lat, location.lon, location.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]); // re-run when units change to get unit-specific fields (if supported by API)

  // user triggers search
  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const place = await geocodePlace(query);
      const displayName = `${place.name}${place.admin1 ? ", " + place.admin1 : ""}${place.country ? ", " + place.country : ""}`;
      setLocation({ name: displayName, lat: place.latitude, lon: place.longitude });
      await fetchWeather(place.latitude, place.longitude, displayName);
    } catch (err) {
      console.error(err);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const toggleUnits = () => setUnits((u) => (u === "metric" ? "imperial" : "metric"));

  // filter hourly for the selected day
  const hourlyForSelectedDay = () => {
    if (!hourly || hourly.length === 0 || !daily[selectedDayIndex]) return [];
    const targetDate = daily[selectedDayIndex].date; // e.g. "2025-08-05"
    // only include hours starting with targetDate
    return hourly.filter((h) => h.time.startsWith(targetDate));
  };

  // small UI helpers
  const formatDateFriendly = (isoDate) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString(undefined, { weekday: "short" }); // "Tue"
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="app">
      <div className="weather-container">
        {/* HEADER */}
        <div className="header">
          <div className="brand">
            <Logo />
          </div>
          <button
            className="unit-btn"
            onClick={toggleUnits}
            title={`Switch to ${units === "metric" ? "Imperial" : "Metric"}`}
          >
            <Units /> {units === "metric" ? "Metric" : "Imperial"} <FaAngleDown />
          </button>
        </div>

        {/* TITLE */}
        <h1 className="title">How’s the sky looking today?</h1>

        {/* SEARCH BAR */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search for a place..."
            aria-label="Search for a place"
          />
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Search"}
          </button>
        </form>

        {/* show error */}
        {error && <div style={{ color: "#ffb4b4", textAlign: "center", marginBottom: 8 }}>{error}</div>}

        <div className="main-content">
          {/* LEFT SIDE */}
          <div className="left-section">
            <div className="main-box">
              <div className="weather-degree">
                <div className="location-info">
                  <p className="city">{current?.displayName ?? location.name}</p>
                  <p className="date">{current ? new Date().toLocaleString() : "—"}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="weather-icon" aria-hidden>
                    {/* swap for mapped icon if you want */}
                    <img src={Sunny} alt="" style={{ width: "120px" }} />
                  </div>

                  <p className="temp">
                    {current ? `${toDisplayTemp(current.tempC ?? (hourly[0]?.tempC ?? 0))}°` : "—"}
                  </p>
                </div>
              </div>

              <div className="info-grid">
                <div className="feels-like">
                  <p>Feels Like</p>
                  <h3>
                    {current
                      ? `${toDisplayTemp(
                          // approximate feels-like by using current temp; for real feels-like you'd request apparent_temperature from Open-Meteo
                          current.tempC ?? (hourly[0]?.tempC ?? 0)
                        )}°`
                      : "—"}
                  </h3>
                </div>

                <div className="feels-like">
                  <p>Humidity</p>
                  <h3>{hourly[0] ? `${round(hourly[0].humidity)}%` : "—"}</h3>
                </div>

                <div className="feels-like">
                  <p>Wind</p>
                  <h3>{current ? toDisplayWind(current.wind_mps ?? (hourly[0]?.wind ?? 0)) : "—"}</h3>
                </div>

                <div className="feels-like">
                  <p>Precipitation</p>
                  <h3>{hourly[0] ? toDisplayPrecip(hourly[0].precipitation ?? 0) : "—"}</h3>
                </div>
              </div>

              <div className="daily-forecast" aria-hidden>
                {daily.length === 0 ? (
                  <div style={{ color: "#aaa" }}>Loading 7-day forecast…</div>
                ) : (
                  daily.slice(0, 7).map((dItem, idx) => (
                    <div
                      className="day"
                      key={dItem.date}
                      onClick={() => setSelectedDayIndex(idx)}
                      style={{
                        cursor: "pointer",
                        outline: selectedDayIndex === idx ? "2px solid rgba(255,255,255,0.12)" : "none",
                      }}
                      title={dItem.date}
                    >
                      <p>{formatDateFriendly(dItem.date)}</p>
                      <span className="icon">{weatherCodeToEmoji(dItem.weathercode)}</span>
                      <p className="small" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span>{toDisplayTemp(dItem.maxC)} </span>
                        <span style={{ opacity: 0.8 }}>{toDisplayTemp(dItem.minC)}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-section">
            <div className="hourly-header">
              <p>Hourly forecast</p>
              <select
                value={selectedDayIndex}
                onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                aria-label="Choose day"
              >
                {daily.map((d, i) => (
                  <option key={d.date} value={i}>
                    {new Date(d.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="hourly-list">
              {hourlyForSelectedDay().length === 0 ? (
                <div style={{ color: "#ddd", textAlign: "center" }}>No hourly data</div>
              ) : (
                hourlyForSelectedDay().map((h) => (
                  <div className="hour" key={h.time}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <p>{weatherCodeToEmoji(h.weathercode)}</p>
                      <span>{new Date(h.time).toLocaleTimeString(undefined, { hour: "numeric", minute: undefined })}</span>
                    </div>
                    <p>{toDisplayTemp(h.tempC)}°</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













// import React, { useState } from "react";
// import {ReactComponent as Logo} from '../assets/images/logo.svg';
// import {ReactComponent as Units} from '../assets/images/icon-units.svg';
// import  Sunny from '../assets/images/icon-sunny.webp';
// import {FaAngleDown} from "react-icons/fa";

// // Single-file React component (Tailwind CSS required in your project)
// // Default export: WeatherApp

// export default function WeatherApp() {
//   // const [query, setQuery] = useState("Berlin, Germany");
//   // // mock data - replace with API calls when ready
//   // const weather = {
//   //   location: query,
//   //   date: "Tuesday, Aug 5, 2025",
//   //   temp: 20,
//   //   feelsLike: 18,
//   //   humidity: 46,
//   //   wind: "14 km/h",
//   //   precipitation: "0 mm",
//   //   hourly: [
//   //     { time: "3 PM", icon: "cloud", t: 20 },
//   //     { time: "4 PM", icon: "cloud-sun", t: 20 },
//   //     { time: "5 PM", icon: "sun", t: 20 },
//   //     { time: "6 PM", icon: "cloud", t: 19 },
//   //     { time: "7 PM", icon: "cloud", t: 19 },
//   //   ],
//   // };

//     return (
//     <div className="app">
//       <div className="weather-container">
//         {/* HEADER */}
//         <div className="header">
//           <div className="brand">
//             <Logo/>
//           </div>
//           <button className="unit-btn"><Units/>Units <FaAngleDown/></button>
//         </div>

//         {/* TITLE */}
//         <h1 className="title">How’s the sky looking today?</h1>

//         {/* SEARCH BAR */}
//         <div className="search-bar">
//           <input type="text" placeholder="Search for a place..." />
//           <button>Search</button>
//         </div>

//         <div className="main-content">
//           {/* LEFT SIDE */}
//           <div className= "left-section">
//             <div className="main-box">
//               <div className="weather-degree">
//               <div className="location-info">
//                 <p className="city"> Berlin,Germany </p>
//                 <p className="date">Tuesday, Aug 5, 2025</p>
//               </div>
//               <div style={{ display:"flex", alignItems:"center", justifyContents:"center",  gap:"10px"}}>
//               <div className="weather-icon"><img src={Sunny} alt="" style={{width:"120px"}}/></div>
//               <p className="temp">20°</p>
//               </div>
//               </div>

//               <div className="info-grid">
//                 <div className="feels-like">
//                   <p>Feels Like</p>
//                   <h3>18°</h3>
//                 </div>
//                 <div className="feels-like">
//                   <p>Humidity</p>
//                   <h3>46%</h3>
//                 </div>
//                 <div className="feels-like">
//                   <p>Wind</p>
//                   <h3>14 km/h</h3>
//                 </div>
//                 <div className="feels-like" >
//                   <p>Precipitation</p>
//                   <h3>0 mm</h3>
//                 </div>
//               </div>
//                   {/* <label> Daily Forecast</label> */}
//               <div className="daily-forecast">
//                 {[
//                   ["Tue", "🌧️", "20°", "14°"],
//                   ["Wed", "🌧️", "21°", "15°"],
//                   ["Thu", "☀️", "24°", "14°"],
//                   ["Fri", "⛅", "25°", "13°"],
//                   ["Sat", "🌩️", "21°", "15°"],
//                   ["Sun", "🌧️", "25°", "16°"],
//                   ["Mon", "🌫️", "24°", "15°"],
//                 ].map(([day, icon, high, low]) => (
//                   <div className="day" key={day}>
//                     <p>{day}</p>
//                     <span className="icon"> {icon} </span>
//                     <p className="small" style={{display:"flex", justifyContents:"space-between"}}>
//                       {high}   {low}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="right-section">
//             <div className="hourly-header">
//               <p>Hourly forecast</p>
//               <select>
//                 <option>Tuesday</option>
//               </select>
//             </div>
//             <div className="hourly-list">
//               {[
//                 ["3 PM", "☁️", "20°"],
//                 ["4 PM", "⛅", "20°"],
//                 ["5 PM", "☀️", "20°"],
//                 ["6 PM", "☁️", "19°"],
//                 ["7 PM", "🌤️", "18°"],
//                 ["8 PM", "🌧️", "18°"],
//                 ["9 PM", "🌧️", "17°"],
//                 ["10 PM", "🌧️", "17°"],
//               ].map(([time, icon, temp]) => (
//                 <div className="hour" key={time}>
//                   <div style={{display:"flex", alignItems:"center", gap:"7px"}}>
//                   <p>{icon}</p>
//                   <span>{time}</span>
//                   </div>
//                   <p>{temp}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   ); }

//   // return (
//   //   <div className="Weatherapp">
//   //       <header className="lg:col-span-12 text-center">
//   //         <Logo/>
//   //         <h1 className="text-4xl lg:text-5xl font-extrabold drop-shadow-lg">
//   //           How's the sky looking today?
//   //         </h1>
//   //       </header>
//   //       </div>
//   // )
//         {/* <main className="lg:col-span-8 space-y-6">

//           <div className="flex items-center justify-center lg:justify-start gap-4">
//             <div className="relative w-full max-w-xl">
//               <span className="absolute inset-y-0 left-3 flex items-center opacity-60">
//                 🔍
//               </span>
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Search for a place..."
//               />
//             </div>
//             <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">
//               Search
//             </button>
//           </div>
//           <section className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-8 shadow-2xl text-slate-50">
//             <div className="flex items-center justify-between gap-6">
//               <div>
//                 <h2 className="text-xl font-semibold">{weather.location}</h2>
//                 <p className="text-sm opacity-90">{weather.date}</p>
//               </div>

//               <div className="flex items-center gap-6">
//                 <div className="text-right">
//                   <div className="text-6xl font-extrabold leading-none">
//                     {weather.temp}°
//                   </div>
//                 </div>

//                 <div className="w-20 h-20 flex items-center justify-center">
//                   <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16">
//                     <circle
//                       cx="12"
//                       cy="12"
//                       r="4"
//                       fill="rgba(255,255,255,0.95)"
//                     />
//                     <g stroke="rgba(255,255,255,0.7)" strokeWidth="1.2">
//                       <path d="M12 1v2" />
//                       <path d="M12 21v2" />
//                       <path d="M4.2 4.2l1.4 1.4" />
//                       <path d="M18.4 18.4l1.4 1.4" />
//                       <path d="M1 12h2" />
//                       <path d="M21 12h2" />
//                       <path d="M4.2 19.8l1.4-1.4" />
//                       <path d="M18.4 5.6l1.4-1.4" />
//                     </g>
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
//               <StatCard title="Feels Like" value={`${weather.feelsLike}°`} />
//               <StatCard title="Humidity" value={`${weather.humidity}%`} />
//               <StatCard title="Wind" value={weather.wind} />
//               <StatCard title="Precipitation" value={weather.precipitation} />
//             </div>
//           </section>

//           <div className="lg:hidden">
//             <HourlyPanel hourly={weather.hourly} />
//           </div>
//         </main>
//         <aside className="lg:col-span-4 hidden lg:block">
//           <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-semibold">Hourly forecast</h3>
//               <select className="bg-slate-700 text-sm rounded-md px-2 py-1">
//                 <option>Tuesday</option>
//               </select>
//             </div>

//             <div className="space-y-3">
//               {weather.hourly.map((h) => (
//                 <div
//                   key={h.time}
//                   className="flex items-center justify-between bg-slate-900/20 p-3 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-md">
//                       {hourIcon(h.icon)}
//                     </div>
//                     <div className="text-sm opacity-90">{h.time}</div>
//                   </div>
//                   <div className="font-medium">{h.t}°</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="mt-6 hidden lg:block">
//             <div className="grid grid-cols-2 gap-3">
//               <MiniStat title="UV Index" value="3" />
//               <MiniStat title="Visibility" value="10 km" />
//             </div>
//           </div>
//         </aside>

//         {/* Footer / caption */}
//         {/* <footer className="lg:col-span-12 text-center opacity-60 text-sm mt-6">
//           Image-style weather UI recreated with Tailwind — connect a real
//           weather API to replace mock data.
//         </footer>
//       </div> */} 
//     // </div>
//   // );
// // }

// // function StatCard({ title, value }) {
// //   return (
// //     <div className="bg-slate-800/30 p-4 rounded-xl">
// //       <div className="text-xs opacity-80">{title}</div>
// //       <div className="text-lg font-semibold">{value}</div>
// //     </div>
// //   );
// // }

// // function MiniStat({ title, value }) {
// //   return (
// //     <div className="bg-slate-800/30 p-3 rounded-lg text-center">
// //       <div className="text-xs opacity-80">{title}</div>
// //       <div className="text-lg font-semibold">{value}</div>
// //     </div>
// //   );
// // }

// // function HourlyPanel({ hourly }) {
// //   return (
// //     <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
// //       <h4 className="font-semibold mb-3">Hourly</h4>
// //       <div className="flex gap-3 overflow-x-auto">
// //         {hourly.map((h) => (
// //           <div
// //             key={h.time}
// //             className="min-w-[90px] bg-slate-900/20 p-3 rounded-lg text-center"
// //           >
// //             <div className="text-sm opacity-90">{h.time}</div>
// //             <div className="mt-2">{hourIcon(h.icon)} </div>
// //             <div className="mt-2 font-medium">{h.t}° </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // function hourIcon(name) {
// //   if (name === "sun") return <div className="text-2xl">☀️</div>;
// //   if (name === "cloud") return <div className="text-2xl">☁️</div>;
// //   if (name === "cloud-sun") return <div className="text-2xl">⛅</div>;
// //   return <div className="text-2xl">🌤️</div>;
// // }
