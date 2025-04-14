/**
 * Export utilities for ChartComponent
 */
import { formatDateString } from './ChartComponentUtils';

// Export chart data as CSV
export const downloadCSV = (filteredData, startYear, endYear) => {
    if (!filteredData || filteredData.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    // Check if we have ensemble data
    const hasEnsembleMembers = filteredData.some(d => d.hasOwnProperty('ensemble'));

    if (hasEnsembleMembers) {
        // Ensemble data format
        const years = [...new Set(filteredData.map(d => d.year))].sort((a, b) => a - b);
        const ensembleMembers = [...new Set(filteredData.map(d => d.ensemble))].sort((a, b) => a - b);

        // Headers row
        csvContent += "Ensemble,";
        csvContent += years.join(",");
        csvContent += "\r\n";

        // Data rows for each ensemble member
        ensembleMembers.forEach(member => {
            csvContent += `${member},`;
            years.forEach(year => {
                const entry = filteredData.find(d => d.year === year && d.ensemble === member);
                csvContent += `${entry && entry.value !== undefined ? entry.value : ""},`;
            });
            csvContent += "\r\n";
        });

        // Statistics rows
        // Mean
        csvContent += "Mean,";
        years.forEach(year => {
            const yearData = filteredData.filter(d => d.year === year);
            const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
            const mean = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : "";
            csvContent += `${mean !== "" ? mean.toFixed(2) : ""},`;
        });
        csvContent += "\r\n";

        // Min
        csvContent += "Min,";
        years.forEach(year => {
            const yearData = filteredData.filter(d => d.year === year);
            const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
            const min = values.length ? Math.min(...values) : "";
            csvContent += `${min !== "" ? min.toFixed(2) : ""},`;
        });
        csvContent += "\r\n";

        // Max
        csvContent += "Max,";
        years.forEach(year => {
            const yearData = filteredData.filter(d => d.year === year);
            const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
            const max = values.length ? Math.max(...values) : "";
            csvContent += `${max !== "" ? max.toFixed(2) : ""},`;
        });
    } else if (filteredData.some(d => d.month)) {
        // Time series data format
        csvContent += "Date,Year,Month,Value\r\n";
        filteredData.forEach(item => {
            const formattedDate = item.formattedDate || formatDateString(item.year, item.month);
            csvContent += `${formattedDate},${item.year},${item.month || ""},${item.value !== undefined ? item.value : ""}\r\n`;
        });
    } else {
        // Simple yearly data format
        csvContent += "Year,Value\r\n";
        filteredData.forEach(item => {
            csvContent += `${item.year},${item.value !== undefined ? item.value : ""}\r\n`;
        });
    }

    // Download the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `time_series_${startYear}-${endYear}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
};

// Download chart as image
export const downloadImage = (chartRef, startYear, endYear, format = 'png') => {
    if (!chartRef.current) return;

    const canvas = chartRef.current;
    const link = document.createElement('a');

    if (format === 'png') {
        link.href = canvas.toDataURL('image/png');
        link.download = `chart_${startYear}-${endYear}.png`;
    } else if (format === 'jpg') {
        link.href = canvas.toDataURL('image/jpeg', 0.8);
        link.download = `chart_${startYear}-${endYear}.jpg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};



// /**
//  * Utility functions for the ChartComponent
//  */

// // Format date string from year and month
// export const formatDateString = (year, month) => {
//     if (!month) return `${year}`;
    
//     const monthNames = [
//         'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];
    
//     return `${monthNames[month-1]} ${year}`;
// };

// // Determine the appropriate time unit based on the data points
// export const determineTimeUnit = (dataPoints) => {
//     if (!dataPoints || dataPoints.length < 2) return 'month';

//     // Check if all data points have the same year
//     const allSameYear = dataPoints.every(d => d.year === dataPoints[0].year);
    
//     // If all in the same year, use 'month' as the unit
//     if (allSameYear) return 'month';
    
//     // Calculate the time span
//     const years = [...new Set(dataPoints.map(d => d.year))];
    
//     // If the span is larger than 10 years, use 'year'
//     if (years.length > 10) return 'year';
    
//     // Otherwise, use 'month' or 'quarter' depending on data density
//     return dataPoints.length / years.length > 4 ? 'month' : 'quarter';
// };

// // Get appropriate chart title based on options
// export const getChartTitle = (options) => {
//     let title = "";

//     if (options && options.varType) {
//         if (options.varType.startsWith("SPI")) {
//             title = `Standardized Precipitation Index (${options.varType.slice(3)} month${options.varType.slice(3) > 1 ? "s" : ""})`;
//         } else if (options.varType === "Yield") {
//             title = "Rice Yield";
//         } else if (options.varType === "Prcp") {
//             title = "Precipitation";
//         } else if (options.varType === "Temp") {
//             title = "Temperature";
//         } else if (options.varType === "Area") {
//             title = "Rice Area";
//         } else if (options.varType === "Production") {
//             title = "Rice Production";
//         } else if (options.varType === "smpct1") {
//             title = "Soil Moisture Percentile";
//         } else if (options.varType === "yieldAnom") {
//             title = "Yield Anomaly";
//         } else {
//             title = options.varType;
//         }
//     }

//     return title;
// };

// // Get appropriate y-axis label
// export const getYAxisLabel = (options) => {
//     if (!options || !options.varType) return "Value";

//     switch (options.varType) {
//         case "SPI1":
//         case "SPI3":
//         case "SPI6":
//         case "SPI12":
//             return "SPI Value";
//         case "Yield":
//             return "Yield (ton/ha)";
//         case "Area":
//             return "Area (ha)";
//         case "Production":
//             return "Production (ton)";
//         case "Prcp":
//             return "Precipitation (mm)";
//         case "Temp":
//             return "Temperature (°C)";
//         case "smpct1":
//             return "Soil Moisture (%)";
//         case "yieldAnom":
//             return "Yield Anomaly (%)";
//         default:
//             return "Value";
//     }
// };

// // Get appropriate dataset label
// export const getChartLabel = (options) => {
//     if (!options || !options.varType) return "Value";

//     switch (options.varType) {
//         case "SPI1":
//         case "SPI3":
//         case "SPI6":
//         case "SPI12":
//             return `${options.varType} Value`;
//         case "Yield":
//             return "Rice Yield";
//         case "Area":
//             return "Rice Area";
//         case "Production":
//             return "Rice Production";
//         case "Prcp":
//             return "Precipitation";
//         case "Temp":
//             return "Temperature";
//         case "smpct1":
//             return "Soil Moisture";
//         case "yieldAnom":
//             return "Yield Anomaly";
//         default:
//             return options.varType;
//     }
// };

// // Create background coloring plugin for SPI charts
// export const createBackgroundPlugin = (options) => {
//     return {
//         id: 'customBackgroundColors',
//         beforeDraw: (chart) => {
//             const { ctx, chartArea, scales } = chart;
//             if (!chartArea || !scales.y) return;
            
//             // Only apply for SPI charts
//             if (!options || !options.varType || !options.varType.startsWith('SPI')) return;
            
//             const { top, bottom, left, right } = chartArea;
//             const yScale = scales.y;
            
//             // Draw colored background zones
            
//             // Extremely wet zone (> 2): green
//             const y2 = yScale.getPixelForValue(2);
//             ctx.fillStyle = 'rgba(20, 113, 61, 0.25)';
//             ctx.fillRect(left, top, right - left, y2 - top);
            
//             // Moderately wet zone (1-2): light green
//             const y1 = yScale.getPixelForValue(1);
//             ctx.fillStyle = 'rgba(152, 238, 152, 0.3)';
//             ctx.fillRect(left, y2, right - left, y1 - y2);
            
//             // Near normal zone (-1 to 1): very light gray
//             const ym1 = yScale.getPixelForValue(-1);
//             ctx.fillStyle = 'rgba(238, 238, 238, 0.2)';
//             ctx.fillRect(left, y1, right - left, ym1 - y1);
            
//             // Moderately dry zone (-1 to -2): light orange
//             const ym2 = yScale.getPixelForValue(-2);
//             ctx.fillStyle = 'rgba(245, 222, 179, 0.3)';
//             ctx.fillRect(left, ym1, right - left, ym2 - ym1);
            
//             // Extremely dry zone (< -2): light red
//             ctx.fillStyle = 'rgba(178, 34, 34, 0.3)';
//             ctx.fillRect(left, ym2, right - left, bottom - ym2);
//         }
//     };
// };

// // Generate a random but consistent color for ensemble members
// export const getEnsembleColor = (member) => {
//     // Use the member number to generate a color with golden ratio to spread colors
//     // const hue = (member * 137) % 360; 
//     const hue = 240 % 360; 
//     return `hsla(${hue}, 70%, 50%, 0.3)`; // Light, semi-transparent colors
// };

// // Create common chart options
// export const createChartOptions = (title, yAxisLabel, useTimeScale, timeUnit, isEnsemble) => {
//     return {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             title: {
//                 display: true,
//                 text: title,
//                 font: { size: 18, weight: 'bold' },
//                 padding: { top: 10, bottom: 20 }
//             },
//             legend: {
//                 display: true,
//                 position: 'top',
//                 labels: {
//                     font: { size: 15},
//                     // For ensemble charts, only show statistical lines
//                     filter: isEnsemble ? 
//                         (legendItem) => !legendItem.text.startsWith('Ensemble') : 
//                         undefined,
//                     usePointStyle: false,
//                     boxWidth: 40,
//                     boxHeight: 2,
//                 }
//             }
//         },
//         interaction: {
//             mode: 'nearest',
//             intersect: false
//         },
//         scales: {
//             x: useTimeScale ? 
//                 {
//                     type: 'time',
//                     time: {
//                         unit: timeUnit,
//                         displayFormats: {
//                             day: 'MMM d, yyyy',
//                             month: 'MMM yyyy',
//                             quarter: 'MMM yyyy',
//                             year: 'yyyy'
//                         },
//                         tooltipFormat: 'MMM yyyy'
//                     },
//                     title: {
//                         display: true,
//                         text: 'Date',
//                         font: { size: 16, weight: 'bold' },
//                         padding: { top: 10 }
//                     }
//                 } : 
//                 {
//                     type: 'category', 
//                     title: {
//                         display: true,
//                         text: 'Date',
//                         font: { size: 16, weight: 'bold' },
//                         padding: { top: 10 }
//                     }
//                 },
//             y: {
//                 title: {
//                     display: true,
//                     text: yAxisLabel,
//                     font: { size: 16, weight: 'bold' },
//                     padding: { bottom: 10 }
//                 },
//                 ticks: { font: { size: 14 } }
//             }
//         }
//     };
// };