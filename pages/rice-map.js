import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

import { VariableSelector } from "@components/VariableSelector";
import { DateSelector } from "@components/DateSelector";
import { TimeIntervalSelector } from "@components/TimeIntervalSelector";
import { AdminLevelSelector } from "@components/AdminLevelSelector";
import { DashTop } from "@components/DashTop";
// Import the loading components
import {
    LoadingSpinner,
    MapLoadingOverlay,
    DataLoadingIndicator
} from "@components/LoadingSpinner";

const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false, loading: () => <p>Loading map...</p> }
);

const ChartComponent = dynamic(
    () =>
        import("../components/ChartComponent").then(
            (mod) => mod.ChartComponent
        ),
    { ssr: false }
);

const D3TimeSeriesChart = dynamic(
    () =>
        import("@components/D3TimeSeriesChart").then(
            (mod) => mod.D3TimeSeriesChart
        ),
    { ssr: false }
);

const DashMapTif = dynamic(
    () => import("../components/DashMapTif/DashMapTif"),
    {
        ssr: false,
        loading: () => <MapLoadingOverlay isLoading={true} />
    }
);

export default function Home() {
    // Add loading state variables
    const [isLoading, setIsLoading] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(
        "Loading application..."
    );

    // Existing state variables
    const [spi, setSpi] = useState("0");
    const [lastUpdated, setLastUpdated] = useState("15/07/2024");
    const [currData, setCurrData] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarTextVisible, setSidebarTextVisible] = useState(true);

    const [mapNullCheck, setMapNullCheck] = useState(false);
    const [errorMessage, setErrorMessage] = useState("ERROR MESSAGE TEST");

    const [options, setOptions] = useState({
        varType: "Yield",
        region: "SEA",
        overview: "forecast",
        adminLevel: "Grid",
        dateType: "Monthly",
        date: "202504"
    });

    const geoJsonLayerRef = useRef(null);
    const [geojsonData, setGeojsonData] = useState(null);
    const geoRasterLayerRef = useRef(null);
    const [geoRasterData, setGeoRasterData] = useState(null);
    const [mapData, setMapData] = useState(null);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);

    const [selectedDate, setSelectedDate] = useState("20100101");
    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedMonth, setSelectedMonth] = useState("04");
    const [selectedDay, setSelectedDay] = useState("01");

    const [selectedYearEnd, setSelectedYearEnd] = useState("2000");
    const [selectedMonthEnd, setSelectedMonthEnd] = useState("01");
    const [selectedDayEnd, setSelectedDayEnd] = useState("01");

    // Close initial loading after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setInitialLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Updated fetch data function with loading states
    const fetchData = useCallback(async () => {
        const { varType, region, overview, adminLevel, dateType } = options;
        console.log(`${varType}_${dateType}_${adminLevel}_${region}`);

        // Set loading states
        setDataLoading(true);
        setLoadingMessage(`Loading ${varType} data for ${region}...`);

        try {
            // Generate request URL
            const url = `/api/get_data?varType=${options.varType}&dateType=${options.dateType}&adminLevel=${options.adminLevel}&region=${options.region}&overview=${options.overview}&selectedDate=${selectedDate}`;

            // Set map loading state
            setMapLoading(true);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch data: ${response.status} ${response.statusText}`
                );
            }

            if (adminLevel === "Grid") {
                console.log("Response URL:", response);
                setGeoRasterData({
                    data: await response.arrayBuffer(),
                    url: response.url,
                    datatype: "geotiff"
                });
                setMapData({
                    url: response.url,
                    datatype: "geotiff",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                setSelectedProvince(null);
                setTimeSeries([]);
            } else {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                setSelectedProvince(null);
                setTimeSeries([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMessage(`Failed to load data: ${error.message}`);
            // Keep error message visible longer for user to read
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            // Reset loading states
            setDataLoading(false);
            // Delay turning off map loading for smoother UX
            setTimeout(() => setMapLoading(false), 500);
        }
    }, [options, selectedDate]);

    // Format selected date for display
    useEffect(() => {
        let formattedDate = selectedYear;
        if (options.dateType === "Monthly") {
            formattedDate = `${selectedYear}${selectedMonth}`;
        } else if (options.dateType === "Daily") {
            formattedDate = `${selectedYear}${selectedMonth}${selectedDay}`;
        }

        setSelectedDate(formattedDate);
        setOptions((prev) => ({ ...prev, date: formattedDate }));
    }, [selectedYear, selectedMonth, selectedDay, options.dateType]);

    // Handle sidebar visibility
    useEffect(() => {
        if (!sidebarOpen) {
            setSidebarTextVisible(false);
        } else {
            setTimeout(() => setSidebarTextVisible(true), 300);
        }
    }, [sidebarOpen]);

    // Error message handling
    useEffect(() => {
        if (options.dateType === "Daily") {
            setErrorMessage(
                "Daily data is under development, please check and select again"
            );
        } else if (
            options.overview === "forecast" &&
            options.varType.startsWith("SPI") &&
            (options.dateType !== "Monthly" || options.adminLevel !== "Grid")
        ) {
            setErrorMessage(
                "Note that only 'Monthly' and 'Grid' SPI forecast data is available currently"
            );
        } else if (
            options.adminLevel === "Grid" &&
            options.dateType === "Yearly" &&
            (options.varType === "Prcp" || options.varType === "Temp") &&
            (Number(selectedDate) > 2010 || Number(selectedDate) < 1990)
        ) {
            setErrorMessage(
                "Grid data for this varType is only available for 1990-2010, please check and select again"
            );
        } else if (
            options.adminLevel === "Prov" &&
            options.region === "SEA" &&
            options.varType === "Yield"
        ) {
            setErrorMessage(
                "There is no individual country data, please select region-SEA for country-wide details"
            );
        } else if (
            options.adminLevel === "Country" &&
            options.varType !== "Prcp" &&
            options.varType !== "Temp" &&
            options.varType !== "Yield"
        ) {
            setErrorMessage(
                "There is no country data for this variable type, please check and select again"
            );
        }

        // Clear error message after a delay
        const timer = setTimeout(() => setErrorMessage(""), 5000);
        return () => clearTimeout(timer);
    }, [options, geojsonData, geoRasterData, selectedDate]);

    // Fetch data when options change
    useEffect(() => {
        console.log("Re-fetch start.");
        fetchData();
    }, [fetchData]);

    // Update GeoJSON layer
    useEffect(() => {
        console.log("geoJsonLayerRef.current:", geoJsonLayerRef.current);
        if (geoJsonLayerRef.current && geojsonData) {
            console.log("GeoJSONLayer instance:", geoJsonLayerRef.current);
            geoJsonLayerRef.current.clearLayers();
            geoJsonLayerRef.current.addData(geojsonData);
        }
    }, [geojsonData]);

    // Update GeoTIFF layer
    useEffect(() => {
        if (geoRasterLayerRef.current && geoRasterData) {
            console.log("GeoRasterLayer instance:", geoRasterLayerRef.current);
            geoRasterLayerRef.current.clearLayers();
            geoRasterLayerRef.current.addData(geoRasterData);
        }
    }, [geoRasterData]);

    // Update options function
    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const [selectedFeature, setSelectedFeature] = useState(null);

    // Enhanced time series data extraction that handles both historical and forecast data
    useEffect(() => {
        if (selectedFeature) {
            const { properties } = selectedFeature;

            // Check for different data patterns
            const historicalKeys = Object.keys(properties).filter(
                (key) => /^y\d+$/.test(key) && !/^y\d+_\d+$/.test(key)
            );

            const forecastKeys = Object.keys(properties).filter((key) =>
                /^y\d+_\d+$/.test(key)
            );

            let extractedData = [];

            // Process data based on the detected pattern
            if (historicalKeys.length > 0) {
                // Historical data pattern (y1990, y2000, etc.)
                console.log(
                    "Detected historical data pattern:",
                    historicalKeys
                );

                extractedData = historicalKeys
                    .map((key) => {
                        const year = parseInt(key.substring(1), 10);
                        const value = properties[key];
                        return {
                            year,
                            value:
                                typeof value === "number"
                                    ? value
                                    : parseFloat(value)
                        };
                    })
                    .filter(
                        (item) =>
                            item.value !== null &&
                            item.value !== undefined &&
                            !isNaN(item.value)
                    );

                // Sort data chronologically
                extractedData.sort((a, b) => a.year - b.year);
            } else if (forecastKeys.length > 0) {
                // Forecast data with ensembles pattern (y2025_1, y2025_2, etc.)
                console.log("Detected forecast data pattern:", forecastKeys);

                extractedData = forecastKeys
                    .map((key) => {
                        const match = key.match(/^y(\d+)_(\d+)$/);
                        if (match) {
                            return {
                                year: parseInt(match[1], 10),
                                ensemble: parseInt(match[2], 10),
                                value:
                                    typeof properties[key] === "number"
                                        ? properties[key]
                                        : parseFloat(properties[key])
                            };
                        }
                        return null;
                    })
                    .filter(
                        (item) =>
                            item !== null &&
                            item.value !== null &&
                            item.value !== undefined &&
                            !isNaN(item.value)
                    );
            }

            console.log("Processed time series data:", extractedData);

            if (extractedData.length > 0) {
                setTimeSeries(extractedData);
                setSelectedProvince(properties.name || "Selected Region");
            } else {
                console.warn(
                    "No valid time series data found in properties:",
                    properties
                );
                // You might want to show an error message to the user
                setTimeSeries([]);
            }
        }
    }, [selectedFeature]);

    return (
        <>
            {/* Initial application loading */}
            {initialLoading && (
                <LoadingSpinner
                    isLoading={true}
                    message="Initializing Rice Map Application..."
                    size="large"
                />
            )}

            {/* Data loading indicator */}
            <DataLoadingIndicator isLoading={dataLoading} />

            <DashTop
                options={options}
                updateOption={updateOption}
                setSelectedYear={setSelectedYear}
                setSelectedMonth={setSelectedMonth}
            />
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </Head>
            <div className="dashboard-container">
                {/* Sidebar */}
                <div
                    className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}
                >
                    <button
                        className="toggle-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? "❮" : "❯"}
                    </button>

                    <div
                        className={`sidebar-content ${
                            sidebarTextVisible ? "visible" : "hidden"
                        }`}
                    >
                        <TimeIntervalSelector
                            label="Date:"
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            options={options}
                            updateOption={updateOption}
                        />

                        <AdminLevelSelector
                            label="Date:"
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            options={options}
                            updateOption={updateOption}
                        />

                        <VariableSelector
                            selectedVar={options.varType}
                            updateOption={updateOption}
                        />
                    </div>
                </div>

                {/* Map container */}
                <div className="map-container">
                    {/* Date title */}
                    <div className="date-mainshow-container">
                        <p>{formatDateDisplay(selectedDate)}</p>
                    </div>

                    {/* Error message */}
                    {/* {errorMessage && (
                        <div className="error-message">
                            <p>{errorMessage}</p>
                        </div>
                    )} */}

                    {/* Map loading overlay */}
                    {mapLoading && <MapLoadingOverlay />}

                    <DashMapTif
                        data={mapData}
                        options={options}
                        selectedDate={selectedDate}
                        selectedFeature={selectedFeature}
                        setSelectedFeature={setSelectedFeature}
                        setSelectedProvince={setSelectedProvince}
                        setTimeSeries={setTimeSeries}
                    />
                </div>
            </div>

            {/* Details section */}
            <div id="details-section" className="details-container">
                <button
                    className="back-to-map-btn"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                >
                    Back to Map
                </button>
                <div className="info-panel">
                    {/* <h2>Information</h2> */}
                    {selectedFeature ? (
                        <div>
                            {/* <p>
                                <strong>Name:</strong>{" "}
                                {selectedFeature.properties.name}
                            </p> */}
                            {/* {options.overview === "forecast" ? (
                                <p>
                                    <em>
                                        Showing forecast data with ensemble
                                        members
                                    </em>
                                </p>
                            ) : (
                                <p>
                                    <em>Showing historical data</em>
                                </p>
                            )} */}
                        </div>
                    ) : (
                        <p>Click on a region to see details.</p>
                    )}
                </div>
                <div className="chart-panel">
                    <>
                        {timeSeries.length > 0 ? (
                            <ChartComponent
                                data={timeSeries}
                                options={options}
                            />
                            // <D3TimeSeriesChart
                            // data={timeSeries}
                            // options={options}
                            // />
                            
                        ) : (
                            <div className="no-data-message">
                                <p>
                                    Select a region on the map to view time
                                    series data
                                </p>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    );
}

// Date formatting utility
const formatDateDisplay = (selectedDate) => {
    if (!selectedDate) return "Unknown Date";

    const year = selectedDate.slice(0, 4);
    const month = selectedDate.length >= 6 ? selectedDate.slice(4, 6) : null;
    const day = selectedDate.length === 8 ? selectedDate.slice(6, 8) : null;

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const monthFormatted = month ? monthNames[parseInt(month, 10) - 1] : "";

    if (selectedDate.length === 4) {
        return `${year}`;
    } else if (selectedDate.length === 6) {
        return `${monthFormatted}, ${year}`;
    } else if (selectedDate.length === 8) {
        return `${monthFormatted} ${parseInt(day, 10)}, ${year}`;
    }

    return "Invalid Date";
};
