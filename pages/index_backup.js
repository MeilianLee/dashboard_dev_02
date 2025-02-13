import { BadgeMessage, BadgeGroup, BadgeIcon } from "@components/Badge";
import { SectionContainer } from "@components/Section";
import { PageTitle } from "@components/Title";
import { Layout } from "@components/Layout";
import { HomeBanner } from "@components/Banner";
import { Columns } from "@components/Columns";
import { ContentImage } from "@components/ContentImage";
import { Content } from "@components/Content";
import { Accordion } from "@components/Accordion";
import { MotionBTTContainer } from "@components/Motion";
import SEO from "@components/SEO/SEO";
import {
    CardBody,
    CardGroup,
    CardHeader,
    CardImage,
    Card
} from "@components/Card";

import { MapSection } from "@components/MapSection";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// const MapComponent = dynamic(
//     () => import("../components/MapSection/MapSection"),
//     {
//         ssr: false
//     }
// );

export default function Home() {
    return (
        <Layout className="">
            <SEO
                title="RICE-MAP: Rice Information & Climate Evaluation - Monitoring And Prediction 🚀"
                description="Explore RICE-MAP, your go-to tool for predicting and analyzing rice production trends in major rice-producing countries. 
                Stay informed with the latest data and insights to help you make informed decisions in agriculture and trade."
            />
            <div className="main-wrapper bg-[#F3F5F8] relative z-10 pb-20 pt-20 ">
                {/* { Page Banner } */}
                <HomeBanner />
                {/* Components Container */}
                <SectionContainer className="components--container wrap wrap-px grid gap-8 sm:gap-24">
                    {/* Features */}
                    <MotionBTTContainer
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <SectionContainer id="countries" className="countries">
                            <BadgeGroup alignment="center">
                                <BadgeMessage>Countries</BadgeMessage>
                            </BadgeGroup>
                            <PageTitle
                                className="text-center mx-auto"
                                type="default"
                            >
                                RICE-MAP in Key Countries
                            </PageTitle>
                            <Content className="text-center" alignment="center">
                                <p>
                                    Explore detailed forecasts of rice yield in
                                    key Southeast Asian countries. Our advanced
                                    models predict rice production trends,
                                    helping you understand the impact of climate
                                    patterns, extreme weather events, and
                                    agricultural practices on future yields.
                                    Stay informed and make data-driven decisions
                                    with our comprehensive insights into the
                                    rice-growing regions around Singapore.
                                </p>
                            </Content>
                            <ContentImage />
                        </SectionContainer>
                    </MotionBTTContainer>
                    {/* Card Container Tabs */}
                    <MotionBTTContainer
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <SectionContainer className="feature-tabs">
                            <BadgeGroup alignment="center">
                                <BadgeMessage>Weather</BadgeMessage>
                                <BadgeIcon icon="ph:cloud-rain" />
                            </BadgeGroup>
                            <PageTitle
                                className="text-center mx-auto"
                                type="default"
                            >
                                Navigate and Understand Climate Patterns
                            </PageTitle>
                            <Content className="text-center" alignment="center">
                                <p>
                                    Our dashboard empowers you to explore and
                                    comprehend the intricate weather patterns
                                    that influence crop yields. By visualizing
                                    key weather variables, you can gain insights
                                    into the conditions that impact rice
                                    production. Here's how each variable helps
                                    you understand the broader weather patterns:
                                </p>
                            </Content>
                            <CardGroup className="grid scroll-m-24 gap-8 grid-cols-1 max-w-4xl mx-auto mt-24 md:grid-cols-2">
                                <Card className="col-span-1 text-primary-900">
                                    <CardBody className="w-full bg-white-600/20 p-12">
                                        <div className="relative w-full h-60">
                                            <CardImage
                                                src="/layout.png"
                                                alt="Customizable Layouts image used."
                                                className="object-cover absolute inset-0 w-full h-full"
                                            />
                                        </div>
                                        <CardHeader className="!text-black !text-2xl !font-bold">
                                            Customizable Layouts
                                        </CardHeader>
                                        <p>
                                            Personalize your meal planning
                                            experience with our flexible
                                            layouts. Tailor your sections,
                                            categories, and tabs to suit your
                                            unique style and organization
                                            preferences. Our template adapts to
                                            your needs, providing a seamless and
                                            personalized planning experience.
                                        </p>
                                    </CardBody>
                                </Card>
                                <Card className="col-span-1 text-primary-900">
                                    <CardBody className="w-full bg-white-600/20 p-12">
                                        <div className="relative w-full h-60">
                                            <CardImage
                                                src="/early_warning.png"
                                                alt="Progress Tracking image used."
                                                className="object-cover absolute inset-0 w-full h-full"
                                            />
                                        </div>
                                        <CardHeader className="!text-black !text-2xl !font-bold">
                                            Early Warning
                                        </CardHeader>
                                        <p>
                                            Early warning systems for rice yield
                                            in Southeast Asia aim to anticipate
                                            potential disruptions in rice
                                            production by leveraging a range of
                                            data and technologies. These systems
                                            are designed to provide timely
                                            alerts to stakeholders, helping them
                                            to take proactive measures to
                                            mitigate risks and ensure food
                                            security.
                                        </p>
                                    </CardBody>
                                </Card>
                            </CardGroup>
                        </SectionContainer>
                    </MotionBTTContainer>
                    {/* Reivews */}
                    <MotionBTTContainer
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <SectionContainer id="features" className="benefits">
                            <BadgeGroup alignment="left">
                                <BadgeMessage>Features</BadgeMessage>
                                <BadgeIcon icon="twemoji:waving-hand" />
                            </BadgeGroup>
                            <PageTitle className="" type="default">
                                Dashboard
                            </PageTitle>
                            <MapSection />
                            <Columns />
                        </SectionContainer>
                    </MotionBTTContainer>
                    {/* Accordions */}
                    <MotionBTTContainer
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <SectionContainer id="faq" className="faq">
                            <BadgeGroup alignment="center">
                                <BadgeMessage>FAQ</BadgeMessage>
                            </BadgeGroup>
                            <PageTitle
                                className="text-center mx-auto"
                                type="default"
                            >
                                Got some burning questions about RICE-MAP?{" "}
                                <br></br>
                                <br></br>No worries! We&apos;ve got the answers
                                you need:
                            </PageTitle>
                            <Accordion />
                        </SectionContainer>
                    </MotionBTTContainer>
                </SectionContainer>
            </div>
        </Layout>
    );
}
