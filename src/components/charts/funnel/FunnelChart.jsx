import React, { useEffect, useRef, useState } from "react";
import FunnelGraph from "funnel-graph-js/src/js/main";
import getSupabaseClient from "../../../utils/db";
import { useSelector } from "react-redux";
import "./styles.css"

function FunnelChart({ width, height }) {
  const graphRef = useRef(null);
  const [data, setData] = useState();
  const supabase = getSupabaseClient();

  const { startDate, endDate } = useSelector((state) => state.dateRange);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      console.error("Start and end dates are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date();

    const [{ data: allPages, error: e1 }, { data: leads, error: e2 }, { data: singlePage, error: e3 }] = await Promise.all([
      supabase.from("page_views").select().gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
      supabase.from("leads").select().gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
      supabase.from("page_views").select().eq("page", "/home").gte("created_at", start.toISOString()).lte("created_at", end.toISOString()),
    ]);

    if (e1 || e2 || e3) {
      console.error("Error fetching data from Supabase:", e1 || e2 || e3);
      return;
    }

    setData({
      labels: ["Total Page Views", "Single Page Views", "Leads"],
      colors: [["#1A56DB", "#1A56DB", "#00D492"]],
      values: [[allPages?.length || 0], [singlePage?.length || 0], [leads?.length || 0]],
    });
  };

  useEffect(() => {
    if (startDate && endDate) fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
    const pageViewsChannel = supabase
      .channel("page_views-funnel-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, fetchData)
      .subscribe();

    const leadsChannel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(pageViewsChannel);
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  useEffect(() => {
    if (data) {
      if (!graphRef.current) {
        graphRef.current = new FunnelGraph({
          container: ".Funnel",
          gradientDirection: "horizontal",
          data,
          displayPercent: false,
          direction: "Horizontal",
          width,
          height,
        });
        graphRef.current.draw();
      } else {
        graphRef.current.updateWidth(width);
        graphRef.current.updateData(data);
      }
    }
  }, [data, width, height]);

  return <div className="Funnel" />;
}

export default FunnelChart;
