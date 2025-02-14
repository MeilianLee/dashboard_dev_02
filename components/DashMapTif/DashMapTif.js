import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

export default function DashMapTif({
    data,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    // Check if data is null, if so, set the default URL
    if (data === null) {
        data = {
            url: "/api/get_Yield_Yearly_Country_SEA",
            datatype: "geojson",
            data_vartype: "Yield"
        }; // Set default URL if data is null
    }

    useEffect(() => {
        console.log("Received data in DashMapTif:", data);
        console.log("Selected date in DashMapTif:", selectedDate);
    }, [data, selectedDate]);

    //根据地块value值来动态设置fill color
    const styleGeoJSON = (feature) => {
        const value = feature.properties[`y${selectedDate}`] ?? 0; // 获取选中日期的值

        // 根据 options.varType 选择颜色函数
        const colorFunction = data_url.data_vartype.startsWith("SPI")
            ? getColor
            : data_url.data_vartype === "Yield"
            ? getColorYield
            : data_url.data_vartype === "Temp"
            ? getColorTemp
            : data_url.data_vartype === "SMPct"
            ? getColorSMPct
            : getColor; // 默认使用 getColor

        return {
            fillColor: colorFunction(value), // 动态设置填充颜色
            color: "#666", // 边框颜色
            weight: 2, // 边框宽度
            dashArray: "3",
            fillOpacity: 0.7 // 填充透明度
        };
    };

    return (
        <MapContainer
            // key={`map-${selectedDate}-${data.datatype}`} // Use a unique key based on the data URL
            key={`map-${data.url}`}
            center={[20, 93]}
            zoom={5}
            minZoom={4} // 设置最小缩放
            maxZoom={11} // 设置最大缩放
            maxBounds={[
                [-10, 20],
                [40, 150]
            ]} // 设置拖拽边界（南西和东北角的坐标）
            // style={{ height: "500px", width: "100%" }}
            // id="map_container"
            className="map-container"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>;'
            />
            {data.datatype === "geojson" && (
                <GeoJSONLayer
                    data_url={data}
                    selectedDate={selectedDate}
                    selectedFeature={selectedFeature}
                    setSelectedProvince={setSelectedProvince}
                    setTimeSeries={setTimeSeries}
                    setSelectedFeature={setSelectedFeature}
                    style={styleGeoJSON}
                />
            )}
            {data.datatype === "geotiff" && (
                <GeoTIFFLayer data_url={data} selectedDate={selectedDate} />
            )}
            <InfoControl />
            <LegendControl data={data} />
            <ZoomControl /> {/* Add custom zoom control */}
        </MapContainer>
    );
}

// GeoJSON Layer Component
function GeoJSONLayer({
    data_url,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    console.log("Received data URL in geojsonlayer:", data_url);
    const map = useMap();
    const infoRef = useRef(null); // Create a ref to store the info control
    const highlightRef = useRef(null); // Create a ref to store the highlighted layer
    const geoJsonLayerRef = useRef(null); // Create a ref to store the GeoJSON layer

    // Update GeoJSON data when selectedDate changes
    // useEffect(() => {
    //   if (data_url && selectedDate) {
    //     debugger;
    //       // Filter or get new GeoJSON data based on the selectedDate
    //       const filteredData = data_url.data.features.filter((item) => item.year === selectedDate);

    //       setGeoJsonData(filteredData);

    //       // Update the GeoJSON layer on the map
    //       if (geoJsonLayerRef.current) {
    //           geoJsonLayerRef.current.clearLayers();
    //           geoJsonLayerRef.current.addData(filteredData);
    //       }
    //   }
    // }, [data_url, selectedDate]);

    // START: 地块样式设置
    const handleFeatureClick = (feature, layer) => {
        setSelectedFeature(feature); // 更新选中的地块
        // Apply styling to highlight the feature
        layer.setStyle({
            color: "#EB5A3C", // Red border color
            weight: 4, // Thicker border
            opacity: 1 // Ensure visibility
        });

        // Ensure the layer is brought to the front
        if (layer.bringToFront) {
            layer.bringToFront();
        }
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
    useEffect(() => {
        // Initialize info control and add to map
        const info = L.control({ position: "topright" });

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Country</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info; // Store the info control in the ref

        // Define the highlight style
        const highlightStyle = {
            weight: 3,
            color: "#ff0000",
            dashArray: "",
            fillOpacity: 0.7
        };

        const styleGeoJSON = (feature) => {
            const value = feature.properties[`y${selectedDate}`] ?? 0; // 获取选中日期的值

            // 根据 options.varType 选择颜色函数
            const colorFunction = data_url.data_vartype.startsWith("SPI")
                ? getColor
                : data_url.data_vartype === "Yield"
                ? getColorYield
                : data_url.data_vartype === "Temp"
                ? getColorTemp
                : data_url.data_vartype === "SMPct"
                ? getColorSMPct
                : getColor; // 默认使用 getColor

            return {
                fillColor: colorFunction(value), // 动态设置填充颜色
                color: "#666", // 边框颜色
                weight: 2, // 边框宽度
                dashArray: "3",
                fillOpacity: 0.7 // 填充透明度
            };
        };

        const resetFeatureStyle = (layer, feature) => {
            // 恢复默认样式
            layer.setStyle({
                color: "#666",
                weight: 2,
                dashArray: "3"
            });
        };

        // fetch data
        fetch(data_url.url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Network response was not ok (${response.status})`
                    );
                }
                return response.json();
            })
            .then((data) => {
                if (!data || !data.features) {
                    throw new Error("Invalid GeoJSON data received");
                }
                console.log("Received GeoJSON data:", data);

                // Remove the existing GeoJSON layer, if any
                if (geoJsonLayerRef.current) {
                    map.removeLayer(geoJsonLayerRef.current);
                }

                const geojsonLayer = L.geoJSON(data, {
                    style: styleGeoJSON,
                    onEachFeature: function (feature, layer) {
                        // 获取当前地块的值和名称
                        const value =
                            feature.properties[`y${selectedDate}`] ?? 0;
                        const name = feature.properties.name;

                        // 根据 options.varType 选择颜色函数
                        const colorFunction = data_url.data_vartype.startsWith(
                            "SPI"
                        )
                            ? getColor
                            : data_url.data_vartype === "Yield"
                            ? getColorYield
                            : data_url.data_vartype === "Temp"
                            ? getColorTemp
                            : data_url.data_vartype === "SMPct"
                            ? getColorSMPct
                            : getColor; // 默认使用 getColor

                        // 绑定 Tooltip，显示地块名称和值
                        layer.bindTooltip(
                            `<b>${name}</b><br>Value: ${
                                value !== undefined ? value.toFixed(2) : "N/A"
                            }`,
                            { direction: "top", sticky: true }
                        );

                        // 默认样式
                        layer.setStyle({
                            fillColor: colorFunction(value), // 动态设置填充颜色
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
                            if (
                                selectedFeature &&
                                selectedFeature !== feature
                            ) {
                                resetFeatureStyle(layer, selectedFeature); // 重置上一个选中地块的样式
                            }
                            handleFeatureClick(feature, layer); // 高亮当前选中地块
                            handleProvClickToGenerateTimeSeries(feature);
                        });
                        layer.on("mouseover", function (e) {
                            // Update info control with feature details
                            infoRef.current.update(
                                "<b>" +
                                    feature.properties.name +
                                    "</b><br>" +
                                    feature.properties.region
                            );

                            // Highlight the feature
                            layer.setStyle(highlightStyle);
                            highlightRef.current = layer;
                        });

                        layer.on("mouseout", function (e) {
                            // Reset the info control
                            if (infoRef.current) {
                                infoRef.current.update();
                            }

                            // Reset the feature style
                            if (highlightRef.current) {
                                highlightRef.current.setStyle(
                                    styleGeoJSON(feature)
                                );
                                highlightRef.current = null;
                            }
                        });
                    }
                });
                console.log("geojsonLayer:", geojsonLayer);
                geojsonLayer.addTo(map);
                geoJsonLayerRef.current = geojsonLayer; // Store the new layer
            })
            .catch((error) => console.error("Error loading GeoJSON:", error));
    }, [map, selectedDate]);

    return null;
}

// GeoTIFF Layer Component
function GeoTIFFLayer({ data_url, selectedDate }) {
    console.log("Received data URL in GeoTIFFLayer:", data_url);
    const map = useMap();
    const colorFunctions = {
        Prcp: getColorPrcp,
        Temp: getColorTemp,
        SPI: getColor,
        Yield: getColorYield,
        SMPct: getColorSMPct
    };
    // Function to get color based on vartype and pixel value
    function getColorByVartype(data_url, pixelValue) {
        const vartype = data_url.data_vartype;
        const colorFunction = colorFunctions[vartype] || getColor; // Default to getColorTemp if vartype is unknown
        return colorFunction(pixelValue);
    }

    useEffect(() => {
        const loadGeoTIFFData = async () => {
            try {
                const response = await fetch(data_url.url);
                const arrayBuffer = await response.arrayBuffer();
                const parsedRaster = await georaster(arrayBuffer);
                const bandIndex = Number(selectedDate - 1950);
                const layer = new GeoRasterLayer({
                    georaster: parsedRaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: (values) => {
                        const pixelValue =
                            data_url.data_vartype === "Prcp" ||
                            data_url.data_vartype === "Temp"
                                ? values[0]
                                : values[bandIndex];
                        if (pixelValue === 0 || isNaN(pixelValue)) {
                            return null;
                        }
                        return getColorByVartype(data_url, pixelValue);
                    },
                    resolution: 64
                });

                layer.addTo(map);
                map.fitBounds(layer.getBounds());
            } catch (error) {
                console.error("Error loading GeoTIFF data:", error);
            }
        };

        loadGeoTIFFData();
    }, [map, data_url.data_url, selectedDate]); // Adding `data_url` and `map` as dependencies

    return null;
}

// Info Control Component
function InfoControl() {
    const map = useMap();
    const infoRef = useRef(null);

    useEffect(() => {
        const info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Crop Area Data</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info;
    }, [map]);

    return null;
}

// Legend Control Component
function LegendControl({ data }) {
    const map = useMap();
    const legendRef = useRef(null);
    const legendConfig = {
        Prcp: {
            title: "Precipitation (mm)",
            grades: [0, 1, 2, 5, 10, 50, 100],
            colors: [
                "#D3D3D3",
                "#ADD8E6",
                "#00FFFF",
                "#FFFF00",
                "#FF4500",
                "#4B0082"
            ]
        },
        SPI: {
            title: "SPI",
            grades: [-2, -1.6, -1.3, -0.8, -0.5],
            labels: ["D4", "D3", "D2", "D1", "D0"],
            // colors: ['#d3d3d3', '#f7fcf0', '#ccebc5', '#a8ddb5', '#7bccc4', '#2b8cbe', '#084081'],
            colors: ["#730000", "#E60000", "#FFAA00", "#FCD37F", "#FFFF00"]
        },
        Temp: {
            title: "Temperature (℃)",
            grades: [15, 20, 25, 30],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        },
        Yield: {
            title: "Yield (k ha)",
            grades: [500000, 1000000, 5000000, 10000000, 100000000],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        },
        SMPct: {
            title: "SMPct",
            grades: [20, 40, 60, 80],
            colors: [
                "#00f", // Blue for 1°C (cool)
                "#0099ff", // Light blue for 5°C
                "#ffff00", // Yellow for 10°C
                "#ffcc00", // Orange for 20°C
                "#ff3300" // Red for 30°C (hot)],
            ]
        }
    };

    useEffect(() => {
        if (legendRef.current) {
            // If the legend already exists, remove it before adding a new one
            legendRef.current.remove();
        }

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            const vartype = data.data_vartype.startsWith("SPI")
                ? "SPI"
                : data.data_vartype || "Default";
            const config = legendConfig[vartype] || legendConfig.Default;

            const { title, grades, colors, labels } = config;

            // Add the legend title (this is used for general categories but not for SPI)
            div.innerHTML = `
      <div style="text-align: center; font-size: 1.3rem; font-weight: bold; margin-bottom: 2px;">
        <strong>${title}</strong>
      </div><br>
      `;
            if (vartype === "Prcp") {
                // Continuous color gradient legend
                const gradientBar = `
          <div style="
            background: linear-gradient(to right, ${colors.join(", ")});
            width: 100%;
            height: 20px;
            border: 1px solid #000;
            margin-bottom: 8px;">
          </div>
        `;

                div.innerHTML += gradientBar;

                // Add labels below the gradient bar
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");
                div.innerHTML += `
          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-top: 4px;">
            ${labels}
          </div>`;
            } else if (vartype === "SPI") {
                // Discrete color boxes for SPI
                for (let i = 0; i < grades.length; i++) {
                    div.innerHTML += `
            <div class="flex flex-col items-center" style="margin-bottom: 4px;">
            <div class="flex flex-col items-center mb-4">
              <div style="
                width: 30px;
                height: 20px;
                background-color: ${colors[i]};
                border: 2px solid #000;
                margin-bottom: 8px;">
              </div>
              <span class="text-sm">${labels[i]} (${grades[i]})</span>
            </div>`;
                }
            } else if (vartype === "Yield") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(60, 100%, 40%), hsl(120, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 确保标签数匹配渐变步数
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 让标签均匀分布

                // 生成刻度标签
                const labels = grades
                    .map((grade) => `<span>${Math.floor(grade / 1000)}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else if (vartype === "SMPct") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(210, 10%, 90%), hsl(210, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 确保标签数匹配渐变步数
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 让标签均匀分布

                // 生成刻度标签
                const labels = grades
                    .map((grade) => `<span>${Math.floor(grade)}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else if (vartype === "Temp") {
                const gradientBar = `
                <div style="
                  background: linear-gradient(to right, hsl(0, 30%, 90%), hsl(0, 100%, 40%));
                  width: 20vw;
                  height: 20px;
                  border: 1px solid #000;
                  margin-bottom: 8px;">
                </div>`;

                div.innerHTML += gradientBar;

                // 计算标签刻度
                const numLabels = grades.length;
                const step = Math.floor(100 / (numLabels - 1)); // 均匀分布标签

                // 生成标签
                const labels = grades
                    .map((grade) => `<span>${grade}</span>`)
                    .join(" ");

                div.innerHTML += `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-top: 4px;">
                  ${labels}
                </div>`;
            } else {
                // Default legend
                div.innerHTML += `
          <div style="
            width: 30px;
            height: 20px;
            background-color: ${colors[0]};
            border: 2px solid #000;
            margin-bottom: 4px;">
          </div>
          <span class="text-sm">${grades[0]}</span>`;
            }

            return div;
        };

        legend.addTo(map);
        legendRef.current = legend;

        return () => {
            // Clean up the legend when the component unmounts or re-renders
            if (legendRef.current) {
                legendRef.current.remove();
            }
        };
    }, [map, data.data_vartype]);

    return null;
}

// Zoom Control Component
function ZoomControl() {
    const map = useMap();

    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const zoomChange = e.deltaY < 0 ? 1 : -1;
                const newZoom = map.getZoom() + zoomChange;
                map.setZoom(
                    Math.min(
                        Math.max(newZoom, map.getMinZoom()),
                        map.getMaxZoom()
                    )
                );
            }
        };

        map.getContainer().addEventListener("wheel", handleWheel, {
            passive: false
        });

        return () => {
            map.getContainer().removeEventListener("wheel", handleWheel);
        };
    }, [map]);

    return null;
}

// Function to generate color based on value
function getColor(d) {
    return d > -0.5
        ? "#fff"
        : d > -0.8
        ? "#FFFF00"
        : d > -1.3
        ? "#FCD37F"
        : d > -1.6
        ? "#FFAA00"
        : d > -2
        ? "#74c476"
        : "#c7e9c0"; // Light green
}

// function getColorPrcp(d) {
//     return d > 100
//         ? "#4B0082" // Indigo for extreme precipitation (>100mm)
//         : d > 50
//         ? "#FF4500" // Orange-Red for 51-100mm
//         : d > 10
//         ? "#FFFF00" // Yellow for moderate rainfall (10-50mm)
//         : d > 5
//         ? "#00FFFF" // Aqua for light rainfall (5-10mm)
//         : d > 1
//         ? "#ADD8E6" // Light Blue for very low rainfall (1-5mm)
//         : d > 0
//         ? "#D3D3D3" // Light Grey for no precipitation (0-1mm)
//         : "#FFFFFF"; // White as a fallback
// }

function getColorPrcp(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // 定义颜色范围：HSL（色相、饱和度、亮度）
    const minVal = 0; // 最小降水量
    const maxVal = 11; // 最大降水量（超过 100mm 按 100 计算）

    const minHue = 200; // 蓝色 (H=240)
    const maxHue = 0; // 红色 (H=0)

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue); // 从蓝色到红色

    return `hsl(${hue}, 100%, 50%)`; // 保持饱和度 100%，亮度 50%
}

function getColorTemp(d) {
    if (d <= 0) return "#333"; // if no value

    // define data range
    const minVal = 15; // min
    const maxVal = 30; // max

    // HSL
    const minSaturation = 30;
    const maxSaturation = 100;
    const minLightness = 90;
    const maxLightness = 40;

    // 归一化 d 值到 [0, 1]
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));

    // 计算 HSL 颜色值
    let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    let lightness = minLightness - ratio * (minLightness - maxLightness);

    // 返回计算出的 HSL 颜色值
    return `hsl(0, ${saturation}%, ${lightness}%)`;
}

function getColorYield(d) {
    if (d <= 0) return "#FFFFFF"; // No precipitation

    // 定义颜色范围：HSL（色相、饱和度、亮度）
    const minVal = 0; // 最小降水量
    const maxVal = 100000000; // 最大降水量（超过 100mm 按 100 计算）

    const minHue = 60;
    const maxHue = 120;

    // 归一化 d 值到 [0, 1]，并计算插值色相
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 90%, 40%)`;

    // return `hsl(${hue}, 70%, 50%)`; // 保持饱和度 100%，亮度 50%

    // return d > 100000000
    //     ? "#730000" // Dark red for temperatures > 30°C
    //     : d > 10000000
    //     ? "#E60000" // Red for temperatures between 20°C and 30°C
    //     : d > 5000000
    //     ? "#FFAA00" // Orange for temperatures between 10°C and 20°C
    //     : d > 1000000
    //     ? "#FCD37F" // Yellow for temperatures between 5°C and 10°C
    //     : d > 500000
    //     ? "#FFFF00" // Light yellow for temperatures between 1°C and 5°C
    //     : "#fff"; // White for temperatures <= 1°C or no temperature data
}

function getColorSMPct(d) {
    if (d <= 0) return "hsl(210, 10%, 100%)"; // 最浅色（灰蓝）

    // 定义数据范围
    const minVal = 20; // 最小值
    const maxVal = 80; // 最大值

    // HSL 颜色范围
    const minSaturation = 10; // 最小饱和度
    const maxSaturation = 100; // 最大饱和度
    const minLightness = 90; // 最小亮度（最浅色）
    const maxLightness = 40; // 最大亮度（最深色）

    // 归一化数据 d 到 [0, 1]
    let ratio = Math.min(1, (d - minVal) / (maxVal - minVal));

    // 计算 HSL 颜色值
    let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    let lightness = minLightness - ratio * (minLightness - maxLightness);

    // 返回计算出的 HSL 颜色值
    return `hsl(210, ${saturation}%, ${lightness}%)`;
}

// const MapComponent = ({ map, geojsonData, geoRasterData }) => {
//     const getColor = (pixelValue) => {
//         // Define your color scale function here
//         if (pixelValue > 50) return "red";
//         if (pixelValue > 30) return "orange";
//         if (pixelValue > 10) return "yellow";
//         return "green";
//     };

//     useEffect(() => {
//         if (map && geoRasterData) {
//             parseGeoraster(geoRasterData).then((georaster) => {
//                 const layer = new GeoRasterLayer({
//                     georaster,
//                     opacity: 0.7,
//                     pixelValuesToColorFn: (values) => {
//                         const pixelValue = values[0];
//                         if (pixelValue === 0 || isNaN(pixelValue)) {
//                             return null;
//                         }
//                         return getColor(pixelValue);
//                     },
//                     resolution: 64,
//                 });

//                 layer.addTo(map);
//                 map.fitBounds(layer.getBounds());
//             });
//         }
//     }, [map, geoRasterData]);

//     return (
//         <>
//             {/* Base Tile Layer */}
//             <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

//             {/* Conditional Rendering of GeoJSON or GeoTIFF */}
//             {geojsonData && !geoRasterData && (
//                 <GeoJSON
//                     key={`geojson-${Date.now()}`}
//                     data={geojsonData}
//                     style={styleGeoJSON} // Define your styleGeoJSON function
//                     onEachFeature={handleEachFeature} // Define your handleEachFeature function
//                 />
//             )}
//         </>
//     );
// };

// export default dynamic(() => Promise.resolve(MapComponent), { ssr: false });
