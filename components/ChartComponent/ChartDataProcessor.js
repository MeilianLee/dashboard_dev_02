/**
 * Data processing functions for ChartComponent
 */
import { formatDateString } from './ChartComponentUtils';

// Process data to prepare for visualization
export const processData = (rawData, setChartType, setProcessedData, setDataReady, setStartYear, setEndYear) => {
    if (!rawData || rawData.length === 0) return;

    // Detect the data format
    let detectedDataType;

    // 1. Check if data has ensemble property
    if (rawData.some(d => d.hasOwnProperty('ensemble'))) {
        detectedDataType = "ensemble";
        setChartType("ensemble");
    } 
    // 2. Check if data has month property (time series)
    else if (rawData.some(d => d.hasOwnProperty('month'))) {
        detectedDataType = "timeSeries";
        setChartType("timeSeries");
    }
    // 3. Check for historical format with properties like y1990, y2000 in a GeoJSON feature
    else if (rawData[0]?.properties && Object.keys(rawData[0].properties).some(key => /^y\d+$/.test(key))) {
        detectedDataType = "historical";
        processHistoricalData(
            rawData, 
            setChartType, 
            setProcessedData, 
            setDataReady, 
            setStartYear, 
            setEndYear
        );
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
    } 
    else if (detectedDataType === "timeSeries") {
        // Convert year/month into JavaScript Date objects
        transformedData = rawData.map(item => ({
            ...item,
            date: new Date(item.year, (item.month || 1) - 1, 1), // Month is 0-indexed in JS
            formattedDate: formatDateString(item.year, item.month)
        }));
    } 
    else {
        // Standard year/value data
        transformedData = rawData.map(item => ({
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
    const years = [...new Set(transformedData.map(d => d.year))].sort((a, b) => a - b);
    if (years.length > 0) {
        setStartYear(years[0]);
        setEndYear(years[years.length - 1]);
    }

    setProcessedData(transformedData);
    setDataReady(true);
};

// Process historical data from GeoJSON properties
export const processHistoricalData = (rawData, setChartType, setProcessedData, setDataReady, setStartYear, setEndYear) => {
    if (!rawData || rawData.length === 0 || !rawData[0].properties) {
        setProcessedData([]);
        setDataReady(true);
        return;
    }

    const timeSeriesData = [];
    const properties = rawData[0].properties;

    // Extract data from properties with pattern y1990, y2000, etc.
    Object.keys(properties).forEach(key => {
        if (/^y\d+$/.test(key)) {
            // Handle both yearly and monthly formats
            const yearKey = key.substring(1);
            let year, month = 1; // Default to January for yearly data

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

            if (!isNaN(year) && !isNaN(month) && value !== null && value !== undefined) {
                timeSeriesData.push({
                    year: year,
                    month: month,
                    date: new Date(year, month - 1, 1), // JavaScript months are 0-based
                    formattedDate: formatDateString(year, month),
                    value: typeof value === 'number' ? value : parseFloat(value)
                });
            }
        }
    });

    // Sort by date
    timeSeriesData.sort((a, b) => a.date - b.date);
    
    setChartType(timeSeriesData.some(d => d.month > 1) ? "timeSeries" : "standard");
    setProcessedData(timeSeriesData);
    
    // Set the initial year range based on available data
    const years = [...new Set(timeSeriesData.map(d => d.year))].sort((a, b) => a - b);
    if (years.length > 0) {
        setStartYear(years[0]);
        setEndYear(years[years.length - 1]);
    }
    
    setDataReady(true);
};

// Generate years array for select options
export const getYearOptions = (processedData) => {
    if (!processedData || processedData.length === 0) return [];
    return [...new Set(processedData.map(d => d.year))].sort((a, b) => a - b);
};

// Filter data based on selected year range
export const filterDataByYearRange = (processedData, startYear, endYear) => {
    if (!processedData || processedData.length === 0 || !startYear || !endYear) {
        return processedData;
    }
    
    return processedData.filter(item => 
        item.year >= startYear && item.year <= endYear
    );
};





// /**
//  * Data processing functions for ChartComponent
//  */
// import { formatDateString } from './ChartComponentUtils';

// // Process data to prepare for visualization
// export const processData = (rawData, setChartType, setProcessedData, setDataReady, setStartYear, setEndYear) => {
//     if (!rawData || rawData.length === 0) return;

//     // Detect the data format
//     let detectedDataType;

//     // 1. Check if data has ensemble property
//     if (rawData.some(d => d.hasOwnProperty('ensemble'))) {
//         detectedDataType = "ensemble";
//         setChartType("ensemble");
//     } 
//     // 2. Check if data has month property (time series)
//     else if (rawData.some(d => d.hasOwnProperty('month'))) {
//         detectedDataType = "timeSeries";
//         setChartType("timeSeries");
//     }
//     // 3. Check for historical format with properties like y1990, y2000 in a GeoJSON feature
//     else if (rawData[0]?.properties && Object.keys(rawData[0].properties).some(key => /^y\d+$/.test(key))) {
//         detectedDataType = "historical";
//         processHistoricalData(
//             rawData, 
//             setChartType, 
//             setProcessedData, 
//             setDataReady, 
//             setStartYear, 
//             setEndYear
//         );
//         return; // Early return as we're handling this specially
//     }
//     // 4. Standard year/value pairs
//     else {
//         detectedDataType = "standard";
//         setChartType("standard");
//     }

//     console.log("Detected data type:", detectedDataType);

//     // Transform the data based on its type
//     let transformedData;

//     if (detectedDataType === "ensemble") {
//         // No transformation needed for ensemble data
//         transformedData = rawData;
//     } 
//     else if (detectedDataType === "timeSeries") {
//         // Convert year/month into JavaScript Date objects
//         transformedData = rawData.map(item => ({
//             ...item,
//             date: new Date(item.year, (item.month || 1) - 1, 1), // Month is 0-indexed in JS
//             formattedDate: formatDateString(item.year, item.month)
//         }));
//     } 
//     else {
//         // Standard year/value data
//         transformedData = rawData.map(item => ({
//             ...item,
//             date: new Date(item.year, 0, 1), // January 1st of the year
//             formattedDate: `${item.year}`
//         }));
//     }

//     // Sort the data chronologically
//     transformedData.sort((a, b) => {
//         if (a.date && b.date) return a.date - b.date;
//         if (a.year !== b.year) return a.year - b.year;
//         if (a.month && b.month) return a.month - b.month;
//         return 0;
//     });

//     // Set the initial year range based on available data
//     const years = [...new Set(transformedData.map(d => d.year))].sort((a, b) => a - b);
//     if (years.length > 0) {
//         setStartYear(years[0]);
//         setEndYear(years[years.length - 1]);
//     }

//     setProcessedData(transformedData);
//     setDataReady(true);
// };

// // Process historical data from GeoJSON properties
// export const processHistoricalData = (rawData, setChartType, setProcessedData, setDataReady, setStartYear, setEndYear) => {
//     if (!rawData || rawData.length === 0 || !rawData[0].properties) {
//         setProcessedData([]);
//         setDataReady(true);
//         return;
//     }

//     const timeSeriesData = [];
//     const properties = rawData[0].properties;

//     // Extract data from properties with pattern y1990, y2000, etc.
//     Object.keys(properties).forEach(key => {
//         if (/^y\d+$/.test(key)) {
//             // Handle both yearly and monthly formats
//             const yearKey = key.substring(1);
//             let year, month = 1; // Default to January for yearly data

//             if (yearKey.length === 4) {
//                 // Format: y1990 (yearly)
//                 year = parseInt(yearKey, 10);
//             } else if (yearKey.length === 6) {
//                 // Format: y199001 (monthly)
//                 year = parseInt(yearKey.substring(0, 4), 10);
//                 month = parseInt(yearKey.substring(4, 6), 10);
//             } else {
//                 // Unknown format, skip
//                 return;
//             }

//             const value = properties[key];

//             if (!isNaN(year) && !isNaN(month) && value !== null && value !== undefined) {
//                 timeSeriesData.push({
//                     year: year,
//                     month: month,
//                     date: new Date(year, month - 1, 1), // JavaScript months are 0-based
//                     formattedDate: formatDateString(year, month),
//                     value: typeof value === 'number' ? value : parseFloat(value)
//                 });
//             }
//         }
//     });

//     // Sort by date
//     timeSeriesData.sort((a, b) => a.date - b.date);
    
//     setChartType(timeSeriesData.some(d => d.month > 1) ? "timeSeries" : "standard");
//     setProcessedData(timeSeriesData);
    
//     // Set the initial year range based on available data
//     const years = [...new Set(timeSeriesData.map(d => d.year))].sort((a, b) => a - b);
//     if (years.length > 0) {
//         setStartYear(years[0]);
//         setEndYear(years[years.length - 1]);
//     }
    
//     setDataReady(true);
// };

// // Generate years array for select options
// export const getYearOptions = (processedData) => {
//     if (!processedData || processedData.length === 0) return [];
//     return [...new Set(processedData.map(d => d.year))].sort((a, b) => a - b);
// };

// // Filter data based on selected year range
// export const filterDataByYearRange = (processedData, startYear, endYear) => {
//     if (!processedData || processedData.length === 0 || !startYear || !endYear) {
//         return processedData;
//     }
    
//     return processedData.filter(item => 
//         item.year >= startYear && item.year <= endYear
//     );
// };