import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const MapComponent = ({ geoData, onProvinceSelect }) => {
    const handleFeatureClick = (e) => {
        const provinceName = e.target.feature.properties.name; // 假设 GeoJSON 属性包含省份名称
        onProvinceSelect(provinceName);
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            click: handleFeatureClick
        });
    };

    return (
        <MapContainer
            style={{ height: "500px", width: "100%" }}
            zoom={6}
            center={[35, 105]}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <GeoJSON data={geoData} onEachFeature={onEachFeature} />
        </MapContainer>
    );
};
