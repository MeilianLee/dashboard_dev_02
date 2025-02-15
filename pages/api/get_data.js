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

    // Apply special case list to check options
    // // check different name rules, if like left thing, then use right thing as file path
    // const specialCases = {
    //     Yield_SEA: `yield_country.json`,
    //     Yield_SEA: `${region}_${varType}_${adminLevel}_${dateType}_${overview}_${selectedDate}.json`
    // };

    // // 选择文件路径逻辑
    // const fileKey = `${region}_${varType}_${adminLevel}_${dateType}_${overview}_${selectedDate}`;
    // const fileName =
    //     specialCases[fileKey] ||
    //     `${varType}_${dateType}_${region}_1950_2016.json`;

    let fileName;

    // switch (adminLevel) {
    //     case "Grid":
    //         switch (dateType) {
    //             case "Yearly":
    //                 break;
    //             case "Monthly":
    //                 break;
    //             default:
    //                 fileName = `no_data.json`;
    //         }
    //         break;
    //     case "Country":
    //         switch (dateType) {
    //             case "Yearly":
    //                 switch (true) {
    //                     case varType === "Yield" && region === "SEA":
    //                         fileName = `yield_country.json`;
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //         }

    //         break;
    //     case "Prov":
    //         switch (dateType) {
    //             case "Yearly":
    //                 switch (true) {
    //                     case varType === "Prcp":
    //                         fileName = `${region}_Precipitation_annual.geojson`;
    //                         break;
    //                     case varType === "Temp":
    //                         fileName = `${region}_Temperature_annual.geojson`;
    //                         break;
    //                     case varType === "Yield":
    //                         fileName = `${region}_yield.geojson`;
    //                         break;
    //                     case varType === "SMPct":
    //                         fileName = `${region}_${varType}_${dateType}_${adminLevel}.json`;
    //                         break;
    //                     case varType.startsWith("SPI"):
    //                         fileName = `${region}_${varType}_${dateType}_${adminLevel}.json`;
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;
    //             case "Monthly":
    //                 switch (varType) {
    //                     case "Prcp":
    //                         fileName = `${region}_Precipitation.geojson`;
    //                         break;
    //                     case "Temp":
    //                         fileName = `${region}_Temperature.geojson`;
    //                         break;
    //                     default:
    //                         fileName = `no_data.json`;
    //                 }
    //                 break;
    //         }
    //         break;
    //     default:
    //         fileName = `no_data.json`;
    // }

    switch (adminLevel) {
        case "Grid":
            switch (dateType) {
                case "Yearly":
                    fileName = "grid_yearly_data.json";
                    break;
                case "Monthly":
                    fileName = "grid_monthly_data.json";
                    break;
                default:
                    fileName = `no_data.json`;
            }
            break;

        case "Country":
            switch (dateType) {
                case "Yearly":
                    switch (true) {
                        case varType === "Yield" && region === "SEA":
                            fileName = `yield_country.json`;
                            break;
                        default:
                            fileName = `no_data.json`;
                    }
                    break;
                default:
                    fileName = `no_data.json`;
            }
            break;

        case "Prov":
            switch (dateType) {
                case "Yearly":
                    switch (varType) {
                        case "Prcp":
                            fileName = `${region}_Precipitation_annual.geojson`;
                            break;
                        case "Temp":
                            fileName = `${region}_Temperature_annual.geojson`;
                            break;
                        case "Yield":
                            fileName = `${region}_yield.geojson`;
                            break;
                        case "SMPct":
                        case varType.startsWith("SPI") ? varType : null:
                            fileName = `${region}_${varType}_${dateType}_${adminLevel}.json`;
                            break;
                        default:
                            fileName = `no_data.json`;
                    }
                    break;

                case "Monthly":
                    switch (varType) {
                        case "Prcp":
                            fileName = `${region}_Precipitation_monthly.geojson`;
                            break;
                        case "Temp":
                            fileName = `${region}_Temperature_monthly.geojson`;
                            break;
                        default:
                            fileName = `no_data.json`;
                    }
                    break;

                default:
                    fileName = `no_data.json`;
            }
            break;

        default:
            fileName = `no_data.json`;
    }

    let directory;

    if (varType === "Prcp" && adminLevel === "Grid") {
        directory = "Precipitation";
    }

    // **security check**：防止路径遍历攻击
    const safeFileName = path.basename(fileName); // 仅保留文件名
    const safeDirectory = directory ? path.basename(directory) : ""; // 可选的目录

    // determine final data file path
    const basePath = path.join(process.cwd(), "data");
    const filePath = directory
        ? path.join(basePath, safeDirectory, safeFileName) // `/data/dir1/data.json`
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
            .json({ error: `Data file not found: ${fileName}` });
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
