// import React, { useEffect, useRef, useState } from "react";
// import Chart from "chart.js/auto";

// export const ChartComponent = ({ data, options }) => {
//     const chartRef = useRef(null);
//     const chartInstanceRef = useRef(null);

//     // For date filtering and range selection
//     const [startYear, setStartYear] = useState(null);
//     const [endYear, setEndYear] = useState(null);
//     const [filteredData, setFilteredData] = useState([]);
//     const [dataReady, setDataReady] = useState(false);
//     const [showDownloadOptions, setShowDownloadOptions] = useState(false);

//     // Process data when it changes
//     useEffect(() => {
//         if (!data || data.length === 0) return;

//         // Set initial year range based on available data
//         const years = [...new Set(data.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//         if (!startYear && years.length > 0) setStartYear(years[0]);
//         if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);

//         // Process data for chart
//         processData(data);
//     }, [data]);

//     // Filter data when range changes
//     useEffect(() => {
//         if (!data || data.length === 0 || !startYear || !endYear) return;

//         const newFilteredData = data.filter(
//             (item) => item.year >= startYear && item.year <= endYear
//         );
//         setFilteredData(newFilteredData);
//         setDataReady(true);
//     }, [data, startYear, endYear]);

//     // Process data to prepare for visualization
//     const processData = (rawData) => {
//         if (!rawData || rawData.length === 0) return;

//         // If the data contains ensemble members, process it differently
//         if (rawData.some((d) => d.hasOwnProperty("ensemble"))) {
//             processEnsembleData(rawData);
//         } else {
//             setFilteredData(rawData);
//             setDataReady(true);
//         }
//     };

//     // Special processing for ensemble forecast data
//     const processEnsembleData = (rawData) => {
//         // No additional processing needed at this level
//         // We will handle the ensemble visualization in the chart creation
//         setFilteredData(rawData);
//         setDataReady(true);
//     };

//     // Update chart when filtered data changes
//     useEffect(() => {
//         if (!dataReady || !chartRef.current) return;

//         createChart();
//     }, [filteredData, dataReady]);

//     // Create and render the chart
//     const createChart = () => {
//         // Clean up existing chart
//         if (chartInstanceRef.current) {
//             chartInstanceRef.current.destroy();
//         }

//         const ctx = chartRef.current.getContext("2d");

//         // Check if data contains ensemble members
//         const hasEnsembleMembers = filteredData.some((d) =>
//             d.hasOwnProperty("ensemble")
//         );

//         if (hasEnsembleMembers) {
//             createEnsembleChart(ctx);
//         } else {
//             createStandardChart(ctx);
//         }
//     };

//     // Create a chart for non-ensemble data
//     const createStandardChart = (ctx) => {
//         // Sort data chronologically
//         const sortedData = [...filteredData].sort((a, b) => a.year - b.year);

//         // Prepare datasets
//         const datasets = [
//             {
//                 label: getChartLabel(),
//                 data: sortedData.map((item) => ({
//                     x: item.year,
//                     y: item.value
//                 })),
//                 borderColor: "rgba(75, 192, 192, 1)",
//                 backgroundColor: "rgba(75, 192, 192, 0.2)",
//                 borderWidth: 3,
//                 tension: 0.3, // Adds slight curve to lines
//                 pointRadius: 4,
//                 pointHoverRadius: 6
//             }
//         ];

//         // If data has upper/lower bounds, add them
//         if (
//             sortedData.some(
//                 (d) =>
//                     d.hasOwnProperty("upper_bound") &&
//                     d.hasOwnProperty("lower_bound")
//             )
//         ) {
//             datasets.push({
//                 label: "Upper Bound",
//                 data: sortedData.map((item) => ({
//                     x: item.year,
//                     y: item.upper_bound
//                 })),
//                 borderColor: "rgba(75, 192, 192, 0.5)",
//                 borderWidth: 1,
//                 borderDash: [5, 5],
//                 pointRadius: 0,
//                 fill: false
//             });

//             datasets.push({
//                 label: "Lower Bound",
//                 data: sortedData.map((item) => ({
//                     x: item.year,
//                     y: item.lower_bound
//                 })),
//                 borderColor: "rgba(75, 192, 192, 0.5)",
//                 borderWidth: 1,
//                 borderDash: [5, 5],
//                 pointRadius: 0,
//                 fill: {
//                     target: "-1",
//                     above: "rgba(75, 192, 192, 0.1)"
//                 }
//             });
//         }

//         chartInstanceRef.current = new Chart(ctx, {
//             type: "line",
//             data: { datasets },
//             options: createChartOptions()
//         });
//     };

//     // Create a chart for ensemble data (spaghetti plot)
//     const createEnsembleChart = (ctx) => {
//         // Extract unique years and ensemble members
//         const years = [...new Set(filteredData.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//         const ensembleMembers = [
//             ...new Set(filteredData.map((d) => d.ensemble))
//         ].sort((a, b) => a - b);

//         // Create stats by year
//         const yearlyStats = years.map((year) => {
//             const yearData = filteredData.filter((d) => d.year === year);
//             const values = yearData
//                 .map((d) => d.value)
//                 .filter((v) => v !== null && v !== undefined);

//             return {
//                 year,
//                 mean: values.length
//                     ? values.reduce((sum, val) => sum + val, 0) / values.length
//                     : null,
//                 min: values.length ? Math.min(...values) : null,
//                 max: values.length ? Math.max(...values) : null,
//                 values: yearData
//             };
//         });

//         // Prepare datasets for ensemble members (thin lines)
//         const ensembleDatasets = ensembleMembers.map((member) => {
//             return {
//                 label: `Ensemble ${member}`,
//                 data: years.map((year) => {
//                     const entry = filteredData.find(
//                         (d) => d.year === year && d.ensemble === member
//                     );
//                     return { x: year, y: entry ? entry.value : null };
//                 }),
//                 borderColor: `rgba(200, 200, 200, 0.3)`,
//                 borderWidth: 1,
//                 pointRadius: 0,
//                 tension: 0.1,
//                 spanGaps: true
//             };
//         });

//         // Prepare datasets for statistics (thick lines)
//         const statDatasets = [
//             {
//                 label: "Mean",
//                 data: yearlyStats.map((stat) => ({
//                     x: stat.year,
//                     y: stat.mean
//                 })),
//                 borderColor: "rgba(75, 192, 192, 1)",
//                 backgroundColor: "rgba(75, 192, 192, 0.2)",
//                 borderWidth: 3,
//                 pointRadius: 4,
//                 pointHoverRadius: 6,
//                 tension: 0.3,
//                 spanGaps: true,
//                 order: 1 // Lower order = drawn on top
//             },
//             {
//                 label: "Max",
//                 data: yearlyStats.map((stat) => ({
//                     x: stat.year,
//                     y: stat.max
//                 })),
//                 borderColor: "rgba(255, 99, 132, 1)",
//                 borderWidth: 2,
//                 pointRadius: 0,
//                 tension: 0.3,
//                 spanGaps: true,
//                 order: 2
//             },
//             {
//                 label: "Min",
//                 data: yearlyStats.map((stat) => ({
//                     x: stat.year,
//                     y: stat.min
//                 })),
//                 borderColor: "rgba(54, 162, 235, 1)",
//                 borderWidth: 2,
//                 pointRadius: 0,
//                 tension: 0.3,
//                 spanGaps: true,
//                 fill: {
//                     target: "-1",
//                     above: "rgba(54, 162, 235, 0.1)"
//                 },
//                 order: 2
//             }
//         ];

//         // Combine ensemble members with statistics
//         // Put ensemble members first so stats are drawn on top
//         const datasets = [...ensembleDatasets, ...statDatasets];

//         chartInstanceRef.current = new Chart(ctx, {
//             type: "line",
//             data: { datasets },
//             options: createChartOptions(true) // Pass true for ensemble charts
//         });
//     };

//     // Create chart options based on chart type
//     const createChartOptions = (isEnsemble = false) => {
//         return {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: getChartTitle(),
//                     font: {
//                         size: 18,
//                         weight: "bold"
//                     },
//                     padding: {
//                         top: 10,
//                         bottom: 20
//                     }
//                 },
//                 legend: {
//                     display: true,
//                     position: "top",
//                     labels: {
//                         font: {
//                             size: 14
//                         },
//                         // For ensemble charts, only show the statistics in the legend
//                         filter: isEnsemble
//                             ? (legendItem) => {
//                                   return !legendItem.text.startsWith(
//                                       "Ensemble"
//                                   );
//                               }
//                             : undefined
//                     }
//                 },
//                 tooltip: {
//                     callbacks: {
//                         title: (tooltipItems) => {
//                             return `Year: ${tooltipItems[0].parsed.x}`;
//                         },
//                         label: (tooltipItem) => {
//                             return `${
//                                 tooltipItem.dataset.label
//                             }: ${tooltipItem.parsed.y.toFixed(2)}`;
//                         }
//                     },
//                     bodyFont: {
//                         size: 14
//                     },
//                     titleFont: {
//                         size: 16,
//                         weight: "bold"
//                     }
//                 }
//             },
//             interaction: {
//                 mode: "nearest",
//                 intersect: false
//             },
//             scales: {
//                 x: {
//                     type: "linear",
//                     title: {
//                         display: true,
//                         text: "Year",
//                         font: {
//                             size: 16,
//                             weight: "bold"
//                         },
//                         padding: {
//                             top: 10
//                         }
//                     },
//                     ticks: {
//                         font: {
//                             size: 14
//                         },
//                         callback: function (value) {
//                             // Ensure ticks are whole years
//                             if (Number.isInteger(value)) {
//                                 return value;
//                             }
//                         }
//                     }
//                 },
//                 y: {
//                     title: {
//                         display: true,
//                         text: getYAxisLabel(),
//                         font: {
//                             size: 16,
//                             weight: "bold"
//                         },
//                         padding: {
//                             bottom: 10
//                         }
//                     },
//                     ticks: {
//                         font: {
//                             size: 14
//                         }
//                     }
//                 }
//             }
//         };
//     };

//     // Get appropriate chart title based on options
//     const getChartTitle = () => {
//         let title = "";

//         if (options && options.varType) {
//             if (options.varType.startsWith("SPI")) {
//                 title = `Standardized Precipitation Index (${options.varType.slice(
//                     3
//                 )} month${options.varType.slice(3) > 1 ? "s" : ""})`;
//             } else if (options.varType === "Yield") {
//                 title = "Rice Yield";
//             } else if (options.varType === "Prcp") {
//                 title = "Precipitation";
//             } else if (options.varType === "Temp") {
//                 title = "Temperature";
//             } else if (options.varType === "Area") {
//                 title = "Rice Area";
//             } else if (options.varType === "Production") {
//                 title = "Rice Production";
//             } else {
//                 title = options.varType;
//             }
//         }

//         return title;
//     };

//     // Get appropriate y-axis label
//     const getYAxisLabel = () => {
//         if (!options || !options.varType) return "Value";

//         switch (options.varType) {
//             case "SPI1":
//             case "SPI3":
//             case "SPI6":
//             case "SPI12":
//                 return "SPI Value";
//             case "Yield":
//                 return "Yield (ton/ha)";
//             case "Area":
//                 return "Area (ha)";
//             case "Production":
//                 return "Production (ton)";
//             case "Prcp":
//                 return "Precipitation (mm)";
//             case "Temp":
//                 return "Temperature (°C)";
//             default:
//                 return "Value";
//         }
//     };

//     // Get appropriate dataset label
//     const getChartLabel = () => {
//         if (!options || !options.varType) return "Value";

//         switch (options.varType) {
//             case "SPI1":
//             case "SPI3":
//             case "SPI6":
//             case "SPI12":
//                 return `${options.varType} Value`;
//             case "Yield":
//                 return "Rice Yield";
//             case "Area":
//                 return "Rice Area";
//             case "Production":
//                 return "Rice Production";
//             case "Prcp":
//                 return "Precipitation";
//             case "Temp":
//                 return "Temperature";
//             default:
//                 return options.varType;
//         }
//     };

//     // Handle year range selection change
//     const handleYearRangeChange = () => {
//         if (!startYear || !endYear) return;

//         const newFilteredData = data.filter((item) => {
//             return item.year >= startYear && item.year <= endYear;
//         });

//         setFilteredData(newFilteredData);
//     };

//     // Export chart data as CSV
//     const downloadCSV = () => {
//         if (!filteredData || filteredData.length === 0) return;

//         let csvContent = "data:text/csv;charset=utf-8,";

//         // Check if we have ensemble data
//         const hasEnsembleMembers = filteredData.some((d) =>
//             d.hasOwnProperty("ensemble")
//         );

//         if (hasEnsembleMembers) {
//             // Create headers
//             const years = [...new Set(filteredData.map((d) => d.year))].sort(
//                 (a, b) => a - b
//             );
//             const ensembleMembers = [
//                 ...new Set(filteredData.map((d) => d.ensemble))
//             ].sort((a, b) => a - b);

//             // Create row for each ensemble member
//             csvContent += "Ensemble,";
//             csvContent += years.join(",");
//             csvContent += "\r\n";

//             ensembleMembers.forEach((member) => {
//                 csvContent += `${member},`;
//                 years.forEach((year) => {
//                     const entry = filteredData.find(
//                         (d) => d.year === year && d.ensemble === member
//                     );
//                     csvContent += `${
//                         entry && entry.value !== undefined ? entry.value : ""
//                     },`;
//                 });
//                 csvContent += "\r\n";
//             });

//             // Add statistics rows
//             csvContent += "Mean,";
//             years.forEach((year) => {
//                 const yearData = filteredData.filter((d) => d.year === year);
//                 const values = yearData
//                     .map((d) => d.value)
//                     .filter((v) => v !== null && v !== undefined);
//                 const mean = values.length
//                     ? values.reduce((sum, val) => sum + val, 0) / values.length
//                     : "";
//                 csvContent += `${mean !== "" ? mean.toFixed(2) : ""},`;
//             });
//             csvContent += "\r\n";

//             csvContent += "Min,";
//             years.forEach((year) => {
//                 const yearData = filteredData.filter((d) => d.year === year);
//                 const values = yearData
//                     .map((d) => d.value)
//                     .filter((v) => v !== null && v !== undefined);
//                 const min = values.length ? Math.min(...values) : "";
//                 csvContent += `${min !== "" ? min.toFixed(2) : ""},`;
//             });
//             csvContent += "\r\n";

//             csvContent += "Max,";
//             years.forEach((year) => {
//                 const yearData = filteredData.filter((d) => d.year === year);
//                 const values = yearData
//                     .map((d) => d.value)
//                     .filter((v) => v !== null && v !== undefined);
//                 const max = values.length ? Math.max(...values) : "";
//                 csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
//             });
//         } else {
//             // Simple time series
//             csvContent += "Year,Value\r\n";
//             filteredData.forEach((item) => {
//                 csvContent += `${item.year},${
//                     item.value !== undefined ? item.value : ""
//                 }\r\n`;
//             });
//         }

//         const encodedUri = encodeURI(csvContent);
//         const link = document.createElement("a");
//         link.setAttribute("href", encodedUri);
//         link.setAttribute(
//             "download",
//             `time_series_${startYear}-${endYear}.csv`
//         );
//         document.body.appendChild(link);

//         link.click();
//         document.body.removeChild(link);
//     };

//     // Download chart as image
//     const downloadImage = (format = "png") => {
//         if (!chartInstanceRef.current) return;

//         const canvas = chartRef.current;
//         const link = document.createElement("a");

//         if (format === "png") {
//             link.href = canvas.toDataURL("image/png");
//             link.download = `chart_${startYear}-${endYear}.png`;
//         } else if (format === "jpg") {
//             link.href = canvas.toDataURL("image/jpeg", 0.8);
//             link.download = `chart_${startYear}-${endYear}.jpg`;
//         }

//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     // Generate years array for select options
//     const getYearOptions = () => {
//         if (!data || data.length === 0) return [];

//         const years = [...new Set(data.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//         return years;
//     };

//     return (
//         <div className="chart-component">
//             {/* Title area */}
//             <div className="chart-header">
//                 <h2 className="chart-title">{getChartTitle()}</h2>
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
//                                         {getYearOptions().map((year) => (
//                                             <option
//                                                 key={`start-${year}`}
//                                                 value={year}
//                                             >
//                                                 {year}
//                                             </option>
//                                         ))}
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
//                                         {getYearOptions().map((year) => (
//                                             <option
//                                                 key={`end-${year}`}
//                                                 value={year}
//                                             >
//                                                 {year}
//                                             </option>
//                                         ))}
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
//                                     <button onClick={downloadCSV}>
//                                         CSV Data
//                                     </button>
//                                     <button
//                                         onClick={() => downloadImage("png")}
//                                     >
//                                         PNG Image
//                                     </button>
//                                     <button
//                                         onClick={() => downloadImage("jpg")}
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
//             </div>

//             {/* Chart footer with explanations */}
//             {data &&
//                 data.length > 0 &&
//                 data.some((d) => d.hasOwnProperty("ensemble")) && (
//                     <div className="chart-footer">
//                         <h3>Chart Legend</h3>
//                         <ul>
//                             <li>
//                                 <span className="legend-item mean"></span>{" "}
//                                 <strong>Mean</strong>: Average of all ensemble
//                                 members
//                             </li>
//                             <li>
//                                 <span className="legend-item max"></span>{" "}
//                                 <strong>Max</strong>: Maximum value across
//                                 ensemble members
//                             </li>
//                             <li>
//                                 <span className="legend-item min"></span>{" "}
//                                 <strong>Min</strong>: Minimum value across
//                                 ensemble members
//                             </li>
//                             <li>
//                                 <span className="legend-item ensemble"></span>{" "}
//                                 <strong>Ensembles</strong>: Individual forecast
//                                 runs
//                             </li>
//                         </ul>
//                         {/* <p className="ensemble-explainer">
//                             Ensemble forecasts combine multiple model runs with
//                             slightly different initial conditions to capture
//                             uncertainty. The spread between min and max values
//                             indicates the range of possible outcomes.
//                         </p> */}
//                     </div>
//                 )}
//         </div>
//     );
// };

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export const ChartComponent = ({ data, options }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // For date filtering and range selection
    const [startYear, setStartYear] = useState(null);
    const [endYear, setEndYear] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    // Process data when it changes
    useEffect(() => {
        if (!data || data.length === 0) return;

        console.log("Processing chart data:", data);

        // Process data for chart
        processData(data);
    }, [data]);

    // Initialize year range when filtered data is ready
    useEffect(() => {
        if (!filteredData || filteredData.length === 0) return;

        console.log("Setting year range from filtered data:", filteredData);

        // Get years from filtered data
        const years = getYearOptions();

        // Set year range if not already set
        if ((!startYear || !endYear) && years.length > 0) {
            setStartYear(years[0]);
            setEndYear(years[years.length - 1]);
        }

        setDataReady(true);
    }, [filteredData]);

    // Process data to prepare for visualization
    const processData = (rawData) => {
        if (!rawData || !rawData.length === 0) return;

        // If the data is already in a standard format with year and value properties
        if (
            rawData[0] &&
            rawData[0].hasOwnProperty("year") &&
            rawData[0].hasOwnProperty("value")
        ) {
            setFilteredData([...rawData]);
            setDataReady(true);
            return;
        }

        // If there's a selectedFeature object with properties
        if (rawData[0] && rawData[0].properties) {
            const timeSeriesData = extractTimeSeriesFromFeature(rawData[0]);
            setFilteredData(timeSeriesData);
            setDataReady(true);
            return;
        }

        // Fallback
        setFilteredData([]);
        setDataReady(true);
    };

    // Extract time series data from feature properties
    const extractTimeSeriesFromFeature = (feature) => {
        if (!feature || !feature.properties) {
            console.warn("Invalid feature or missing properties");
            return [];
        }

        const { properties } = feature;
        let timeSeriesData = [];

        // First check if this is an ensemble format (y202502_1)
        const ensembleKeys = Object.keys(properties).filter((key) =>
            /^y\d+_\d+$/.test(key)
        );

        if (ensembleKeys.length > 0) {
            console.log("Processing as ensemble forecast data");
            // Process as ensemble data
            ensembleKeys.forEach((key) => {
                const match = key.match(/^y(\d+)_(\d+)$/);
                if (match) {
                    timeSeriesData.push({
                        year: parseInt(match[1], 10),
                        ensemble: parseInt(match[2], 10),
                        value: properties[key]
                    });
                }
            });
        } else {
            // Then check for historical year pattern (y1990)
            const yearKeys = Object.keys(properties).filter((key) =>
                /^y\d+$/.test(key)
            );

            if (yearKeys.length > 0) {
                console.log("Processing as historical data");
                yearKeys.forEach((key) => {
                    const year = parseInt(key.substring(1), 10);
                    const value = properties[key];

                    if (!isNaN(year) && value !== null && value !== undefined) {
                        timeSeriesData.push({
                            year: year,
                            value: value
                        });
                    }
                });
            } else {
                console.warn(
                    "No recognizable time series format found in feature properties"
                );
            }
        }

        // Sort by year
        timeSeriesData.sort((a, b) => a.year - b.year);
        console.log("Extracted time series data:", timeSeriesData);

        return timeSeriesData;
    };

    // Update chart when filtered data changes
    useEffect(() => {
        if (!dataReady || !chartRef.current) return;

        createChart();
    }, [filteredData, dataReady]);

    // Create and render the chart
    const createChart = () => {
        // Clean up existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        // Check if data contains ensemble members
        const hasEnsembleMembers = filteredData.some((d) =>
            d.hasOwnProperty("ensemble")
        );

        if (hasEnsembleMembers) {
            createEnsembleChart(ctx);
        } else {
            createStandardChart(ctx);
        }
    };

    // Create a chart for non-ensemble data
    const createStandardChart = (ctx) => {
        // Sort data chronologically
        const sortedData = [...filteredData].sort((a, b) => a.year - b.year);

        // Prepare datasets
        const datasets = [
            {
                label: getChartLabel(),
                data: sortedData.map((item) => ({
                    x: item.year,
                    y: item.value
                })),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 3,
                tension: 0.3, // Adds slight curve to lines
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ];

        // If data has upper/lower bounds, add them
        if (
            sortedData.some(
                (d) =>
                    d.hasOwnProperty("upper_bound") &&
                    d.hasOwnProperty("lower_bound")
            )
        ) {
            datasets.push({
                label: "Upper Bound",
                data: sortedData.map((item) => ({
                    x: item.year,
                    y: item.upper_bound
                })),
                borderColor: "rgba(75, 192, 192, 0.5)",
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            });

            datasets.push({
                label: "Lower Bound",
                data: sortedData.map((item) => ({
                    x: item.year,
                    y: item.lower_bound
                })),
                borderColor: "rgba(75, 192, 192, 0.5)",
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: {
                    target: "-1",
                    above: "rgba(75, 192, 192, 0.1)"
                }
            });
        }

        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: { datasets },
            options: createChartOptions()
        });
    };

    // Create a chart for ensemble data (spaghetti plot)
    const createEnsembleChart = (ctx) => {
        // Extract unique years and ensemble members
        const years = [...new Set(filteredData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
        const ensembleMembers = [
            ...new Set(filteredData.map((d) => d.ensemble))
        ].sort((a, b) => a - b);

        // Create stats by year
        const yearlyStats = years.map((year) => {
            const yearData = filteredData.filter((d) => d.year === year);
            const values = yearData
                .map((d) => d.value)
                .filter((v) => v !== null && v !== undefined);

            return {
                year,
                mean: values.length
                    ? values.reduce((sum, val) => sum + val, 0) / values.length
                    : null,
                min: values.length ? Math.min(...values) : null,
                max: values.length ? Math.max(...values) : null,
                values: yearData
            };
        });

        // Prepare datasets for ensemble members (thin lines)
        const ensembleDatasets = ensembleMembers.map((member) => {
            return {
                label: `Ensemble ${member}`,
                data: years.map((year) => {
                    const entry = filteredData.find(
                        (d) => d.year === year && d.ensemble === member
                    );
                    return { x: year, y: entry ? entry.value : null };
                }),
                borderColor: `rgba(200, 200, 200, 0.3)`,
                borderWidth: 1,
                pointRadius: 0,
                tension: 0.1,
                spanGaps: true
            };
        });

        // Prepare datasets for statistics (thick lines)
        const statDatasets = [
            {
                label: "Mean",
                data: yearlyStats.map((stat) => ({
                    x: stat.year,
                    y: stat.mean
                })),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.3,
                spanGaps: true,
                order: 1 // Lower order = drawn on top
            },
            {
                label: "Max",
                data: yearlyStats.map((stat) => ({
                    x: stat.year,
                    y: stat.max
                })),
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                spanGaps: true,
                order: 2
            },
            {
                label: "Min",
                data: yearlyStats.map((stat) => ({
                    x: stat.year,
                    y: stat.min
                })),
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                spanGaps: true,
                fill: {
                    target: "-1",
                    above: "rgba(54, 162, 235, 0.1)"
                },
                order: 2
            }
        ];

        // Combine ensemble members with statistics
        // Put ensemble members first so stats are drawn on top
        const datasets = [...ensembleDatasets, ...statDatasets];

        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: { datasets },
            options: createChartOptions(true) // Pass true for ensemble charts
        });
    };

    // Create chart options based on chart type
    const createChartOptions = (isEnsemble = false) => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getChartTitle(),
                    font: {
                        size: 18,
                        weight: "bold"
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: {
                            size: 14
                        },
                        // For ensemble charts, only show the statistics in the legend
                        filter: isEnsemble
                            ? (legendItem) => {
                                  return !legendItem.text.startsWith(
                                      "Ensemble"
                                  );
                              }
                            : undefined
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            return `Year: ${tooltipItems[0].parsed.x}`;
                        },
                        label: (tooltipItem) => {
                            return `${
                                tooltipItem.dataset.label
                            }: ${tooltipItem.parsed.y.toFixed(2)}`;
                        }
                    },
                    bodyFont: {
                        size: 14
                    },
                    titleFont: {
                        size: 16,
                        weight: "bold"
                    }
                }
            },
            interaction: {
                mode: "nearest",
                intersect: false
            },
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Year",
                        font: {
                            size: 16,
                            weight: "bold"
                        },
                        padding: {
                            top: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                        callback: function (value) {
                            // Ensure ticks are whole years
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: getYAxisLabel(),
                        font: {
                            size: 16,
                            weight: "bold"
                        },
                        padding: {
                            bottom: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        };
    };

    // Get appropriate chart title based on options
    const getChartTitle = () => {
        let title = "";

        if (options && options.varType) {
            if (options.varType.startsWith("SPI")) {
                title = `Standardized Precipitation Index (${options.varType.slice(
                    3
                )} month${options.varType.slice(3) > 1 ? "s" : ""})`;
            } else if (options.varType === "Yield") {
                title = "Rice Yield";
            } else if (options.varType === "Prcp") {
                title = "Precipitation";
            } else if (options.varType === "Temp") {
                title = "Temperature";
            } else if (options.varType === "Area") {
                title = "Rice Area";
            } else if (options.varType === "Production") {
                title = "Rice Production";
            } else {
                title = options.varType;
            }
        }

        return title;
    };

    // Get appropriate y-axis label
    const getYAxisLabel = () => {
        if (!options || !options.varType) return "Value";

        switch (options.varType) {
            case "SPI1":
            case "SPI3":
            case "SPI6":
            case "SPI12":
                return "SPI Value";
            case "Yield":
                return "Yield (ton/ha)";
            case "Area":
                return "Area (ha)";
            case "Production":
                return "Production (ton)";
            case "Prcp":
                return "Precipitation (mm)";
            case "Temp":
                return "Temperature (°C)";
            default:
                return "Value";
        }
    };

    // Get appropriate dataset label
    const getChartLabel = () => {
        if (!options || !options.varType) return "Value";

        switch (options.varType) {
            case "SPI1":
            case "SPI3":
            case "SPI6":
            case "SPI12":
                return `${options.varType} Value`;
            case "Yield":
                return "Rice Yield";
            case "Area":
                return "Rice Area";
            case "Production":
                return "Rice Production";
            case "Prcp":
                return "Precipitation";
            case "Temp":
                return "Temperature";
            default:
                return options.varType;
        }
    };

    // Handle year range selection change
    const handleYearRangeChange = () => {
        if (!startYear || !endYear) return;

        // Filter the data based on the year range
        const newFilteredData = filteredData.filter((item) => {
            return item.year >= startYear && item.year <= endYear;
        });

        setFilteredData(newFilteredData);
    };

    // Export chart data as CSV
    const downloadCSV = () => {
        if (!filteredData || filteredData.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        // Check if we have ensemble data
        const hasEnsembleMembers = filteredData.some((d) =>
            d.hasOwnProperty("ensemble")
        );

        if (hasEnsembleMembers) {
            // Create headers
            const years = [...new Set(filteredData.map((d) => d.year))].sort(
                (a, b) => a - b
            );
            const ensembleMembers = [
                ...new Set(filteredData.map((d) => d.ensemble))
            ].sort((a, b) => a - b);

            // Create row for each ensemble member
            csvContent += "Ensemble,";
            csvContent += years.join(",");
            csvContent += "\r\n";

            ensembleMembers.forEach((member) => {
                csvContent += `${member},`;
                years.forEach((year) => {
                    const entry = filteredData.find(
                        (d) => d.year === year && d.ensemble === member
                    );
                    csvContent += `${
                        entry && entry.value !== undefined ? entry.value : ""
                    },`;
                });
                csvContent += "\r\n";
            });

            // Add statistics rows
            csvContent += "Mean,";
            years.forEach((year) => {
                const yearData = filteredData.filter((d) => d.year === year);
                const values = yearData
                    .map((d) => d.value)
                    .filter((v) => v !== null && v !== undefined);
                const mean = values.length
                    ? values.reduce((sum, val) => sum + val, 0) / values.length
                    : "";
                csvContent += `${mean !== "" ? mean.toFixed(2) : ""},`;
            });
            csvContent += "\r\n";

            csvContent += "Min,";
            years.forEach((year) => {
                const yearData = filteredData.filter((d) => d.year === year);
                const values = yearData
                    .map((d) => d.value)
                    .filter((v) => v !== null && v !== undefined);
                const min = values.length ? Math.min(...values) : "";
                csvContent += `${min !== "" ? min.toFixed(2) : ""},`;
            });
            csvContent += "\r\n";

            csvContent += "Max,";
            years.forEach((year) => {
                const yearData = filteredData.filter((d) => d.year === year);
                const values = yearData
                    .map((d) => d.value)
                    .filter((v) => v !== null && v !== undefined);
                const max = values.length ? Math.max(...values) : "";
                csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
            });
        } else {
            // Simple time series
            csvContent += "Year,Value\r\n";
            filteredData.forEach((item) => {
                csvContent += `${item.year},${
                    item.value !== undefined ? item.value : ""
                }\r\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `time_series_${startYear}-${endYear}.csv`
        );
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
    };

    // Download chart as image
    const downloadImage = (format = "png") => {
        if (!chartInstanceRef.current) return;

        const canvas = chartRef.current;
        const link = document.createElement("a");

        if (format === "png") {
            link.href = canvas.toDataURL("image/png");
            link.download = `chart_${startYear}-${endYear}.png`;
        } else if (format === "jpg") {
            link.href = canvas.toDataURL("image/jpeg", 0.8);
            link.download = `chart_${startYear}-${endYear}.jpg`;
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate years array for select options
    const getYearOptions = () => {
        if (!filteredData || filteredData.length === 0) return [];

        // Get years from filtered data
        const years = [...new Set(filteredData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
        return years;
    };

    return (
        <div className="chart-component">
            {/* Title area */}
            <div className="chart-header">
                <h2 className="chart-title">{getChartTitle()}</h2>
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
                                        {getYearOptions().map((year) => (
                                            <option
                                                key={`start-${year}`}
                                                value={year}
                                            >
                                                {year}
                                            </option>
                                        ))}
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
                                        {getYearOptions().map((year) => (
                                            <option
                                                key={`end-${year}`}
                                                value={year}
                                            >
                                                {year}
                                            </option>
                                        ))}
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
                                    <button onClick={downloadCSV}>
                                        CSV Data
                                    </button>
                                    <button
                                        onClick={() => downloadImage("png")}
                                    >
                                        PNG Image
                                    </button>
                                    <button
                                        onClick={() => downloadImage("jpg")}
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

                {/* Loading indicator when data is processing */}
                {data && data.length > 0 && !dataReady && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Processing data...</p>
                    </div>
                )}
            </div>

            {/* Chart footer with explanations */}
            {data &&
                data.length > 0 &&
                data.some((d) => d.hasOwnProperty("ensemble")) && (
                    <div className="chart-footer">
                        <h3>Chart Legend</h3>
                        <ul>
                            <li>
                                <span className="chart-legend-item mean"></span>{" "}
                                <strong>Mean</strong>: Average of all ensemble
                                members
                            </li>
                            <li>
                                <span className="chart-legend-item max"></span>{" "}
                                <strong>Max</strong>: Maximum value across
                                ensemble members
                            </li>
                            <li>
                                <span className="chart-legend-item min"></span>{" "}
                                <strong>Min</strong>: Minimum value across
                                ensemble members
                            </li>
                            <li>
                                <span className="chart-legend-item ensemble"></span>{" "}
                                <strong>Ensembles</strong>: Individual forecast
                                runs
                            </li>
                        </ul>
                        <p className="ensemble-explainer">
                            Ensemble forecasts combine multiple model runs with
                            slightly different initial conditions to capture
                            uncertainty. The spread between min and max values
                            indicates the range of possible outcomes.
                        </p>
                    </div>
                )}
        </div>
    );
};
