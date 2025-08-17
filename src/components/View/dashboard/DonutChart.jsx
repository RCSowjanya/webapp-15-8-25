import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Custom label rendering for donut chart
function renderCustomizedLabelFactory(data) {
  let lastLeftY = null;
  let lastRightY = null;
  return function renderCustomizedLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) {
    const RADIAN = Math.PI / 180;
    const value = data[index].value;
    const color = data[index].color;

    // Make the L-shaped lines longer
    const lineLength = 30;   // Increased radial length
    const lineLength2 = 30;  // Increased horizontal length
    const angle = -midAngle * RADIAN;

    // Start: just outside the arc
    const sx = cx + (outerRadius + 4) * Math.cos(angle);
    const sy = cy + (outerRadius + 4) * Math.sin(angle);

    // Middle: further out radially
    const mx = cx + (outerRadius + lineLength) * Math.cos(angle);
    let my = cy + (outerRadius + lineLength) * Math.sin(angle);

    // End: horizontal to left or right
    const isRight = mx > cx;
    let ex = mx + (isRight ? lineLength2 : -lineLength2);
    let ey = my;

    // --- Force extra space between labels on the same side ---
    const minLabelGap = 45; // Increased gap between labels
    if (isRight) {
      if (lastRightY !== null && Math.abs(ey - lastRightY) < minLabelGap) {
        ey = lastRightY + minLabelGap;
        my = lastRightY + minLabelGap;
      }
      lastRightY = ey;
    } else {
      if (lastLeftY !== null && Math.abs(ey - lastLeftY) < minLabelGap) {
        ey = lastLeftY + minLabelGap;
        my = lastLeftY + minLabelGap;
      }
      lastLeftY = ey;
    }

    return (
      <g>
        {/* L-shaped line */}
        <polyline
          points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
          stroke={color}
          fill="none"
          strokeWidth={2}
        />
        {/* Percentage label only */}
        <text
          x={ex + (isRight ? 8 : -8)}
          y={ey + 4}
          fill="#222"
          fontWeight="600"
          fontSize="15"
          textAnchor={isRight ? "start" : "end"}
          dominantBaseline="central"
        >
          {value < 1 ? Number(value.toFixed(2)) : Number(value.toFixed(1))}%
        </text>
      </g>
    );
  };
}

export default function DonutChart({
  data,
  centerValue,
  className = "",
  style = {},
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationData, setAnimationData] = useState([]);

  useEffect(() => {
    // Start animation when data changes
    setIsAnimating(true);
    
    // Create initial data with 0 values
    const initialData = data.map(item => ({ ...item, value: 0 }));
    setAnimationData(initialData);

    // Animate to actual values
    const animationDuration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = animationDuration / steps;
    let currentStep = 0;

    const animate = () => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      // Update data with animated values
      const newData = data.map(item => ({
        ...item,
        value: item.value * easeOutQuart
      }));
      setAnimationData(newData);

      if (currentStep < steps) {
        setTimeout(animate, stepDuration);
      } else {
        setIsAnimating(false);
      }
    };

    // Start animation after a small delay
    setTimeout(animate, 100);
  }, [data]);

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`} style={style}>
      <ResponsiveContainer width="100%" aspect={1.2} minHeight={220}>
        <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
          <Pie
            data={animationData}
            cx="50%"
            cy="50%"
            innerRadius={"38%"}
            outerRadius={"62%"}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            label={renderCustomizedLabelFactory(animationData)}
            labelLine={{ length: 8, length2: 8 }}
            isAnimationActive={false}
            animationDuration={1500}
            animationBegin={0}
          >
            {animationData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          {/* Centered value */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="1.5em"
            fontWeight="bold"
            fill="#111"
          >
            {centerValue}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}