/**
 * Color Utilities for Rice Map Application
 * Centralized module for handling color schemes across different data types
 */

// Configuration for different data types
export const colorConfig = {
    // SPI (Standardized Precipitation Index)
    SPI: {
      title: "Drought Index",
      grades: [2, 1.5, 1, 0, -1, -1.5, -2],
      labels: ["W3", "W2", "W1", "D0", "D1", "D2", "D3"],
      colors: [
        "#14713d", // Extremely Wet
        "#3cb371", // Very Wet
        "#98fb98", // Moderately Wet
        "#EEE",    // Near Normal
        "#f5deb3", // Moderately Dry
        "#d2691e", // Severely Dry
        "#b22222"  // Extremely Dry
      ],
      legendTexts: {
        W3: "Extremely Wet",
        W2: "Severely Wet",
        W1: "Moderately Wet",
        D0: "Near Normal",
        D1: "Moderately Dry",
        D2: "Severely Dry",
        D3: "Extremely Dry"
      },
      tooltips: {
        W3: "Unusual flooding, excessive soil moisture, potential waterlogging.",
        W2: "High rainfall, increased runoff, risk of localized flooding.",
        W1: "Above-normal precipitation, beneficial for agriculture and water supply.",
        D0: "Typical climate conditions, no significant anomalies.",
        D1: "Some damage to crops, low streamflow, water shortages possible.",
        D2: "Severe Drought: Likely crop loss, water restrictions may be needed.",
        D3: "Extreme Drought: Major crop losses, widespread water shortages."
      }
    },
    
    // Precipitation
    Prcp: {
      title: "Precipitation (mm)",
      grades: [0, 200, 400, 600, 800, 1000],
      colors: ["#0033FF", "#0099FF", "#00FF99", "#FFFF00", "#FF3300"],
      minVal: 0,
      maxVal: 1000,
      minHue: 200,
      maxHue: 0
    },
    
    // Provincial Precipitation (Annual)
    PrcpProvYearly: {
      title: "Precipitation (mm)",
      grades: [0, 600, 1200, 1800, 2400, 3000],
      colors: ["hsl(200, 100%, 50%)", "hsl(150, 100%, 50%)", "hsl(100, 100%, 50%)", "hsl(50, 100%, 50%)", "hsl(0, 100%, 50%)"],
      minVal: 0,
      maxVal: 3000,
      minHue: 200,
      maxHue: 0
    },
    
    // Provincial Precipitation (Monthly)
    PrcpProvMonthly: {
      title: "Precipitation (mm)",
      grades: [0, 100, 200, 300, 400, 500],
      colors: ["hsl(200, 100%, 50%)", "hsl(150, 100%, 50%)", "hsl(100, 100%, 50%)", "hsl(50, 100%, 50%)", "hsl(0, 100%, 50%)"],
      minVal: 0,
      maxVal: 500,
      minHue: 200,
      maxHue: 0
    },
    
    // Temperature
    Temp: {
      title: "Temperature (℃)",
      grades: [10, 15, 20, 25, 30, 35],
      colors: ["#08306B", "#4292C6", "#41AB5D", "#F7DC6F", "#E67E22", "#C0392B"],
      colorStops: [
        { temp: 10, color: "#08306B" }, // Dark Blue - Unusually Cold
        { temp: 15, color: "#4292C6" }, // Light Blue - Cool
        { temp: 20, color: "#41AB5D" }, // Green - Moderate
        { temp: 25, color: "#F7DC6F" }, // Yellow - Warm
        { temp: 30, color: "#E67E22" }, // Orange - Hot
        { temp: 35, color: "#C0392B" }  // Red - Extreme Heat
      ]
    },
    
    // Rice Yield
    Yield: {
      title: "Yield (ton/ha)",
      grades: [1, 3, 5, 7],
      colors: ["hsl(30, 100%, 40%)", "hsl(60, 100%, 40%)", "hsl(90, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 1,
      maxVal: 7,
      minHue: 30,
      maxHue: 120
    },
    
    // Rice Area
    Area: {
      title: "Rice Area (ha)",
      grades: [0, 2500, 5000, 7500, 10000],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 10000,
      minHue: 30,
      maxHue: 120
    },
    
    // Provincial Rice Area
    AreaProv: {
      title: "Rice Area (ha)",
      grades: [0, 125000, 250000, 375000, 500000],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 500000,
      minHue: 30,
      maxHue: 120
    },
    
    // Country Rice Area
    AreaCountry: {
      title: "Rice Area (ha)",
      grades: [0, 2500000, 5000000, 7500000, 10000000],
      gradientLabels: [0, "2.5m", "5m", "7.5m", "10m"],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 10000000,
      minHue: 30,
      maxHue: 120
    },
    
    // Rice Production
    Production: {
      title: "Production (ton)",
      grades: [0, 2500, 5000, 7500, 10000],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 10000,
      minHue: 30,
      maxHue: 120
    },
    
    // Provincial Rice Production
    ProductionProv: {
      title: "Production (ton)",
      grades: [0, 500000, 1000000, 1500000, 2000000],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 2000000,
      minHue: 30,
      maxHue: 120
    },
    
    // Country Rice Production
    ProductionCountry: {
      title: "Production (ton)",
      grades: [0, 2500000, 5000000, 7500000, 10000000],
      colors: ["hsl(30, 100%, 40%)", "hsl(48, 100%, 40%)", "hsl(66, 100%, 40%)", "hsl(84, 100%, 40%)", "hsl(120, 100%, 40%)"],
      minVal: 0,
      maxVal: 10000000,
      minHue: 30,
      maxHue: 120
    },
    
    // Soil Moisture Percentage
    SMPct: {
      title: "Soil Moisture (%)",
      grades: [20, 40, 60, 80],
      minVal: 20,
      maxVal: 80,
      minSaturation: 10,
      maxSaturation: 100,
      minLightness: 90,
      maxLightness: 40
    }
  };
  
  /**
   * Get color configuration based on data type, admin level, and time interval
   * @param {Object} options - The data options
   * @returns {Object} Color configuration
   */
  export const getColorConfig = (options) => {
    const { varType, adminLevel, dateType } = options;
    
    // Handle SPI-type variables
    if (varType && varType.startsWith("SPI")) {
      return colorConfig.SPI;
    }
    
    // Handle Precipitation
    if (varType === "Prcp") {
      if (adminLevel === "Grid") {
        return colorConfig.Prcp;
      }
      if (dateType === "Yearly") {
        return colorConfig.PrcpProvYearly;
      }
      return colorConfig.PrcpProvMonthly;
    }
    
    // Handle Temperature
    if (varType === "Temp") {
      return colorConfig.Temp;
    }
    
    // Handle Rice Yield
    if (varType === "Yield") {
      return colorConfig.Yield;
    }
    
    // Handle Rice Area
    if (varType === "Area") {
      if (adminLevel === "Grid") {
        return colorConfig.Area;
      }
      if (adminLevel === "Prov") {
        return colorConfig.AreaProv;
      }
      return colorConfig.AreaCountry;
    }
    
    // Handle Rice Production
    if (varType === "Production") {
      if (adminLevel === "Grid") {
        return colorConfig.Production;
      }
      if (adminLevel === "Prov") {
        return colorConfig.ProductionProv;
      }
      return colorConfig.ProductionCountry;
    }
    
    // Handle Soil Moisture
    if (varType === "SMPct") {
      return colorConfig.SMPct;
    }
    
    // Default to Yield if no matching configuration
    return colorConfig.Yield;
  };
  
  /**
   * Generate color for SPI (Standardized Precipitation Index) values
   * @param {number} value - SPI value
   * @returns {string} CSS color
   */
  export const getSPIColor = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "#eee"; // Default color for no data
    }
    
    return value > 2
      ? "#14713d" // Dark Green - Extremely Wet
      : value > 1.5
        ? "#3cb371" // Medium Green - Very Wet
        : value > 1
          ? "#98fb98" // Light Green - Moderately Wet
          : value >= -0.99
            ? "#EEE" // White/Light Gray - Near Normal
            : value >= -1.49
              ? "#f5deb3" // Light Brown - Moderately Dry
              : value >= -1.99
                ? "#d2691e" // Medium Brown - Severely Dry
                : value >= -10
                  ? "#b22222" // Dark Red - Extremely Dry
                  : "#eee"; // Default for invalid values
  };
  
  /**
   * Generate color for precipitation values using HSL color scale
   * @param {number} value - Precipitation value
   * @param {Object} config - Color configuration
   * @returns {string} CSS color
   */
  export const getPrecipitationColor = (value, config) => {
    if (value <= 0 || value === null || value === undefined || isNaN(value)) {
      return "#FFFFFF"; // No precipitation
    }
    
    const { minVal, maxVal, minHue, maxHue } = config;
    
    // Normalize value to [0, 1] range and calculate interpolated hue
    const ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    const hue = minHue + ratio * (maxHue - minHue);
    
    return `hsl(${hue}, 100%, 50%)`;
  };
  
  /**
   * Generate color for temperature values
   * @param {number} temp - Temperature value
   * @returns {string} CSS color
   */
  export const getTemperatureColor = (temp) => {
    if (temp === null || temp === undefined || isNaN(temp) || temp === 0) {
      return "#333"; // Default gray for invalid values
    }
    
    const colorStops = colorConfig.Temp.colorStops;
    
    // Find the temperature range and interpolate color
    for (let i = 0; i < colorStops.length - 1; i++) {
      const t1 = colorStops[i].temp;
      const t2 = colorStops[i + 1].temp;
      
      if (temp <= t1) return colorStops[i].color;
      if (temp <= t2) {
        const factor = (temp - t1) / (t2 - t1);
        return interpolateColor(colorStops[i].color, colorStops[i + 1].color, factor);
      }
    }
    
    return colorStops[colorStops.length - 1].color; // For temperatures above the highest threshold
  };
  
  /**
   * Generate color for yield, area, and production values
   * @param {number} value - Data value
   * @param {Object} config - Color configuration
   * @returns {string} CSS color
   */
  export const getAgriculturalColor = (value, config) => {
    if (value <= 0 || value === null || value === undefined || isNaN(value)) {
      return "#FFFFFF"; // No data
    }
    
    const { minVal, maxVal, minHue, maxHue } = config;
    
    // Normalize value to [0, 1] range and calculate interpolated hue
    const ratio = Math.min(1, (value - minVal) / (maxVal - minVal));
    const hue = minHue + ratio * (maxHue - minHue);
    
    return `hsl(${hue}, 100%, 40%)`;
  };
  
  /**
   * Generate color for soil moisture values
   * @param {number} value - Soil moisture percentage
   * @returns {string} CSS color
   */
  export const getSoilMoistureColor = (value) => {
    if (value <= 0 || value === null || value === undefined || isNaN(value)) {
      return "hsl(210, 10%, 100%)"; // Lightest blue-gray
    }
    
    const config = colorConfig.SMPct;
    
    // Normalize value to [0, 1] range
    const ratio = Math.min(1, (value - config.minVal) / (config.maxVal - config.minVal));
    
    // Calculate HSL values
    const saturation = config.minSaturation + ratio * (config.maxSaturation - config.minSaturation);
    const lightness = config.minLightness - ratio * (config.minLightness - config.maxLightness);
    
    return `hsl(210, ${saturation}%, ${lightness}%)`;
  };
  
  /**
   * Get color for a value based on data type and configuration
   * @param {number} value - Data value
   * @param {Object} options - Data options
   * @returns {string} CSS color
   */
  export const getColor = (value, options) => {
    const config = getColorConfig(options);
    
    if (options.varType && options.varType.startsWith("SPI")) {
      return getSPIColor(value);
    }
    
    if (options.varType === "Prcp") {
      return getPrecipitationColor(value, config);
    }
    
    if (options.varType === "Temp") {
      return getTemperatureColor(value);
    }
    
    if (options.varType === "SMPct") {
      return getSoilMoistureColor(value);
    }
    
    // For Yield, Area, and Production
    return getAgriculturalColor(value, config);
  };
  
  /**
   * Interpolate between two colors
   * @param {string} color1 - Starting color (hex)
   * @param {string} color2 - Ending color (hex)
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {string} Interpolated color
   */
  export const interpolateColor = (color1, color2, factor) => {
    if (factor > 1) factor = 1;
    if (factor < 0) factor = 0;
    
    // Handle both hex and rgb formats
    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  /**
   * Parse color string to RGB components
   * @param {string} color - Color string (hex or rgb)
   * @returns {Object} RGB components
   */
  const parseColor = (color) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const bigint = parseInt(hex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
    
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      return {
        r: parseInt(match[0]),
        g: parseInt(match[1]),
        b: parseInt(match[2])
      };
    }
    
    return { r: 0, g: 0, b: 0 };
  };