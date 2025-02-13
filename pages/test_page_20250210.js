import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Header } from "@components/Header";

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

    // 动态改变选项
    const [options, setOptions] = useState({
        varType: "SPI1", // Var Type
        region: "SEA", // Region
        overview: "forecast", // Overview
        adminLevel: "Country", // Administrative Level
        dateType: "Yearly", // Date
        date: "2010" // Date Picker Value
    });

    const geoJsonLayerRef = useRef(null); // 引用 GeoJSON 图层

    const [geojsonData, setGeojsonData] = useState(null); // 当前的 GeoJSON 数据

    const geoRasterLayerRef = useRef(null); // 引用 GeoRaster 图层

    const [geoRasterData, setGeoRasterData] = useState(null); // 当前的 GeoRaster 数据
    const [mapData, setMapData] = useState(null);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);

    // 动态改变日期
    const [selectedDate, setSelectedDate] = useState("2010"); // 默认日期

    const [additionalData, setAdditionalData] = useState(null); // 新数据

    // async fetching data
    const fetchData = async () => {
        const { varType, region, overview, adminLevel, dateType, date } =
            options;
        console.log(`${varType}_${dateType}_${adminLevel}_${region}`);
        // generate request
        if (overview === "hist") {
            const response = await fetch(
                `/api/get_${varType}_${dateType}_${adminLevel}_${region}`
                // "/api/get_yield"
            );
            if (varType.startsWith("SPI") && adminLevel !== "Grid") {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                // mapData is passed to DashMapTif
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson",
                    data_vartype: varType
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            } else if (varType === "Yield") {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                // mapData is passed to DashMapTif
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson",
                    data_vartype: varType
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            } else {
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
                    data_vartype: varType
                });
                // setGeoRasterData(dummyRaster);
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            }
        } else {
            // forecast data
            const response = await fetch(
                `/api/get_${varType}_${dateType}_${adminLevel}_${region}_${overview}`
            );
            if (varType.startsWith("SPI") && adminLevel !== "Grid") {
                const data = await response.json();
                console.log("fetched geoJSON data:", data);
                setGeojsonData(data);
                // mapData is passed to DashMapTif
                setMapData({
                    data: data,
                    url: response.url,
                    datatype: "geojson"
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            } else {
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
                    data_vartype: varType
                });
                setSelectedProvince(null); // 清空选中状态
                setTimeSeries([]); // 清空时间序列数据
            }
        }
    };

    // if sidebar is not open, switch the sidebar texts to invisible.
    // This function is required to be linked to /styles/core/components/_dashboard.scss.sidebar.sidebar-content{}
    useEffect(() => {
        if (!sidebarOpen) {
            setSidebarTextVisible(false);
        } else {
            setTimeout(() => setSidebarTextVisible(true), 300);
        }
    }, [sidebarOpen]);

    // 当选项改变时，重新加载数据
    useEffect(() => {
        console.log("Re-fetch start.");
        fetchData();
    }, [options]);

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
    const handleProvClickToGenerateTimeSeries = (feature) => {
        const { properties } = feature;
        setSelectedProvince(properties.name);

        const timeSeriesData = Object.keys(properties)
            .filter((key) => key.startsWith("y"))
            .map((key) => ({
                year: parseInt(key.replace("y", ""), 10),
                value: properties[key]
            }));

        setTimeSeries(timeSeriesData);
    };

    // START : new test of click effect
    const [selectedFeature, setSelectedFeature] = useState(null); // 记录选中的地块

    // START: 颜色映射函数，将值映射到颜色范围
    const getColor = (value) => {
        const min = -2; // 假设值的最小值
        const max = 2; // 假设值的最大值

        if (value === undefined || isNaN(value)) return "#ccc"; // 缺失数据用灰色

        // 归一化数值到 [0, 1]
        const ratio = (value - min) / (max - min);
        const clampedRatio = Math.max(0, Math.min(1, ratio)); // 确保在 [0, 1] 范围内

        // 生成颜色 (从蓝色到红色的渐变)
        // const r = Math.floor(255 * (1 - clampedRatio));
        // const g = 180;
        // const b = Math.floor(255 * clampedRatio);
        // return `rgb(${r}, ${g}, ${b})`;
        // Ensure value is within the defined range
        if (value < min) value = min;
        if (value > max) value = max;

        // Assign colors based on value ranges
        if (value > -0.5) return "#fff"; // Greater than -0.5
        if ((value > -0.8) & (value <= -0.5)) return "#FFFF00"; // Greater than -0.8
        if ((value > -1.3) & (value <= -0.8)) return "#FCD37F"; // Greater than -1.3
        if ((value > -1.6) & (value <= -1.3)) return "#FFAA00"; // Greater than -1.6
        if ((value > -2) & (value <= -1.6)) return "#E60000"; // Greater than -2
        if (value <= -2) return "#730000"; // Less than or equal to -2

        return "#fff"; // Default color (should not reach here)
    };
    // END: 颜色映射函数，将值映射到颜色范围

    // START: 地块样式设置
    const handleFeatureClick = (feature, layer) => {
        setSelectedFeature(feature); // 更新选中的地块
        layer.setStyle({
            color: "#EB5A3C", // 选中后的边框颜色
            weight: 4
        });

        // layer.bringToFront();
    };

    const resetFeatureStyle = (layer, feature) => {
        // 恢复默认样式
        layer.setStyle({
            color: "#666",
            weight: 2,
            dashArray: "3"
        });
    };

    //根据地块value值来动态设置fill color
    const styleGeoJSON = (feature) => {
        const value = feature.properties[`y${selectedDate}`]; // 获取选中日期的值
        return {
            fillColor: getColor(value), // 动态设置填充颜色
            color: "#666", // 边框颜色
            weight: 2, // 边框宽度
            dashArray: "3",
            fillOpacity: 0.7 // 填充透明度
        };
    };
    // console.log("georaster data:", geoRasterData.georaster.values);
    // const validValues = flattenedValues.filter(value => value !== -999000000);

    // END: 地块样式设置

    // START: mouse in, mouse out, click effects
    // 处理所有鼠标移入，移出，点击地块的效果

    // note on 2025-02-10: handleEachFeature() is repleced by the GeoJSONLayer() in /component/DashMapTif/DashMapTif.js
    // so it is currently not needed here, but it is still considered to remain it, tempororally
    const handleEachFeature = (feature, layer) => {
        // 获取当前地块的值和名称
        const value = feature.properties[`y${selectedDate}`];
        const name = feature.properties.name;

        // 绑定 Tooltip，显示地块名称和值
        layer.bindTooltip(
            `<b>${name}</b><br>Value: ${
                value !== undefined ? value.toFixed(2) : "N/A"
            }`,
            { direction: "top", sticky: true }
        );

        // 默认样式
        layer.setStyle({
            fillColor: getColor(value), // 动态设置填充颜色
            color: "#666", // 边框颜色
            weight: 2, // 边框宽度
            fillOpacity: 0.7, // 填充透明度
            dashArray: "3"
            // color: "#666",
            // weight: 2,
            //
        });

        // Hover 高亮
        layer.on("mouseover", () => {
            layer.setStyle({
                color: "#EB5A3C", // Hover 时边框颜色
                weight: 4
            });
        });

        // // 鼠标移出时恢复样式
        // layer.on("mouseout", () => {
        //     layer.setStyle(styleGeoJSON(feature));
        // });

        // 移出取消
        layer.on("mouseout", () => {
            if (selectedFeature !== feature) {
                layer.setStyle(styleGeoJSON(feature));
                // resetFeatureStyle(layer, feature);
            }
        });

        // 点击选中
        layer.on("click", () => {
            // 如果有其他选中的地块，先重置其样式
            if (selectedFeature && selectedFeature !== feature) {
                resetFeatureStyle(layer, selectedFeature); // 重置上一个选中地块的样式
            }
            handleFeatureClick(feature, layer); // 高亮当前选中地块
            handleProvClickToGenerateTimeSeries(feature);
        });

        // 点击高亮效果
        // layer.on("click", () => {
        //     // 重置之前选中地块的样式
        //     if (selectedLayer) {
        //         selectedLayer.setStyle(styleGeoJSON(selectedLayer.feature));
        //     }

        //     // 设置当前地块为选中状态
        //     setSelectedLayer(layer);
        //     layer.setStyle({
        //         weight: 5,
        //         color: "#ff0000",
        //         fillOpacity: 0.9
        //     });

        //     // 将选中地块提升到最上层
        //     layer.bringToFront();
        //     handleProvClickToGenerateTimeSeries(feature);
        // });
    };

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
                        <h2>Options</h2>
                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Variables:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("varType", e.target.value)
                                }
                                value={options.varType}
                            >
                                <option value="SPI1">SPI1</option>
                                <option value="SPI3">SPI3</option>
                                <option value="SPI6">SPI6</option>
                                <option value="SPI12">SPI12</option>
                                <option value="SMPCT">
                                    Soil Moisture Percentile
                                </option>
                                <option value="Yield">Rice Yield</option>
                                <option value="Prcp">Precipitation</option>
                                <option value="Temp">Temperature</option>
                            </select>
                        </label>

                        <label className="flex flex-col text-sm font-medium text-gray-700">
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
                                <option value="India">India</option>
                                <option value="Laos">Laos</option>
                                <option value="Myanmar">Myanmar</option>
                                <option value="Vietnam">Vietnam</option>
                                <option value="SEA">Southeast Asia</option>
                            </select>
                        </label>

                        <label className="flex flex-col text-sm font-medium text-gray-700">
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
                        </label>

                        <label className="flex flex-col text-sm font-medium text-gray-700">
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
                        </label>

                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Time Periods:</span>
                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) =>
                                    updateOption("dateType", e.target.value)
                                }
                                value={options.dateType}
                            >
                                <option value="Yearly">Yearly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Daily">Daily</option>
                            </select>
                        </label>

                        <label className="flex flex-col text-sm font-medium text-gray-700">
                            <span>Select Date:</span>

                            <select
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedDate}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    setSelectedDate(newDate);
                                    setOptions((prev) => ({
                                        ...prev,
                                        date: newDate
                                    })); // update selectedDate and options.date simultaneously
                                }}
                            >
                                {Array.from(
                                    { length: 67 },
                                    (_, i) => 1950 + i
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* 地图容器 */}
                <div className="map-container">
                    <DashMapTif
                        data={mapData}
                        selectedDate={selectedDate}
                        selectedFeature={selectedFeature}
                        setSelectedFeature={setSelectedFeature}
                        setSelectedProvince={setSelectedProvince}
                        setTimeSeries={setTimeSeries}
                    />
                    <button
                        className="scroll-to-details-btn"
                        onClick={() =>
                            document
                                .getElementById("details-section")
                                .scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        View Details & Charts
                    </button>
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
                    {selectedProvince ? (
                        <>
                            <h2>Selected Province: {selectedProvince}</h2>
                            {/* <ChartComponent data={timeSeries} /> */}
                            {/* this is for sample plot, replace the data and options with your real data
                            and options when they are prepared */}
                            <ChartComponent
                                data={sampleData}
                                options={options}
                            />
                        </>
                    ) : (
                        <p>
                            Select a province on the map to see time series
                            data.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

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
