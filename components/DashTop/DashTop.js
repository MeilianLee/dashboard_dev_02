import React, { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { SectionContainer } from "@components/Section";
import { Nav } from "@components/Nav";
import { ButtonGroup, Button } from "@components/Button";
import { Icon } from "@iconify/react";

export const DashTop = ({ options, updateOption }) => {
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    return (
        <div className="dash-top-container bg-white backdrop-filter backdrop-blur-md bg-opacity-50">
            <div className="dash-top-left">
                <div className="header-logo--container">
                    <Link href="/dashboard_page">
                        <Image
                            src="/rice_logo.png"
                            alt="logo"
                            className="h-15 w-auto"
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
                            options.overview === "hist" ? "active" : ""
                        }`}
                        onClick={() => updateOption("overview", "hist")}
                    >
                        Historical
                    </button>
                    <button
                        className={`dash-top-button ${
                            options.overview === "forecast" ? "active" : ""
                        }`}
                        onClick={() => updateOption("overview", "forecast")}
                    >
                        Forecast
                    </button>
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
    );
};
