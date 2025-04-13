import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const D3TimeSeriesChart = ({ data, options }) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const containerRef = useRef(null);

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

    const processData = (rawData) => {
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
            // Process ensemble data - extract statistics
            transformedData = processEnsembleData(rawData);
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
        setFilteredData(transformedData);
        setDataReady(true);
    };

    // Process ensemble data to extract statistics
    const processEnsembleData = (rawData) => {
        const years = [...new Set(rawData.map(d => d.year))].sort((a, b) => a - b);
        const ensembleMembers = [...new Set(rawData.map(d => d.ensemble))].sort((a, b) => a - b);
        
        // Create dataset with ensemble members and statistics
        const result = [];
        
        // First, add all ensemble members
        ensembleMembers.forEach(member => {
            years.forEach(year => {
                const entry = rawData.find(d => d.year === year && d.ensemble === member);
                if (entry) {
                    result.push({
                        ...entry,
                        date: new Date(year, 0, 1),
                        formattedDate: `${year}`,
                        type: 'ensemble'
                    });
                }
            });
        });
        
        // Then calculate and add statistics
        years.forEach(year => {
            const yearData = rawData.filter(d => d.year === year);
            const values = yearData.map(d => d.value).filter(v => v !== null && v !== undefined);
            
            if (values.length > 0) {
                result.push({
                    year,
                    date: new Date(year, 0, 1),
                    formattedDate: `${year}`,
                    value: values.reduce((sum, val) => sum + val, 0) / values.length,
                    type: 'mean'
                });
                
                result.push({
                    year,
                    date: new Date(year, 0, 1),
                    formattedDate: `${year}`,
                    value: Math.min(...values),
                    type: 'min'
                });
                
                result.push({
                    year,
                    date: new Date(year, 0, 1),
                    formattedDate: `${year}`,
                    value: Math.max(...values),
                    type: 'max'
                });
            }
        });
        
        return result;
    };

    // Process historical data from GeoJSON properties
    const processHistoricalData = (rawData) => {
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
        
        // Set the initial year range based on available data
        const years = [...new Set(timeSeriesData.map(d => d.year))].sort((a, b) => a - b);
        if (years.length > 0) {
            setStartYear(years[0]);
            setEndYear(years[years.length - 1]);
        }
        
        setProcessedData(timeSeriesData);
        setFilteredData(timeSeriesData);
        setDataReady(true);
    };

    // Format date string from year and month
    const formatDateString = (year, month) => {
        if (!month) return `${year}`;
        
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        return `${monthNames[month-1]} ${year}`;
    };

    // Filter data when range changes
    useEffect(() => {
        if (!processedData || processedData.length === 0 || !startYear || !endYear) return;

        // Filter data based on selected year range
        const newFilteredData = processedData.filter(item => {
            return item.year >= startYear && item.year <= endYear;
        });

        setFilteredData(newFilteredData);
    }, [startYear, endYear, processedData]);

    // Create or update chart when filtered data changes
    useEffect(() => {
        if (!dataReady || !svgRef.current || filteredData.length === 0) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll("*").remove();
        
        // Render the chart based on chart type
        if (chartType === "ensemble") {
            renderEnsembleChart();
        } else {
            renderTimeSeriesChart();
        }
    }, [filteredData, dataReady]);

    // Handle year range selection change
    const handleYearRangeChange = () => {
        if (!startYear || !endYear) return;

        // Filter data based on selected year range
        const newFilteredData = processedData.filter(item => {
            return item.year >= startYear && item.year <= endYear;
        });

        setFilteredData(newFilteredData);
    };

    // Render the time series chart using D3
    const renderTimeSeriesChart = () => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const container = d3.select(containerRef.current);
        
        // Get container dimensions
        const containerWidth = containerRef.current.clientWidth;
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        // Create SVG with margin convention
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);
           
        const chart = svg.append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Determine if we need a time scale
        const useTimeScale = chartType === "timeSeries";
        
        // Create x-scale
        const x = useTimeScale
            ? d3.scaleTime()
                .domain(d3.extent(filteredData, d => d.date))
                .range([0, width])
                .nice()
            : d3.scaleBand()
                .domain(filteredData.map(d => d.formattedDate || d.year.toString()))
                .range([0, width])
                .paddingInner(0.1);
        
        // Create y-scale
        const y = d3.scaleLinear()
            .domain([
                d3.min(filteredData, d => d.value) * 0.9,
                d3.max(filteredData, d => d.value) * 1.1
            ])
            .range([height, 0])
            .nice();
        
        // Add background zones for SPI data
        if (options?.varType?.startsWith('SPI')) {
            // Extremely wet zone (> 2): green
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(2))
                .attr("width", width)
                .attr("height", y(-Infinity) - y(2)) // From y=2 to the top
                .attr("fill", "rgba(0, 200, 0, 0.1)");
                
            // Moderately wet zone (1-2): light green
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(1))
                .attr("width", width)
                .attr("height", y(2) - y(1))
                .attr("fill", "rgba(144, 238, 144, 0.1)");
                
            // Moderately dry zone (-1 to -2): light red
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(-1))
                .attr("width", width)
                .attr("height", y(-2) - y(-1))
                .attr("fill", "rgba(255, 192, 192, 0.1)");
                
            // Extremely dry zone (< -2): red
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(-2))
                .attr("width", width)
                .attr("height", y(Infinity) - y(-2)) // From y=-2 to the bottom
                .attr("fill", "rgba(255, 0, 0, 0.1)");
        }
        
        // Add x-axis
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(useTimeScale 
                ? d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))
                : d3.axisBottom(x)
            )
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");
        
        // Add x-axis label
        chart.append("text")
            .attr("transform", `translate(${width/2}, ${height + 50})`)
            .style("text-anchor", "middle")
            .text("Date");
        
        // Add y-axis
        chart.append("g")
            .call(d3.axisLeft(y));
        
        // Add y-axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -(height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(getYAxisLabel(options));
        
        // Add chart title
        svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text(getChartTitle(options));
        
        // Create line generator
        const line = d3.line()
            .x(d => useTimeScale ? x(d.date) : x(d.formattedDate || d.year.toString()) + x.bandwidth() / 2)
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);
        
        // Add the line
        chart.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "rgba(75, 192, 192, 1)")
            .attr("stroke-width", 3)
            .attr("d", line);
        
        // Add data points
        chart.selectAll(".dot")
            .data(filteredData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => useTimeScale ? x(d.date) : x(d.formattedDate || d.year.toString()) + x.bandwidth() / 2)
            .attr("cy", d => y(d.value))
            .attr("r", 5)
            .attr("fill", "rgba(75, 192, 192, 1)")
            .on("mouseover", function(event, d) {
                // Tooltip content
                let tooltipContent = `
                    <strong>${d.formattedDate || d.year}</strong><br>
                    Value: ${d.value.toFixed(2)}
                `;
                
                // Add color indicators for SPI values
                if (options && options.varType && options.varType.startsWith('SPI')) {
                    if (d.value > 2) tooltipContent += " 🟢"; // Extremely wet
                    else if (d.value > 1) tooltipContent += " 🟩"; // Moderately wet
                    else if (d.value < -2) tooltipContent += " 🔴"; // Extremely dry
                    else if (d.value < -1) tooltipContent += " 🟥"; // Moderately dry
                }
                
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px")
                    .html(tooltipContent)
                    .transition().duration(200)
                    .style("opacity", 0.9);
                    
                d3.select(this)
                    .attr("r", 8)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500)
                    .style("opacity", 0);
                    
                d3.select(this)
                    .attr("r", 5)
                    .attr("stroke", "none");
            });
            
        // Check if data has upper/lower bounds
        if (filteredData.some(d => d.hasOwnProperty('upper_bound') && d.hasOwnProperty('lower_bound'))) {
            // Create area generator for confidence interval
            const area = d3.area()
                .x(d => useTimeScale ? x(d.date) : x(d.formattedDate || d.year.toString()) + x.bandwidth() / 2)
                .y0(d => y(d.lower_bound))
                .y1(d => y(d.upper_bound))
                .curve(d3.curveMonotoneX);
                
            // Add confidence interval area
            chart.append("path")
                .datum(filteredData)
                .attr("fill", "rgba(75, 192, 192, 0.1)")
                .attr("d", area);
                
            // Add upper bound line
            const upperLine = d3.line()
                .x(d => useTimeScale ? x(d.date) : x(d.formattedDate || d.year.toString()) + x.bandwidth() / 2)
                .y(d => y(d.upper_bound))
                .curve(d3.curveMonotoneX);
                
            chart.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "rgba(75, 192, 192, 0.5)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5")
                .attr("d", upperLine);
                
            // Add lower bound line
            const lowerLine = d3.line()
                .x(d => useTimeScale ? x(d.date) : x(d.formattedDate || d.year.toString()) + x.bandwidth() / 2)
                .y(d => y(d.lower_bound))
                .curve(d3.curveMonotoneX);
                
            chart.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "rgba(75, 192, 192, 0.5)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5")
                .attr("d", lowerLine);
        }
    };

    // Render the ensemble chart using D3
    const renderEnsembleChart = () => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const container = d3.select(containerRef.current);
        
        // Get container dimensions
        const containerWidth = containerRef.current.clientWidth;
        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        // Create SVG with margin convention
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);
           
        const chart = svg.append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Get unique years and ensemble types
        const years = [...new Set(filteredData.map(d => d.year))].sort((a, b) => a - b);
        const types = [...new Set(filteredData.map(d => d.type || 'ensemble'))];
        
        // X scale (using band scale for uniform spacing)
        const x = d3.scaleBand()
            .domain(years.map(y => y.toString()))
            .range([0, width])
            .paddingInner(0.1);
        
        // Y scale
        const y = d3.scaleLinear()
            .domain([
                d3.min(filteredData, d => d.value) * 0.9,
                d3.max(filteredData, d => d.value) * 1.1
            ])
            .range([height, 0])
            .nice();
        
        // Add background zones for SPI data
        if (options?.varType?.startsWith('SPI')) {
            // Extremely wet zone (> 2): green
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(0))
                .attr("width", width)
                .attr("height", y(2) - y(Infinity)) // From y=2 to the top
                .attr("fill", "rgba(20, 113, 61, 0.3)");
                
            // Moderately wet zone (1-2): light green
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(2))
                .attr("width", width)
                .attr("height", y(1) - y(2))
                .attr("fill", "rgba(152, 251, 152, 0.3)");
                
            // Moderately dry zone (-1 to -2): light red
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(-1))
                .attr("width", width)
                .attr("height", y(-2) - y(-1))
                .attr("fill", "rgba(255, 60, 60, 0.3)");
                
            // Extremely dry zone (< -2): red
            chart.append("rect")
                .attr("x", 0)
                .attr("y", y(-2))
                .attr("width", width)
                .attr("height", y(Infinity) - y(-2)) // From y=-2 to the bottom
                .attr("fill", "rgba(255, 0, 0, 0.3)");
        }
        
        // Add x-axis
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
                .style("text-anchor", "middle");
        
        // Add x-axis label
        chart.append("text")
            .attr("transform", `translate(${width/2}, ${height + 40})`)
            .style("text-anchor", "middle")
            .text("Date");
        
        // Add y-axis
        chart.append("g")
            .call(d3.axisLeft(y));
        
        // Add y-axis label
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -(height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(getYAxisLabel(options));
        
        // Add chart title
        svg.append("text")
            .attr("x", (width + margin.left + margin.right) / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text(getChartTitle(options));
        
        // Generate an array of colors for ensemble members
        const ensembleColorScale = d => {
            // const hue = (d.ensemble * 137) % 360; // Golden ratio to spread colors
            const hue = 200 % 360; // Golden ratio to spread colors
            return `hsla(${hue}, 70%, 70%, 0.5)`;
        };
        
        // Color mapping for stat lines
        const statColors = {
            mean: "rgba(75, 192, 192, 1)",
            min: "rgba(54, 162, 235, 1)",
            max: "rgba(255, 99, 132, 1)"
        };
        
        // First, add all ensemble lines (thinner, lighter)
        const ensembleData = filteredData.filter(d => !d.type || d.type === 'ensemble');
        const ensemblesByMember = d3.group(ensembleData, d => d.ensemble);
        
        ensemblesByMember.forEach((points, member) => {
            // Sort points by year
            points.sort((a, b) => a.year - b.year);
            
            // Create line generator for this ensemble
            const ensembleLine = d3.line()
                .x(d => x(d.year.toString()) + x.bandwidth() / 2)
                .y(d => y(d.value))
                .curve(d3.curveMonotoneX);
            
            // Add the ensemble line
            chart.append("path")
                .datum(points)
                .attr("fill", "none")
                .attr("stroke", ensembleColorScale(points[0]))
                .attr("stroke-width", 1)
                .attr("d", ensembleLine);
        });
        
        // Then, add stat lines (thicker, more prominent)
        ['mean', 'min', 'max'].forEach(statType => {
            const statData = filteredData.filter(d => d.type === statType);
            
            // Sort by year
            statData.sort((a, b) => a.year - b.year);
            
            if (statData.length > 0) {
                // Create line generator
                const statLine = d3.line()
                    .x(d => x(d.year.toString()) + x.bandwidth() / 2)
                    .y(d => y(d.value))
                    .curve(d3.curveMonotoneX);
                
                // Add the stat line
                chart.append("path")
                    .datum(statData)
                    .attr("fill", "none")
                    .attr("stroke", statColors[statType])
                    .attr("stroke-width", statType === 'mean' ? 3 : 2)
                    .attr("d", statLine);
                
                // Add data points for the stat line
                chart.selectAll(`.dot-${statType}`)
                    .data(statData)
                    // .enter().append("circle")
                    .attr("class", `dot-${statType}`)
                    .attr("cx", d => x(d.year.toString()) + x.bandwidth() / 2)
                    .attr("cy", d => y(d.value))
                    .attr("r", statType === 'mean' ? 5 : 3)
                    .attr("fill", statColors[statType])
                    .on("mouseover", function(event, d) {
                        // Tooltip content with statistic type
                        let tooltipContent = `
                            <strong>${d.year}</strong><br>
                            ${statType.charAt(0).toUpperCase() + statType.slice(1)}: ${d.value.toFixed(2)}
                        `;
                        
                        // Add color indicators for SPI values
                        if (options && options.varType && options.varType.startsWith('SPI')) {
                            if (d.value > 2) tooltipContent += " 🟢"; // Extremely wet
                            else if (d.value > 1) tooltipContent += " 🟩"; // Moderately wet
                            else if (d.value < -2) tooltipContent += " 🔴"; // Extremely dry
                            else if (d.value < -1) tooltipContent += " 🟥"; // Moderately dry
                        }
                        
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 20) + "px")
                            .html(tooltipContent)
                            .transition().duration(200)
                            .style("opacity", 0.9);
                            
                        d3.select(this)
                            .attr("r", statType === 'mean' ? 8 : 5)
                            .attr("stroke", "#000")
                            .attr("stroke-width", 1);
                    })
                    .on("mouseout", function() {
                        tooltip.transition().duration(500)
                            .style("opacity", 0);
                            
                        d3.select(this)
                            .attr("r", statType === 'mean' ? 5 : 3)
                            .attr("stroke", "none");
                    });
            }
        });
        
        // Create legend for statistics (no ensemble members in legend)
        const legendData = [
            { type: 'mean', label: 'Mean', color: statColors.mean },
            { type: 'max', label: 'Max', color: statColors.max },
            { type: 'min', label: 'Min', color: statColors.min }
        ];
        
        const legend = chart.append("g")
            .attr("transform", `translate(${width - 120}, 0)`);
            
        legendData.forEach((d, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);
                
            // Add line instead of box
            legendRow.append("line")
                .attr("x1", 0)
                .attr("y1", 10)
                .attr("x2", 40)
                .attr("y2", 10)
                .style("stroke", d.color)
                .style("stroke-width", d.type === 'mean' ? 3 : 2);
                
            // Add legend text
            legendRow.append("text")
                .attr("x", 50)
                .attr("y", 10)
                .attr("dy", ".35em")
                .style("font-size", "12px")
                .text(d.label);
        });
    };

    // Get appropriate chart title based on options
    const getChartTitle = (options) => {
        let title = "";

        if (options && options.varType) {
            if (options.varType.startsWith("SPI")) {
                title = `Standardized Precipitation Index (${options.varType.slice(3)} month${options.varType.slice(3) > 1 ? "s" : ""})`;
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
    const getYAxisLabel = (options) => {
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

    // Get year options for select dropdown
    const getYearOptions = () => {
        if (!processedData || processedData.length === 0) return [];
        return [...new Set(processedData.map(d => d.year))].sort((a, b) => a - b);
    };

    // Export chart data as CSV
    const downloadCSV = () => {
        if (!filteredData || filteredData.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        // Check if we have ensemble data
        const hasEnsembleMembers = filteredData.some(d => d.ensemble);

        if (hasEnsembleMembers) {
            // Ensemble data format
            const years = [...new Set(filteredData.map(d => d.year))].sort((a, b) => a - b);
            const ensembleMembers = [...new Set(filteredData.filter(d => d.ensemble).map(d => d.ensemble))].sort((a, b) => a - b);

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
            const statTypes = ['mean', 'min', 'max'];
            statTypes.forEach(statType => {
                csvContent += `${statType.charAt(0).toUpperCase() + statType.slice(1)},`;
                years.forEach(year => {
                    const entry = filteredData.find(d => d.year === year && d.type === statType);
                    csvContent += `${entry && entry.value !== undefined ? entry.value : ""},`;
                });
                csvContent += "\r\n";
            });
        } else if (filteredData.some(d => d.month)) {
            // Time series data format
            csvContent += "Date,Year,Month,Value\r\n";
            filteredData.forEach(item => {
                csvContent += `${item.formattedDate || formatDateString(item.year, item.month)},${item.year},${item.month || ""},${item.value !== undefined ? item.value : ""}\r\n`;
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

    // Download chart as SVG image
    const downloadSVG = () => {
        if (!svgRef.current) return;
        
        // Get the SVG element
        const svgElement = svgRef.current;
        
        // Create a clone of the SVG to avoid modifying the displayed one
        const svgClone = svgElement.cloneNode(true);
        
        // Get the SVG as a string
        const svgString = new XMLSerializer().serializeToString(svgClone);
        
        // Create a data URL
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `chart_${startYear}-${endYear}.svg`;
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Download chart as PNG image
    const downloadPNG = () => {
        if (!svgRef.current) return;
        
        // Get the SVG element
        const svgElement = svgRef.current;
        
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const svgRect = svgElement.getBoundingClientRect();
        canvas.width = svgRect.width;
        canvas.height = svgRect.height;
        const ctx = canvas.getContext('2d');
        
        // Create a new image from the SVG
        const img = new Image();
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
        
        // When the image loads, draw it on the canvas and convert to PNG
        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Convert canvas to PNG data URL
            const pngUrl = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `chart_${startYear}-${endYear}.png`;
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Clean up
            document.body.removeChild(link);
        };
        
        // Set the image source to start loading
        img.src = svgData;
    };

    return (
        <div className="d3-chart-component">
            {/* Title area */}
            <div className="chart-header">
                <h2 className="chart-title">{getChartTitle(options)}</h2>
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
                                        {getYearOptions().map((year) => (
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
                                        {getYearOptions().map((year) => (
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
                                    <button onClick={downloadCSV}>
                                        CSV Data
                                    </button>
                                    <button onClick={downloadSVG}>
                                        SVG Image
                                    </button>
                                    <button onClick={downloadPNG}>
                                        PNG Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Chart container */}
            <div className="chart-container" ref={containerRef}>
                {data && data.length > 0 ? (
                    <>
                        <svg ref={svgRef}></svg>
                        <div 
                            ref={tooltipRef} 
                            className="d3-tooltip" 
                            style={{
                                opacity: 0,
                                position: 'absolute',
                                pointerEvents: 'none',
                                backgroundColor: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.2)',
                                fontSize: '14px'
                            }}
                        ></div>
                    </>
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

            <style jsx>{`
                .d3-chart-component {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                .chart-container {
                    position: relative;
                    height: 400px;
                    width: 100%;
                    margin: 20px 0;
                }
                .chart-header {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 10px;
                }
                .chart-title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .chart-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .year-range {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .year-select {
                    padding: 6px 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-left: 5px;
                }
                .update-button, .download-button {
                    padding: 8px 16px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .update-button:hover, .download-button:hover {
                    background-color: #45a049;
                }
                .download-dropdown {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    background-color: white;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 100;
                }
                .download-dropdown button {
                    display: block;
                    width: 100%;
                    text-align: left;
                    padding: 8px 16px;
                    border: none;
                    background: none;
                    cursor: pointer;
                }
                .download-dropdown button:hover {
                    background-color: #f1f1f1;
                }
                .chart-footer {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #eee;
                }
                .chart-footer h3 {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                .chart-footer ul {
                    padding-left: 20px;
                    margin-bottom: 10px;
                }
                .chart-footer li {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .chart-legend-item {
                    display: inline-block;
                    width: 40px;
                    height: 3px;
                    margin-right: 10px;
                }
                .chart-legend-item.mean {
                    background-color: rgba(75, 192, 192, 1);
                    height: 3px;
                }
                .chart-legend-item.max {
                    background-color: rgba(255, 99, 132, 1);
                    height: 2px;
                }
                .chart-legend-item.min {
                    background-color: rgba(54, 162, 235, 1);
                    height: 2px;
                }
                .chart-legend-item.ensemble {
                    background-color: rgba(200, 200, 200, 0.8);
                    height: 1px;
                }
                .ensemble-explainer {
                    font-size: 14px;
                    color: #666;
                    font-style: italic;
                }
                .no-data-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background-color: #f9fafb;
                    border-radius: 8px;
                    border: 1px dashed #d1d5db;
                }
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .loading-spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};