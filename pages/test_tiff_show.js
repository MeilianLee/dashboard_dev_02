import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);

const GeoJSON = dynamic(
    () => import("react-leaflet").then((mod) => mod.GeoJSON),
    { ssr: false }
);

const GeoRasterLayer = dynamic(
    () =>
        import("georaster-layer-for-leaflet").then((mod) => mod.GeoRasterLayer),
    { ssr: false }
);

const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    {
        ssr: false,
        loading: () => <p>Loading map...</p>
    }
);

// 动态导入 GeoTIFFLayer 避免 SSR 问题
const TestGeoTIFFLayer = dynamic(
    () =>
        import("../components/TestGeoTIFFLayer").then(
            (mod) => mod.TestGeoTIFFLayer
        ),
    { ssr: false }
);

export default function TimeSeriesTiffPage() {
    const [selectedDate, setSelectedDate] = useState("1950"); // 默认日期
    const [tiffUrl, setTiffUrl] = useState(
        // "/data/SPI1_yearly_0.250deg_1950_2016_Myanmar.tif"
        "SPI1_Yearly_Vietnam_2016.tif"
    ); // 初始 GeoTIFF 文件路径

    // 监听 selectedDate 变化，动态加载对应的 GeoTIFF 文件
    useEffect(() => {
        setTiffUrl(`/data/tiff_${selectedDate}.tif`);
    }, [selectedDate]);

    return (
        <div className="dashboard">
            <div className="sidebar">
                <h2>Time Series TIFF Viewer</h2>
                <label>
                    Select Date:
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    >
                        {Array.from({ length: 67 }, (_, i) => 1950 + i).map(
                            (year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            )
                        )}
                    </select>
                </label>
            </div>

            {/* 地图组件 */}
            <div className="map-container">
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: "100vh", width: "100%" }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <TestGeoTIFFLayer tiffUrl={tiffUrl} />
                </MapContainer>
            </div>
        </div>
    );
}
