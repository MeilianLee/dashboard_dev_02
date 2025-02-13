// //
// import { useEffect, useRef } from "react";
// import Chart from "chart.js/auto";

// export const TimeSeriesChart = ({ data, province }) => {
//     const chartRef = useRef(null);

//     useEffect(() => {
//         if (!data || !province) return;

//         const ctx = chartRef.current.getContext("2d");
//         const chart = new Chart(ctx, {
//             type: "line",
//             data: {
//                 labels: data.map((item) => item.date), // 时间序列
//                 datasets: [
//                     {
//                         label: `Time Series for ${province}`,
//                         data: data.map((item) => item.value), // 数值序列
//                         borderColor: "blue",
//                         fill: false
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 scales: {
//                     x: { title: { display: true, text: "Date" } },
//                     y: { title: { display: true, text: "Value" } }
//                 }
//             }
//         });

//         return () => {
//             chart.destroy(); // 清理图表实例
//         };
//     }, [data, province]);

//     return <canvas ref={chartRef} style={{ width: "100%", height: "400px" }} />;
// };

// new attempt of plotting
import { useEffect, useRef } from "react";
import { Chart } from "chart.js";

export default function TimeSeriesChart({ data }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: data.map((item) => item.year),
                    datasets: [
                        {
                            label: "Value over Time",
                            data: data.map((item) => item.value),
                            borderColor: "rgba(75, 192, 192, 1)",
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Year"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Value"
                            }
                        }
                    }
                }
            });
        }

        return () => {
            // 清理Chart实例
            if (chartRef.current && chartRef.current.chart) {
                chartRef.current.chart.destroy();
            }
        };
    }, [data]);

    return <canvas ref={chartRef} />;
}
