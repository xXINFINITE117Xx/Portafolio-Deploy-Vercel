/**
 * components.js — Componentes React (sin JSX, compatible con CDN)
 */
(function (global) {
  "use strict";

  const e = React.createElement;
  const { useEffect, useRef } = React;
  const API = global.DashboardAPI;

  function KpiCard({ label, value, change, changeUp, icon }) {
    return e(
      "div",
      { className: "kpi-card" },
      e("div", { className: "kpi-label" }, label),
      e("div", { className: "kpi-value" }, value),
      change != null &&
        e(
          "div",
          { className: "kpi-change " + (changeUp ? "up" : "down") },
          (changeUp ? "▲ " : "▼ ") + change,
        ),
      e("i", { className: "kpi-icon fas " + icon }),
    );
  }

  function LineChart({ labels, prices }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current || !global.Chart || !labels || !labels.length)
        return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 260);
      gradient.addColorStop(0, "rgba(0, 255, 209, 0.35)");
      gradient.addColorStop(1, "rgba(0, 255, 209, 0.02)");

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "BTC (USD)",
              data: prices,
              borderColor: "#00FFD1",
              backgroundColor: gradient,
              borderWidth: 2,
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "#FF007A",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1A1F2E",
              titleColor: "#00FFD1",
              bodyColor: "#E0E0E0",
              borderColor: "rgba(0,255,209,0.3)",
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.04)" },
              ticks: { color: "#8B92A5", maxTicksLimit: 8, font: { size: 10 } },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: {
                color: "#8B92A5",
                font: { size: 10 },
                callback: function (v) {
                  return "$" + Number(v).toLocaleString();
                },
              },
            },
          },
        },
      });

      return function () {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [labels, prices]);

    return e(
      "div",
      { className: "chart-wrap" },
      e("canvas", { ref: canvasRef }),
    );
  }

  function DoughnutChart({ markets }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current || !global.Chart || !markets || !markets.length)
        return;

      if (chartRef.current) chartRef.current.destroy();

      const top = markets.slice(0, 6);
      const colors = [
        "#00FFD1",
        "#FF007A",
        "#FFD700",
        "#7B61FF",
        "#4ade80",
        "#fb923c",
      ];

      chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: top.map((c) => c.symbol.toUpperCase()),
          datasets: [
            {
              data: top.map((c) => c.market_cap),
              backgroundColor: colors,
              borderColor: "#0A0F1B",
              borderWidth: 3,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "62%",
          plugins: {
            legend: {
              position: "right",
              labels: {
                color: "#A0A0A0",
                boxWidth: 12,
                padding: 12,
                font: { size: 11 },
              },
            },
            tooltip: {
              backgroundColor: "#1A1F2E",
              titleColor: "#00FFD1",
              bodyColor: "#E0E0E0",
              callbacks: {
                label: function (ctx) {
                  return " " + API.formatUsd(ctx.raw);
                },
              },
            },
          },
        },
      });

      return function () {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [markets]);

    return e(
      "div",
      { className: "chart-wrap" },
      e("canvas", { ref: canvasRef }),
    );
  }

  function MarketsTable({ markets }) {
    return e(
      "div",
      { className: "table-scroll" },
      e(
        "table",
        { className: "data-table" },
        e(
          "thead",
          null,
          e(
            "tr",
            null,
            e("th", null, "#"),
            e("th", null, "Activo"),
            e("th", null, "Precio"),
            e("th", null, "24h"),
            e("th", null, "Market Cap"),
            e("th", null, "Volumen"),
          ),
        ),
        e(
          "tbody",
          null,
          markets.map(function (coin) {
            const up = (coin.price_change_percentage_24h || 0) >= 0;
            return e(
              "tr",
              { key: coin.id },
              e(
                "td",
                null,
                e(
                  "span",
                  { className: "rank-badge" },
                  coin.market_cap_rank || "—",
                ),
              ),
              e(
                "td",
                null,
                e(
                  "div",
                  { className: "coin-cell" },
                  coin.image
                    ? e("img", {
                        className: "coin-icon",
                        src: coin.image,
                        alt: coin.name,
                      })
                    : e(
                        "div",
                        {
                          className: "coin-icon",
                          style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            color: "#00FFD1",
                          },
                        },
                        (coin.symbol || "?").slice(0, 3).toUpperCase(),
                      ),
                  e(
                    "div",
                    null,
                    e("div", { className: "coin-name" }, coin.name),
                    e("div", { className: "coin-symbol" }, coin.symbol),
                  ),
                ),
              ),
              e("td", null, API.formatUsd(coin.current_price)),
              e(
                "td",
                { className: up ? "price-up" : "price-down" },
                API.formatPct(coin.price_change_percentage_24h),
              ),
              e("td", null, API.formatUsd(coin.market_cap)),
              e("td", null, API.formatUsd(coin.total_volume)),
            );
          }),
        ),
      ),
    );
  }

  global.DashboardComponents = {
    KpiCard,
    LineChart,
    DoughnutChart,
    MarketsTable,
  };
})(window);
