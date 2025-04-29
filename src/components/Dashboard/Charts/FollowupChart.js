"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function FollowUpChart({ tab, dataArr, totalCount }) {
  const [chartKey, setChartKey] = useState(0);

  const isEmptyData = dataArr.every((val) => val === 0);

  // Example data
  const data = {
    // labels: ["Total Completed", "Total Missed", "Total Pending"],
    labels: isEmptyData
      ? ["No Data"] // Placeholder label
      : ["Total Completed", "Total Missed", "Total Pending"],
    datasets: [
      {
        data: isEmptyData ? [100] : dataArr,
        backgroundColor: isEmptyData
          ? ["#d3d3d3"]
          : ["#1bd81b", "#f02626", "#ffb62e"], // Fixed property
        borderWidth: 0,
        spacing: isEmptyData ? 1 : 10,
        borderRadius: 10,
        clip: false,
      },
    ],
  };

  const options = {
    cutout: "90%",
    layout: {
      padding: 15,
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // --- SHADOW PLUGIN ---
  const shadowArcPlugin = {
    id: "shadowArcPlugin",
    beforeDatasetDraw(chart, args, pluginOptions) {
      const { ctx, chartArea, config } = chart;
      const dataset = config.data.datasets[0];

      ctx.save();

      dataset.backgroundColor.forEach((color, index) => {
        const meta = chart.getDatasetMeta(0);
        const arc = meta.data[index];
        if (!arc) return;

        ctx.shadowColor = color + "AD"; // Adjust opacity dynamically
        ctx.shadowBlur = pluginOptions?.shadowBlur || 15;
        ctx.shadowOffsetX = pluginOptions?.shadowOffsetX || 0;
        ctx.shadowOffsetY = pluginOptions?.shadowOffsetY || 4;

        arc.draw(ctx);
      });

      ctx.restore();
    },
  };

  // --- CENTER TEXT PLUGIN ---
  // const centerTextPlugin = {
  //   id: "centerText",
  //   beforeDraw: (chart) => {
  //     const {
  //       ctx,
  //       chartArea: { top, bottom, left, right, width, height },
  //     } = chart;
  //     const total = chart.config.data.datasets[0].data.reduce(
  //       (acc, val) => acc + val,
  //       0
  //     );

  //     ctx.save();
  //     ctx.fillStyle = "#000";
  //     ctx.textAlign = "center";

  //     // Main number
  //     ctx.font = "600 42px Inter";
  //     ctx.fillText(660, left + width / 2, top + height / 2);

  //     // Subtitle lines
  //     ctx.font = "600 16px Inter";
  //     ctx.fillText("Total Follow ups", left + width / 2, top + height / 2 + 30);

  //     ctx.font = "12px Inter";
  //     ctx.fillStyle = "#7A7A7A";
  //     ctx.fillText(
  //       `${tab === "left" ? "Today" : "This Week"}`,
  //       left + width / 2,
  //       top + height / 2 + 50
  //     );

  //     ctx.restore();
  //   },
  // };

  const centerTextPlugin = useMemo(
    () => ({
      id: "centerText",
      beforeDraw: (chart) => {
        const {
          ctx,
          chartArea: { top, bottom, left, right, width, height },
        } = chart;
        const total = chart.config.data.datasets[0].data.reduce(
          (acc, val) => acc + val,
          0
        );

        ctx.save();
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        // Main number
        ctx.font = "600 42px Inter";
        ctx.fillText(
          // `${tab === "left" ? 30 : 250}`,
          totalCount,
          left + width / 2,
          top + height / 2
        );

        // Subtitle lines
        ctx.font = "600 16px Inter";
        ctx.fillText(
          "Total Follow ups",
          left + width / 2,
          top + height / 2 + 30
        );

        ctx.font = "12px Inter";
        ctx.fillStyle = "#7A7A7A";
        ctx.fillText(
          `${tab === "left" ? "Today" : "This Week"}`,
          left + width / 2,
          top + height / 2 + 50
        );

        ctx.restore();
      },
    }),
    [tab, dataArr] // Recompute the plugin whenever `tab` changes
  );

  useEffect(() => {
    setChartKey((prevKey) => prevKey + 0.1);
  }, [tab]);

  return (
    <div style={{ width: 300, height: 300 }}>
      <Doughnut
        key={chartKey}
        data={data}
        options={options}
        plugins={[
          centerTextPlugin,
          {
            ...shadowArcPlugin,
            pluginOptions: { shadowBlur: 20 }, // Customizable
          },
        ]}
      />
    </div>
  );
}
