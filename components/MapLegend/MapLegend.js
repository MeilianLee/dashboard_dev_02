import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// export const MapLegend = ({ data }) => {
//     const legendConfig = {
//         Prcp: {
//             title: "Precipitation (mm)",
//             grades: [0, 200, 400, 600, 800, 1000],
//             colors: ["#0033FF", "#0099FF", "#00FF99", "#FFFF00", "#FF3300"]
//         },
//         PrcpProv: {
//             title: "Precipitation (mm)",
//             grades: [0, 600, 1200, 1800, 2400, 3000],
//             colors: [
//                 "hsl(200, 100%, 50%)",
//                 "hsl(150, 100%, 50%)",
//                 "hsl(100, 100%, 50%)",
//                 "hsl(50, 100%, 50%)",
//                 "hsl(0, 100%, 50%)"
//             ]
//         },
//         PrcpProvMonthly: {
//             title: "Precipitation (mm)",
//             grades: [0, 100, 200, 300, 400, 500],
//             colors: [
//                 "hsl(200, 100%, 50%)",
//                 "hsl(150, 100%, 50%)",
//                 "hsl(100, 100%, 50%)",
//                 "hsl(50, 100%, 50%)",
//                 "hsl(0, 100%, 50%)"
//             ]
//         },

//         SPI: {
//             title: "Drought Index",
//             grades: [2, 1.5, 1, 0, -1, -1.5, -2],
//             labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
//             colors: [
//                 "#14713d",
//                 "#3cb371",
//                 "#98fb98",
//                 "#eee",
//                 "#f5deb3",
//                 "#d2691e",
//                 "#b22222"
//             ],
//             className: "legend-SPI"
//         },
//         Temp: {
//             title: "Temperature (℃)",
//             grades: [10, 15, 20, 25, 30, 35],
//             colors: [
//                 "#08306B",
//                 "#4292C6",
//                 "#41AB5D",
//                 "#F7DC6F",
//                 "#E67E22",
//                 "#C0392B"
//             ]
//         },
//         Yield: {
//             title: "Yield (ton/ha)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "hsl(30, 100%, 40%)",
//                 "hsl(60, 100%, 40%)",
//                 "hsl(90, 100%, 40%)",
//                 "hsl(120, 100%, 40%)"
//             ]
//         },
//         YieldProv: {
//             title: "Yield (ton/ha)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "hsl(30, 100%, 40%)",
//                 "hsl(60, 100%, 40%)",
//                 "hsl(90, 100%, 40%)",
//                 "hsl(120, 100%, 40%)"
//             ]
//         },
//         Prod: {
//             title: "Production (ton)",
//             grades: [1, 3, 5, 7],
//             colors: [
//                 "#00f", // Blue for 1°C (cool)
//                 "#0099ff", // Light blue for 5°C
//                 "#ffff00", // Yellow for 10°C
//                 "#ffcc00", // Orange for 20°C
//                 "#ff3300" // Red for 30°C (hot)],
//             ]
//         },
//         SMPct: {
//             title: "SMPct",
//             grades: [20, 40, 60, 80]
//         }
//     };

//     const map = useMap();
//     const legendRef = useRef(null);

//     useEffect(() => {
//         if (legendRef.current) {
//             legendRef.current.remove();
//         }

//         const legend = L.control({ position: "bottomleft" });
//         legend.onAdd = function () {
//             let vartype = data.data_vartype.startsWith("SPI")
//                 ? "SPI"
//                 : data.data_vartype === "Yield"
//                 ? "YieldProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Prov" &&
//                   data.data_dateType === "Yearly"
//                 ? "PrcpProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Country" &&
//                   data.data_dateType === "Yearly"
//                 ? "PrcpProv"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Prov" &&
//                   data.data_dateType === "Monthly"
//                 ? "PrcpProvMonthly"
//                 : data.data_vartype === "Prcp" &&
//                   data.data_adminLevel === "Country" &&
//                   data.data_dateType === "Monthly"
//                 ? "PrcpProvMonthly"
//                 : data.data_vartype || "Default";

//             const config = legendConfig[vartype] || {};

// let div = L.DomUtil.create(
//     "div",
//     `legend-container ${config.className || "legend-default"}`
// );

// if (vartype === "SPI") {
//     const tooltipTexts = {
//         D3: "Extreme Drought Major crop losses, widespread water shortages.",
//         D2: "Severe Drought Likely crop loss, water restrictions may be needed.",
//         D1: "Some damage to crops, low streamflow, water shortages possible.",
//         D0: "Typical climate conditions, no significant anomalies.",
//         W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
//         W2: "High rainfall, increased runoff, risk of localized flooding.",
//         W3: "Unusual flooding, excessive soil moisture, potential waterlogging."
//     };

//     const legendTexts = {
//         D3: "Extremely Dry",
//         D2: "Severely Dry",
//         D1: "Moderately Dry",
//         D0: "Near Normal",
//         W1: "Moderately Wet",
//         W2: "Severly Wet",
//         W3: "Extremely Wet"
//     };

//     const legendContainer = document.createElement("div");

//     const title = document.createElement("div");
//     title.className = "legend-title";
//     title.textContent = config.title;
//     legendContainer.appendChild(title);

//     for (let i = 0; i < config.grades.length; i++) {
//         const tooltipText =
//             tooltipTexts[config.labels[i]] ||
//             "No information available";

//         const legendItem = document.createElement("div");
//         legendItem.className = "legend-item";

//         // 问号图标
//         const infoIcon = document.createElement("div");
//         infoIcon.className = "info-icon";
//         infoIcon.innerHTML = `?`;

//         const tooltip = document.createElement("div");
//         tooltip.className = "tooltip";
//         tooltip.textContent = tooltipText;
//         infoIcon.appendChild(tooltip);

//         // 颜色块
//         const colorBox = document.createElement("div");
//         colorBox.className = "color-box";
//         colorBox.style.backgroundColor = config.colors[i];

//         // 标签文本
//         const legendText = document.createElement("span");
//         legendText.className = "legend-text";
//         legendText.textContent = legendTexts[config.labels[i]];

//         legendItem.appendChild(infoIcon);
//         legendItem.appendChild(colorBox);
//         legendItem.appendChild(legendText);

//         legendContainer.appendChild(legendItem);
//     }
//     div.appendChild(legendContainer);
// } else if (config.colors) {
//     div.innerHTML = `<div class="legend-title">${
//         config.title || "Legend"
//     }</div>`;
//     div.innerHTML += `<div class="legend-gradient" style="background: linear-gradient(to right, ${config.colors.join(
//         ", "
//     )});"></div>`;
//     div.innerHTML += `<div class="legend-labels">${config.grades
//         .map((g) => `<span>${g}</span>`)
//         .join(" ")}</div>`;
// }

// return div;
//         };

//         legend.addTo(map);
//         legendRef.current = legend;

//         return () => legend.remove();
//     }, [map, data.data_vartype]);

//     return null;
// };

// import React from "react";

export const MapLegend = ({ data, selectedDate }) => {
    // month names map
    const formatDateDisplay = (selectedDate) => {
        if (!selectedDate) return "Unknown Date";

        const year = selectedDate.slice(0, 4);
        const month =
            selectedDate.length >= 6 ? selectedDate.slice(4, 6) : null;
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

    const legendConfig = {
        Prcp: {
            title: "Precipitation (mm)",
            grades: [0, 200, 400, 600, 800, 1000],
            colors: ["#0033FF", "#0099FF", "#00FF99", "#FFFF00", "#FF3300"]
        },
        PrcpProv: {
            title: "Precipitation (mm)",
            grades: [0, 600, 1200, 1800, 2400, 3000],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },
        PrcpProvMonthly: {
            title: "Precipitation (mm)",
            grades: [0, 100, 200, 300, 400, 500],
            colors: [
                "hsl(200, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(0, 100%, 50%)"
            ]
        },

        SPI: {
            title: "Drought Index",
            grades: [2, 1.5, 1, 0, -1, -1.5, -2],
            labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
            colors: [
                "#14713d",
                "#3cb371",
                "#98fb98",
                "#eee",
                "#f5deb3",
                "#d2691e",
                "#b22222"
            ],
            className: "legend-SPI"
        },
        Temp: {
            title: "Temperature (℃)",
            grades: [10, 15, 20, 25, 30, 35],
            colors: [
                "#08306B",
                "#4292C6",
                "#41AB5D",
                "#F7DC6F",
                "#E67E22",
                "#C0392B"
            ]
        },
        Yield: {
            title: "Yield (ton/ha)",
            grades: [1, 3, 5, 7],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(60, 100%, 40%)",
                "hsl(90, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        YieldProv: {
            title: "Yield (ton/ha)",
            grades: [1, 3, 5, 7],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(60, 100%, 40%)",
                "hsl(90, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        Area: {
            title: "Rice Area",
            grades: [0, 0.33, 0.67, 1],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(60, 100%, 40%)",
                "hsl(90, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        Production: {
            title: "Production (ton)",
            grades: [0, 5, 10, 15],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(60, 100%, 40%)",
                "hsl(90, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        SMPct: {
            title: "SMPct",
            grades: [20, 40, 60, 80]
        }
    };

    let vartype = data.data_vartype.startsWith("SPI")
        ? "SPI"
        : data.data_vartype === "Yield"
        ? "YieldProv"
        : data.data_vartype === "Area"
        ? "Area"
        : data.data_vartype === "Production"
        ? "Production"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Prov" &&
          data.data_dateType === "Yearly"
        ? "PrcpProv"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Country" &&
          data.data_dateType === "Yearly"
        ? "PrcpProv"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Prov" &&
          data.data_dateType === "Monthly"
        ? "PrcpProvMonthly"
        : data.data_vartype === "Prcp" &&
          data.data_adminLevel === "Country" &&
          data.data_dateType === "Monthly"
        ? "PrcpProvMonthly"
        : data.data_vartype || "Default";

    const config = legendConfig[vartype] || legendConfig["Yield"];

    return (
        <div
            className={`legend-container ${
                config.className || "legend-default"
            }`}
        >
            <div className="legend-title">{config.title}</div>
            {vartype === "SPI" ? (
                <div className="legend-items">
                    {config.labels.map((label, i) => (
                        <div key={i} className="legend-item">
                            {/* 问号图标及 Tooltip */}
                            <div className="info-icon">
                                ?
                                <div className="tooltip">
                                    {tooltipTexts[label] ||
                                        "No information available"}
                                </div>
                            </div>

                            {/* 颜色块 */}
                            <div
                                className="color-box"
                                style={{ backgroundColor: config.colors[i] }}
                            ></div>

                            {/* 标签文本 */}
                            <span className="legend-text">
                                {legendTexts[label]}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="legend-gradient-container">
                    <div
                        className="legend-gradient"
                        style={{
                            background: `linear-gradient(to right, ${config.colors.join(
                                ", "
                            )})`
                        }}
                    ></div>
                    <div className="legend-labels">
                        {config.grades.map((grade, i) => (
                            <span key={i}>{grade}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// SPI 类型的 Tooltip 信息
const tooltipTexts = {
    D3: "Extreme Drought Major crop losses, widespread water shortages.",
    D2: "Severe Drought Likely crop loss, water restrictions may be needed.",
    D1: "Some damage to crops, low streamflow, water shortages possible.",
    D0: "Typical climate conditions, no significant anomalies.",
    W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
    W2: "High rainfall, increased runoff, risk of localized flooding.",
    W3: "Unusual flooding, excessive soil moisture, potential waterlogging."
};

// SPI 级别的文本标签
const legendTexts = {
    D3: "Extremely Dry",
    D2: "Severely Dry",
    D1: "Moderately Dry",
    D0: "Near Normal",
    W1: "Moderately Wet",
    W2: "Severly Wet",
    W3: "Extremely Wet"
};
