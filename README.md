# 📊 Dashboard Arlex

Este é um painel web para visualização de dados de sensores conectados via ESP32, armazenados em Supabase e enviados para um backend hospedado no DigitalOcean.

## Funcionalidades

- Seleção de dispositivo (por nome/MAC)
- Filtro por intervalo de tempo
- Gráficos separados para:
  - Temperatura
  - Umidade
  - Concentração de CO₂
  - Luminosidade

## Tecnologias utilizadas

- React
- Chart.js via react-chartjs-2
- Axios
- Supabase (via API)
- Hospedagem no Netlify

## Como rodar localmente

```bash
npm install
npm start
