import React, { useState } from "react";

export const AdminLevelSelector = ({ options, updateOption }) => {
    const [isAdminLevelOpen, setIsAdminLevelOpen] = useState(true);

    return (
        <div className="variable-selector">
            <div className="variable-section">
                <button
                    className="section-title"
                    onClick={() => setIsAdminLevelOpen(!isAdminLevelOpen)}
                >
                    Administrative Level
                    <span
                        className={`toggle-icon ${
                            isAdminLevelOpen ? "open" : "closed"
                        }`}
                    >
                        ▼
                    </span>
                </button>
                {isAdminLevelOpen && (
                    <div className="admin-level-selector">
                        <button
                            className={`dateType-selector-button ${
                                options.adminLevel === "Country" ? "active" : ""
                            }`}
                            onClick={() =>
                                updateOption("adminLevel", "Country")
                            }
                        >
                            Country
                        </button>
                        <button
                            className={`dateType-selector-button ${
                                options.adminLevel === "Prov" ? "active" : ""
                            }`}
                            onClick={() => updateOption("adminLevel", "Prov")}
                        >
                            Province
                        </button>
                        <button
                            className={`dateType-selector-button ${
                                options.adminLevel === "Grid" ? "active" : ""
                            }`}
                            onClick={() => updateOption("adminLevel", "Grid")}
                        >
                            Grid
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
