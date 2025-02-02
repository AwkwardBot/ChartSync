import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import getSupabaseClient from "../../../utils/db";

const LineChartOne = () => {
  const supabase = getSupabaseClient();
  const { startDate, endDate } = useSelector((state) => state.dateRange);

  const [state, setState] = useState({
    series: [{ data: [] }],
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
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          gradientToColors: ["#00D492", "#00D492", "#00D492"],
          stops: [0, 50, 100],
        },
      },
      markers: { size: 0 },
      grid: { show: false, padding: { right: 10, left: 10 } },
      xaxis: {
        type: "datetime",
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        lines: { show: false },
        tickAmount: 4,
        min: 0,
        max: 300,
      },
      legend: { show: false },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 300 },
            xaxis: {
              type: "datetime",
              labels: {
                format: "dd MMM",
                datetimeUTC: false,
                style: { fontSize: "12px" },
                formatter: (value) => {
                  return new Date(value).toLocaleDateString("en-US", { day: "numeric", month: "short" });
                },
              },
              tickAmount: 7,
            },
            yaxis: { labels: { style: { fontSize: "10px" } } },
          },
        },
        {
          breakpoint: 480, // Mobile
          options: {
            chart: { height: 250 },
            xaxis: { labels: { style: { fontSize: "8px" } } },
            yaxis: { labels: { style: { fontSize: "8px" } } },
          },
        },
      ],
    },
  });

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel("time_on_pages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "time_on_pages" },
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
      .from("time_on_pages")
      .select("created_at, time_spent")
      .gte("created_at", new Date(startDate).toISOString())
      .lte("created_at", new Date(endDate).toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const formattedData = data.map((entry) => ({
      x: new Date(entry.created_at).getTime(),
      y: entry.time_spent || 0,
    }));

    setState((prevState) => ({
      ...prevState,
      series: [{ name: "Time Spent", data: formattedData }],
    }));
  }

  function addNewDataPoint(newEntry) {
    if (!newEntry.created_at || newEntry.time_spent == null) return;

    setState((prevState) => {
      const updatedData = [
        ...prevState.series[0].data,
        { x: new Date(newEntry.created_at).getTime(), y: newEntry.time_spent },
      ].sort((a, b) => a.x - b.x);

      return {
        ...prevState,
        series: [{ ...prevState.series[0], data: updatedData }],
      };
    });
  }

  return (
    <div className="border rounded-xl w-full border-gray-300 ">
      <div className="p-4">
        <h2 className="text-sm font-semibold">Time Spent on Pages</h2>
        <p className=" text-2xl font-semibold">{state.series[0].data.length}<span className="text-xl font-normal ps-2">hours</span> </p>
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

export default LineChartOne;
