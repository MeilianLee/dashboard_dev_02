import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import georaster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";

import { MapLegend } from "@components/MapLegend";
// Import the new color utilities
import { getColor, getColorConfig } from "@utils/colorUtils";

export default function DashMapTif({
    data,
    options,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    // Check if data is null, if so, set the default URL
    if (data === null) {
        data = {
            url: "/api/get_Yield_Yearly_Country_SEA",
            datatype: "geojson",
            data_vartype: "Yield",
            data_adminLevel: "Country"
        };
    }

    useEffect(() => {
        console.log("Received data in DashMapTif:", data);
        console.log("Selected date in DashMapTif:", selectedDate);
    }, [data, selectedDate]);

    // Updated styling function using the new color utilities
    const styleGeoJSON = (feature) => {
        const baseKey = `y${selectedDate}`;
        const value =
            feature.properties[`${baseKey}_0`] ??
            feature.properties[baseKey] ??
            -99999; // Try ensemble 0 value first, then non-ensemble value

        console.log("feature value:", { value });

        // Create a data options object for the color utility
        const colorOptions = {
            varType: data.data_vartype,
            adminLevel: data.data_adminLevel,
            dateType: data.data_dateType
        };

        return {
            fillColor: getColor(value, colorOptions),
            color: "#666", // Border color
            weight: 2, // Border width
            dashArray: "3",
            fillOpacity: 0.7 // Fill opacity
        };
    };

    const [countryBoundaries, setCountryBoundaries] = useState(null);

    // Only load country boundaries when adminLevel is "Grid"
    useEffect(() => {
        if (options.adminLevel !== "Grid") return;

        fetch("/data/SEA_boundary.geojson")
            .then((res) => res.json())
            .then((data) => setCountryBoundaries(data))
            .catch((error) =>
                console.error("Error loading country boundaries:", error)
            );

        console.log("fetched country boundaries:", { countryBoundaries });
    }, [options.adminLevel]);

    // Filter boundaries based on selected region
    const filteredBoundaries = countryBoundaries
        ? {
              ...countryBoundaries,
              features: countryBoundaries.features.filter(
                  (feature) =>
                      options.region === "SEA" ||
                      feature.properties.name === options.region
              )
          }
        : null;

    // Country boundary style
    const countryBoundaryStyle = (color) => ({
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0
    });

    return (
        <MapContainer
            key={`map-${data.url}`}
            center={[18, 85]}
            zoom={4.5}
            zoomSnap={0.1}
            zoomDelta={0.25}
            minZoom={4}
            maxZoom={10}
            maxBounds={[
                [-5, 55],
                [40, 125]
            ]}
            scrollWheelZoom={false}
            className="map-container"
        >
            <MapLegend data={data} selectedDate={selectedDate} />
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>;'
            />
            {options.adminLevel === "Grid" && filteredBoundaries && (
                <GeoJSON
                    data={filteredBoundaries}
                    style={countryBoundaryStyle("#333")}
                />
            )}
            {data.datatype === "geojson" && (
                <GeoJSONLayer
                    data_url={data}
                    options={options}
                    selectedDate={selectedDate}
                    selectedFeature={selectedFeature}
                    setSelectedProvince={setSelectedProvince}
                    setTimeSeries={setTimeSeries}
                    setSelectedFeature={setSelectedFeature}
                    style={styleGeoJSON}
                />
            )}
            {data.datatype === "geotiff" && (
                <GeoTIFFLayer 
                    data_url={data} 
                    selectedDate={selectedDate}
                    options={options} // Pass options to GeoTIFFLayer
                />
            )}
            <InfoControl />
        </MapContainer>
    );
}

// GeoJSON Layer Component - Updated to use new color utilities
function GeoJSONLayer({
    data_url,
    options,
    selectedDate,
    selectedFeature,
    setSelectedProvince,
    setTimeSeries,
    setSelectedFeature
}) {
    console.log("Received data URL in geojsonlayer:", data_url);
    const map = useMap();
    const infoRef = useRef(null);
    const highlightRef = useRef(null);
    const geoJsonLayerRef = useRef(null);

    // Remove bounding box
    const removeBoundingBox = () => {
        map.eachLayer((layer) => {
            if (layer instanceof L.Rectangle) {
                map.removeLayer(layer);
            }
        });
    };

    // Handle feature click
    const handleFeatureClick = (feature, layer) => {
        removeBoundingBox();
        setSelectedFeature(feature);

        layer.setStyle({
            color: "#EB5A3C", // Red border
            weight: 4,
            opacity: 1
        });

        // Ensure the layer is brought to the front
        if (layer.bringToFront && layer.bringToBack) {
            const isAtFront =
                map.hasLayer(layer) &&
                layer === map._layers[Object.keys(map._layers).pop()];
            if (isAtFront) {
                layer.bringToBack();
                layer.bringToFront();
            } else {
                layer.bringToFront();
            }
        }
    };

    // Generate time series data from feature properties
    const handleProvClickToGenerateTimeSeries = (feature) => {
        const { properties } = feature;
        setSelectedProvince(properties.name);

        const timeSeriesData = Object.keys(properties)
            .filter((key) => key.startsWith("y"))
            .map((key) => ({
                year: parseInt(key.replace("y", ""), 10),
                value: properties[key]
            }));

        setTimeSeries(timeSeriesData);
    };

    useEffect(() => {
        // Initialize info control
        const info = L.control({ position: "topright" });

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Country</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info;

        // Highlight style
        const highlightStyle = {
            weight: 3,
            color: "#ff0000",
            dashArray: "-",
            fillOpacity: 0.7
        };

        // Style function using the new color utilities
        const styleGeoJSON = (feature) => {
            const baseKey = `y${selectedDate}`;
            const value =
                feature.properties[`${baseKey}_0`] ??
                feature.properties[baseKey] ??
                0;

            // Create a data options object for the color utility
            const colorOptions = {
                varType: data_url.data_vartype,
                adminLevel: data_url.data_adminLevel,
                dateType: data_url.data_dateType
            };

            return {
                fillColor: getColor(value, colorOptions),
                color: "#666",
                weight: 2,
                dashArray: "3",
                fillOpacity: 0.7
            };
        };

        // Reset feature style
        const resetFeatureStyle = (layer, feature) => {
            layer.setStyle({
                color: "#666",
                weight: 2,
                dashArray: "3"
            });
        };

        // Fetch GeoJSON data
        fetch(data_url.url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Network response was not ok (${response.status})`
                    );
                }
                return response.json();
            })
            .then((data) => {
                if (!data || !data.features) {
                    throw new Error("Invalid GeoJSON data received");
                }
                console.log("Received GeoJSON data:", data);

                // Remove existing GeoJSON layer
                if (geoJsonLayerRef.current) {
                    map.removeLayer(geoJsonLayerRef.current);
                }

                const geojsonLayer = L.geoJSON(data, {
                    style: styleGeoJSON,
                    onEachFeature: function (feature, layer) {
                        // Get current feature value and name
                        const value =
                            feature.properties[`y${selectedDate}_0`] ??
                            feature.properties[`y${selectedDate}`] ??
                            0;
                        const name = feature.properties.name;

                        // Create color options for tooltips
                        const colorOptions = {
                            varType: data_url.data_vartype,
                            adminLevel: data_url.data_adminLevel,
                            dateType: data_url.data_dateType
                        };

                        // Bind tooltip
                        layer.bindTooltip(
                            `<b>${name}</b><br>${options.varType}: ${
                                value !== undefined ? value.toFixed(2) : "N/A"
                            }`,
                            { direction: "top", sticky: true }
                        );

                        // Default style
                        layer.setStyle({
                            fillColor: getColor(value, colorOptions),
                            color: "#666",
                            weight: 2,
                            fillOpacity: 0.7,
                            dashArray: "3"
                        });

                        // Hover highlight
                        layer.on("mouseover", () => {
                            layer.setStyle({
                                color: "#EB5A3C",
                                weight: 4
                            });
                        });

                        // Mouse out event
                        layer.on("mouseout", () => {
                            if (selectedFeature !== feature) {
                                layer.setStyle(styleGeoJSON(feature));
                            }
                        });

                        // Click event
                        layer.on("click", () => {
                            removeBoundingBox();
                            if (
                                selectedFeature &&
                                selectedFeature !== feature
                            ) {
                                resetFeatureStyle(layer, selectedFeature);
                            }
                            handleFeatureClick(feature, layer);
                            handleProvClickToGenerateTimeSeries(feature);
                        });
                        
                        // Update info control on mouseover
                        layer.on("mouseover", function (e) {
                            infoRef.current.update(
                                "<b>" +
                                    feature.properties.name +
                                    "</b><br>" +
                                    feature.properties.region
                            );

                            // Highlight the feature
                            layer.setStyle(highlightStyle);
                            highlightRef.current = layer;
                        });

                        // Reset info control on mouseout
                        layer.on("mouseout", function (e) {
                            if (infoRef.current) {
                                infoRef.current.update();
                            }

                            // Reset the feature style
                            if (highlightRef.current && selectedFeature !== feature) {
                                highlightRef.current.setStyle(
                                    styleGeoJSON(feature)
                                );
                                highlightRef.current = null;
                            }
                        });
                    }
                });
                console.log("geojsonLayer:", geojsonLayer);
                geojsonLayer.addTo(map);
                geoJsonLayerRef.current = geojsonLayer; // Store the new layer
            })
            .catch((error) => console.error("Error loading GeoJSON:", error));
    }, [map, selectedDate, data_url.url, options, selectedFeature, setSelectedFeature, setSelectedProvince, setTimeSeries]);

    return null;
}

// GeoTIFF Layer Component updated to use the new color utilities
function GeoTIFFLayer({ data_url, selectedDate, options }) {
    console.log("Received data URL in GeoTIFFLayer:", data_url);
    const map = useMap();
    
    // Create color options object for the getColor utility
    const colorOptions = {
        varType: data_url.data_vartype,
        adminLevel: data_url.data_adminLevel,
        dateType: data_url.data_dateType
    };

    useEffect(() => {
        const loadGeoTIFFData = async () => {
            try {
                const response = await fetch(data_url.url);
                const arrayBuffer = await response.arrayBuffer();
                const parsedRaster = await georaster(arrayBuffer);
                const bandIndex = Number(selectedDate - 1950);
                const layer = new GeoRasterLayer({
                    georaster: parsedRaster,
                    opacity: 0.7,
                    pixelValuesToColorFn: (values) => {
                        // Get the appropriate pixel value based on data type
                        const pixelValue =
                            data_url.data_vartype === "Yield" ||
                            data_url.data_vartype === "Area" ||
                            data_url.data_vartype === "Production" ||
                            data_url.data_vartype === "Prcp" ||
                            data_url.data_vartype === "Temp" ||
                            data_url.data_vartype.startsWith("SPI")
                                ? values[0]
                                : values[bandIndex];
                                
                        // Return null for invalid values to make them transparent
                        if (
                            pixelValue === 0 ||
                            pixelValue < -9999 ||
                            isNaN(pixelValue)
                        ) {
                            return null;
                        }
                        
                        // Use the new color utility
                        return getColor(pixelValue, colorOptions);
                    },
                    resolution: 64
                });

                layer.addTo(map);
            } catch (error) {
                console.error("Error loading GeoTIFF data:", error);
            }
        };

        loadGeoTIFFData();
    }, [map, data_url.url, selectedDate, colorOptions]); // Updated dependencies

    return null;
}

// Info Control Component
function InfoControl() {
    const map = useMap();
    const infoRef = useRef(null);

    useEffect(() => {
        const info = L.control();

        info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info");
            this.update();
            return this._div;
        };

        info.update = function (content) {
            // this._div.innerHTML = '<h4>Crop Area Data</h4>' + (content ? content : '');
        };

        info.addTo(map);
        infoRef.current = info;
    }, [map]);

    return null;
}
