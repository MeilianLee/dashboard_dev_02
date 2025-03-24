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

//         // Process data for chart
//         processData(data);

//         // After processing, set year range based on available data
//         setTimeout(() => {
//             const years = getYearOptions();
//             if (!startYear && years.length > 0) setStartYear(years[0]);
//             if (!endYear && years.length > 0)
//                 setEndYear(years[years.length - 1]);
//         }, 0);
//     }, [data]);

//     // Filter data when range changes
//     useEffect(() => {
//         if (!data || data.length === 0 || !startYear || !endYear) return;

//         // Only apply the filter if we've already processed the data
//         if (dataReady) {
//             handleYearRangeChange();
//         }
//     }, [data, startYear, endYear]);

//     // Process data to prepare for visualization
//     const processData = (rawData) => {
//         if (!rawData || rawData.length === 0) return;

//         // Determine if this is historical data (with properties like y1990, y2000) or forecast data with ensembles
//         const isHistoricalFormat = detectHistoricalFormat(rawData);

//         if (isHistoricalFormat) {
//             processHistoricalData(rawData);
//         } else if (rawData.some((d) => d.hasOwnProperty("ensemble"))) {
//             processEnsembleData(rawData);
//         } else {
//             setFilteredData(rawData);
//             setDataReady(true);
//         }
//     };

//     // Detect if data is in historical format (with year keys like y1990)
//     const detectHistoricalFormat = (rawData) => {
//         if (!rawData || rawData.length === 0 || !rawData[0].properties)
//             return false;

//         // Check if any properties start with 'y' followed by digits (like y1990)
//         const yearKeys = Object.keys(rawData[0].properties).filter((key) =>
//             /^y\d+$/.test(key)
//         );
//         return yearKeys.length > 0;
//     };

//     // Process historical data with year keys
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
//                 let year, month;

//                 if (yearKey.length === 4) {
//                     // Format: y1990 (yearly)
//                     year = parseInt(yearKey, 10);
//                     month = 1; // Default to January for yearly data
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
//                         formattedDate: new Date(year, month - 1, 1), // JavaScript months are 0-based
//                         value: value
//                     });
//                 }
//             }
//         });

//         // Sort by date
//         timeSeriesData.sort((a, b) => a.formattedDate - b.formattedDate);

//         setFilteredData(timeSeriesData);
//         setDataReady(true);
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
//     const createChartOptions = (isEnsemble = false, dataPoints = []) => {
//         // Determine whether we're working with time series or just years
//         const hasTimeData =
//             dataPoints.length > 0 && dataPoints[0] instanceof Date;

//         // Set appropriate time scale options based on data type
//         const xAxisOptions = hasTimeData
//             ? {
//                   type: "time",
//                   time: {
//                       unit: determineTimeUnit(dataPoints),
//                       displayFormats: {
//                           day: "MMM d, yyyy",
//                           month: "MMM yyyy",
//                           quarter: "MMM yyyy",
//                           year: "yyyy"
//                       },
//                       tooltipFormat: "MMM d, yyyy"
//                   },
//                   title: {
//                       display: true,
//                       text: "Date",
//                       font: {
//                           size: 16,
//                           weight: "bold"
//                       },
//                       padding: {
//                           top: 10
//                       }
//                   },
//                   ticks: {
//                       font: {
//                           size: 14
//                       },
//                       major: {
//                           enabled: true,
//                           fontStyle: "bold"
//                       },
//                       source: "data" // Use the actual data points to determine ticks
//                   }
//               }
//             : {
//                   type: "linear",
//                   title: {
//                       display: true,
//                       text: "Year",
//                       font: {
//                           size: 16,
//                           weight: "bold"
//                       },
//                       padding: {
//                           top: 10
//                       }
//                   },
//                   ticks: {
//                       font: {
//                           size: 14
//                       },
//                       callback: function (value) {
//                           // Ensure ticks are whole years
//                           if (Number.isInteger(value)) {
//                               return value;
//                           }
//                       }
//                   }
//               };

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
//                             const date = tooltipItems[0].parsed.x;
//                             if (date instanceof Date) {
//                                 return date.toLocaleDateString(undefined, {
//                                     year: "numeric",
//                                     month: "long",
//                                     day: "numeric"
//                                 });
//                             }
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
//                 x: xAxisOptions,
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

//     // Determine the appropriate time unit based on the data points
//     const determineTimeUnit = (dataPoints) => {
//         if (!dataPoints || dataPoints.length < 2) return "month";

//         // Check if we have both month and year
//         const allSameYear = dataPoints.every(
//             (d) => d.getFullYear() === dataPoints[0].getFullYear()
//         );
//         const allSameMonth = dataPoints.every(
//             (d) => d.getMonth() === dataPoints[0].getMonth()
//         );

//         if (allSameYear && allSameMonth) {
//             return "day";
//         } else if (allSameYear) {
//             return "month";
//         } else {
//             // Calculate total time span
//             const firstDate = new Date(
//                 Math.min(...dataPoints.map((d) => d.getTime()))
//             );
//             const lastDate = new Date(
//                 Math.max(...dataPoints.map((d) => d.getTime()))
//             );
//             const monthsDiff =
//                 (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
//                 (lastDate.getMonth() - firstDate.getMonth());

//             if (monthsDiff > 48) {
//                 return "year";
//             } else if (monthsDiff > 12) {
//                 return "quarter";
//             } else {
//                 return "month";
//             }
//         }
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

//         // Check if we're dealing with historical data format
//         if (data[0] && data[0].properties) {
//             const timeSeriesData = [];
//             const properties = data[0].properties;

//             // Filter year keys based on selected range
//             Object.keys(properties).forEach((key) => {
//                 if (/^y\d+$/.test(key)) {
//                     // Parse year and month from key
//                     const yearKey = key.substring(1);
//                     let year, month;

//                     if (yearKey.length === 4) {
//                         // Format: y1990 (yearly)
//                         year = parseInt(yearKey, 10);
//                         month = 1; // Default to January for yearly data
//                     } else if (yearKey.length === 6) {
//                         // Format: y199001 (monthly)
//                         year = parseInt(yearKey.substring(0, 4), 10);
//                         month = parseInt(yearKey.substring(4, 6), 10);
//                     } else {
//                         return; // Skip invalid formats
//                     }

//                     // Check if the year is within the selected range
//                     if (year >= startYear && year <= endYear) {
//                         const value = properties[key];

//                         if (
//                             !isNaN(year) &&
//                             !isNaN(month) &&
//                             value !== null &&
//                             value !== undefined
//                         ) {
//                             timeSeriesData.push({
//                                 year: year,
//                                 month: month,
//                                 formattedDate: new Date(year, month - 1, 1),
//                                 value:
//                                     typeof value === "number"
//                                         ? value
//                                         : parseFloat(value)
//                             });
//                         }
//                     }
//                 }
//             });

//             // Sort by date
//             timeSeriesData.sort((a, b) => a.formattedDate - b.formattedDate);
//             setFilteredData(timeSeriesData);
//         } else {
//             // Standard data format or ensemble data
//             const newFilteredData = data.filter((item) => {
//                 // For data with formattedDate
//                 if (item.formattedDate) {
//                     const year = item.formattedDate.getFullYear();
//                     return year >= startYear && year <= endYear;
//                 }
//                 // For data with just year field
//                 return item.year >= startYear && item.year <= endYear;
//             });

//             setFilteredData(newFilteredData);
//         }
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

//         // If we're dealing with raw data that has properties (historical data)
//         if (data[0] && data[0].properties) {
//             const yearKeys = Object.keys(data[0].properties)
//                 .filter((key) => /^y\d+$/.test(key))
//                 .map((key) => {
//                     const yearKey = key.substring(1);
//                     if (yearKey.length === 4) {
//                         return parseInt(yearKey, 10);
//                     } else if (yearKey.length === 6) {
//                         return parseInt(yearKey.substring(0, 4), 10);
//                     }
//                     return null;
//                 })
//                 .filter((year) => year !== null)
//                 .sort((a, b) => a - b);

//             return [...new Set(yearKeys)]; // Remove duplicates
//         }

//         // For regular data with year field
//         if (filteredData.length > 0 && filteredData[0].formattedDate) {
//             // For data with formatted dates, extract unique years
//             return [
//                 ...new Set(
//                     filteredData.map((d) => d.formattedDate.getFullYear())
//                 )
//             ].sort((a, b) => a - b);
//         }

//         // Standard data format with explicit year field
//         return [...new Set(filteredData.map((d) => d.year))].sort(
//             (a, b) => a - b
//         );
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

//                 {/* Loading indicator when data is processing */}
//                 {data && data.length > 0 && !dataReady && (
//                     <div className="loading-overlay">
//                         <div className="loading-spinner"></div>
//                         <p>Processing data...</p>
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
//                                 <span className="chart-legend-item mean"></span>{" "}
//                                 <strong>Mean</strong>: Average of all ensemble
//                                 members
//                             </li>
//                             <li>
//                                 <span className="chart-legend-item max"></span>{" "}
//                                 <strong>Max</strong>: Maximum value across
//                                 ensemble members
//                             </li>
//                             <li>
//                                 <span className="chart-legend-item min"></span>{" "}
//                                 <strong>Min</strong>: Minimum value across
//                                 ensemble members
//                             </li>
//                             <li>
//                                 <span className="chart-legend-item ensemble"></span>{" "}
//                                 <strong>Ensembles</strong>: Individual forecast
//                                 runs
//                             </li>
//                         </ul>
//                         <p className="ensemble-explainer">
//                             Ensemble forecasts combine multiple model runs with
//                             slightly different initial conditions to capture
//                             uncertainty. The spread between min and max values
//                             indicates the range of possible outcomes.
//                         </p>
//                     </div>
//                 )}
//         </div>
//     );
// };

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns"; // Required for proper time-scale handling

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
        processData(data);
    }, [data]);

    // Process data to prepare for visualization
    const processData = (rawData) => {
        if (!rawData || rawData.length === 0) return;

        // Detect the data format
        let detectedDataType;

        // 1. Check if data has ensemble property
        if (rawData.some((d) => d.hasOwnProperty("ensemble"))) {
            detectedDataType = "ensemble";
            setChartType("ensemble");
        }
        // 2. Check if data has month property (time series)
        else if (rawData.some((d) => d.hasOwnProperty("month"))) {
            detectedDataType = "timeSeries";
            setChartType("timeSeries");
        }
        // 3. Check for historical format with properties like y1990, y2000 in a GeoJSON feature
        else if (
            rawData[0]?.properties &&
            Object.keys(rawData[0].properties).some((key) => /^y\d+$/.test(key))
        ) {
            detectedDataType = "historical";
            processHistoricalData(rawData);
            return; // Early return as we're handling this specially
        }
        // 4. Standard year/value pairs
        else {
            detectedDataType = "standard";
            setChartType("standard");
        }

        console.log("Detected data type:", detectedDataType);

        // Transform the data based on its type
        let transformedData;

        if (detectedDataType === "ensemble") {
            // No transformation needed for ensemble data
            transformedData = rawData;
        } else if (detectedDataType === "timeSeries") {
            // Convert year/month into JavaScript Date objects
            transformedData = rawData.map((item) => ({
                ...item,
                date: new Date(item.year, (item.month || 1) - 1, 1), // Month is 0-indexed in JS
                formattedDate: formatDateString(item.year, item.month)
            }));
        } else {
            // Standard year/value data
            transformedData = rawData.map((item) => ({
                ...item,
                date: new Date(item.year, 0, 1), // January 1st of the year
                formattedDate: `${item.year}`
            }));
        }

        // Sort the data chronologically
        transformedData.sort((a, b) => {
            if (a.date && b.date) return a.date - b.date;
            if (a.year !== b.year) return a.year - b.year;
            if (a.month && b.month) return a.month - b.month;
            return 0;
        });

        // Set the initial year range based on available data
        const years = [...new Set(transformedData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
        if (!startYear && years.length > 0) setStartYear(years[0]);
        if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);

        setProcessedData(transformedData);
        setFilteredData(transformedData);
        setDataReady(true);
    };

    // Format date string from year and month
    const formatDateString = (year, month) => {
        if (!month) return `${year}`;

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

        return `${monthNames[month - 1]} ${year}`;
    };

    // Process historical data from GeoJSON properties
    const processHistoricalData = (rawData) => {
        if (!rawData || rawData.length === 0 || !rawData[0].properties) {
            setFilteredData([]);
            setDataReady(true);
            return;
        }

        const timeSeriesData = [];
        const properties = rawData[0].properties;

        // Extract data from properties with pattern y1990, y2000, etc.
        Object.keys(properties).forEach((key) => {
            if (/^y\d+$/.test(key)) {
                // Handle both yearly and monthly formats
                const yearKey = key.substring(1);
                let year,
                    month = 1; // Default to January for yearly data

                if (yearKey.length === 4) {
                    // Format: y1990 (yearly)
                    year = parseInt(yearKey, 10);
                } else if (yearKey.length === 6) {
                    // Format: y199001 (monthly)
                    year = parseInt(yearKey.substring(0, 4), 10);
                    month = parseInt(yearKey.substring(4, 6), 10);
                } else {
                    // Unknown format, skip
                    return;
                }

                const value = properties[key];

                if (
                    !isNaN(year) &&
                    !isNaN(month) &&
                    value !== null &&
                    value !== undefined
                ) {
                    timeSeriesData.push({
                        year: year,
                        month: month,
                        date: new Date(year, month - 1, 1), // JavaScript months are 0-based
                        formattedDate: formatDateString(year, month),
                        value:
                            typeof value === "number"
                                ? value
                                : parseFloat(value)
                    });
                }
            }
        });

        // Sort by date
        timeSeriesData.sort((a, b) => a.date - b.date);

        setChartType(
            timeSeriesData.some((d) => d.month > 1) ? "timeSeries" : "standard"
        );
        setProcessedData(timeSeriesData);
        setFilteredData(timeSeriesData);

        // Set the initial year range based on available data
        const years = [...new Set(timeSeriesData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
        if (!startYear && years.length > 0) setStartYear(years[0]);
        if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);

        setDataReady(true);
    };

    // Filter data when range changes
    useEffect(() => {
        if (
            !processedData ||
            processedData.length === 0 ||
            !startYear ||
            !endYear
        )
            return;

        // Apply the year filter
        const newFilteredData = processedData.filter((item) => {
            return item.year >= startYear && item.year <= endYear;
        });

        setFilteredData(newFilteredData);
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

        // Create chart based on detected chart type
        if (chartType === "ensemble") {
            createEnsembleChart(ctx);
        } else {
            createTimeSeriesChart(ctx);
        }
    };

    // Create a chart for time series data (standard or time-based)
    const createTimeSeriesChart = (ctx) => {
        // Sort data chronologically
        const sortedData = [...filteredData].sort((a, b) => {
            if (a.date && b.date) return a.date - b.date;
            return a.year - b.year;
        });

        // Determine if we need a time scale
        const useTimeScale = chartType === "timeSeries";

        // Choose x-value based on chart type
        const xValueSelector = useTimeScale
            ? (item) => item.date
            : (item) => item.formattedDate || item.year.toString();

        // Prepare datasets
        const datasets = [
            {
                label: getChartLabel(),
                data: sortedData.map((item) => ({
                    x: xValueSelector(item),
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
                    x: xValueSelector(item),
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
                    x: xValueSelector(item),
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

        // Create the chart with appropriate options
        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: { datasets },
            options: createTimeSeriesChartOptions(useTimeScale)
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
                date: new Date(year, 0, 1),
                formattedDate: `${year}`,
                mean: values.length
                    ? values.reduce((sum, val) => sum + val, 0) / values.length
                    : null,
                min: values.length ? Math.min(...values) : null,
                max: values.length ? Math.max(...values) : null,
                values: yearData
            };
        });

        // Determine if we need a time scale
        // For ensemble data, we typically use standard scale with years
        const useTimeScale = false;
        const xValueSelector = (item) =>
            item.formattedDate || item.year.toString();

        // Prepare datasets for ensemble members (thin lines)
        const ensembleDatasets = ensembleMembers.map((member) => {
            return {
                label: `Ensemble ${member}`,
                data: years.map((year) => {
                    const entry = filteredData.find(
                        (d) => d.year === year && d.ensemble === member
                    );
                    return {
                        x: xValueSelector({ year, formattedDate: `${year}` }),
                        y: entry ? entry.value : null
                    };
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
                    x: xValueSelector(stat),
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
                    x: xValueSelector(stat),
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
                    x: xValueSelector(stat),
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

        // Create the chart
        chartInstanceRef.current = new Chart(ctx, {
            type: "line",
            data: { datasets },
            options: createTimeSeriesChartOptions(useTimeScale, true) // Pass true for ensemble charts
        });
    };

    // Create chart options for time series
    const createTimeSeriesChartOptions = (
        useTimeScale = false,
        isEnsemble = false
    ) => {
        // Configure x-axis based on scale type
        const xAxisOptions = useTimeScale
            ? {
                  type: "time",
                  time: {
                      unit: determineTimeUnit(filteredData),
                      displayFormats: {
                          day: "MMM d, yyyy",
                          month: "MMM yyyy",
                          quarter: "MMM yyyy",
                          year: "yyyy"
                      },
                      tooltipFormat: "MMM yyyy"
                  },
                  title: {
                      display: true,
                      text: "Date",
                      font: { size: 16, weight: "bold" },
                      padding: { top: 10 }
                  }
              }
            : {
                  type: "category", // Use category scale for uniform spacing
                  title: {
                      display: true,
                      text: "Date",
                      font: { size: 16, weight: "bold" },
                      padding: { top: 10 }
                  }
              };

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: getChartTitle(),
                    font: { size: 18, weight: "bold" },
                    padding: { top: 10, bottom: 20 }
                },
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        font: { size: 14 },
                        // For ensemble charts, only show the statistics in the legend
                        filter: isEnsemble
                            ? (legendItem) =>
                                  !legendItem.text.startsWith("Ensemble")
                            : undefined
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => {
                            const xValue = tooltipItems[0].parsed.x;
                            // Handle different x-value types
                            if (xValue instanceof Date) {
                                return xValue.toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long"
                                });
                            }
                            return tooltipItems[0].label || `Year: ${xValue}`;
                        },
                        label: (tooltipItem) => {
                            return `${
                                tooltipItem.dataset.label
                            }: ${tooltipItem.parsed.y.toFixed(2)}`;
                        }
                    },
                    bodyFont: { size: 14 },
                    titleFont: { size: 16, weight: "bold" }
                }
            },
            interaction: {
                mode: "nearest",
                intersect: false
            },
            scales: {
                x: xAxisOptions,
                y: {
                    title: {
                        display: true,
                        text: getYAxisLabel(),
                        font: { size: 16, weight: "bold" },
                        padding: { bottom: 10 }
                    },
                    ticks: { font: { size: 14 } }
                }
            }
        };
    };

    // Determine the appropriate time unit based on the data points
    const determineTimeUnit = (dataPoints) => {
        if (!dataPoints || dataPoints.length < 2) return "month";

        // Check if all data points have the same year
        const allSameYear = dataPoints.every(
            (d) => d.year === dataPoints[0].year
        );

        // If all in the same year, use 'month' as the unit
        if (allSameYear) return "month";

        // Calculate the time span
        const years = [...new Set(dataPoints.map((d) => d.year))];

        // If the span is larger than 10 years, use 'year'
        if (years.length > 10) return "year";

        // Otherwise, use 'month' or 'quarter' depending on data density
        return dataPoints.length / years.length > 4 ? "month" : "quarter";
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
        if (
            !startYear ||
            !endYear ||
            !processedData ||
            processedData.length === 0
        )
            return;

        // Filter data based on selected year range
        const newFilteredData = processedData.filter((item) => {
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
            // Ensemble data format
            const years = [...new Set(filteredData.map((d) => d.year))].sort(
                (a, b) => a - b
            );
            const ensembleMembers = [
                ...new Set(filteredData.map((d) => d.ensemble))
            ].sort((a, b) => a - b);

            // Headers row
            csvContent += "Ensemble,";
            csvContent += years.join(",");
            csvContent += "\r\n";

            // Data rows for each ensemble member
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

            // Statistics rows
            // Mean
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

            // Min
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

            // Max
            csvContent += "Max,";
            years.forEach((year) => {
                const yearData = filteredData.filter((d) => d.year === year);
                const values = yearData
                    .map((d) => d.value)
                    .filter((v) => v !== null && v !== undefined);
                const max = values.length ? Math.max(...values) : "";
                csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
            });
        } else if (chartType === "timeSeries") {
            // Time series data format
            csvContent += "Date,Year,Month,Value\r\n";
            filteredData.forEach((item) => {
                const formattedDate =
                    item.formattedDate ||
                    formatDateString(item.year, item.month);
                csvContent += `${formattedDate},${item.year},${
                    item.month || ""
                },${item.value !== undefined ? item.value : ""}\r\n`;
            });
        } else {
            // Simple yearly data format
            csvContent += "Year,Value\r\n";
            filteredData.forEach((item) => {
                csvContent += `${item.year},${
                    item.value !== undefined ? item.value : ""
                }\r\n`;
            });
        }

        // Download the CSV file
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
        if (!processedData || processedData.length === 0) return [];
        return [...new Set(processedData.map((d) => d.year))].sort(
            (a, b) => a - b
        );
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

                {/* Loading indicator */}
                {data && data.length > 0 && !dataReady && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Processing data...</p>
                    </div>
                )}
            </div>

            {/* Chart footer with explanations - only shown for ensemble charts */}
            {data && data.length > 0 && chartType === "ensemble" && (
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
                            <strong>Max</strong>: Maximum value across ensemble
                            members
                        </li>
                        <li>
                            <span className="chart-legend-item min"></span>{" "}
                            <strong>Min</strong>: Minimum value across ensemble
                            members
                        </li>
                        <li>
                            <span className="chart-legend-item ensemble"></span>{" "}
                            <strong>Ensembles</strong>: Individual forecast runs
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
