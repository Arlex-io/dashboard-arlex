// Dashboard Arlex - Frontend Moderno com Tailwind, Abas, Cards e Dark Mode

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
  const [darkMode, setDarkMode] = useState(false);

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
          backgroundColor: color + "33",
          fill: true,
          tension: 0.3,
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: darkMode ? "#fff" : "#000" },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { tooltipFormat: "dd/MM/yyyy HH:mm", unit: "hour" },
          ticks: { color: darkMode ? "#ccc" : "#333" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: darkMode ? "#ccc" : "#333" },
        },
      },
    };
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</h2>
        <Line data={data} options={options} />
      </div>
    );
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100`}>
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 Dashboard Arlex</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded bg-gray-700 text-white dark:bg-yellow-400 dark:text-black"
          >
            {darkMode ? "Modo Claro" : "Modo Escuro"}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["temperatura", "Temperatura"],
            ["umidade", "Umidade"],
            ["co2", "CO₂"],
            ["luminosidade", "Luminosidade"],
            ["config", "Configuração"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-lg font-medium shadow ${
                tab === key
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "config" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
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
              className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="datetime-local"
              className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              className="col-span-full px-4 py-2 bg-green-600 text-white rounded-lg shadow"
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
    </div>
  );
}
