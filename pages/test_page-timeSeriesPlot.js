import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TimeSeriesChart } from "../components/TimeSeriesChart";

import { useRouter } from "next/router";
import Chart from "chart.js/auto";

// import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

// import { MapComponent } from "../components/MapComponent"; // 对应命名导出

// 开始：动态导入地图组件以避免服务器端渲染SSR问题
// 注意！这种格式的动态导入无效！因为本项目的所有组件均不是默认导出，而是命名导出
// const MapComponent = dynamic(() => import("../components/MapComponent"), {
//     ssr: false
// });

// 以下这种格式的动态导入对本项目的组件才有效果
const MapComponent = dynamic(
    () => import("@components/MapComponent").then((mod) => mod.MapComponent),
    { ssr: false }
);

const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);

const GeoJSON = dynamic(
    () => import("react-leaflet").then((mod) => mod.GeoJSON),
    { ssr: false }
);

const ChartComponent = dynamic(
    () =>
        import("../components/ChartComponent").then(
            (mod) => mod.ChartComponent
        ),
    { ssr: false }
);

// 结束：动态导入组件

export default function Home() {
    // 动态改变选项
    const [options, setOptions] = useState({
        varType: "SPI1", // Var Type
        region: "Thailand", // Region
        overview: "hist", // Overview
        adminLevel: "Country", // Administrative Level
        dateType: "Yearly", // Date
        date: "2023-01-01" // Date Picker Value
    });

    const geoJsonLayerRef = useRef(null); // 引用 GeoJSON 图层

    const [geojsonData, setGeojsonData] = useState(null); // 当前的 GeoJSON 数据

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);

    // 动态改变日期
    const [selectedDate, setSelectedDate] = useState("1950"); // 默认日期

    const [additionalData, setAdditionalData] = useState(null); // 新数据

    // const query = `varType=${varType}&region=${region}&overview=${overview}&adminLevel=${adminLevel}&dateType=${dateType}&date=${date}`;
    // const response = await fetch(`/api/geojsonData?${query}`);

    // async fetching data
    const fetchData = async () => {
        const { varType, region, overview, adminLevel, dateType, date } =
            options;

        // generate request
        const response = await fetch(
            `/api/get_${varType}_${dateType}_${adminLevel}_${region}`
        );
        const data = await response.json();

        console.log("fetched geoJSON data:", data);

        setGeojsonData(data);
        setSelectedProvince(null); // 清空选中状态
        setTimeSeries([]); // 清空时间序列数据
    };

    // 当选项改变时，重新加载数据
    useEffect(() => {
        console.log("Re-fetch start.");
        fetchData();
    }, [options]);

    // remove old layer and add new layer
    useEffect(() => {
        if (geoJsonLayerRef.current && geojsonData) {
            // 清空旧的 GeoJSON 图层
            geoJsonLayerRef.current.clearLayers();

            // 添加新的 GeoJSON 数据
            geoJsonLayerRef.current.addData(geojsonData);
        }
    }, [geojsonData]);

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
        const r = Math.floor(255 * (1 - clampedRatio));
        const g = 180;
        const b = Math.floor(255 * clampedRatio);
        return `rgb(${r}, ${g}, ${b})`;
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

    // END: 地块样式设置

    // START: mouse in, mouse out, click effects
    // 处理所有鼠标移入，移出，点击地块的效果

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
    // END: mouse in, mouse out, click effects

    // original codes, can be recovered if attempt failed
    // // 点击省份时处理时间序列数据
    // const handleProvinceClick = (e) => {
    //     const feature = e.target.feature;
    //     setSelectedProvince(feature.properties.name);

    //     // 从properties中提取时间序列数据
    //     const timeData = Object.entries(feature.properties)
    //         .filter(([key, value]) => key.startsWith("y")) // 过滤出时间序列数据
    //         .map(([key, value]) => ({
    //             year: key.replace("y", ""),
    //             value: value
    //         }));
    //     console.log("Extract time series data as:", timeData);

    //     setTimeSeries(timeData);
    // };

    // useEffect(() => {
    //     if (selectedProvince) {
    //     }
    // }, [selectedProvince]);
    // original codes, can be recovered if attempt failed

    return (
        <div>
            <h1>RICE-MAP Dashboard</h1>

            {/* 选项区域 */}
            <div style={{ marginBottom: "20px" }}>
                <label>
                    Var Type:
                    <select
                        onChange={(e) =>
                            updateOption("varType", e.target.value)
                        }
                        value={options.varType}
                    >
                        <option value="SPI1">SPI1</option>
                        <option value="SPI3">SPI3</option>
                        <option value="SPI6">SPI6</option>
                        <option value="SPI12">SPI12</option>
                        <option value="SMPCT">SMPCT</option>
                        <option value="Yield">Yield</option>
                    </select>
                </label>
                <label>
                    Region:
                    <select
                        onChange={(e) => updateOption("region", e.target.value)}
                        value={options.region}
                    >
                        <option value="Thailand">Thailand</option>
                        <option value="Cambodia">Cambodia</option>
                        <option value="Laos">Laos</option>
                    </select>
                </label>
                <label>
                    Overview:
                    <select
                        onChange={(e) =>
                            updateOption("overview", e.target.value)
                        }
                        value={options.overview}
                    >
                        <option value="hist">Historical</option>
                        <option value="forecast">Forecast</option>
                    </select>
                </label>
                <label>
                    Administrative Level:
                    <select
                        onChange={(e) =>
                            updateOption("adminLevel", e.target.value)
                        }
                        value={options.adminLevel}
                    >
                        <option value="Country">Country</option>
                        <option value="Prov">Provincial</option>
                        <option value="Grid">Grid</option>
                    </select>
                </label>
                <label>
                    Date Type:
                    <select
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
                {/* <label>
                    Date:
                    <input
                        type="date"
                        value={options.date}
                        onChange={(e) => updateOption("date", e.target.value)}
                    />
                </label> */}
            </div>

            {/* 日期选择器 */}
            <label>
                Select Date:
                <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                >
                    {Array.from({ length: 67 }, (_, i) => 1950 + i).map(
                        (year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        )
                    )}
                </select>
            </label>

            {/* 地图组件 */}
            <div style={{ height: "500px", marginBottom: "20px" }}>
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    minZoom={4} // 设置最小缩放
                    maxZoom={11} // 设置最大缩放
                    maxBounds={[
                        [-5, 50],
                        [35, 140]
                    ]} // 设置拖拽边界（南西和东北角的坐标）
                    style={{ height: "500px", width: "100%" }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {geojsonData && (
                        <GeoJSON
                            // key={JSON.stringify(geojsonData)} // 使用新的数据生成唯一 key
                            key={`geojson-${Date.now()}`} // 使用新的数据生成唯一 key
                            data={geojsonData}
                            style={styleGeoJSON} // 使用动态样式
                            // style={() => ({
                            //     color: "#3388ff", // 默认边框颜色
                            //     weight: 2, // 默认边框粗细
                            //     fillOpacity: 0.2 // 默认填充透明度
                            //     // dashArray: "3"
                            // })}
                            // call handleProvinceClick when click a prov
                            onEachFeature={handleEachFeature}
                        />
                    )}
                </MapContainer>
                {/* 
                {geojsonData ? (
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={5}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <GeoJSON
                            ref={geoJsonLayerRef} // 引用 GeoJSON 图层
                            data={geojsonData}
                            onEachFeature={(feature, layer) => {
                                layer.on("click", () =>
                                    handleProvClickToGenerateTimeSeries(feature)
                                    handleProvinceClick(feature)
                                );
                            }}
                        />
                    </MapContainer>
                ) : (
                    <p>Loading map...</p>
                )} */}
            </div>

            {/* 颜色图例 */}
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center"
                }}
            >
                <span>Legend:</span>
                <div
                    style={{
                        width: "200px",
                        height: "20px",
                        background:
                            "linear-gradient(to right, rgb(0, 180, 255), rgb(255, 180, 0))",
                        marginLeft: "10px",
                        border: "1px solid #000"
                    }}
                ></div>
                {/* <span style={{ marginLeft: "10px" }}>Low</span> */}
                {/* <span style={{ marginLeft: "auto" }}>High</span> */}
            </div>

            {/* 详细信息面板 */}
            <div
                style={{
                    flex: 1,
                    marginLeft: "20px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9"
                }}
            >
                <h2>Detail Panel</h2>
                {selectedFeature ? (
                    <div>
                        <p>
                            <strong>Name:</strong>{" "}
                            {selectedFeature.properties.name}
                        </p>
                        <p>
                            <strong>Value ({selectedDate}):</strong>{" "}
                            {selectedFeature.properties[`y${selectedDate}`] !==
                            undefined
                                ? selectedFeature.properties[
                                      `y${selectedDate}`
                                  ].toFixed(2)
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Precipitation:</strong>{" "}
                            {additionalData?.precipitation || "Loading..."}
                        </p>
                        <p>
                            <strong>Yield:</strong>{" "}
                            {additionalData?.yield || "Loading..."}
                        </p>
                    </div>
                ) : (
                    <p>Click on a region to see details.</p>
                )}
            </div>

            {/* 图表组件 */}
            <div>
                {selectedProvince ? (
                    <>
                        <h2>Selected Province: {selectedProvince}</h2>
                        <ChartComponent data={timeSeries} />
                    </>
                ) : (
                    <p>Select a province on the map to see time series data.</p>
                )}
            </div>
        </div>
    );
}
