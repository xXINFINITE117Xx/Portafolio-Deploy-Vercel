/**
 * Clima Cyberpunk — OpenWeather API (key opcional) + modo demo
 * Obtén key gratis: https://openweathermap.org/api
 */
(function () {
  "use strict";

  // --- CONFIGURA TU API KEY AQUÍ (OpenWeather free) ---
  var API_KEY = "6bd668d8bc7e23936abb73c2e1106c67"; // ej: 'abcdef123456...'
  var USE_DEMO_IF_NO_KEY = true;

  var form = document.getElementById("search-form");
  var input = document.getElementById("city-input");
  var geoBtn = document.getElementById("geo-btn");
  var statusEl = document.getElementById("status");
  var card = document.getElementById("weather-card");

  var ICON_MAP = {
    clear: "fa-sun",
    clouds: "fa-cloud",
    rain: "fa-cloud-rain",
    drizzle: "fa-cloud-rain",
    thunderstorm: "fa-bolt",
    snow: "fa-snowflake",
    mist: "fa-smog",
    fog: "fa-smog",
    haze: "fa-smog",
  };

  function weatherKey(main) {
    var m = (main || "").toLowerCase();
    if (m.indexOf("thunder") >= 0) return "storm";
    if (m.indexOf("rain") >= 0 || m.indexOf("drizzle") >= 0) return "rain";
    if (m.indexOf("snow") >= 0) return "snow";
    if (m.indexOf("cloud") >= 0) return "clouds";
    if (
      m.indexOf("mist") >= 0 ||
      m.indexOf("fog") >= 0 ||
      m.indexOf("haze") >= 0
    )
      return "mist";
    return "clear";
  }

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  function applyTheme(main) {
    var key = weatherKey(main);
    document.body.setAttribute("data-weather", key);
  }

  function iconClass(main) {
    var m = (main || "clear").toLowerCase();
    for (var k in ICON_MAP) {
      if (m.indexOf(k) >= 0) return ICON_MAP[k];
    }
    return "fa-cloud";
  }

  function render(data) {
    applyTheme(data.weather[0].main);
    document.getElementById("city-name").textContent =
      data.name + (data.sys && data.sys.country ? ", " + data.sys.country : "");
    document.getElementById("date-line").textContent =
      new Date().toLocaleString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    document.getElementById("desc").textContent = data.weather[0].description;
    document.getElementById("icon-main").innerHTML =
      '<i class="fas ' + iconClass(data.weather[0].main) + '"></i>';
    document.getElementById("temp").textContent =
      Math.round(data.main.temp) + "°";
    document.getElementById("feels").textContent =
      Math.round(data.main.feels_like) + "°";
    document.getElementById("humidity").textContent = data.main.humidity + "%";
    document.getElementById("wind").textContent =
      Math.round((data.wind.speed || 0) * 3.6) + " km/h";
    document.getElementById("pressure").textContent =
      data.main.pressure + " hPa";

    var fc = document.getElementById("forecast");
    fc.innerHTML = "";
    var days = data.forecast || demoForecast(data.main.temp);
    days.forEach(function (d) {
      var el = document.createElement("div");
      el.className = "fc-item";
      el.innerHTML =
        "<span>" +
        d.label +
        '</span><i class="fas ' +
        iconClass(d.main) +
        '"></i><strong>' +
        d.temp +
        "°</strong>";
      fc.appendChild(el);
    });

    card.hidden = false;
    setStatus(
      data._demo ? "Modo demo (sin API key)" : "Datos en vivo · OpenWeather",
    );
  }

  function demoForecast(base) {
    var labels = ["Hoy", "Mar", "Mié", "Jue", "Vie"];
    var mains = ["Clear", "Clouds", "Rain", "Clear", "Clouds"];
    return labels.map(function (l, i) {
      return {
        label: l,
        main: mains[i],
        temp: Math.round(base + (Math.random() * 6 - 3)),
      };
    });
  }

  function mockWeather(city) {
    var mains = ["Clear", "Clouds", "Rain", "Thunderstorm", "Snow", "Mist"];
    var main = mains[Math.floor(Math.random() * mains.length)];
    var temp = 8 + Math.round(Math.random() * 28);
    return {
      _demo: true,
      name: city || "Neo Tokyo",
      sys: { country: "CP" },
      weather: [{ main: main, description: main.toLowerCase() + " cyberpunk" }],
      main: {
        temp: temp,
        feels_like: temp - 1,
        humidity: 40 + Math.round(Math.random() * 50),
        pressure: 1010,
      },
      wind: { speed: 1 + Math.random() * 6 },
      forecast: demoForecast(temp),
    };
  }

  function fetchByCity(city) {
    if (!API_KEY) {
      if (USE_DEMO_IF_NO_KEY) {
        render(mockWeather(city));
        return;
      }
      setStatus("Configura API_KEY en clima.js", "error");
      return;
    }
    setStatus("Consultando OpenWeather…", "loading");
    var url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      encodeURIComponent(city) +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es";
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("Ciudad no encontrada");
        return r.json();
      })
      .then(function (data) {
        return fetchForecast(data.coord.lat, data.coord.lon).then(
          function (fc) {
            data.forecast = fc;
            render(data);
          },
        );
      })
      .catch(function (e) {
        setStatus(e.message || "Error de red", "error");
      });
  }

  function fetchByCoords(lat, lon) {
    if (!API_KEY) {
      if (USE_DEMO_IF_NO_KEY) {
        render(mockWeather("Tu ubicación"));
        return;
      }
      setStatus("Configura API_KEY en clima.js", "error");
      return;
    }
    setStatus("Obteniendo clima local…", "loading");
    var url =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es";
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("No se pudo obtener el clima");
        return r.json();
      })
      .then(function (data) {
        return fetchForecast(lat, lon).then(function (fc) {
          data.forecast = fc;
          render(data);
        });
      })
      .catch(function (e) {
        setStatus(e.message || "Error", "error");
      });
  }

  function fetchForecast(lat, lon) {
    if (!API_KEY) return Promise.resolve(demoForecast(20));
    var url =
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      API_KEY +
      "&units=metric&lang=es&cnt=40";
    return fetch(url)
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (json) {
        if (!json || !json.list) return demoForecast(20);
        var byDay = {};
        json.list.forEach(function (item) {
          var day = item.dt_txt.slice(0, 10);
          if (!byDay[day]) byDay[day] = item;
        });
        return Object.keys(byDay)
          .slice(0, 5)
          .map(function (day, i) {
            var item = byDay[day];
            var label =
              i === 0
                ? "Hoy"
                : new Date(day).toLocaleDateString("es-ES", {
                    weekday: "short",
                  });
            return {
              label: label,
              main: item.weather[0].main,
              temp: Math.round(item.main.temp),
            };
          });
      })
      .catch(function () {
        return demoForecast(20);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var city = input.value.trim();
    if (!city) return;
    fetchByCity(city);
  });

  geoBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      setStatus("Geolocalización no disponible", "error");
      return;
    }
    setStatus("Obteniendo ubicación…", "loading");
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      function () {
        setStatus("No se pudo acceder a la ubicación", "error");
      },
    );
  });

  // Demo inicial visual
  if (!API_KEY && USE_DEMO_IF_NO_KEY) {
    render(mockWeather("Neo Bogotá"));
  }
})();
