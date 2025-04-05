/**
 * Color utility functions for map visualizations
 */

// Function to get color based on value and variable type
export function getColor(value, options = {}) {
    const { varType, adminLevel, dateType } = options;

    // Handle invalid values
    if (
        value === undefined ||
        value === null ||
        value < -9999 ||
        isNaN(value)
    ) {
        return "#FFFFFF"; // Return white/transparent for no data
    }

    // SPI variables (drought indices)
    if (varType?.startsWith("SPI")) {
        return getSPIColor(value);
    }



    // Different color scales based on variable and admin level
    if (varType === "Yield") {
        return getYieldColor(value, adminLevel);
    } else if (varType === "Production") {
        return getProductionColor(value, adminLevel);
    } else if (varType === "Area") {
        return getAreaColor(value, adminLevel);
    } else if (varType === "Prcp") {
        return getPrecipitationColor(value, adminLevel, dateType);
    } else if (varType === "Temp") {
        return getTemperatureColor(value);
    } else if (varType === "smpct1") {
        return getSoilMoistureColor(value);
    } else if (varType === "yieldAnom") {
        return getYieldAnomColor(value);
    }

    // Default color - should not reach here if all variable types are handled
    return "#CCCCCC";
}

// Get SPI colors - standardized drought indices
function getSPIColor(value) {
    if (value > 2) return "#14713d"; // Extremely wet
    if (value > 1.5) return "#3cb371"; // Very wet
    if (value > 1) return "#98fb98"; // Moderately wet
    if (value >= -0.99) return "#EEE"; // Near normal
    if (value >= -1.49) return "#f5deb3"; // Moderately dry
    if (value >= -1.99) return "#d2691e"; // Severely dry
    return "#b22222"; // Extremely dry
}

// Get yield color based on admin level
function getYieldColor(value, adminLevel) {
    // Different scales for different admin levels
    const minVal = 1;
    const maxVal = adminLevel === "Country" ? 8 : 7;

    // Use HSL color interpolation from orange to green
    const minHue = 30;
    const maxHue = 120;

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue);

    return `hsl(${hue}, 100%, 40%)`;
}

// Get production color based on admin level
function getProductionColor(value, adminLevel) {
    let minVal = 0;
    let maxVal;

    if (adminLevel === "Country") {
        maxVal = 10000000;
    } else if (adminLevel === "Prov") {
        maxVal = 2000000;
    } else {
        maxVal = 10000;
    }

    const minHue = 30;
    const maxHue = 120;

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue);

    return `hsl(${hue}, 100%, 40%)`;
}

// Get area color based on admin level
function getAreaColor(value, adminLevel) {
    let minVal = 0;
    let maxVal;

    if (adminLevel === "Country") {
        maxVal = 10000000;
    } else if (adminLevel === "Prov") {
        maxVal = 500000;
    } else {
        maxVal = 10000;
    }

    const minHue = 30;
    const maxHue = 120;

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    let hue = minHue + ratio * (maxHue - minHue);

    return `hsl(${hue}, 100%, 40%)`;
}

// Get precipitation color based on admin level and date type
function getPrecipitationColor(value, adminLevel, dateType) {
    if (value <= 0) return "#FFFFFF";

    let minVal = 0;
    let maxVal;

    if (dateType === "Monthly") {
        maxVal = 500; // Monthly precipitation max
    } else {
        maxVal = adminLevel === "Grid" ? 1000 : 3000; // Annual precipitation max
    }

    // HSL color interpolation from blue to red
    const minHue = 200; // Blue
    const maxHue = 0; // Red

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    let hue = minHue - ratio * (minHue - maxHue);

    return `hsl(${hue}, 100%, 50%)`;
}

// Get temperature color
function getTemperatureColor(temp) {
    if (temp == null || temp === 0 || isNaN(temp)) {
        return "#333";
    }

    const colorStops = [
        { temp: 10, color: "#08306B" }, // Dark Blue - Cold
        { temp: 15, color: "#4292C6" }, // Light Blue - Cool
        { temp: 20, color: "#41AB5D" }, // Green - Mild
        { temp: 25, color: "#F7DC6F" }, // Yellow - Warm
        { temp: 30, color: "#E67E22" }, // Orange - Hot
        { temp: 35, color: "#C0392B" } // Red - Very hot
    ];

    // Find the right color range and interpolate
    for (let i = 0; i < colorStops.length - 1; i++) {
        const t1 = colorStops[i].temp;
        const t2 = colorStops[i + 1].temp;

        if (temp <= t1) return colorStops[i].color;
        if (temp <= t2) {
            const factor = (temp - t1) / (t2 - t1);
            return interpolateColor(
                colorStops[i].color,
                colorStops[i + 1].color,
                factor
            );
        }
    }

    return colorStops[colorStops.length - 1].color;
}

// Get soil moisture percentile color
function getSoilMoistureColor(value) {
    if (value <= 0) return "hsl(210, 10%, 100%)";

    const minVal = 0;
    const maxVal = 1;

    // const minSaturation = 10;
    // const maxSaturation = 100;
    // const minLightness = 90;
    // const maxLightness = 40;
    const minHue = 0
    const maxHue = 200

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));

    // let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    // let lightness = minLightness - ratio * (minLightness - maxLightness);
    let hue = minHue - ratio * (minHue - maxHue);


    return `hsl(${hue}, 100%, 50%)`;
}

// Get soil moisture percentile color
function getYieldAnomColor(value) {
    if (value <= 0) return "hsl(210, 10%, 100%)";

    const minVal = -1.5;
    const maxVal = 1.5;

    // const minSaturation = 10;
    // const maxSaturation = 100;
    // const minLightness = 90;
    // const maxLightness = 40;
    const minHue = 0
    const maxHue = 210

    let ratio = Math.min(1, (value - minVal) / (maxVal - minVal));

    // let saturation = minSaturation + ratio * (maxSaturation - minSaturation);
    // let lightness = minLightness - ratio * (minLightness - maxLightness);
    let hue = minHue - ratio * (minHue - maxHue);


    return `hsl(${hue}, 100%, 50%)`;
}

// Helper function to interpolate colors
function interpolateColor(color1, color2, factor) {
    if (factor > 1) factor = 1;
    if (factor < 0) factor = 0;

    // Parse hex colors
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Returns configuration for color legend based on variable type
 */
export function getColorConfig(options) {
    const { varType, adminLevel, dateType } = options;
    const config = {
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
            title: "Rice Area (ha)",
            grades: [0, 2500, 5000, 7500, 10000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        AreaProv: {
            title: "Rice Area (ha)",
            grades: [0, 125000, 250000, 375000, 500000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        AreaCountry: {
            title: "Rice Area (ha)",
            grades: [0, "2.5m", "5m", "7.5m", "10m"],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        Production: {
            title: "Production (ton)",
            grades: [0, 2500, 5000, 7500, 10000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        ProductionProv: {
            title: "Production (ton)",
            grades: [0, 500000, 1000000, 1500000, 2000000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        ProductionCountry: {
            title: "Production (ton)",
            grades: [0, 2500000, 5000000, 7500000, 100000000],
            colors: [
                "hsl(30, 100%, 40%)",
                "hsl(48, 100%, 40%)",
                "hsl(66, 100%, 40%)",
                "hsl(84, 100%, 40%)",
                "hsl(120, 100%, 40%)"
            ]
        },
        smpct1: {
            title: "Soil Moisture Percentile",
            grades: [0, 25, 50, 75, 100],
            colors: [
                "hsl(0, 100%, 50%)",
                "hsl(50, 100%, 50%)",
                "hsl(100, 100%, 50%)",
                "hsl(150, 100%, 50%)",
                "hsl(200, 100%, 50%)"
            ]
        },
        yieldAnom: {
            title: "Yield Anomaly",
            grades: [-1.5, -1, -0.5, 0, 0.5, 1.0, 1.5],
            colors: [
                "hsl(0, 100%, 50%)",
                "hsl(35, 100%, 50%)",
                "hsl(70, 100%, 50%)",
                "hsl(105, 100%, 50%)",
                "hsl(140, 100%, 50%)",
                "hsl(175, 100%, 50%)",
                "hsl(210, 100%, 50%)",
            ]
        }
    };

    return config;
}

/**
 * Get center coordinates for a GeoJSON feature
 */
export function getFeatureCenter(feature) {
    // Check if feature has a centroid property
    if (feature.properties?.centroid) {
        const [lon, lat] = feature.properties.centroid;
        return [lat, lon]; // Leaflet uses [lat, lon] format
    }

    // If no centroid is provided, calculate the center of the feature
    try {
        // For MultiPolygon or Polygon geometries
        if (feature.geometry.type === "MultiPolygon") {
            // Get the first polygon's first ring coordinates
            const coords = feature.geometry.coordinates[0][0];
            // Average all points to find the centroid (simplified approach)
            let lat = 0,
                lon = 0;
            coords.forEach((point) => {
                lon += point[0];
                lat += point[1];
            });
            return [lat / coords.length, lon / coords.length];
        } else if (feature.geometry.type === "Polygon") {
            // Get the first ring coordinates
            const coords = feature.geometry.coordinates[0];
            // Average all points to find the centroid (simplified approach)
            let lat = 0,
                lon = 0;
            coords.forEach((point) => {
                lon += point[0];
                lat += point[1];
            });
            return [lat / coords.length, lon / coords.length];
        }
        // For Point geometries
        else if (feature.geometry.type === "Point") {
            const [lon, lat] = feature.geometry.coordinates;
            return [lat, lon];
        }
    } catch (e) {
        console.error("Error calculating feature center:", e);
    }

    // Default fallback (should not reach here if GeoJSON is valid)
    return [0, 0];
}

/**
 * Threshold utility functions
 */

// Define threshold values for different variables
export function getThresholds(options) {
    const { varType, adminLevel, dateType, region } = options;

    // Default thresholds structure
    const defaultThresholds = {
        high: null,
        low: null,
        unit: "",
        highMessage: "",
        lowMessage: ""
    };

    // SPI variables (drought indices)
    if (varType?.startsWith("SPI")) {
        return {
            high: 1.99,
            low: -1.99,
            unit: "",
            highMessage: "Extremely wet conditions",
            lowMessage: "Severe drought conditions"
        };
    }

    // Precipitation thresholds
    if (varType === "Prcp") {
        if (dateType === "Monthly") {
            return {
                high: 700,
                low: -5,
                unit: "mm",
                highMessage: "High precipitation",
                lowMessage: "Low precipitation"
            };
        } else {
            return {
                high: 3000,
                low: 200,
                unit: "mm",
                highMessage: "Annual precipitation above normal range",
                lowMessage: "Annual precipitation below normal range"
            };
        }
    }

    // Temperature thresholds
    if (varType === "Temp") {
        return {
            high: 35,
            low: 5,
            unit: "°C",
            highMessage: "High temperature",
            lowMessage: "Low temperature"
        };
    }

    // // Yield thresholds
    // if (varType === "Yield") {
    //     if (adminLevel === "Country") {
    //         return {
    //             high: 50,
    //             low: -1,
    //             unit: "ton/ha",
    //             highMessage: "Yield significantly above average",
    //             lowMessage: "Yield significantly below average"
    //         };
    //     } else {
    //         return {
    //             high: 50,
    //             low: -1,
    //             unit: "ton/ha",
    //             highMessage: "Regional yield above average",
    //             lowMessage: "Regional yield below average"
    //         };
    //     }
    // }

    //   // Production thresholds
    //   if (varType === "Production") {
    //       if (adminLevel === "Country") {
    //           return {
    //               high: 8000000,
    //               low: 2000000,
    //               unit: "ton",
    //               highMessage: "Production significantly above average",
    //               lowMessage: "Production significantly below average"
    //           };
    //       } else if (adminLevel === "Prov") {
    //           return {
    //               high: 1500000,
    //               low: 300000,
    //               unit: "ton",
    //               highMessage: "Provincial production above average",
    //               lowMessage: "Provincial production below average"
    //           };
    //       } else {
    //           return {
    //               high: 8000,
    //               low: 1000,
    //               unit: "ton",
    //               highMessage: "Local production above average",
    //               lowMessage: "Local production below average"
    //           };
    //       }
    //   }

    //   // Area thresholds
    //   if (varType === "Area") {
    //       if (adminLevel === "Country") {
    //           return {
    //               high: 7500000,
    //               low: 2500000,
    //               unit: "ha",
    //               highMessage: "Rice area larger than typical",
    //               lowMessage: "Rice area smaller than typical"
    //           };
    //       } else if (adminLevel === "Prov") {
    //           return {
    //               high: 400000,
    //               low: 100000,
    //               unit: "ha",
    //               highMessage: "Provincial rice area larger than typical",
    //               lowMessage: "Provincial rice area smaller than typical"
    //           };
    //       } else {
    //           return {
    //               high: 7500,
    //               low: 2500,
    //               unit: "ha",
    //               highMessage: "Local rice area larger than typical",
    //               lowMessage: "Local rice area smaller than typical"
    //           };
    //       }
    //   }

    // Soil moisture thresholds
    if (varType === "smpct1") {
        return {
            high: 75,
            low: 25,
            unit: "%",
            highMessage: "High soil moisture",
            lowMessage: "Low soil moisture"
        };
    }

    // Soil moisture thresholds
    if (varType === "yieldAnom") {
        return {
            high: 1.49,
            low: -1.49,
            unit: "",
            highMessage: "High yield anomaly",
            lowMessage: "Low yield anomaly"
        };
    }

    // Return default thresholds if no specific ones are defined
    return defaultThresholds;
}
