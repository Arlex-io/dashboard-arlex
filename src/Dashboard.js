// Dashboard Arlex - Frontend React

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedMac, setSelectedMac] = useState("");
  const [readings, setReadings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    axios.get("/api/dispositivos").then((res) => setDevices(res.data));
  }, []);

  const loadData = async () => {
    if (!selectedMac) return;
    const res = await axios.get(`/api/dispositivo/${selectedMac}/dados?limit=5000`);
    let data = res.data;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date("2000-01-01");
      const end = endDate ? new Date(endDate) : new Date();
      data = data.filter((r) => new Date(r.timestamp_esp) >= start && new Date(r.timestamp_esp) <= end);
    }
    setReadings(data);
  };

  const makeChart = (label, field, color) => {
    const data = {
      labels: readings.map((r) => r.timestamp_esp),
      datasets: [
        {
          label,
          data: readings.map((r) => r[field]),
          borderColor: color,
          fill: false,
        },
      ],
    };
    const options = {
      scales: {
        x: {
          type: "time",
          time: {
            tooltipFormat: "dd/MM/yyyy HH:mm",
            unit: "hour",
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    };
    return <Line data={data} options={options} />;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Arlex</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="p-2 border rounded"
          value={selectedMac}
          onChange={(e) => setSelectedMac(e.target.value)}
        >
          <option value="">Selecione um dispositivo</option>
          {devices.map((d) => (
            <option key={d.mac_address} value={d.mac_address}>
              {d.nome || d.mac_address}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="p-2 border rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="datetime-local"
          className="p-2 border rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={loadData}>
        Carregar Dados
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {makeChart("Temperatura (°C)", "temperatura", "#e11d48")}
        {makeChart("Umidade (%)", "umidade", "#3b82f6")}
        {makeChart("CO2 (ppm)", "concentracao_co2", "#10b981")}
        {makeChart("Luminosidade", "luminosidade", "#f59e0b")}
      </div>
    </div>
  );
}
