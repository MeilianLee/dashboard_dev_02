import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";
import georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { AlertMarker } from "@components/AlertMarker";
import { getColor, getThresholds } from "@utils/colorUtils";

export const GeoTiffLayer = ({ 
    data_url, 
    selectedDate, 
    options,
    showWarnings 
}) => {
    const map = useMap();
    const rasterLayerRef = useRef(null);
    const [alerts, setAlerts] = useState([]);
    
    // Create color options object for the getColor utility
    const colorOptions = {
        varType: data_url.data_vartype,
        adminLevel: data_url.data_adminLevel,
        dateType: data_url.data_dateType
    };

    // Process raster data to find cells exceeding thresholds
    const processRasterAlerts = (parsedRaster, bandIndex) => {
        // Get thresholds based on current options
        const thresholds = getThresholds({
            varType: data_url.data_vartype,
            adminLevel: data_url.data_adminLevel,
            dateType: data_url.data_dateType,
            region: options.region
        });
        
        // If no thresholds defined, clear alerts and return
        if (!thresholds.high && !thresholds.low) {
            setAlerts([]);
            return;
        }
        
        // For GeoTIFF data, we'll sample the raster at regular intervals
        // to avoid overwhelming the map with alert markers
        const newAlerts = [];
        const width = parsedRaster.width;
        const height = parsedRaster.height;
        
        // Sample every Nth pixel in both dimensions
        // Adjust sampleRate based on your needs and performance considerations
        const sampleRate = Math.max(10, Math.floor(width / 20));
        
        // For each sampled pixel, check if it exceeds thresholds
        for (let y = 0; y < height; y += sampleRate) {
            for (let x = 0; x < width; x += sampleRate) {
                try {
                    // Get the value at this pixel
                    const value = parsedRaster.values[bandIndex][y][x];
                    
                    // Skip if the value is invalid or null
                    if (value === undefined || value === null || value < -9999 || isNaN(value)) {
                        continue;
                    }
                    
                    // Check if the value exceeds thresholds
                    if (value > thresholds.high || value < thresholds.low) {
                        // Convert pixel coordinates to geographic coordinates
                        const [longitude, latitude] = parsedRaster.pixelToLatLng(x, y);
                        
                        // Determine if this is a high or low alert
                        const isHigh = value > thresholds.high;
                        
                        // Add to alerts list
                        newAlerts.push({
                            position: [latitude, longitude],
                            type: isHigh ? 'high' : 'low',
                            message: isHigh 
                                ? `${thresholds.highMessage}: ${value.toFixed(2)}${thresholds.unit}` 
                                : `${thresholds.lowMessage}: ${value.toFixed(2)}${thresholds.unit}`,
                            name: `${options.varType} Alert`,
                            value: value
                        });
                    }
                } catch (e) {
                    console.warn('Error processing raster cell:', e);
                }
            }
        }
        
        // Limit the number of alerts to avoid performance issues
        const maxAlerts = 50;
        if (newAlerts.length > maxAlerts) {
            const step = Math.floor(newAlerts.length / maxAlerts);
            const sampledAlerts = [];
            for (let i = 0; i < newAlerts.length; i += step) {
                sampledAlerts.push(newAlerts[i]);
                if (sampledAlerts.length >= maxAlerts) break;
            }
            setAlerts(sampledAlerts);
        } else {
            setAlerts(newAlerts);
        }
    };

    useEffect(() => {
        const loadGeoTIFFData = async () => {
            try {
                // Remove existing layer if any
                if (rasterLayerRef.current) {
                    map.removeLayer(rasterLayerRef.current);
                    rasterLayerRef.current = null;
                }
                
                const response = await fetch(data_url.url);
                const arrayBuffer = await response.arrayBuffer();
                const parsedRaster = await georaster(arrayBuffer);
                
                // Determine which band to use
                const bandIndex = data_url.data_vartype.startsWith("SPI") || 
                                  data_url.data_vartype === "Yield" ||
                                  data_url.data_vartype === "Area" ||
                                  data_url.data_vartype === "Production" ||
                                  data_url.data_vartype === "Prcp" ||
                                  data_url.data_vartype === "Temp"
                    ? 0 // Use first band for these types
                    : Number(selectedDate - 1950); // Calculate band index for time series data
                
                // Process the raster for alerts
                processRasterAlerts(parsedRaster, bandIndex);
                
                // Create the raster layer
                const layer = new GeoRasterLayer({
                    georaster: parsedRaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: (values) => {
                        // Get the appropriate pixel value based on data type
                        const pixelValue = data_url.data_vartype === "Yield" ||
                                          data_url.data_vartype === "Area" ||
                                          data_url.data_vartype === "Production" ||
                                          data_url.data_vartype === "Prcp" ||
                                          data_url.data_vartype === "Temp" ||
                                          data_url.data_vartype.startsWith("SPI")
                            ? values[0]
                            : values[bandIndex];
                                
                        // Return null for invalid values to make them transparent
                        if (pixelValue === 0 ||
                            pixelValue < -9999 ||
                            isNaN(pixelValue)) {
                            return null;
                        }
                        
                        // Use the color utility
                        return getColor(pixelValue, colorOptions);
                    },
                    resolution: 64
                });

                // Add layer to map and store reference
                layer.addTo(map);
                rasterLayerRef.current = layer;
                
            } catch (error) {
                console.error("Error loading GeoTIFF data:", error);
            }
        };

        loadGeoTIFFData();
        
        // Cleanup on unmount
        return () => {
            if (rasterLayerRef.current) {
                map.removeLayer(rasterLayerRef.current);
            }
        };
    }, [map, data_url.url, selectedDate, data_url.data_vartype, colorOptions, options]);

    // Render alert markers if showWarnings is true
    return (
        <>
            {showWarnings && alerts.map((alert, index) => (
                <AlertMarker
                    key={`raster-alert-${index}`}
                    position={alert.position}
                    type={alert.type}
                    message={alert.message}
                    name={alert.name}
                />
            ))}
        </>
    );
};