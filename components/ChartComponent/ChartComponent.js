// import React, { useEffect, useRef, useState } from "react";
// import Chart from "chart.js/auto";
// import "chartjs-adapter-date-fns"; // Required for proper time-scale handling

// // Import modular utilities
// import {
//     processData,
//     getYearOptions,
//     filterDataByYearRange
// } from "./ChartDataProcessor";
// import { createTimeSeriesChart, createEnsembleChart } from "./ChartRenderers";
// import { downloadCSV, downloadImage } from "./ChartExportUtils";
// import { getChartTitle } from "./ChartComponentUtils";

// export const ChartComponent = ({ data, options }) => {
//     const chartRef = useRef(null);
//     const chartInstanceRef = useRef(null);

//     // For date filtering and range selection
//     const [startYear, setStartYear] = useState(null);
//     const [endYear, setEndYear] = useState(null);
//     const [filteredData, setFilteredData] = useState([]);
//     const [processedData, setProcessedData] = useState([]);
//     const [dataReady, setDataReady] = useState(false);
//     const [showDownloadOptions, setShowDownloadOptions] = useState(false);
//     const [chartType, setChartType] = useState("standard"); // standard, ensemble, or timeSeries

//     // Process data when it changes
//     useEffect(() => {
//         if (!data || data.length === 0) return;

//         // Process data for chart
//         processData(
//             data,
//             setChartType,
//             setProcessedData,
//             setDataReady,
//             setStartYear,
//             setEndYear
//         );
//     }, [data]);

//     // Filter data when year range or processed data changes
//     useEffect(() => {
//         if (
//             !processedData ||
//             processedData.length === 0 ||
//             !startYear ||
//             !endYear
//         )
//             return;

//         const filtered = filterDataByYearRange(
//             processedData,
//             startYear,
//             endYear
//         );
//         setFilteredData(filtered);
//     }, [processedData, startYear, endYear]);

//     // Update chart when filtered data changes
//     useEffect(() => {
//         if (!dataReady || !chartRef.current || filteredData.length === 0)
//             return;

//         createChart();
//     }, [filteredData, dataReady]);

//     // Create and render the chart
//     const createChart = () => {
//         // Clean up existing chart
//         if (chartInstanceRef.current) {
//             chartInstanceRef.current.destroy();
//         }

//         const ctx = chartRef.current.getContext("2d");

//         // Create chart based on detected chart type
//         if (chartType === "ensemble") {
//             createEnsembleChart(ctx, filteredData, options, chartInstanceRef);
//         } else {
//             createTimeSeriesChart(
//                 ctx,
//                 filteredData,
//                 chartType,
//                 options,
//                 chartInstanceRef
//             );
//         }
//     };

//     // Handle year range selection change
//     const handleYearRangeChange = () => {
//         if (
//             !startYear ||
//             !endYear ||
//             !processedData ||
//             processedData.length === 0
//         )
//             return;

//         const filtered = filterDataByYearRange(
//             processedData,
//             startYear,
//             endYear
//         );
//         setFilteredData(filtered);
//     };

//     // Handle download button options
//     const handleDownload = (format) => {
//         if (format === "csv") {
//             downloadCSV(filteredData, startYear, endYear);
//         } else {
//             downloadImage(chartRef, startYear, endYear, format);
//         }
//         setShowDownloadOptions(false); // Hide dropdown after selection
//     };

//     return (
//         <div className="chart-component">
//             {/* Title area */}
//             <div className="chart-header">
//                 {/* <h2 className="chart-title">{getChartTitle(options)}</h2> */}
//                 {data && data.length > 0 && (
//                     <div className="chart-controls">
//                         <div className="range-selector">
//                             <div className="year-range">
//                                 <label>
//                                     Start Year:
//                                     <select
//                                         value={startYear || ""}
//                                         onChange={(e) =>
//                                             setStartYear(Number(e.target.value))
//                                         }
//                                         className="year-select"
//                                     >
//                                         {getYearOptions(processedData).map(
//                                             (year) => (
//                                                 <option
//                                                     key={`start-${year}`}
//                                                     value={year}
//                                                 >
//                                                     {year}
//                                                 </option>
//                                             )
//                                         )}
//                                     </select>
//                                 </label>
//                                 <label>
//                                     End Year:
//                                     <select
//                                         value={endYear || ""}
//                                         onChange={(e) =>
//                                             setEndYear(Number(e.target.value))
//                                         }
//                                         className="year-select"
//                                     >
//                                         {getYearOptions(processedData).map(
//                                             (year) => (
//                                                 <option
//                                                     key={`end-${year}`}
//                                                     value={year}
//                                                 >
//                                                     {year}
//                                                 </option>
//                                             )
//                                         )}
//                                     </select>
//                                 </label>
//                                 <button
//                                     onClick={handleYearRangeChange}
//                                     className="update-button"
//                                 >
//                                     Update Chart
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="download-options">
//                             <button
//                                 onClick={() =>
//                                     setShowDownloadOptions(!showDownloadOptions)
//                                 }
//                                 className="download-button"
//                             >
//                                 Download ▼
//                             </button>
//                             {showDownloadOptions && (
//                                 <div className="download-dropdown">
//                                     <button
//                                         onClick={() => handleDownload("csv")}
//                                     >
//                                         CSV Data
//                                     </button>
//                                     <button
//                                         onClick={() => handleDownload("png")}
//                                     >
//                                         PNG Image
//                                     </button>
//                                     <button
//                                         onClick={() => handleDownload("jpg")}
//                                     >
//                                         JPG Image
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Chart container */}
//             <div className="chart-container">
//                 {data && data.length > 0 ? (
//                     <canvas ref={chartRef}></canvas>
//                 ) : (
//                     <div className="no-data-message">
//                         <p>
//                             No data available. Please select a region on the
//                             map.
//                         </p>
//                     </div>
//                 )}

//                 {/* Loading indicator */}
//                 {data && data.length > 0 && !dataReady && (
//                     <div className="loading-overlay">
//                         <div className="loading-spinner"></div>
//                         <p>Processing data...</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns"; // Required for proper time-scale handling

// Import modular utilities
import {
    processData,
    getYearOptions,
    filterDataByYearRange
} from "./ChartDataProcessor";
import { createTimeSeriesChart, createEnsembleChart } from "./ChartRenderers";
import { downloadCSV, downloadImage } from "./ChartExportUtils";
import { getChartTitle } from "./ChartComponentUtils";

export const ChartComponent = ({ geojsonData, options }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // For date filtering and range selection
    const [startYear, setStartYear] = useState(null);
    const [endYear, setEndYear] = useState(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [processedData, setProcessedData] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [chartType, setChartType] = useState("standard"); // standard, ensemble, timeSeries, or ensembleWithStats
    const [hasBuiltInStats, setHasBuiltInStats] = useState(false); // Store built-in stats detection result

    // Check for built-in statistics very first using original raw data

    // useEffect(() => {
    //     // if (!data || data.length === 0) return;

    //     console.log("select inner data property:", data);

    //     // Check if this is GeoJSON format with properties
    //     if (data[0]?.properties) {
    //         const properties = data[0].properties;
    //         const keys = Object.keys(properties);

    //         // Look for keys with _min, _max, or _mean suffixes
    //         const hasStatKeys = keys.some(
    //             (key) =>
    //                 key.includes("_min") ||
    //                 key.includes("_max") ||
    //                 key.includes("_mean")
    //         );

    //         console.log("Built-in stats detection:", hasStatKeys);
    //         console.log("Sample properties keys:", keys.slice(0, 10));
    //         setHasBuiltInStats(hasStatKeys);
    //     } else {
    //         setHasBuiltInStats(false);
    //     }
    // }, [data]);

    // useEffect: 将原始 feature 转换为 timeSeries 数组
    useEffect(() => {
        if (!geojsonData || !geojsonData.properties) {
            setProcessedData([]);
            return;
        }

        const properties = geojsonData.properties;
        const keys = Object.keys(properties);

        // 判断是否内置统计字段
        const hasStats = keys.some(
            (k) =>
                k.endsWith("_min") || k.endsWith("_max") || k.endsWith("_mean")
        );
        setHasBuiltInStats(hasStats);

        // 提取年份字段
        const historicalKeys = keys.filter(
            (key) => /^y\d+$/.test(key) && !/^y\d+_\d+$/.test(key)
        );
        const forecastKeys = keys.filter((key) => /^y\d+_\d+$/.test(key));

        let extractedData = [];

        if (historicalKeys.length > 0) {
            extractedData = historicalKeys.map((key) => ({
                year: parseInt(key.substring(1), 10),
                value: parseFloat(properties[key])
            }));
        } else if (forecastKeys.length > 0) {
            extractedData = forecastKeys
                .map((key) => {
                    const [_, year, ensemble] =
                        key.match(/^y(\d+)_(\d+)$/) || [];
                    return {
                        year: parseInt(year, 10),
                        ensemble: parseInt(ensemble, 10),
                        value: parseFloat(properties[key])
                    };
                })
                .filter((item) => item?.value != null && !isNaN(item.value));
        }

        // setProcessedData(extractedData);
        setDataReady(extractedData.length > 0);
        setData(extractedData);
    }, [geojsonData]);

    // Process data when it changes
    useEffect(() => {
        if (!data || data.length === 0) return;

        // Process data for chart, passing hasBuiltInStats information
        processData(
            data,
            setChartType,
            setProcessedData,
            setDataReady,
            setStartYear,
            setEndYear,
            hasBuiltInStats // Pass the built-in stats detection result
        );
    }, [data, hasBuiltInStats]);

    // Filter data when year range or processed data changes
    useEffect(() => {
        if (
            !processedData ||
            processedData.length === 0 ||
            !startYear ||
            !endYear
        )
            return;

        const filtered = filterDataByYearRange(
            processedData,
            startYear,
            endYear
        );
        setFilteredData(filtered);
    }, [processedData, startYear, endYear]);

    // Update chart when filtered data changes
    useEffect(() => {
        if (!dataReady || !chartRef.current || filteredData.length === 0)
            return;

        createChart();
    }, [filteredData, dataReady]);

    // Create and render the chart
    const createChart = () => {
        // Clean up existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        // Create chart based on detected chart type and pass hasBuiltInStats
        if (chartType === "ensemble" || chartType === "ensembleWithStats") {
            createEnsembleChart(
                ctx,
                filteredData,
                options,
                chartInstanceRef,
                hasBuiltInStats
            );
        } else {
            createTimeSeriesChart(
                ctx,
                filteredData,
                chartType,
                options,
                chartInstanceRef
            );
        }
    };

    // Handle year range selection change
    const handleYearRangeChange = () => {
        if (
            !startYear ||
            !endYear ||
            !processedData ||
            processedData.length === 0
        )
            return;

        const filtered = filterDataByYearRange(
            processedData,
            startYear,
            endYear
        );
        setFilteredData(filtered);
    };

    // Handle download button options
    const handleDownload = (format) => {
        if (format === "csv") {
            downloadCSV(filteredData, startYear, endYear, hasBuiltInStats);
        } else {
            downloadImage(chartRef, startYear, endYear, format);
        }
        setShowDownloadOptions(false); // Hide dropdown after selection
    };

    return (
        <div className="chart-component">
            {/* Title area */}
            <div className="chart-header">
                {data && data.length > 0 && (
                    <div className="chart-controls">
                        <div className="range-selector">
                            <div className="year-range">
                                <label>
                                    Start Year:
                                    <select
                                        value={startYear || ""}
                                        onChange={(e) =>
                                            setStartYear(Number(e.target.value))
                                        }
                                        className="year-select"
                                    >
                                        {getYearOptions(processedData).map(
                                            (year) => (
                                                <option
                                                    key={`start-${year}`}
                                                    value={year}
                                                >
                                                    {year}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                                <label>
                                    End Year:
                                    <select
                                        value={endYear || ""}
                                        onChange={(e) =>
                                            setEndYear(Number(e.target.value))
                                        }
                                        className="year-select"
                                    >
                                        {getYearOptions(processedData).map(
                                            (year) => (
                                                <option
                                                    key={`end-${year}`}
                                                    value={year}
                                                >
                                                    {year}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>
                                <button
                                    onClick={handleYearRangeChange}
                                    className="update-button"
                                >
                                    Update Chart
                                </button>
                            </div>
                        </div>

                        <div className="download-options">
                            <button
                                onClick={() =>
                                    setShowDownloadOptions(!showDownloadOptions)
                                }
                                className="download-button"
                            >
                                Download ▼
                            </button>
                            {showDownloadOptions && (
                                <div className="download-dropdown">
                                    <button
                                        onClick={() => handleDownload("csv")}
                                    >
                                        CSV Data
                                    </button>
                                    <button
                                        onClick={() => handleDownload("png")}
                                    >
                                        PNG Image
                                    </button>
                                    <button
                                        onClick={() => handleDownload("jpg")}
                                    >
                                        JPG Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Chart container */}
            <div className="chart-container">
                {data && data.length > 0 ? (
                    <canvas ref={chartRef}></canvas>
                ) : (
                    <div className="no-data-message">
                        <p>
                            No data available. Please select a region on the
                            map.
                        </p>
                    </div>
                )}

                {/* Loading indicator */}
                {data && data.length > 0 && !dataReady && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Processing data...</p>
                    </div>
                )}
            </div>

            {/* Chart footer with explanation for new statistics format */}
            {(chartType === "ensembleWithStats" || hasBuiltInStats) && (
                <div className="chart-footer">
                    <h3>Chart Legend</h3>
                    <ul>
                        <li>
                            <span className="chart-legend-item mean"></span>
                            <strong>Mean</strong> - Pre-calculated average value
                            across all ensemble members
                        </li>
                        <li>
                            <span className="chart-legend-item max"></span>
                            <strong>Max</strong> - Pre-calculated maximum value
                            across all ensemble members
                        </li>
                        <li>
                            <span className="chart-legend-item min"></span>
                            <strong>Min</strong> - Pre-calculated minimum value
                            across all ensemble members
                        </li>
                        {filteredData.some(
                            (d) =>
                                d.ensembleMembers &&
                                d.ensembleMembers.length > 0
                        ) && (
                            <li>
                                <span className="chart-legend-item ensemble"></span>
                                <strong>Individual Ensemble Members</strong> -
                                Individual forecast scenarios (light gray lines)
                            </li>
                        )}
                    </ul>
                    <div className="ensemble-explainer">
                        <em>
                            This chart displays forecast data with built-in
                            statistical calculations for improved performance
                            and consistency.
                        </em>
                    </div>
                </div>
            )}
        </div>
    );
};
