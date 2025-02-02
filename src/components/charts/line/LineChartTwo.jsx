import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import getSupabaseClient from "../../../utils/db";
import { useSelector } from "react-redux";

const LineChartTwo = () => {
  const supabase = getSupabaseClient();
  const { startDate, endDate } = useSelector((state) => state.dateRange);

  const [state, setState] = useState({
    series: [{ name: "Single Page Views", data: [] }],
    options: {
      chart: {
        id: "realtime",
        height: 350,
        type: "line",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: { speed: 1000 },
        },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: { size: 0 },
      grid: { show: false, padding: { right: 10, left: 10 } },
      xaxis: {
        type: "datetime",
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        tickAmount: 4,
        min: 0,
      },
      legend: { show: false },
    },
  });

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel("page_views-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "page_views" },
        (payload) => {
          addNewDataPoint(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchInitialData();
    }
  }, [startDate, endDate]);

  async function fetchInitialData() {
    if (!startDate || !endDate) return;

    const { data, error } = await supabase
      .from("page_views")
      .select("created_at")
      .eq("page", "/home")
      .gte("created_at", new Date(startDate).toISOString())
      .lte("created_at", new Date(endDate).toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const aggregatedData = data.reduce((acc, entry) => {
      const dateKey = new Date(entry.created_at).toISOString().split("T")[0]; 
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    const formattedData = Object.entries(aggregatedData).map(([date, count]) => ({
      x: new Date(date).getTime(),
      y: count,
    }));

    setState((prevState) => ({
      ...prevState,
      series: [{ name: "Single Page Views", data: formattedData }],
    }));
  }

  function addNewDataPoint(newEntry) {
    if (!newEntry.created_at) return;

    setState((prevState) => {
      const dateKey = new Date(newEntry.created_at).toISOString().split("T")[0];
      let updatedData = [...prevState.series[0].data];

      const existingIndex = updatedData.findIndex((point) => {
        return new Date(point.x).toISOString().split("T")[0] === dateKey;
      });

      if (existingIndex !== -1) {
        updatedData[existingIndex] = {
          ...updatedData[existingIndex],
          y: updatedData[existingIndex].y + 1,
        };
      } else {
        updatedData.push({ x: new Date(dateKey).getTime(), y: 1 });
      }

      return {
        ...prevState,
        series: [{ ...prevState.series[0], data: updatedData.sort((a, b) => a.x - b.x) }],
      };
    });
  }

  return (
    <div className="border rounded-xl w-full border-gray-300">
      <div className="p-4">
        <h2 className="text-sm font-semibold">Single Page Views</h2>
        <p className=" text-2xl font-semibold">{state.series[0].data.length}<span className="text-xl font-normal ps-2">Views</span> </p>
      </div>
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="line"
        height={300}
        width="100%"
      />
    </div>
  );
};

export default LineChartTwo;
