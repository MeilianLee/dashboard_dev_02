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

    switch (adminLevel) {
        case "Grid":
            fileName = `precipitation_month_1.tif`;
            break;
        case "Country":
        case "Prov":
            switch (true) {
                case varType === "Yield":
                    fileName = `yield_country.json`;
                    break;
                case varType === "Prcp":
                    fileName = `precipitation_month_1.tif`;
                    break;
                case varType === "Temp":
                    fileName = `Temp_Asia.json`;
                    break;
                case varType.startsWith("SPI"):
                    fileName = `${region}_${varType}_${dateType}_${adminLevel}.json`;
                    break;
                default:
                    fileName = `${varType}_${dateType}_${region}_1950_2016xxxx.json`;
            }
    }

    const filePath = path.join(process.cwd(), "data", fileName);

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
