/**
 * app.js — Aplicación principal React
 * Dashboard Analytics: React + API CoinGecko + Chart.js
 */
(function () {
  "use strict";

  const e = React.createElement;
  const { useState, useEffect, useCallback } = React;
  const API = window.DashboardAPI;
  const { KpiCard, LineChart, DoughnutChart, MarketsTable } =
    window.DashboardComponents;

  function App() {
    const [markets, setMarkets] = useState([]);
    const [chart, setChart] = useState({ labels: [], prices: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [source, setSource] = useState("");
    const [updatedAt, setUpdatedAt] = useState(null);
    const [chartDays, setChartDays] = useState(7);

    const loadData = useCallback(
      async function (isRefresh) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
          const [marketsRes, chartRes] = await Promise.all([
            API.fetchMarkets(),
            API.fetchBitcoinChart(chartDays),
          ]);

          setMarkets(marketsRes.data || []);
          setSource(marketsRes.source);
          setChart({ labels: chartRes.labels, prices: chartRes.prices });
          setUpdatedAt(new Date());

          if (marketsRes.mock && chartRes.mock) {
            setError(
              "No se pudo conectar con la API. Mostrando datos de demostración.",
            );
          }
        } catch (err) {
          setError(err.message || "Error al cargar datos");
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [chartDays],
    );

    useEffect(
      function () {
        loadData(false);
      },
      [loadData],
    );

    const kpis = API.computeKpis(markets);

    if (loading) {
      return e(
        "div",
        { className: "boot-loader" },
        e("div", { className: "boot-spinner" }),
        e("p", null, "Cargando Dashboard..."),
      );
    }

    return e(
      "div",
      { className: "dashboard" },
      // Header
      e(
        "header",
        { className: "dash-header" },
        e(
          "a",
          { className: "brand", href: "../../index.html" },
          e(
            "div",
            { className: "brand-mark" },
            e("i", { className: "fas fa-chart-line" }),
          ),
          e(
            "div",
            { className: "brand-text" },
            "DASHBOARD ",
            e("span", null, "ANALYTICS"),
          ),
        ),
        e(
          "div",
          { className: "header-actions" },
          e(
            "span",
            { className: "api-badge" },
            e("i", { className: "fas fa-plug" }),
            source || "API",
          ),
          updatedAt &&
            e(
              "span",
              { className: "last-update" },
              "Act. " +
                updatedAt.toLocaleTimeString("es", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
            ),
          e(
            "button",
            {
              className: "btn btn-primary",
              onClick: function () {
                loadData(true);
              },
              disabled: refreshing,
            },
            e("i", {
              className: "fas fa-sync-alt" + (refreshing ? " fa-spin" : ""),
            }),
            refreshing ? " Actualizando..." : " Refresh",
          ),
        ),
      ),

      // Error
      error &&
        e(
          "div",
          { className: "error-box" },
          e(
            "span",
            null,
            e("i", { className: "fas fa-exclamation-triangle" }),
            " ",
            error,
          ),
          e(
            "button",
            {
              className: "btn btn-ghost",
              onClick: function () {
                loadData(true);
              },
            },
            "Reintentar",
          ),
        ),

      // KPIs
      e(
        "section",
        { className: "kpi-grid" },
        e(KpiCard, {
          label: "Market Cap (top)",
          value: API.formatUsd(kpis.totalMarketCap),
          change: API.formatPct(kpis.avgChange),
          changeUp: kpis.avgChange >= 0,
          icon: "fa-globe",
        }),
        e(KpiCard, {
          label: "Volumen 24h",
          value: API.formatUsd(kpis.totalVolume),
          icon: "fa-exchange-alt",
        }),
        e(KpiCard, {
          label: "Bitcoin",
          value: API.formatUsd(kpis.btcPrice),
          change: API.formatPct(kpis.btcChange),
          changeUp: kpis.btcChange >= 0,
          icon: "fa-dollar",
        }),
        e(KpiCard, {
          label: "Gainers / Losers",
          value: kpis.gainers + " / " + kpis.losers,
          change:
            kpis.gainers >= kpis.losers ? "Mercado alcista" : "Mercado bajista",
          changeUp: kpis.gainers >= kpis.losers,
          icon: "fa-balance-scale",
        }),
      ),

      // Charts
      e(
        "section",
        { className: "charts-row" },
        e(
          "div",
          { className: "panel" },
          e(
            "div",
            { className: "panel-header" },
            e("h2", { className: "panel-title" }, "BTC — Precio histórico"),
            e(
              "div",
              { style: { display: "flex", gap: "0.4rem" } },
              [7, 14, 30].map(function (d) {
                return e(
                  "button",
                  {
                    key: d,
                    className:
                      "btn btn-ghost" + (chartDays === d ? " btn-primary" : ""),
                    style:
                      chartDays === d
                        ? {
                            background:
                              "linear-gradient(90deg,#00FFD1,#FF007A)",
                            color: "#0A0F1B",
                            border: "none",
                          }
                        : undefined,
                    onClick: function () {
                      setChartDays(d);
                    },
                  },
                  d + "D",
                );
              }),
            ),
          ),
          refreshing
            ? e(
                "div",
                { className: "loading-overlay" },
                e("div", { className: "spinner-sm" }),
                " Actualizando gráfico...",
              )
            : e(LineChart, { labels: chart.labels, prices: chart.prices }),
        ),
        e(
          "div",
          { className: "panel" },
          e(
            "div",
            { className: "panel-header" },
            e("h2", { className: "panel-title" }, "Market Cap (top 6)"),
          ),
          e(DoughnutChart, { markets: markets }),
        ),
      ),

      // Table
      e(
        "section",
        { className: "panel table-panel" },
        e(
          "div",
          { className: "panel-header" },
          e("h2", { className: "panel-title" }, "Mercados en tiempo real"),
        ),
        e(MarketsTable, { markets: markets }),
      ),

      e(
        "footer",
        { className: "dash-footer" },
        e("a", { href: "../../index.html" }, "← Volver al portafolio"),
        " · React 18 + Chart.js + CoinGecko API · Demo",
      ),
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
})();
