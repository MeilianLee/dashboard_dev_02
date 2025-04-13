
// import React, { useEffect, useRef, useState } from "react";
// import Chart from "chart.js/auto";
// import "chartjs-adapter-date-fns"; // Required for proper time-scale handling

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
//         processData(data);
//     }, [data]);

//     // Process data to prepare for visualization
//     const processData = (rawData) => {
//         if (!rawData || rawData.length === 0) return;

//         // Detect the data format
//         let detectedDataType;

//         // 1. Check if data has ensemble property
//         if (rawData.some((d) => d.hasOwnProperty("ensemble"))) {
//             detectedDataType = "ensemble";
//             setChartType("ensemble");
//         }
//         // 2. Check if data has month property (time series)
//         else if (rawData.some((d) => d.hasOwnProperty("month"))) {
//             detectedDataType = "timeSeries";
//             setChartType("timeSeries");
//         }
//         // 3. Check for historical format with properties like y1990, y2000 in a GeoJSON feature
//         else if (
//             rawData[0]?.properties &&
//             Object.keys(rawData[0].properties).some((key) => /^y\d+$/.test(key))
//         ) {
//             detectedDataType = "historical";
//             processHistoricalData(rawData);
//             return; // Early return as we're handling this specially
//         }
//         // 4. Standard year/value pairs
//         else {
//             detectedDataType = "standard";
//             setChartType("standard");
//         }

//         console.log("Detected data type:", detectedDataType);

//         // Transform the data based on its type
//         let transformedData;

//         if (detectedDataType === "ensemble") {
//             // No transformation needed for ensemble data
//             transformedData = rawData;
//         } else if (detectedDataType === "timeSeries") {
//             // Convert year/month into JavaScript Date objects
//             transformedData = rawData.map((item) => ({
//                 ...item,
//                 date: new Date(item.year, (item.month || 1) - 1, 1), // Month is 0-indexed in JS
//                 formattedDate: formatDateString(item.year, item.month)
//             }));
//         } else {
//             // Standard year/value data
//             transformedData = rawData.map((item) => ({
//                 ...item,
//                 date: new Date(item.year, 0, 1), // January 1st of the year
//                 formattedDate: `${item.year}`
//             }));
//         }

//         // Sort the data chronologically
//         transformedData.sort((a, b) => {
//             if (a.date && b.date) return a.date - b.date;
//             if (a.year !== b.year) return a.year - b.year;
//             if (a.month && b.month) return a.month - b.month;
//             return 0;
//         });

//         // Set the initial year range based on available data
//         const years = [...new Set(transformedData.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//         if (!startYear && years.length > 0) setStartYear(years[0]);
//         if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);

//         setProcessedData(transformedData);
//         setFilteredData(transformedData);
//         setDataReady(true);
//     };

//     // Format date string from year and month
//     const formatDateString = (year, month) => {
//         if (!month) return `${year}`;

//         const monthNames = [
//             "Jan",
//             "Feb",
//             "Mar",
//             "Apr",
//             "May",
//             "Jun",
//             "Jul",
//             "Aug",
//             "Sep",
//             "Oct",
//             "Nov",
//             "Dec"
//         ];

//         return `${monthNames[month - 1]} ${year}`;
//     };

//     // Process historical data from GeoJSON properties
//     const processHistoricalData = (rawData) => {
//         if (!rawData || rawData.length === 0 || !rawData[0].properties) {
//             setFilteredData([]);
//             setDataReady(true);
//             return;
//         }

//         const timeSeriesData = [];
//         const properties = rawData[0].properties;

//         // Extract data from properties with pattern y1990, y2000, etc.
//         Object.keys(properties).forEach((key) => {
//             if (/^y\d+$/.test(key)) {
//                 // Handle both yearly and monthly formats
//                 const yearKey = key.substring(1);
//                 let year,
//                     month = 1; // Default to January for yearly data

//                 if (yearKey.length === 4) {
//                     // Format: y1990 (yearly)
//                     year = parseInt(yearKey, 10);
//                 } else if (yearKey.length === 6) {
//                     // Format: y199001 (monthly)
//                     year = parseInt(yearKey.substring(0, 4), 10);
//                     month = parseInt(yearKey.substring(4, 6), 10);
//                 } else {
//                     // Unknown format, skip
//                     return;
//                 }

//                 const value = properties[key];

//                 if (
//                     !isNaN(year) &&
//                     !isNaN(month) &&
//                     value !== null &&
//                     value !== undefined
//                 ) {
//                     timeSeriesData.push({
//                         year: year,
//                         month: month,
//                         date: new Date(year, month - 1, 1), // JavaScript months are 0-based
//                         formattedDate: formatDateString(year, month),
//                         value:
//                             typeof value === "number"
//                                 ? value
//                                 : parseFloat(value)
//                     });
//                 }
//             }
//         });

//         // Sort by date
//         timeSeriesData.sort((a, b) => a.date - b.date);

//         setChartType(
//             timeSeriesData.some((d) => d.month > 1) ? "timeSeries" : "standard"
//         );
//         setProcessedData(timeSeriesData);
//         setFilteredData(timeSeriesData);

//         // Set the initial year range based on available data
//         const years = [...new Set(timeSeriesData.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//         if (!startYear && years.length > 0) setStartYear(years[0]);
//         if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);

//         setDataReady(true);
//     };

//     // Filter data when range changes
//     useEffect(() => {
//         if (
//             !processedData ||
//             processedData.length === 0 ||
//             !startYear ||
//             !endYear
//         )
//             return;

//         // Apply the year filter
//         const newFilteredData = processedData.filter((item) => {
//             return item.year >= startYear && item.year <= endYear;
//         });

//         setFilteredData(newFilteredData);
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
//             createEnsembleChart(ctx);
//         } else {
//             createTimeSeriesChart(ctx);
//         }
//     };

//     // Create a chart for time series data (standard or time-based)
//     const createTimeSeriesChart = (ctx) => {
//         // Sort data chronologically
//         const sortedData = [...filteredData].sort((a, b) => {
//             if (a.date && b.date) return a.date - b.date;
//             return a.year - b.year;
//         });

//         // Determine if we need a time scale
//         const useTimeScale = chartType === "timeSeries";

//         // Choose x-value based on chart type
//         const xValueSelector = useTimeScale
//             ? (item) => item.date
//             : (item) => item.formattedDate || item.year.toString();

//         // Prepare datasets
//         const datasets = [
//             {
//                 label: getChartLabel(),
//                 data: sortedData.map((item) => ({
//                     x: xValueSelector(item),
//                     y: item.value
//                 })),
//                 borderColor: "rgba(75, 192, 192, 1)",
//                 backgroundColor: "rgba(75, 192, 192, 0.2)",
//                 borderWidth: 3,
//                 tension: 0.3, // Adds slight curve to lines
//                 pointRadius: 0,
//                 pointHoverRadius: 4
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
//                     x: xValueSelector(item),
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
//                     x: xValueSelector(item),
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

//         // Create the chart with appropriate options
//         chartInstanceRef.current = new Chart(ctx, {
//             type: "line",
//             data: { datasets },
//             options: createTimeSeriesChartOptions(useTimeScale)
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
//                 date: new Date(year, 0, 1),
//                 formattedDate: `${year}`,
//                 mean: values.length
//                     ? values.reduce((sum, val) => sum + val, 0) / values.length
//                     : null,
//                 min: values.length ? Math.min(...values) : null,
//                 max: values.length ? Math.max(...values) : null,
//                 values: yearData
//             };
//         });

//         // Determine if we need a time scale
//         // For ensemble data, we typically use standard scale with years
//         const useTimeScale = false;
//         const xValueSelector = (item) =>
//             item.formattedDate || item.year.toString();

//         // Prepare datasets for ensemble members (thin lines)
//         const ensembleDatasets = ensembleMembers.map((member) => {
//             return {
//                 label: `Ensemble ${member}`,
//                 data: years.map((year) => {
//                     const entry = filteredData.find(
//                         (d) => d.year === year && d.ensemble === member
//                     );
//                     return {
//                         x: xValueSelector({ year, formattedDate: `${year}` }),
//                         y: entry ? entry.value : null
//                     };
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
//                     x: xValueSelector(stat),
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
//                     x: xValueSelector(stat),
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
//                     x: xValueSelector(stat),
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

//         // Create the chart
//         chartInstanceRef.current = new Chart(ctx, {
//             type: "line",
//             data: { datasets },
//             options: createTimeSeriesChartOptions(useTimeScale, true) // Pass true for ensemble charts
//         });
//     };

//     // Create chart options for time series
//     const createTimeSeriesChartOptions = (
//         useTimeScale = false,
//         isEnsemble = false
//     ) => {
//         // Configure x-axis based on scale type
//         const xAxisOptions = useTimeScale
//             ? {
//                   type: "time",
//                   time: {
//                       unit: determineTimeUnit(filteredData),
//                       displayFormats: {
//                           day: "MMM d, yyyy",
//                           month: "MMM yyyy",
//                           quarter: "MMM yyyy",
//                           year: "yyyy"
//                       },
//                       tooltipFormat: "MMM yyyy"
//                   },
//                   title: {
//                       display: true,
//                       text: "Date",
//                       font: { size: 16, weight: "bold" },
//                       padding: { top: 10 }
//                   }
//               }
//             : {
//                   type: "category", // Use category scale for uniform spacing
//                   title: {
//                       display: true,
//                       text: "Date",
//                       font: { size: 16, weight: "bold" },
//                       padding: { top: 10 }
//                   }
//               };

//         return {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 title: {
//                     display: true,
//                     text: getChartTitle(),
//                     font: { size: 18, weight: "bold" },
//                     padding: { top: 10, bottom: 20 }
//                 },
//                 legend: {
//                     display: true,
//                     position: "top",
//                     labels: {
//                         font: { size: 14 },
//                         // For ensemble charts, only show the statistics in the legend
//                         filter: isEnsemble
//                             ? (legendItem) =>
//                                   !legendItem.text.startsWith("Ensemble")
//                             : undefined
//                     }
//                 },
//                 tooltip: {
//                     callbacks: {
//                         title: (tooltipItems) => {
//                             const xValue = tooltipItems[0].parsed.x;
//                             // Handle different x-value types
//                             if (xValue instanceof Date) {
//                                 return xValue.toLocaleDateString(undefined, {
//                                     year: "numeric",
//                                     month: "long"
//                                 });
//                             }
//                             return tooltipItems[0].label || `Year: ${xValue}`;
//                         },
//                         label: (tooltipItem) => {
//                             return `${
//                                 tooltipItem.dataset.label
//                             }: ${tooltipItem.parsed.y.toFixed(2)}`;
//                         }
//                     },
//                     bodyFont: { size: 14 },
//                     titleFont: { size: 16, weight: "bold" }
//                 }
//             },
//             interaction: {
//                 mode: "nearest",
//                 intersect: false
//             },
//             scales: {
//                 x: xAxisOptions,
//                 y: {
//                     title: {
//                         display: true,
//                         text: getYAxisLabel(),
//                         font: { size: 16, weight: "bold" },
//                         padding: { bottom: 10 }
//                     },
//                     ticks: { font: { size: 14 } }
//                 }
//             }
//         };
//     };

//     // Determine the appropriate time unit based on the data points
//     const determineTimeUnit = (dataPoints) => {
//         if (!dataPoints || dataPoints.length < 2) return "month";

//         // Check if all data points have the same year
//         const allSameYear = dataPoints.every(
//             (d) => d.year === dataPoints[0].year
//         );

//         // If all in the same year, use 'month' as the unit
//         if (allSameYear) return "month";

//         // Calculate the time span
//         const years = [...new Set(dataPoints.map((d) => d.year))];

//         // If the span is larger than 10 years, use 'year'
//         if (years.length > 10) return "year";

//         // Otherwise, use 'month' or 'quarter' depending on data density
//         return dataPoints.length / years.length > 4 ? "month" : "quarter";
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
//         if (
//             !startYear ||
//             !endYear ||
//             !processedData ||
//             processedData.length === 0
//         )
//             return;

//         // Filter data based on selected year range
//         const newFilteredData = processedData.filter((item) => {
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
//             // Ensemble data format
//             const years = [...new Set(filteredData.map((d) => d.year))].sort(
//                 (a, b) => a - b
//             );
//             const ensembleMembers = [
//                 ...new Set(filteredData.map((d) => d.ensemble))
//             ].sort((a, b) => a - b);

//             // Headers row
//             csvContent += "Ensemble,";
//             csvContent += years.join(",");
//             csvContent += "\r\n";

//             // Data rows for each ensemble member
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

//             // Statistics rows
//             // Mean
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

//             // Min
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

//             // Max
//             csvContent += "Max,";
//             years.forEach((year) => {
//                 const yearData = filteredData.filter((d) => d.year === year);
//                 const values = yearData
//                     .map((d) => d.value)
//                     .filter((v) => v !== null && v !== undefined);
//                 const max = values.length ? Math.max(...values) : "";
//                 csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
//             });
//         } else if (chartType === "timeSeries") {
//             // Time series data format
//             csvContent += "Date,Year,Month,Value\r\n";
//             filteredData.forEach((item) => {
//                 const formattedDate =
//                     item.formattedDate ||
//                     formatDateString(item.year, item.month);
//                 csvContent += `${formattedDate},${item.year},${
//                     item.month || ""
//                 },${item.value !== undefined ? item.value : ""}\r\n`;
//             });
//         } else {
//             // Simple yearly data format
//             csvContent += "Year,Value\r\n";
//             filteredData.forEach((item) => {
//                 csvContent += `${item.year},${
//                     item.value !== undefined ? item.value : ""
//                 }\r\n`;
//             });
//         }

//         // Download the CSV file
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
//         if (!processedData || processedData.length === 0) return [];
//         return [...new Set(processedData.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
//     };

//     return (
//         <div className="chart-component">
//             {/* Title area */}
//             <div className="chart-header">
//                 {/* <h2 className="chart-title">{getChartTitle()}</h2> */}
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

//                 {/* Loading indicator */}
//                 {data && data.length > 0 && !dataReady && (
//                     <div className="loading-overlay">
//                         <div className="loading-spinner"></div>
//                         <p>Processing data...</p>
//                     </div>
//                 )}
//             </div>

//             {/* Chart footer with explanations - only shown for ensemble charts */}
//             {data && data.length > 0 && chartType === "ensemble" && (
//                 <div className="chart-footer">
//                     <h3>Chart Legend</h3>
//                     <ul>
//                         <li>
//                             <span className="chart-legend-item mean"></span>{" "}
//                             <strong>Mean</strong>: Average of all ensemble
//                             members
//                         </li>
//                         <li>
//                             <span className="chart-legend-item max"></span>{" "}
//                             <strong>Max</strong>: Maximum value across ensemble
//                             members
//                         </li>
//                         <li>
//                             <span className="chart-legend-item min"></span>{" "}
//                             <strong>Min</strong>: Minimum value across ensemble
//                             members
//                         </li>
//                         <li>
//                             <span className="chart-legend-item ensemble"></span>{" "}
//                             <strong>Ensembles</strong>: Individual forecast runs
//                         </li>
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };



import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import 'chartjs-adapter-date-fns'; // Required for proper time-scale handling

// Import modular utilities
import { 
    processData, 
    getYearOptions, 
    filterDataByYearRange 
} from './ChartDataProcessor';
import { 
    createTimeSeriesChart, 
    createEnsembleChart 
} from './ChartRenderers';
import { 
    downloadCSV, 
    downloadImage 
} from './ChartExportUtils';
import { 
    getChartTitle 
} from './ChartComponentUtils';

export const ChartComponent = ({ data, options }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // For date filtering and range selection
    const [startYear, setStartYear] = useState(null);
    const [endYear, setEndYear] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [processedData, setProcessedData] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [chartType, setChartType] = useState("standard"); // standard, ensemble, or timeSeries

    // Process data when it changes
    useEffect(() => {
        if (!data || data.length === 0) return;

        // Process data for chart
        processData(
            data, 
            setChartType, 
            setProcessedData, 
            setDataReady,
            setStartYear,
            setEndYear
        );
    }, [data]);

    // Filter data when year range or processed data changes
    useEffect(() => {
        if (!processedData || processedData.length === 0 || !startYear || !endYear) return;

        const filtered = filterDataByYearRange(processedData, startYear, endYear);
        setFilteredData(filtered);
    }, [processedData, startYear, endYear]);

    // Update chart when filtered data changes
    useEffect(() => {
        if (!dataReady || !chartRef.current || filteredData.length === 0) return;

        createChart();
    }, [filteredData, dataReady]);

    // Create and render the chart
    const createChart = () => {
        // Clean up existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');

        // Create chart based on detected chart type
        if (chartType === "ensemble") {
            createEnsembleChart(ctx, filteredData, options, chartInstanceRef);
        } else {
            createTimeSeriesChart(ctx, filteredData, chartType, options, chartInstanceRef);
        }
    };

    // Handle year range selection change
    const handleYearRangeChange = () => {
        if (!startYear || !endYear || !processedData || processedData.length === 0) return;

        const filtered = filterDataByYearRange(processedData, startYear, endYear);
        setFilteredData(filtered);
    };

    // Handle download button options
    const handleDownload = (format) => {
        if (format === 'csv') {
            downloadCSV(filteredData, startYear, endYear);
        } else {
            downloadImage(chartRef, startYear, endYear, format);
        }
        setShowDownloadOptions(false); // Hide dropdown after selection
    };

    return (
        <div className="chart-component">
            {/* Title area */}
            <div className="chart-header">
                {/* <h2 className="chart-title">{getChartTitle(options)}</h2> */}
                {data && data.length > 0 && (
                    <div className="chart-controls">
                        <div className="range-selector">
                            <div className="year-range">
                                <label>
                                    Start Year:
                                    <select
                                        value={startYear || ""}
                                        onChange={(e) => setStartYear(Number(e.target.value))}
                                        className="year-select"
                                    >
                                        {getYearOptions(processedData).map((year) => (
                                            <option key={`start-${year}`} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    End Year:
                                    <select
                                        value={endYear || ""}
                                        onChange={(e) => setEndYear(Number(e.target.value))}
                                        className="year-select"
                                    >
                                        {getYearOptions(processedData).map((year) => (
                                            <option key={`end-${year}`} value={year}>
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
                                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                                className="download-button"
                            >
                                Download ▼
                            </button>
                            {showDownloadOptions && (
                                <div className="download-dropdown">
                                    <button onClick={() => handleDownload('csv')}>
                                        CSV Data
                                    </button>
                                    <button onClick={() => handleDownload('png')}>
                                        PNG Image
                                    </button>
                                    <button onClick={() => handleDownload('jpg')}>
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
                            No data available. Please select a region on the map.
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

            {/* Chart footer with explanations - only shown for ensemble charts */}
            {/* {data && data.length > 0 && chartType === "ensemble" && (
                <div className="chart-footer">
                    <h3>Chart Legend</h3>
                    <ul>
                        <li>
                            <span className="chart-legend-item mean"></span>{" "}
                            <strong>Mean</strong>: Average of all ensemble members
                        </li>
                        <li>
                            <span className="chart-legend-item max"></span>{" "}
                            <strong>Max</strong>: Maximum value across ensemble members
                        </li>
                        <li>
                            <span className="chart-legend-item min"></span>{" "}
                            <strong>Min</strong>: Minimum value across ensemble members
                        </li>
                        <li>
                            <span className="chart-legend-item ensemble"></span>{" "}
                            <strong>Ensembles</strong>: Individual forecast runs
                        </li>
                    </ul>
                    <p className="ensemble-explainer">
                        Ensemble forecasts combine multiple model runs with slightly different initial conditions to capture uncertainty. The spread between min and max values indicates the range of possible outcomes.
                    </p>
                </div>
            )} */}
        </div>
    );
};
