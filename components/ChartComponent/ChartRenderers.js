/**
 * Chart rendering functions for ChartComponent
 */
import Chart from "chart.js/auto";
import {
    getChartTitle,
    getYAxisLabel,
    getChartLabel,
    determineTimeUnit,
    createBackgroundPlugin,
    getEnsembleColor,
    createChartOptions
} from './ChartComponentUtils';

// Create a time series chart
export const createTimeSeriesChart = (ctx, filteredData, chartType, options, chartInstanceRef) => {
    // Sort data chronologically
    const sortedData = [...filteredData].sort((a, b) => {
        if (a.date && b.date) return a.date - b.date;
        return a.year - b.year;
    });

    // Determine if we need a time scale
    const useTimeScale = chartType === "timeSeries";

    // Choose x-value based on chart type
    const xValueSelector = useTimeScale ? 
        (item => item.date) : 
        (item => item.formattedDate || item.year.toString());

    // Prepare datasets
    const datasets = [
        {
            label: getChartLabel(options),
            data: sortedData.map(item => ({
                x: xValueSelector(item),
                y: item.value
            })),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 3,
            tension: 0.3, // Adds slight curve to lines
            pointRadius: 0,
            pointHoverRadius: 6
        }
    ];

    // If data has upper/lower bounds, add them
    if (sortedData.some(d => d.hasOwnProperty('upper_bound') && d.hasOwnProperty('lower_bound'))) {
        datasets.push({
            label: "Upper Bound",
            data: sortedData.map(item => ({
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
            data: sortedData.map(item => ({
                x: xValueSelector(item),
                y: item.lower_bound
            })),
            borderColor: "rgba(75, 192, 192, 0.5)",
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: {
                target: '-1',
                above: 'rgba(75, 192, 192, 0.3)'
            }
        });
    }

    // Get base chart options
    const chartOptions = createChartOptions(
        getChartTitle(options),
        getYAxisLabel(options),
        useTimeScale,
        determineTimeUnit(filteredData),
        false
    );

    // Add tooltip callback
    chartOptions.plugins.tooltip = {
        callbacks: {
            title: (tooltipItems) => {
                const xValue = tooltipItems[0].parsed.x;
                // Handle different x-value types
                if (xValue instanceof Date) {
                    return xValue.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long'
                    });
                }
                return tooltipItems[0].label || `Year: ${xValue}`;
            },
            label: (tooltipItem) => {
                let value = tooltipItem.parsed.y.toFixed(2);
                // Add color indicators for SPI values
                if (options && options.varType && options.varType.startsWith('SPI')) {
                    if (value > 2) value += " | Extremely Wet"; // Extremely wet
                    else if (value > 1) value += " | Moderately Wet"; // Moderately wet
                    else if (value < -2) value += " | Extremely Dry"; // Extremely dry
                    else if (value < -1) value += " | Moderately Dry"; // Moderately dry
                }
                return `${tooltipItem.dataset.label}: ${value}`;
            }
        },
        bodyFont: { size: 14 },
        titleFont: { size: 16, weight: 'bold' }
    };

    // Create the background plugin
    const backgroundPlugin = createBackgroundPlugin(options);

    // Create the chart
    chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: chartOptions,
        plugins: [backgroundPlugin]
    });
};

// Create an ensemble chart
export const createEnsembleChart = (ctx, filteredData, options, chartInstanceRef) => {
    // Extract unique years and ensemble members
    const years = [...new Set(filteredData.map(d => d.year))].sort((a, b) => a - b);
    const ensembleMembers = [...new Set(filteredData.map(d => d.ensemble))].sort((a, b) => a - b);

    // Create stats by year
    const yearlyStats = years.map(year => {
        const yearData = filteredData.filter(d => d.year === year);
        const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);

        return {
            year,
            date: new Date(year, 0, 1),
            formattedDate: `${year}`,
            mean: values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : null,
            min: values.length ? Math.min(...values) : null,
            max: values.length ? Math.max(...values) : null,
            values: yearData
        };
    });

    const xValueSelector = item => item.formattedDate || item.year.toString();

    // Prepare datasets for ensemble members (thin lines)
    const ensembleDatasets = ensembleMembers.map(member => {
        const color = getEnsembleColor(member);
        return {
            label: `Ensemble ${member}`,
            data: years.map(year => {
                const entry = filteredData.find(d => d.year === year && d.ensemble === member);
                return { 
                    x: xValueSelector({year, formattedDate: `${year}`}), 
                    y: entry ? entry.value : null 
                };
            }),
            borderColor: color,
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
            data: yearlyStats.map(stat => ({
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
            data: yearlyStats.map(stat => ({
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
            data: yearlyStats.map(stat => ({
                x: xValueSelector(stat),
                y: stat.min
            })),
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            spanGaps: true,
            fill: {
                target: '-1',
                above: 'rgba(54, 162, 235, 0.1)'
            },
            order: 2
        }
    ];

    // Combine ensemble members with statistics
    // Put ensemble members first so stats are drawn on top
    const datasets = [...ensembleDatasets, ...statDatasets];

    // Get base chart options
    const chartOptions = createChartOptions(
        getChartTitle(options),
        getYAxisLabel(options),
        false, // Not using time scale for ensemble charts
        'year',
        true  // This is an ensemble chart
    );

    // Add tooltip callback
    chartOptions.plugins.tooltip = {
        callbacks: {
            title: (tooltipItems) => {
                return `Year: ${tooltipItems[0].label}`;
            },
            label: (tooltipItem) => {
                let value = tooltipItem.parsed.y.toFixed(2);
                // Add color indicators for SPI values
                if (options && options.varType && options.varType.startsWith('SPI')) {
                    if (value > 2) value += " | Extremely Wet"; // Extremely wet
                    else if (value > 1) value += " | Moderately Wet"; // Moderately wet
                    else if (value < -2) value += " | Extremely Dry"; // Extremely dry
                    else if (value < -1) value += " | Moderately Dry"; // Moderately dry
                }
                return `${tooltipItem.dataset.label}: ${value}`;
            }
        },
        bodyFont: { size: 14 },
        titleFont: { size: 16, weight: 'bold' }
    };

    // Create the background plugin
    const backgroundPlugin = createBackgroundPlugin(options);

    // Create the chart
    chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: chartOptions,
        plugins: [backgroundPlugin]
    });
};