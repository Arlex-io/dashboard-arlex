// Dashboard Arlex - Frontend React com Abas e Configuração

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
  const [tab, setTab] = useState("temperatura");

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
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Arlex</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className={`px-4 py-2 rounded ${tab === "temperatura" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("temperatura")}>Temperatura</button>
        <button className={`px-4 py-2 rounded ${tab === "umidade" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("umidade")}>Umidade</button>
        <button className={`px-4 py-2 rounded ${tab === "co2" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("co2")}>CO₂</button>
        <button className={`px-4 py-2 rounded ${tab === "luminosidade" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("luminosidade")}>Luminosidade</button>
        <button className={`px-4 py-2 rounded ${tab === "config" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setTab("config")}>Configuração</button>
      </div>

      {tab === "config" && (
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

          <button
            className="col-span-full px-4 py-2 bg-green-600 text-white rounded"
            onClick={loadData}
          >
            Carregar Dados
          </button>
        </div>
      )}

      {tab === "temperatura" && makeChart("Temperatura (°C)", "temperatura", "#e11d48")}
      {tab === "umidade" && makeChart("Umidade (%)", "umidade", "#3b82f6")}
      {tab === "co2" && makeChart("CO2 (ppm)", "concentracao_co2", "#10b981")}
      {tab === "luminosidade" && makeChart("Luminosidade", "luminosidade", "#f59e0b")}
    </div>
  );
}
