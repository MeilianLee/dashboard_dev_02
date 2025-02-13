import SEO from "@components/SEO/SEO";
import { Timeline } from "@components/Timeline";
import { MapSection } from "@components/MapSection";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { SectionContainer } from "@components/Section";
import { BadgeMessage, BadgeGroup, BadgeIcon } from "@components/Badge";
import { PageTitle } from "@components/Title";
import {
    CardBody,
    CardGroup,
    CardHeader,
    CardImage,
    Card
} from "@components/Card";

import { Charts } from "@components/Charts"
import Script from "next/script";
import Head from "next/head";
import { Component } from "react";
import React, { useState, useEffect } from "react";

export default function Home() {
    const [spi, setSpi] = useState("0");
    const [lastUpdated, setLastUpdated] = useState("15/07/2024");
    const [currData, setCurrData] = useState([]); // State to hold the current data

    useEffect(() => {
        // Update card info based on currData
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setSpi(0.423);
        setLastUpdated(formattedDate);
    }, []); // Empty dependency array to run once on component mount
    return (
        <>
            <Header></Header>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </Head>
            <SEO title="RICE-MAP Dashboard" />
             {/* Load Leaflet first */}
             <Script
                src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
                strategy="beforeInteractive"
            />
            {/* <!-- Make sure you put this AFTER Leaflet's CSS --> */}
            <Script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></Script>
            
            <Script
                src="https://unpkg.com/georaster"
                strategy="beforeInteractive"
            />
            <Script
                src="https://unpkg.com/geotiff"
                strategy="beforeInteractive"
            />
            <Script
                src="https://unpkg.com/leaflet-geotiff/dist/leaflet-geotiff.min.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://unpkg.com/georaster-layer-for-leaflet"
                strategy="beforeInteractive"
            />
            <SectionContainer>
            <MapSection></MapSection>
            <Script
                src="/js/fetch_json.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SPI1_Yearly_thailand_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SPI3_Yearly_thailand_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SPI3_Yearly_vietnam_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SPI3_Yearly_laos_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SPI3_Yearly_cambodia_1950_2016.js"
                // strategy="afterInteractive"
            />

            <Script
                src="/js/dashboard_map_update.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/dashboard_timeline.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/map.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SMPct_Yearly_laos_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SMPct_Yearly_myanmar_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SMPct_Yearly_thailand_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SMPct_Yearly_vietnam_1950_2016.js"
                // strategy="afterInteractive"
            />
            <Script
                src="/js/prov_yearly/SMPct_Yearly_cam_1950_2016.js"
                // strategy="afterInteractive"
            />
            
            <SectionContainer className="key-info">
            <BadgeGroup alignment="center">
                <BadgeMessage>Information</BadgeMessage>
                <BadgeIcon icon="ph:info" />
            </BadgeGroup>
            <PageTitle
                className="text-center mx-auto"
                type="default"
            >
                Key Information Overview
            </PageTitle>
            <CardGroup className="flex flex-wrap justify-between mb-10">
                <Card className="w-[calc(22vw-10px)] min-w-[360px] mx-5 my-5 mt-0 p-5 bg-gray-100 flex flex-col items-center justify-center border border-gray-400 rounded-2xl">
                    <h3 className="mb-5">Precipitation</h3>
                    <span className="card_data block text-4xl font-bold my-8 bg-teal-500 text-white p-5 rounded-full cursor-pointer transition-shadow duration-300 hover:shadow-lg">
                        368mm
                    </span>
                    <p className="mt-5 text-sm">Information last updated on {lastUpdated}</p>
                </Card>
                <Card className="w-[calc(22vw-10px)] min-w-[360px] mx-5 my-5 mt-0 p-5 bg-gray-100 flex flex-col justify-between border border-gray-400 rounded-2xl">
                    <h3 className="mb-5">SPI</h3>
                    <span className="card_data block text-4xl font-bold my-8 bg-teal-500 text-white p-5 rounded-full cursor-pointer transition-shadow duration-300 hover:shadow-lg">
                        {spi}
                    </span>
                    <p className="mt-5 text-sm">Information last updated on {lastUpdated}</p>
                </Card>
                <Card className="w-[calc(22vw-10px)] min-w-[360px] mx-5 my-5 mt-0 p-5 bg-gray-100 flex flex-col justify-between border border-gray-400 rounded-2xl">
                    <h3 className="mb-5">Yield (100 g/ha)</h3>
                    <span className="card_data block text-4xl font-bold my-8 bg-teal-500 text-white p-5 rounded-full cursor-pointer transition-shadow duration-300 hover:shadow-lg">
                        9540
                    </span>
                    <p className="mt-5 text-sm">Information last updated on {lastUpdated}</p>
                </Card>

            </CardGroup>
            <div>
                <Charts/>
            </div>

            </SectionContainer>
            </SectionContainer>
            {/* <Footer /> */}
        </>
        
    );
}
