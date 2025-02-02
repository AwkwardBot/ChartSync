import React, { useRef } from "react";
import useWindowWidth from "../../hooks/useWindowWidth";
import FunnelChart from "../charts/funnel/FunnelChart";

export default function FunnelChartContainer() {
  const ref = useRef(null);
  const width = useWindowWidth();
  const chartWidth = width > 768 ? 600 : width - 40;
  const clientWidth = ref?.current?.clientWidth || 1024;

  return (
    <div ref={ref} style={{ width: "100%", textAlign: "center", overflowX: "auto" }}>
      <FunnelChart width={clientWidth} height={400} />
    </div>
  );
}
