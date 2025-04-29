"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setStage } from "@/lib/slices/dashboardSlice";

// Register needed Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const LeadDistributionChart = ({ data }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const handlePetalClick = (stage, index) => {
    dispatch(setStage([stage?.id]));
    router.push("/leads?from=dashboard");
    // alert(`Clicked on stage: ${stage.status_name}, Count: ${stage.count}`);
    // You could do navigation, modal open, data fetch, etc., here
  };

  // Calculate each stage's fill fraction.
  const fillFractions = data?.status_counts?.map(
    (val) => val?.count / data?.total_leads
  );

  // Create a dataset that divides the donut into equal wedges.
  // Since we will draw the colored petals with a custom plugin,
  // we make the dataset’s background transparent.
  const graphData = {
    labels: data?.status_counts?.map((stage) => stage?.status_name),
    datasets: [
      {
        data: data?.status_counts?.map(() => 1), // one equal slice per stage
        backgroundColor: data?.status_counts?.map(() => "rgba(0,0,0,0)"), // keep transparent
        borderWidth: 0, // disable auto-drawn borders
        hoverBorderWidth: 0,
      },
    ],
  };

  // Configure chart options.
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: (-90 * Math.PI) / 180, // start at top if desired
    cutout: "50%", // size of the inner circle (donut hole)
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const clickedStage = data?.status_counts[index];
        console.log("Clicked Stage:", clickedStage);

        // Call your custom function here
        handlePetalClick(clickedStage, index);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // Show the stage name and raw value when hovering over a petal.
          label: (context) => {
            const idx = context.dataIndex;
            // return `${stages[idx]?.title}: ${values[idx]}`;
            return `${data?.status_counts[idx]?.count}`;
          },
          labelColor: (context) => {
            const idx = context.dataIndex;
            return {
              borderColor: data?.status_counts[idx]?.txt_color,
              backgroundColor: data?.status_counts[idx]?.txt_color,
              borderWidth: 2,
            };
          },
        },
      },
    },
  };

  /**
   * Custom Plugin: radialFillPlugin
   * --------------------------------
   * Draws one “petal” per stage.
   *   1. Subtracts a small gap angle from each wedge so that petals are separated.
   *   2. Computes the filled arc (from inner radius to a radial point proportionate to the stage’s fill fraction).
   *   3. Strokes the colored arc with a white border to create a static separation.
   */

  const radialFillPlugin = {
    id: "radialFillPlugin",
    afterDatasetDraw(chart) {
      const {
        ctx,
        chartArea: { left, right, top, bottom },
      } = chart;
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const datasetMeta = chart.getDatasetMeta(0);

      // Increase gap angle (in radians) to create visible spacing between petals.
      const gapAngle = 0.3; // Adjust this value to change the spread margin

      // Scale factor for petal width; 0.5 means 50% of the original thickness.
      const petalWidthScale = 1.0;

      datasetMeta.data.forEach((arc, index) => {
        const innerRadius = arc.innerRadius;
        const originalOuterRadius = arc.outerRadius;
        // Calculate effective outer radius to reduce petal's thickness.
        const effectiveOuter =
          innerRadius + petalWidthScale * (originalOuterRadius - innerRadius);

        // Adjust the start and end angles to create a gap between petals.
        const aStart = arc.startAngle + gapAngle / 2;
        const aEnd = arc.endAngle - gapAngle / 2;

        // 1. Draw the petal's background (entire petal area) in gray.
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, effectiveOuter, aStart, aEnd, false);
        ctx.arc(centerX, centerY, innerRadius, aEnd, aStart, true);
        ctx.closePath();
        ctx.fillStyle = "#F0F0F0"; // Background color for unfilled part.
        ctx.fill();
        ctx.restore();

        // 2. Draw the filled (colored) portion.
        // Compute filled outer radius based on the petal's fill fraction.
        const fillFraction = fillFractions[index]; // fillFractions should be defined in scope.
        const filledOuter =
          innerRadius + fillFraction * (effectiveOuter - innerRadius);
        // innerRadius +
        // Math.min(fillFraction * 2, 1) * (effectiveOuter - innerRadius);
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, filledOuter, aStart, aEnd, false);
        ctx.arc(centerX, centerY, innerRadius, aEnd, aStart, true);
        ctx.closePath();
        ctx.fillStyle = data?.status_counts[index]?.txt_color; // stageColors should be defined in scope.
        ctx.fill();
        ctx.restore();

        // 3. Draw the petal border (covering the entire petal outline).
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, effectiveOuter, aStart, aEnd, false);
        ctx.arc(centerX, centerY, innerRadius, aEnd, aStart, true);
        ctx.closePath();
        ctx.lineWidth = 1; // Adjust border thickness if needed.
        ctx.strokeStyle = "#F0F0F0"; // Border color.
        ctx.stroke();
        ctx.restore();
      });
    },
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Chart container */}
      <div style={{ position: "relative", width: "100%", height: "300px" }}>
        <Doughnut
          data={graphData}
          options={options}
          plugins={[radialFillPlugin]}
        />
      </div>
    </div>
  );
};

export default LeadDistributionChart;
