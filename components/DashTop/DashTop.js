import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { SectionContainer } from "@components/Section";
import { Nav } from "@components/Nav";
import { ButtonGroup, Button } from "@components/Button";
import { Icon } from "@iconify/react";

export const DashTop = ({
    options,
    updateOption,
    setSelectedYear,
    setSelectedMonth
}) => {
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const [selectedCurrent, setSelectedCurrent] = useState(false);

    const [selectedRegion, setSelectedRegion] = useState(options.region);
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    const handleCurrentClick = () => {
        if (options.overview === "forecast") {
            setSelectedYear("2025");
            setSelectedMonth("02");
            setSelectedCurrent(true);
        }
        if (options.overview === "hist") {
            updateOption("overview", "forecast");
            setSelectedYear("2025");
            setSelectedMonth("02");
            setSelectedCurrent(true);
        }
    };

    const handleOverviewClick = (type) => {
        setSelectedCurrent(false);
        updateOption("overview", type);
        if (options.overview === "forecast") {
            setSelectedYear("2025");
            setSelectedMonth("04");
        }
        if (options.overview === "hist") {
            setSelectedYear("2000");
            setSelectedMonth("01");
        }
    };

    // 当切换成forecast 模式时，自动设置日期数据
    useEffect(() => {
        // if (options.overview === "forecast" && setSelectedCurrent !== "true") {
        //     setSelectedYear("2025");
        //     setSelectedMonth("04");
        // }
        // if (options.overview === "forecast") {
        //     setSelectedYear("2025");
        //     setSelectedMonth("04");
        // }
        if (options.overview === "hist") {
            setSelectedYear("2000");
            setSelectedMonth("01");
        }
    }, [options.overview]);

    return (
        <div className="dash-top-container bg-white backdrop-filter backdrop-blur-md bg-opacity-50">
            <div className="dash-top-left">
                <div className="header-logo--container">
                    <Link href="/dashboard_page">
                        <Image
                            src="/rice_logo.png"
                            alt="logo"
                            className="h-14 w-auto"
                            height="60"
                            width="300"
                            priority
                        />
                    </Link>
                </div>
                {/* <div className="dash-top-logo">LOGO</div> */}
                <div className="dash-top-buttons">
                    <button
                        className={`dash-top-button ${
                            options.overview === "hist" && !selectedCurrent
                                ? "active"
                                : ""
                        }`}
                        onClick={() => handleOverviewClick("hist")}
                    >
                        Historical
                    </button>
                    <button
                        className={`dash-top-button current-button ${
                            selectedCurrent ? "active" : ""
                        }`}
                        onClick={handleCurrentClick}
                    >
                        Current
                    </button>
                    <button
                        className={`dash-top-button ${
                            options.overview === "forecast" && !selectedCurrent
                                ? "active"
                                : ""
                        }`}
                        onClick={() => handleOverviewClick("forecast")}
                    >
                        Forecast
                    </button>
                </div>
            </div>
            <div className="dash-top-left">
                <div className="dash-top-language">
                    <button
                        className="language-button"
                        onClick={() => setIsRegionOpen(!isRegionOpen)}
                    >
                        {selectedRegion} ▼
                    </button>
                    <div
                        className={`language-dropdown ${
                            isRegionOpen ? "open" : ""
                        }`}
                    >
                        {[
                            "Thailand",
                            "Cambodia",
                            "Laos",
                            "Myanmar",
                            "Vietnam",
                            "SEA"
                        ].map((region) => (
                            <div
                                key={region}
                                className={`language-option ${
                                    selectedRegion === region ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setSelectedRegion(region);
                                    updateOption("region", region);
                                    setIsRegionOpen(false);
                                }}
                            >
                                {region}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dash-top-language">
                    <button
                        className="language-button"
                        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    >
                        Language ▼
                    </button>
                    <div
                        className={`language-dropdown ${
                            isLanguageOpen ? "open" : ""
                        }`}
                    >
                        {["English", "Chinese", "Malay", "Thai"].map((lang) => (
                            <div
                                key={lang}
                                className={`language-option ${
                                    selectedLanguage === lang ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setSelectedLanguage(lang);
                                    setIsLanguageOpen(false);
                                }}
                            >
                                {lang}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
