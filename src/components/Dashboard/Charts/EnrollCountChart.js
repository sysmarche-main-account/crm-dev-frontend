"use client";
import React, { useState, useMemo, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useDispatch } from "react-redux";
import { setReporting, setStage } from "@/lib/slices/dashboardSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EnrolledCountChart = ({ data }) => {
  const dispatch = useDispatch();

  const chartRef = useRef();
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(0);

  // Extract names and counts from incoming data
  const { counselor_enroll_counts = [] } = data;

  const counsellors = useMemo(
    () =>
      counselor_enroll_counts.map(
        ({ first_name, last_name }) => `${first_name} ${last_name}`
      ),
    [counselor_enroll_counts]
  );

  const enrolledCounts = useMemo(
    () => counselor_enroll_counts.map(({ enroll_count }) => enroll_count),
    [counselor_enroll_counts]
  );

  const totalPages = Math.ceil(counsellors.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentCounsellors = counsellors.slice(startIndex, endIndex);
  const currentEnrolled = enrolledCounts.slice(startIndex, endIndex);

  const graphData = {
    labels: currentCounsellors,
    datasets: [
      {
        label: "Enrolled count by counsellor",
        data: currentEnrolled,
        backgroundColor: "rgba(255, 193, 7, 0.4)",
        borderColor: "rgba(255, 193, 7, 0.4)",
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
        hoverBackgroundColor: "#FFC107",
        hoverBorderColor: "#FFC107",
        barThickness: 34,
      },
    ],
  };

  const wrapLabel = (label, maxCharsPerLine = 15) => {
    const words = label.split(" ");
    const lines = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (currentLine.length + word.length + 1 > maxCharsPerLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine += " " + word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 24,
        // bottom: 10,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => items[0].chart.data.labels[items[0].dataIndex],
          label: (ctx) => `${ctx?.parsed?.y > 0 ? ctx?.parsed?.y : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          callback: function (_, idx) {
            const label = this.getLabelForValue(idx);
            // return label.length > 20 ? label.slice(0, 17) + "..." : label;
            // return label.length > 15 ? label.slice(0, 12) + "..." : label;
            return wrapLabel(label, 15);
          },
        },
        barPercentage: 0.2,
        categoryPercentage: 0.8,
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...currentEnrolled) * 1.2, // dynamic padding
        ticks: { display: false },
        grid: {
          borderDash: [2, 2],
          lineWidth: 1,
          drawBorder: false,
          tickLength: 0,
        },
      },
    },
  };

  const valueOnTopPlugin = {
    id: "valueOnTopPlugin",
    afterDatasetsDraw(chart) {
      const {
        ctx,
        data,
        chartArea: { top },
        scales: { x, y },
      } = chart;

      ctx.save();

      chart.getDatasetMeta(0).data.forEach((bar, index) => {
        const value = data.datasets[0].data[index];

        if (value > 0) {
          ctx.fillStyle = "#000";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(value, bar.x, bar.y - 6); // 6px above the bar
        }
      });

      ctx.restore();
    },
  };

  const showNavigation = totalPages > 1;
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  const handleBarClick = (event) => {
    try {
      const chart = chartRef.current;
      if (!chart) return;

      const elements = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        true
      );

      if (elements.length) {
        const [{ index }] = elements;
        const actualIndex = startIndex + index;
        const counselor = data?.counselor_enroll_counts[actualIndex];
        console.log("Navigating to leads...", counselor);

        dispatch(setReporting([counselor?.uuid]));
        dispatch(setStage([34]));
        // router.push("/leads?from=dashboard");
        window.location.href = "/leads?from=dashboard";
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "320px" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <Bar
          ref={chartRef}
          data={graphData}
          options={options}
          onClick={handleBarClick}
          plugins={[valueOnTopPlugin]}
        />
      </div>

      {showNavigation && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "16px",
            display: "flex",
            gap: "8px",
          }}
        >
          {canGoBack && (
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!canGoBack}
              style={{
                background: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ddd",
                cursor: canGoBack ? "pointer" : "not-allowed",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                opacity: canGoBack ? 1 : 0.5,
              }}
            >
              ←
            </button>
          )}

          {canGoForward && (
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!canGoForward}
              style={{
                background: "#fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ddd",
                cursor: canGoForward ? "pointer" : "not-allowed",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                opacity: canGoForward ? 1 : 0.5,
              }}
            >
              →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrolledCountChart;
