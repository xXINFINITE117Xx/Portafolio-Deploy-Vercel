/**
 * api.js — Capa de datos
 * API principal: CoinGecko (pública, sin API key)
 * Fallback: datos mock si falla la red
 */
(function (global) {
  "use strict";

  const COINGECKO = "https://api.coingecko.com/api/v3";

  const MOCK_MARKETS = [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "",
      current_price: 67420,
      market_cap: 1.32e12,
      total_volume: 2.8e10,
      price_change_percentage_24h: 2.15,
      market_cap_rank: 1,
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      image: "",
      current_price: 3450,
      market_cap: 4.15e11,
      total_volume: 1.4e10,
      price_change_percentage_24h: -0.82,
      market_cap_rank: 2,
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      image: "",
      current_price: 178,
      market_cap: 8.2e10,
      total_volume: 3.1e9,
      price_change_percentage_24h: 4.6,
      market_cap_rank: 5,
    },
    {
      id: "cardano",
      symbol: "ada",
      name: "Cardano",
      image: "",
      current_price: 0.58,
      market_cap: 2.0e10,
      total_volume: 5.2e8,
      price_change_percentage_24h: 1.2,
      market_cap_rank: 9,
    },
    {
      id: "dogecoin",
      symbol: "doge",
      name: "Dogecoin",
      image: "",
      current_price: 0.16,
      market_cap: 2.3e10,
      total_volume: 9.1e8,
      price_change_percentage_24h: -1.5,
      market_cap_rank: 8,
    },
    {
      id: "ripple",
      symbol: "xrp",
      name: "XRP",
      image: "",
      current_price: 0.62,
      market_cap: 3.4e10,
      total_volume: 1.2e9,
      price_change_percentage_24h: 0.9,
      market_cap_rank: 6,
    },
    {
      id: "polkadot",
      symbol: "dot",
      name: "Polkadot",
      image: "",
      current_price: 7.4,
      market_cap: 1.0e10,
      total_volume: 2.4e8,
      price_change_percentage_24h: 2.8,
      market_cap_rank: 12,
    },
    {
      id: "avalanche-2",
      symbol: "avax",
      name: "Avalanche",
      image: "",
      current_price: 36.2,
      market_cap: 1.4e10,
      total_volume: 4.5e8,
      price_change_percentage_24h: -2.1,
      market_cap_rank: 11,
    },
  ];

  function mockChart(days) {
    const labels = [];
    const prices = [];
    const now = Date.now();
    const step = (days * 24 * 3600 * 1000) / 24;
    let price = 65000;
    for (let i = 0; i < 24; i++) {
      const t = new Date(now - (23 - i) * step);
      labels.push(
        t.toLocaleDateString("es", { month: "short", day: "numeric" }),
      );
      price = price * (1 + (Math.random() - 0.48) * 0.03);
      prices.push(Math.round(price));
    }
    return { labels, prices };
  }

  async function fetchMarkets() {
    const url =
      COINGECKO +
      "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return { data, source: "CoinGecko API", mock: false };
    } catch (err) {
      console.warn("API CoinGecko no disponible, usando mock:", err.message);
      return { data: MOCK_MARKETS, source: "Datos demo (offline)", mock: true };
    }
  }

  async function fetchBitcoinChart(days) {
    days = days || 7;
    const url =
      COINGECKO + "/coins/bitcoin/market_chart?vs_currency=usd&days=" + days;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      const labels = [];
      const prices = [];
      const points = json.prices || [];
      // Muestrear ~24 puntos
      const step = Math.max(1, Math.floor(points.length / 24));
      for (let i = 0; i < points.length; i += step) {
        const [ts, price] = points[i];
        labels.push(
          new Date(ts).toLocaleDateString("es", {
            month: "short",
            day: "numeric",
          }),
        );
        prices.push(Math.round(price));
      }
      return { labels, prices, mock: false };
    } catch (err) {
      console.warn("Chart API fallback:", err.message);
      return Object.assign(mockChart(days), { mock: true });
    }
  }

  function computeKpis(markets) {
    if (!markets || !markets.length) {
      return {
        totalMarketCap: 0,
        totalVolume: 0,
        btcPrice: 0,
        avgChange: 0,
        gainers: 0,
        losers: 0,
      };
    }
    const totalMarketCap = markets.reduce((s, c) => s + (c.market_cap || 0), 0);
    const totalVolume = markets.reduce((s, c) => s + (c.total_volume || 0), 0);
    const btc = markets.find((c) => c.id === "bitcoin") || markets[0];
    const changes = markets.map((c) => c.price_change_percentage_24h || 0);
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const gainers = changes.filter((c) => c > 0).length;
    const losers = changes.filter((c) => c < 0).length;
    return {
      totalMarketCap,
      totalVolume,
      btcPrice: btc.current_price || 0,
      btcChange: btc.price_change_percentage_24h || 0,
      avgChange,
      gainers,
      losers,
    };
  }

  function formatUsd(n) {
    if (n == null || isNaN(n)) return "—";
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1)
      return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return "$" + n.toFixed(4);
  }

  function formatPct(n) {
    if (n == null || isNaN(n)) return "—";
    const sign = n > 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  }

  global.DashboardAPI = {
    fetchMarkets,
    fetchBitcoinChart,
    computeKpis,
    formatUsd,
    formatPct,
  };
})(window);
