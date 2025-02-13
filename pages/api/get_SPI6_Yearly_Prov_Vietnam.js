import path from "path";
import fs from "fs";

export default function handler(req, res) {
    const filePath = path.join(
        process.cwd(),
        "data",
        "SPI6_yearly_Vietnam_prov_1950_2016.json"
    ); // 修改为你的文件路径
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read file" });
        }
        res.status(200).json(JSON.parse(data)); // 返回 JSON 数据
    });
}
