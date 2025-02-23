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

// import "leaflet/dist/leaflet.css";

// import "../styles/dashboard.scss";

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

const DashMapTif = dynamic(
    () => import("../components/DashMapTif/DashMapTif"),
    {
        ssr: false
    }
);

export default function Home() {
    // just some fake data to test
    const [spi, setSpi] = useState("0");
    const [lastUpdated, setLastUpdated] = useState("15/07/2024");
    const [currData, setCurrData] = useState([]); // State to hold the current data
    const [sidebarOpen, setSidebarOpen] = useState(true); // Record status of sidebar's open or not
    const [sidebarTextVisible, setSidebarTextVisible] = useState(true); // when sidebar is closed, texts not visible

    const [mapNullCheck, setMapNullCheck] = useState(false); // Record status of sidebar's open or not
    const [errorMessage, setErrorMessage] = useState("ERROR MESSAGE TEST"); // control the error message box when wrong api or no matched data

    // 动态改变选项
    const [options, setOptions] = useState({
        varType: "Yield", // Var Type
        region: "SEA", // Region
        overview: "forecast", // Overview
        adminLevel: "Grid", // Administrative Level
        dateType: "Monthly", // Date
        date: "202504" // Date Picker Value
    });

    const geoJsonLayerRef = useRef(null); // 引用 GeoJSON 图层

    const [geojsonData, setGeojsonData] = useState(null); // 当前的 GeoJSON 数据

    const geoRasterLayerRef = useRef(null); // 引用 GeoRaster 图层

    const [geoRasterData, setGeoRasterData] = useState(null); // 当前的 GeoRaster 数据
    const [mapData, setMapData] = useState(null);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);

    // 动态改变日期
    const [selectedDate, setSelectedDate] = useState("20100101"); // 默认年
    const [selectedYear, setSelectedYear] = useState("2025"); // 默认年
    const [selectedMonth, setSelectedMonth] = useState("04"); // 默认月
    const [selectedDay, setSelectedDay] = useState("01"); // 默认日

    const [selectedYearEnd, setSelectedYearEnd] = useState("2000");
    const [selectedMonthEnd, setSelectedMonthEnd] = useState("01");
    const [selectedDayEnd, setSelectedDayEnd] = useState("01"); // 默认日

    // 根据选择的年月日，拼接selectedDate，用于传递日期选择信息
    useEffect(() => {
        let formattedDate = selectedYear; // 默认 Yearly 模式
        if (options.dateType === "Monthly") {
            formattedDate = `${selectedYear}${selectedMonth}`;
        } else if (options.dateType === "Daily") {
            formattedDate = `${selectedYear}${selectedMonth}${selectedDay}`;
        }

        setSelectedDate(formattedDate);
        setOptions((prev) => ({ ...prev, date: formattedDate })); // 确保 options.date 也同步更新
    }, [selectedYear, selectedMonth, selectedDay, options.dateType]);

    const [additionalData, setAdditionalData] = useState(null); // 新数据

    // async fetching data
    const fetchData = useCallback(async () => {
        // const fetchData = async () => {
        const { varType, region, overview, adminLevel, dateType, date } =
            options;
        console.log(`${varType}_${dateType}_${adminLevel}_${region}`);
        // generate request
        if (overview === "hist") {
            const response = await fetch(
                `/api/get_data?varType=${options.varType}&dateType=${options.dateType}&adminLevel=${options.adminLevel}&region=${options.region}&overview=${options.overview}&selectedDate=${selectedDate}`
            );

            if (adminLevel === "Grid") {
                console.log("Response URL:", response); // Log the URL for debugging
                // const data = await response.json();
                // console.log("fetched geoRaster data:", data);
                setGeoRasterData({
                    data: await response.arrayBuffer(),
                    url: response.url, // Storing the URL here for later use
                    datatype: "geotiff"
                });
                setMapData({
                    url: response.url,
                    datatype: "geotiff",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                // setGeoRasterData(dummyRaster);
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            } else {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                // mapData is passed to DashMapTif
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            }
        } else {
            // forecast data
            const response = await fetch(
                `/api/get_data?varType=${options.varType}&dateType=${options.dateType}&adminLevel=${options.adminLevel}&region=${options.region}&overview=${options.overview}&selectedDate=${selectedDate}`
            );

            if (adminLevel === "Grid") {
                console.log("Response URL:", response); // Log the URL for debugging
                // const data = await response.json();
                // console.log("fetched geoRaster data:", data);
                setGeoRasterData({
                    data: await response.arrayBuffer(),
                    url: response.url, // Storing the URL here for later use
                    datatype: "geotiff"
                });
                setMapData({
                    url: response.url,
                    datatype: "geotiff",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                // setGeoRasterData(dummyRaster);
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            } else {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                // mapData is passed to DashMapTif
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson",
                    data_vartype: varType,
                    data_adminLevel: adminLevel,
                    data_dateType: dateType
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            }
        }
    }, [options]);

    // if sidebar is not open, switch the sidebar texts to invisible.
    // This function is required to be linked to /styles/core/components/_dashboard.scss.sidebar.sidebar-content{}
    useEffect(() => {
        if (!sidebarOpen) {
            setSidebarTextVisible(false);
        } else {
            setTimeout(() => setSidebarTextVisible(true), 300);
        }
    }, [sidebarOpen]);

    // check if geojsonData or geoRasterData are null, if so, give error message box
    useEffect(() => {
        if (options.dateType === "Daily") {
            setErrorMessage(
                "Daily data is under development, please check and select again"
            );
        }
        // else if (options.overview === "forecast") {
        //     setErrorMessage(
        //         "Forecast data is under development, please check and select again"
        //     );
        // }
        else if (
            options.overview === "forecast" &&
            options.varType.startsWith("SPI") &&
            (options.dateType !== "Monthly") | (options.adminLevel !== "Grid")
        ) {
            setErrorMessage(
                "Note that only 'Monthly' and 'Grid' SPI forecast data is available currently"
            );
        } else if (
            options.adminLevel === "Grid" &&
            options.dateType === "Yearly" &&
            (options.varType === "Prcp") | (options.varType === "Temp") &&
            (Number(selectedDate) > 2010) | (Number(selectedDate) < 1990)
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

        setTimeout(() => setErrorMessage(""), 3000); // 3秒后自动消失
    }, [options, geojsonData, geoRasterData]);

    // 当选项改变时，fetchData重新加载，fetchData重新加载，则重新加载数据
    useEffect(() => {
        console.log("Re-fetch start.");
        fetchData();
    }, [fetchData]);

    // remove old layer and add new layer
    useEffect(() => {
        console.log("geoJsonLayerRef.current:", geoJsonLayerRef.current);
        if (geoJsonLayerRef.current && geojsonData) {
            console.log("GeoJSONLayer instance:", geoJsonLayerRef.current);
            // 清空旧的 GeoJSON 图层
            geoJsonLayerRef.current.clearLayers();

            // 添加新的 GeoJSON 数据
            geoJsonLayerRef.current.addData(geojsonData);
        }
    }, [geojsonData]);

    // remove old layer and add new geotiff layer
    useEffect(() => {
        if (geoRasterLayerRef.current && geoRasterData) {
            console.log("GeoRasterLayer instance:", geoRasterLayerRef.current);
            // 清空旧的 GeoRaster 图层
            geoRasterLayerRef.current.clearLayers();

            // 添加新的 GeoRaster 数据
            geoRasterLayerRef.current.addData(geoRasterData);
        }
    }, [geoRasterData]);

    // 更新选项
    const updateOption = (key, value) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    // 点击省份时处理时间序列数据
    // const handleProvClickToGenerateTimeSeries = (feature) => {
    //     const { properties } = feature;
    //     setSelectedProvince(properties.name);

    //     const timeSeriesData = Object.keys(properties)
    //         .filter((key) => key.startsWith("y"))
    //         .map((key) => ({
    //             year: parseInt(key.replace("y", ""), 10),
    //             value: properties[key]
    //         }));

    //     setTimeSeries(timeSeriesData);
    // };

    const [selectedFeature, setSelectedFeature] = useState(null); // 记录选中的地块

    // 当selectedFeature改变时，打印调试信息
    useEffect(() => {
        if (selectedFeature) {
            const { properties } = selectedFeature;

            const timeSeriesData = Object.keys(properties)

                .filter((key) => /^y\d+_\d+$/.test(key)) // 只匹配 "y202502_1" 这样的 key
                .map((key) => {
                    const match = key.match(/^y(\d+)_(\d+)$/); // 提取 year 和 ensemble member
                    return match
                        ? {
                              year: parseInt(match[1], 10),
                              ensemble: parseInt(match[2], 10),
                              value: properties[key]
                          }
                        : null;
                })
                .filter((item) => item !== null); // 过滤掉 null 值

            setTimeSeries(timeSeriesData);

            console.log("打印keys", Object.keys(properties)); // 打印所有 keys，看是否有 "y202502_1" 之类的键

            console.log(
                "Filtered keys:",
                Object.keys(properties).filter((key) => /^y\d+_\d+$/.test(key))
            );

            // console.log(
            //     "Match result:",
            //     Object.keys(properties).match(/^y(\d+)_(\d+)$/)
            // );
            console.log("Processed time series data:", timeSeriesData); // 调试输出}

            console.log("Final set time series data:", timeSeriesData); // 调试输出}
        }
    }, [selectedFeature]);

    const handleProvClickToGenerateTimeSeries = (feature) => {
        const { properties } = feature;
        setSelectedProvince(properties.name);

        // // 解析时间序列数据，适配 ensemble 结构
        // const timeSeriesData = Object.keys(properties)

        //     .filter((key) => /^y\d+_\d+$/.test(key)) // 只匹配 "y202502_1" 这样的 key
        //     .map((key) => {
        //         const match = key.match(/^y(\d+)_(\d+)$/); // 提取 year 和 ensemble member
        //         return match
        //             ? {
        //                   year: parseInt(match[1], 10),
        //                   ensemble: parseInt(match[2], 10),
        //                   value: properties[key]
        //               }
        //             : null;
        //     })
        //     .filter((item) => item !== null); // 过滤掉 null 值

        // setTimeSeries(timeSeriesData);
    };

    // START: 地块样式设置
    // const handleFeatureClick = (feature, layer) => {
    //     setSelectedFeature(feature); // 更新选中的地块
    //     layer.setStyle({
    //         color: "#EB5A3C", // 选中后的边框颜色
    //         weight: 4
    //     });

    //     // layer.bringToFront();
    // };

    // const resetFeatureStyle = (layer, feature) => {
    //     // 恢复默认样式
    //     layer.setStyle({
    //         color: "#666",
    //         weight: 2,
    //         dashArray: "3"
    //     });
    // };

    // //根据地块value值来动态设置fill color
    // const styleGeoJSON = (feature) => {
    //     const value = feature.properties[`y${selectedDate}`]; // 获取选中日期的值
    //     return {
    //         fillColor: getColor(value), // 动态设置填充颜色
    //         color: "#666", // 边框颜色
    //         weight: 2, // 边框宽度
    //         dashArray: "3",
    //         fillOpacity: 0.7 // 填充透明度
    //     };
    // };

    // END: 地块样式设置

    // START: mouse in, mouse out, click effects

    useEffect(() => {
        // Update card info based on currData
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];
        setSpi(0.423);
        setLastUpdated(formattedDate);
    }, []); // Empty dependency array to run once on component mount

    return (
        <>
            {/* <Header /> */}
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
                {/* 侧边栏 */}
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
                        {/* 起始日期选择 */}
                        {/* <DateSelector
                            label="Date:"
                            selectedYear={selectedYear}
                            setSelectedYear={setSelectedYear}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            options={options}
                        /> */}
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

                        {/* 结束日期选择 */}
                        {/* <DateSelector
                            label="End Date:"
                            selectedYear={selectedYearEnd}
                            setSelectedYear={setSelectedYearEnd}
                            selectedMonth={selectedMonthEnd}
                            setSelectedMonth={setSelectedMonthEnd}
                            options={options}
                        /> */}

                        <VariableSelector
                            selectedVar={options.varType}
                            updateOption={updateOption}
                        />

                        {/* <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Region:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("region", e.target.value)
                                }
                                value={options.region}
                            >
                                <option value="Thailand">Thailand</option>
                                <option value="Cambodia">Cambodia</option>
                                <option value="Laos">Laos</option>
                                <option value="Myanmar">Myanmar</option>
                                <option value="Vietnam">Vietnam</option>
                                <option value="SEA">Southeast Asia</option>
                            </select>
                        </label> */}

                        {/* <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Data Type:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("overview", e.target.value)
                                }
                                value={options.overview}
                            >
                                <option value="hist">Historical</option>
                                <option value="forecast">Forecast</option>
                            </select>
                        </label> */}

                        {/* <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Administrative Level:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("adminLevel", e.target.value)
                                }
                                value={options.adminLevel}
                            >
                                <option value="Country">Country</option>
                                <option value="Prov">Province</option>
                                <option value="Grid">Grid</option>
                            </select>
                        </label> */}

                        {/* <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Time Interval:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("dateType", e.target.value)
                                }
                                value={options.dateType}
                            >
                                <option value="Yearly">Yearly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </label> */}

                        {/* 年份选择 */}
                        {/* <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Select Year:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                            >
                                {options.overview === "forecast" ? (
                                    <option value="2025">2025</option>
                                ) : (
                                    Array.from(
                                        { length: 67 },
                                        (_, i) => 1950 + i
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))
                                )}{" "}
                            </select>
                        </label> */}
                        {/* 月份选择（仅当 Monthly 或 Daily 可见） */}
                        {/* {options.dateType !== "Yearly" && (
                            <label className="flex flex-col text-sm font-medium text-gray-700">
                                <span>Select Month:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(
                                            e.target.value.padStart(2, "0")
                                        )
                                    }
                                >
                                    {options.overview === "forecast"
                                        ? [
                                              "02",
                                              "03",
                                              "04",
                                              "05",
                                              "06",
                                              "07"
                                          ].map((month) => (
                                              <option key={month} value={month}>
                                                  {month}
                                              </option>
                                          ))
                                        : Array.from({ length: 12 }, (_, i) =>
                                              (i + 1)
                                                  .toString()
                                                  .padStart(2, "0")
                                          ).map((month) => (
                                              <option key={month} value={month}>
                                                  {month}
                                              </option>
                                          ))}
                                </select>
                            </label>
                        )} */}
                    </div>
                </div>

                {/* 地图容器 */}
                <div className="map-container">
                    {/* date title */}
                    <div className="date-mainshow-container">
                        <p>{formatDateDisplay(selectedDate)}</p>
                    </div>

                    <DashMapTif
                        data={mapData}
                        options={options}
                        selectedDate={selectedDate}
                        selectedFeature={selectedFeature}
                        setSelectedFeature={setSelectedFeature}
                        setSelectedProvince={setSelectedProvince}
                        setTimeSeries={setTimeSeries}
                    />
                    {/* A button that transfering 1st page and 2nd page. Is recommended to not use this. Just back up here. */}
                    {/* <button
                        className="scroll-to-details-btn"
                        onClick={() =>
                            document
                                .getElementById("details-section")
                                .scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        View Details & Charts
                    </button> */}
                </div>
            </div>

            {/* 详细信息 & 图表组件 */}
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
                    <h2>Information</h2>
                    {selectedFeature ? (
                        <p>
                            <strong>Name:</strong>{" "}
                            {selectedFeature.properties.name}
                        </p>
                    ) : (
                        <p>Click on a region to see details.</p>
                    )}
                </div>
                <div className="chart-panel">
                    <>
                        <ChartComponent data={timeSeries} options={options} />
                    </>

                    {/* selectedProvince && options.adminLevel ? (
                        <>
                            <h2>
                                Selected {options.adminLevel}:{" "}
                                {selectedProvince}
                            </h2>
                            <ChartComponent
                                data={timeSeries}
                                options={options}
                            />
                        </>
                    ) : (
                        <p></p>
                    ) */}
                </div>
            </div>
            {/* <Footer /> */}
        </>
    );
}

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

// sample data for forecast time seried plot: forecast data should look like this! Historical data
// and forecast data and selected current data should all be contained inside.
const sampleData = [
    { year: 1997, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 1998, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 1999, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2000, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2001, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2002, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2003, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2004, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2005, value: 10, lower_bound: 8, upper_bound: 12 },
    { year: 2007, value: 12, lower_bound: 9, upper_bound: 14 },
    { year: 2008, value: 14, lower_bound: 11, upper_bound: 16 },
    { year: 2009, value: 16, lower_bound: 13, upper_bound: 19 },
    { year: 2010, value: 18, lower_bound: 14, upper_bound: 21 },
    { year: 2011, value: 20, lower_bound: 16, upper_bound: 23 },
    { year: 2012, value: 22, lower_bound: 17, upper_bound: 25 },
    { year: 2013, value: 24, lower_bound: 19, upper_bound: 27 },
    { year: 2014, value: 26, lower_bound: 20, upper_bound: 30 },
    { year: 2015, value: 28, lower_bound: 21, upper_bound: 32 },
    { year: 2016, value: 30, lower_bound: 22, upper_bound: 34 }
];

const sampleOptions = { overview: "forecast", date: "2020" };
