import path from "path";
import fs from "fs";

export default function handler(req, res) {
    const {
        region = "SEA",
        varType = "Yield",
        adminLevel = "Country",
        dateType = "Yearly",
        overview = "hist",
        selectedDate = "2010"
    } = req.query;

    let fileName;
    const overviewDir = overview === "hist" ? "Hist" : "Forecast"; // 映射小写 -> 首字母大写

    // switch (overview) {
    //     case "forecast":
    //         switch (adminLevel) {
    //             case "Grid":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_${varType}_${selectedDate}.tif`;
    //                                 break;
    //                             case "Yield":
    //                                 fileName = `SEA_rice_yield.tif`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_precipitation_${selectedDate}.tif`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_temperature_${selectedDate}.tif`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     case "Monthly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_${varType}_${selectedDate}.tif`;
    //                                 break;
    //                             case "Yield":
    //                                 fileName = `SEA_rice_yield.tif`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_precipitation_${selectedDate}.tif`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_temperature_${selectedDate}.tif`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;
    //             case "Country":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `currently_no_data.json`;
    //                                 break;
    //                             case "Yield":
    //                                 fileName = `${region}_${selectedDate}.geojson`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_country_Precipitation_annual.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_country_Temperature_annual.geojson`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     case "Monthly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `currently_no_data.json`;
    //                                 break;
    //                             case "Yield":
    //                                 fileName = `${region}_country_2025_monthly.geojson`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_country_Precipitation_monthly.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_country_Temperature_monthly.geojson`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;
    //             case "Prov":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_${varType}_annual.geojson`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_Precipitation_annual.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_Temperature_annual.geojson`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     case "Monthly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_${varType}.geojson`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_Precipitation_monthly.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_Temperature_monthly.geojson`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;
    //         }
    //         break;
    //     case "hist":
    //         switch (adminLevel) {
    //             case "Grid":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case varType.startsWith("SPI") ? varType : null:
    //                                 fileName = `${region}_${varType}_${selectedDate}.tif`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_precipitation_${selectedDate}.tif`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_temperature_${selectedDate}.tif`;
    //                                 break;
    //                         }
    //                         break;
    //                     case "Monthly":
    //                         switch (varType) {
    //                             case varType.startsWith("SPI") ? varType : null:
    //                                 fileName = `${region}_${varType}_${selectedDate}.tif`;
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_precipitation_${selectedDate}.tif`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_temperature_${selectedDate}.tif`;
    //                                 break;
    //                         }

    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;

    //             case "Country":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case "Yield":
    //                                 switch (region) {
    //                                     case "SEA":
    //                                         fileName = `SEA_yield.geojson`;
    //                                         break;
    //                                     default:
    //                                         fileName = `${region}_yield_country.geojson`;
    //                                 }
    //                                 break;
    //                             case "Prcp":
    //                                 switch (region) {
    //                                     default:
    //                                         fileName = `${region}_country_Precipitation_annual.geojson`;
    //                                 }
    //                                 break;
    //                             case "Temp":
    //                                 switch (region) {
    //                                     default:
    //                                         fileName = `${region}_country_Temperature_annual.geojson`;
    //                                 }
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     case "Monthly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_prov_${varType}_hist_monthly.geojson`;
    //                                 break;

    //                             case "Yield":
    //                                 fileName = `${region}_monthly_yield_country.geojson`;

    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_country_Precipitation_monthly.geojson`;

    //                                 break;
    //                             case "Temp":
    //                                 switch (region) {
    //                                     case "SEA":
    //                                         fileName = `SEA_country_Temperature_monthly.geojson`;
    //                                         break;
    //                                     default:
    //                                         fileName = `${region}_country_Temperature_monthly.geojson`;
    //                                 }
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;

    //             case "Prov":
    //                 switch (dateType) {
    //                     case "Yearly":
    //                         switch (varType) {
    //                             case "Prcp":
    //                                 fileName = `${region}_Precipitation_annual.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_Temperature_annual.geojson`;
    //                                 break;
    //                             case "Yield":
    //                                 fileName = `${region}_yield_prov.geojson`;
    //                                 break;
    //                             case "SMPct":
    //                             case varType.startsWith("SPI") ? varType : null:
    //                                 fileName = `${region}_${varType}_${dateType}_${adminLevel}.json`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;

    //                     case "Monthly":
    //                         switch (varType) {
    //                             case "SPI1":
    //                             case "SPI3":
    //                             case "SPI6":
    //                             case "SPI12":
    //                                 fileName = `${region}_${varType}_hist_monthly.geojson`;
    //                                 break;
    //                             case "Yield":
    //                                 switch (region) {
    //                                     default:
    //                                         fileName = `${region}_monthly_yield_province.geojson`;
    //                                 }
    //                                 break;
    //                             case "Prcp":
    //                                 fileName = `${region}_Precipitation_monthly.geojson`;
    //                                 break;
    //                             case "Temp":
    //                                 fileName = `${region}_Temperature_monthly.geojson`;
    //                                 break;
    //                             default:
    //                                 fileName = `no_data.json`;
    //                         }
    //                         break;

    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;

    //             default:
    //                 fileName = `no_data.json`;
    //         }
    //         break;
    //     default:
    //         fileName = `no_data.json`;
    // }

    function getFileName(
        overview,
        adminLevel,
        dateType,
        varType,
        region,
        selectedDate
    ) {
        // 处理 SPI 变量
        if (varType.startsWith("SPI")) {
            if (overview === "hist") {
                if (adminLevel === "Grid") {
                    if (dateType === "Yearly") {
                        return `${region}_${varType}_${selectedDate}.tif`;
                        // return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`;
                    }
                    if (dateType === "Monthly") {
                        return `${region}_${varType}_${selectedDate}.tif`;
                        // return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`;
                    }
                }
                if (adminLevel === "Country") {
                    if (dateType === "Yearly") {
                        return `${region}_country_${varType}_hist_yearly.geojson`;
                    }
                    if (dateType === "Monthly") {
                        return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`;
                    }
                }
                if (adminLevel === "Prov") {
                    if (dateType === "Yearly") {
                        return `${region}_${varType}_${dateType}_${adminLevel}.json`;
                    }
                    if (dateType === "Monthly") {
                        return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`;
                    }
                }
            }
            if (overview === "forecast") {
                if (adminLevel === "Grid") {
                    if (dateType === "Yearly") {
                        return `${region}_${varType}_${selectedDate}_1.tif`;
                        // return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}_1.tif`;
                    }
                    if (dateType === "Monthly") {
                        return `${region}_${varType}_${selectedDate}_1.tif`;
                        // return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}_1.tif`;
                    }
                }
                if (adminLevel === "Country") {
                    if (dateType === "Yearly") {
                        return `${region}_country_${varType}_forecast_yearly.geojson`; // data is named wrongly, country_monthly and prov_monthly are inversed!
                    }
                    if (dateType === "Monthly") {
                        return `${region}_country_${varType}_forecast_monthly.geojson`;
                    }
                }
                if (adminLevel === "Prov") {
                    if (dateType === "Yearly") {
                        return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`; // OK
                    }
                    if (dateType === "Monthly") {
                        return `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`; //no data after Feb, strange
                    }
                }
            }
        }

        // map list from varType to fileName
        const fileMappings = {
            forecast_Grid_Yearly: {
                Yield: `${region}_yield_yearly_${selectedDate}.tif`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Prcp: `${region}_precipitation_${selectedDate}.tif`,
                Temp: `${region}_temperature_${selectedDate}.tif`
            },
            forecast_Grid_Monthly: {
                Yield: `${region}_yield_monthly_${selectedDate}.tif`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Prcp: `${region}_precipitation_${selectedDate}.tif`,
                Temp: `${region}_temperature_${selectedDate}.tif`
            },
            forecast_Country_Yearly: {
                Yield: `${region}_country_2025.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_country_Precipitation_annual.geojson`,
                Temp: `${region}_country_Temperature_annual.geojson`
            },
            forecast_Country_Monthly: {
                Yield: `${region}_country_2025_monthly.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_country_Precipitation_monthly.geojson`,
                Temp: `${region}_country_Temperature_monthly.geojson`
            },
            forecast_Prov_Yearly: {
                Yield: `${region}_prov_2025.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_Precipitation_annual.geojson`,
                Temp: `${region}_Temperature_annual.geojson`
            },
            forecast_Prov_Monthly: {
                Yield: `${region}_prov_2025_monthly.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_Precipitation_monthly.geojson`,
                Temp: `${region}_Temperature_monthly.geojson`
            },
            // -------------------- ERA5 BASED HIST DATA API -------------------- //
            hist_Grid_Yearly: {
                Yield: `${region}_yield_yearly_${selectedDate}.tif`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Prcp: `${region}_precipitation_${selectedDate}.tif`,
                Temp: `${region}_temperature_${selectedDate}.tif`
            },
            hist_Grid_Monthly: {
                Yield: `${region}_yield_monthly_${selectedDate}.tif`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
                Prcp: `${region}_precipitation_${selectedDate}.tif`,
                Temp: `${region}_temperature_${selectedDate}.tif`
            },
            hist_Country_Yearly: {
                Yield: `${region}_yield_country.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_country_Precipitation_annual.geojson`,
                Temp: `${region}_country_Temperature_annual.geojson`
            },
            hist_Country_Monthly: {
                Yield: `${region}_monthly_yield_country.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_country_Precipitation_monthly.geojson`,
                Temp: `${region}_country_Temperature_monthly.geojson`
            },
            hist_Prov_Yearly: {
                Yield: `${region}_yield_prov.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_Precipitation_annual.geojson`,
                Temp: `${region}_Temperature_annual.geojson`
            },
            hist_Prov_Monthly: {
                Yield: `${region}_monthly_yield_province.geojson`,
                Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
                Prcp: `${region}_precipitation_monthly.geojson`,
                Temp: `${region}_Temperature_monthly.geojson`
            }
            // -------------------- ERA5 BASED HIST DATA API -------------------- //

            //---------------------------BACKUP FOR HIST DATA -------------------------------//
            // hist_Grid_Yearly: {
            //     Yield: `${region}_yield_yearly_${selectedDate}.tif`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
            //     Prcp: `${region}_precipitation_${selectedDate}.tif`,
            //     Temp: `${region}_temperature_${selectedDate}.tif`
            // },
            // hist_Grid_Monthly: {
            //     Yield: `${region}_yield_monthly_${selectedDate}.tif`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}_${selectedDate}.tif`,
            //     Prcp: `${region}_precipitation_${selectedDate}.tif`,
            //     Temp: `${region}_temperature_${selectedDate}.tif`
            // },
            // hist_Country_Yearly: {
            //     Yield: `${region}_yield_country.geojson`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Prcp: `${region}_country_Precipitation_annual.geojson`,
            //     Temp: `${region}_country_Temperature_annual.geojson`
            // },
            // hist_Country_Monthly: {
            //     Yield: `${region}_monthly_yield_country.geojson`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Prcp: `${region}_country_Precipitation_monthly.geojson`,
            //     Temp: `${region}_country_Temperature_monthly.geojson`
            // },
            // hist_Prov_Yearly: {
            //     Yield: `${region}_yield_prov.geojson`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Prcp: `${region}_Precipitation_annual.geojson`,
            //     Temp: `${region}_Temperature_annual.geojson`
            // },
            // hist_Prov_Monthly: {
            //     Yield: `${region}_monthly_yield_province.geojson`,
            //     Area: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Production: `${overviewDir}_${adminLevel}_${dateType}_${varType}_${region}.geojson`,
            //     Prcp: `${region}_precipitation_monthly.geojson`,
            //     Temp: `${region}_Temperature_monthly.geojson`
            // }
            //---------------------------BACKUP FOR HIST DATA -------------------------------//
        };

        // 生成 key 并查询文件名
        const key = `${overview}_${adminLevel}_${dateType}`;
        return fileMappings[key]?.[varType] || `no_data.json`;
    }

    // 调用 getFileName 获取文件名
    fileName = getFileName(
        overview,
        adminLevel,
        dateType,
        varType,
        region,
        selectedDate
    );

    let directory;

    if (varType === "Prcp" && adminLevel === "Grid") {
        directory = "weatherGrid"; //Prcp raster forecast has its own directory
    } else if (varType === "Temp" && adminLevel === "Grid") {
        directory = "weatherGrid"; //Temp raster forecast has its own directory
    } else if (varType === "Yield" && adminLevel === "Grid") {
        directory = "yield_grid"; //Yield raster forecast has its own directory
    } else if (
        varType.startsWith("SPI") &&
        overview === "hist" &&
        (adminLevel === "Prov") | (adminLevel === "Country") &&
        dateType === "Monthly"
    ) {
        directory = path.join(varType, overviewDir, adminLevel, dateType);
    }

    // else if (
    //     varType.startsWith("SPI") &&
    //     adminLevel === "Grid" &&
    //     dateType === "Monthly"
    // ) {
    //     directory = path.join(varType, overviewDir, adminLevel, dateType);
    // } else if (
    //     varType.startsWith("SPI") &&
    //     adminLevel === "Grid" &&
    //     dateType === "Yearly"
    // ) {
    //     directory = path.join(varType, overviewDir, adminLevel, dateType);
    // }
    else if (varType.startsWith("SPI") && adminLevel === "Grid") {
        directory = "SPI_grid"; //SPI raster data has its own directory
    } else if (
        varType.startsWith("SPI") &&
        adminLevel === "Prov" &&
        overview === "forecast"
    ) {
        directory = path.join(varType, overviewDir, adminLevel, dateType); //SPI prov forecast has its own directory
        // directory = "SPI_prov_forecast"; //SPI prov forecast has its own directory
    } else if (varType.startsWith("SPI") && adminLevel !== "Grid") {
        directory = "SPI_json"; //SPI json has its own directory
    } else if (
        varType === "Yield" &&
        overview === "forecast" &&
        adminLevel !== "Grid"
    ) {
        directory = "yield_json_forecast"; //yield prov/country forecast has its own directory
    } else if (overview === "forecast" && varType === "Prcp") {
        directory = "Precipitation_forecast"; //prcp geojson forecast has its own directory
    } else if (overview === "forecast" && varType === "Temp") {
        directory = "Temperature_forecast"; //tempreture geojson forecast has its own directory
    } else if (varType === "Production") {
        directory = path.join(varType, overviewDir, adminLevel, dateType);
    } else if (varType === "Area") {
        directory = path.join(varType, overviewDir, adminLevel, dateType);
    }

    // New logic of detecting directory, modified on 20250324:

    // function getDirectory({ region, varType, adminLevel, dateType, overview, overviewDir }) {
    //     // Map special directory cases
    //     const specialDirectories = {
    //         // Weather Grid data
    //         'Prcp_Grid': 'weatherGrid',
    //         'Temp_Grid': 'weatherGrid',

    //         // Yield Grid data
    //         'Yield_Grid': 'yield_grid',

    //         // SPI Grid data
    //         'SPI1_Grid': 'SPI_grid',
    //         'SPI3_Grid': 'SPI_grid',
    //         'SPI6_Grid': 'SPI_grid',
    //         'SPI12_Grid': 'SPI_grid',

    //         // SPI JSON data (non-Grid)
    //         'SPI1_Country': 'SPI_json',
    //         'SPI3_Country': 'SPI_json',
    //         'SPI6_Country': 'SPI_json',
    //         'SPI12_Country': 'SPI_json',
    //         'SPI1_Prov': 'SPI_json',
    //         'SPI3_Prov': 'SPI_json',
    //         'SPI6_Prov': 'SPI_json',
    //         'SPI12_Prov': 'SPI_json',

    //         // SPI Provincial forecast data
    //         'SPI1_Prov_forecast': path.join('SPI1', 'Forecast', 'Prov', dateType),
    //         'SPI3_Prov_forecast': path.join('SPI3', 'Forecast', 'Prov', dateType),
    //         'SPI6_Prov_forecast': path.join('SPI6', 'Forecast', 'Prov', dateType),
    //         'SPI12_Prov_forecast': path.join('SPI12', 'Forecast', 'Prov', dateType),

    //         // SPI with Monthly data structure
    //         'SPI1_Prov_Monthly_hist': path.join('SPI1', 'Hist', 'Prov', 'Monthly'),
    //         'SPI3_Prov_Monthly_hist': path.join('SPI3', 'Hist', 'Prov', 'Monthly'),
    //         'SPI6_Prov_Monthly_hist': path.join('SPI6', 'Hist', 'Prov', 'Monthly'),
    //         'SPI12_Prov_Monthly_hist': path.join('SPI12', 'Hist', 'Prov', 'Monthly'),
    //         'SPI1_Country_Monthly_hist': path.join('SPI1', 'Hist', 'Country', 'Monthly'),
    //         'SPI3_Country_Monthly_hist': path.join('SPI3', 'Hist', 'Country', 'Monthly'),
    //         'SPI6_Country_Monthly_hist': path.join('SPI6', 'Hist', 'Country', 'Monthly'),
    //         'SPI12_Country_Monthly_hist': path.join('SPI12', 'Hist', 'Country', 'Monthly'),

    //         // Yield forecast data
    //         'Yield_forecast_nonGrid': 'yield_json_forecast',

    //         // Precipitation forecast data
    //         'Prcp_forecast': 'Precipitation_forecast',

    //         // Temperature forecast data
    //         'Temp_forecast': 'Temperature_forecast',

    //         // Production data
    //         'Production_Prov': path.join('Production', overviewDir, 'Prov', dateType),
    //         'Production_Country': path.join('Production', overviewDir, 'Country', dateType),

    //         // Area data
    //         'Area_Prov': path.join('Area', overviewDir, 'Prov', dateType),
    //         'Area_Country': path.join('Area', overviewDir, 'Country', dateType)
    //     };

    //     // Handle special cases for SPI variables with forecast data
    //     if (varType.startsWith('SPI') && adminLevel === 'Prov' && overview === 'forecast') {
    //         return specialDirectories[`${varType}_Prov_forecast`];
    //     }

    //     // Handle special cases for SPI variables with monthly historical data
    //     if (varType.startsWith('SPI') && dateType === 'Monthly' && overview === 'hist' &&
    //         (adminLevel === 'Prov' || adminLevel === 'Country')) {
    //         return specialDirectories[`${varType}_${adminLevel}_Monthly_hist`];
    //     }

    //     // Handle Yield forecast for non-Grid data
    //     if (varType === 'Yield' && overview === 'forecast' && adminLevel !== 'Grid') {
    //         return specialDirectories['Yield_forecast_nonGrid'];
    //     }

    //     // Handle generic SPI Grid data
    //     if (varType.startsWith('SPI') && adminLevel === 'Grid') {
    //         return specialDirectories[`${varType}_Grid`];
    //     }

    //     // Handle generic SPI JSON data (non-Grid)
    //     if (varType.startsWith('SPI') && adminLevel !== 'Grid') {
    //         return specialDirectories[`${varType}_${adminLevel}`];
    //     }

    //     // Handle weather Grid data
    //     if ((varType === 'Prcp' || varType === 'Temp') && adminLevel === 'Grid') {
    //         return specialDirectories[`${varType}_Grid`];
    //     }

    //     // Handle forecast data for Prcp and Temp
    //     if ((varType === 'Prcp' || varType === 'Temp') && overview === 'forecast') {
    //         return specialDirectories[`${varType}_forecast`];
    //     }

    //     // Handle Yield Grid data
    //     if (varType === 'Yield' && adminLevel === 'Grid') {
    //         return specialDirectories['Yield_Grid'];
    //     }

    //     // Handle Production and Area data
    //     if (varType === 'Production') {
    //         return specialDirectories[`Production_${adminLevel}`];
    //     }

    //     if (varType === 'Area') {
    //         return specialDirectories[`Area_${adminLevel}`];
    //     }

    //     // Default to a standardized path if no special case matches
    //     return null;
    // }

    // directory = getDirectory({ region, varType, adminLevel, dateType, overview, overviewDir })

    // **security check**：防止路径遍历攻击

    const safeFileName = path.basename(fileName); // 仅保留文件名
    // const safeDirectory = directory ? path.basename(directory) : ""; // 可选的目录

    // determine final data file path
    const basePath = path.join(process.cwd(), "data");

    // 组合路径：/data/{varType}/{overviewDir}/{adminLevel}/{dateType}/{fileName}
    // 当overview=“hist”时，对应目录名“Hist”；当overview=“forecast”时，对应目录名“Forecast”

    const filePath = directory
        ? path.join(basePath, directory, safeFileName) // `/data/dir1/data.json`
        : path.join(basePath, safeFileName); // `/data/data.json`

    // **security check**：ensure safe directory access
    if (!filePath.startsWith(basePath)) {
        return res.status(403).json({ error: "Forbidden access" });
    }

    // const filePath = path.join(process.cwd(), "data", fileName);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return res
            .status(400)
            .json({ error: `Data file not found: ${filePath}` });
    }

    // 读取文件内容

    if (adminLevel === "Grid") {
        try {
            // Serve the file as raw binary data
            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${path.basename(filePath)}"`
            );
            const stream = fs.createReadStream(filePath);
            stream.pipe(res); // Stream the raw binary file to the frontend
        } catch (error) {
            console.error("Error reading file:", error);
            res.status(500).json({ error: "Failed to serve the GeoTIFF file" });
        }
    } else {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Failed to read file" });
            }
            res.status(200).json(JSON.parse(data)); // 返回 JSON 数据
        });
    }
}
