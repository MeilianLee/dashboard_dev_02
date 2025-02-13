import path from "path";
import fs from "fs";

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'data', 'SPI1_yearly_0.250deg_1950_2016_Myanmar.tif');
    console.log("Serving file from:", filePath);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
  
    try {
      // Serve the file as raw binary data
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res); // Stream the raw binary file to the frontend
    } catch (error) {
      console.error("Error reading file:", error);
      res.status(500).json({ error: "Failed to serve the GeoTIFF file" });
    }
  }