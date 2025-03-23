// import Script from "next/script";
// import React from "react";

// export const Timeline = () => {
//     return <></>;
// };
// "use client";

"use client";

import React, { useState, useMemo } from "react";

export const Timeline = ({
    initialYear = "2024",
    initialMonth = "01",
    dateType = "Monthly",
    viewLength = 5
}) => {
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);

    const selectedDate = useMemo(() => {
        return dateType === "Monthly"
            ? `${selectedYear}${selectedMonth}`
            : selectedYear;
    }, [selectedYear, selectedMonth, dateType]);

    const timelineDates = useMemo(() => {
        const dates = [];
        const startIndex = -viewLength;
        const endIndex = viewLength;

        for (let i = startIndex; i <= endIndex; i++) {
            if (dateType === "Monthly") {
                const date = new Date(
                    parseInt(selectedYear),
                    parseInt(selectedMonth) - 1 + i
                );
                dates.push(
                    `${date.getFullYear()}${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`
                );
            } else {
                dates.push(`${parseInt(selectedYear) + i}`);
            }
        }

        return dates;
    }, [selectedDate, dateType, viewLength]);

    const handleDateSelect = (date) => {
        if (dateType === "Monthly") {
            setSelectedYear(date.slice(0, 4));
            setSelectedMonth(date.slice(4, 6));
        } else {
            setSelectedYear(date);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <div className="flex items-center justify-center w-full">
                <div className="relative w-full h-1 bg-gray-300">
                    {timelineDates.map((date, index) => (
                        <div
                            key={date}
                            className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer 
                ${
                    date === selectedDate
                        ? "w-6 h-6 bg-blue-500"
                        : "w-4 h-4 bg-gray-400 hover:bg-blue-300"
                } 
                rounded-full`}
                            style={{
                                left: `${
                                    ((index + 0.5) / timelineDates.length) * 100
                                }%`
                            }}
                            onClick={() => handleDateSelect(date)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex space-x-2">
                {timelineDates.map((date) => (
                    <button
                        key={date}
                        className={`px-2 py-1 rounded ${
                            date === selectedDate
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => handleDateSelect(date)}
                    >
                        {dateType === "Monthly"
                            ? `${date.slice(0, 4)}-${date.slice(4, 6)}`
                            : date}
                    </button>
                ))}
            </div>

            <div>
                <p>
                    Selected Date:{" "}
                    {dateType === "Monthly"
                        ? `${selectedYear}-${selectedMonth}`
                        : selectedYear}
                </p>
            </div>
        </div>
    );
};
