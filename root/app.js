(function () {
    // manejo global de errores para mostrarlos en pantalla
    window.onerror = function (message, source, lineno, colno, error) {
      console.log("JS Error:", message, "en", source + ":" + lineno + ":" + colno);
      let box = document.getElementById("errorBox");
      if (!box) {
        box = document.createElement("div");
        box.id = "errorBox";
        box.style.cssText = "color:red; white-space:pre; font-family:monospace; margin:10px 0;";
        document.body.prepend(box);
      }
      box.textContent = "Error: " + message + "\n" +
                        "Archivo: " + source + "\n" +
                        "Linea: " + lineno + ", Columna: " + colno;
    };
  
    // elementos DOM
    const canvas = document.getElementById('plotCanvas');
    const ctx = canvas.getContext('2d');
  
    const lrSlider    = document.getElementById('LRSlider');
    const delaySlider = document.getElementById('delaySlider');
    const freqSlider  = document.getElementById('freqSlider');
  
    const lrValueEl    = document.getElementById('LRValue');
    const delayValueEl = document.getElementById('delayValue');
    const freqValueEl  = document.getElementById('freqValue');
  
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
  
    let paused = false;
    let resetRequested = false;
  
    let lr_used =  0;
  
    function updateLabels() {
      lrValueEl.textContent     = parseFloat(lr_used).toFixed(3);
      delayValueEl.textContent  = parseFloat(delaySlider.value).toFixed(0)+ " | "+parseFloat(delaySlider.value/(freqSlider.value)).toFixed(2)+"ms";
      freqValueEl.textContent   = parseFloat(freqSlider.value).toFixed(1)+"Hz | "+ parseFloat(1/(freqSlider.value)).toFixed(2)+"ms";
    }
  
    lrSlider.oninput    = updateLabels;
    delaySlider.oninput = updateLabels;
    freqSlider.oninput  = updateLabels;
    updateLabels();
  
    pauseBtn.onclick = () => {
      paused = !paused;
      pauseBtn.textContent = paused ? 'Reanudar' : 'Frenar';
    };
  
    resetBtn.onclick = () => {
      resetRequested = true;
      paused = false;
    };

    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        // para pausar presionando la letra "F"
        if (key === "f") {
            paused = !paused;
            pauseBtn.textContent = paused ? 'Reanudar' : 'Frenar';
        }
    
        // para reiniciar con la letra "R"
        if (key === "r") {
            resetRequested = true;
            paused = false;
        }
    });
    
  
    const noiseList = [];    // perturbaciones/fallas
    const inputList = [];    // entradas/senales nominales
  
    const addBtn = document.getElementById("addComplexBtn");
    const listEl = document.getElementById("complexList");
  
    const addInputComplexBtn = document.getElementById("addInputComplexBtn");
    const inputListEl       = document.getElementById("inputList");
    const addBluntBtn       = document.getElementById("addBluntBtn");
  
    // ------------ RUIDOS (noiseList) ------------
    addBtn.onclick = function () {
      const n     = parseInt(document.getElementById("nInput").value);
      const min_f = parseFloat(document.getElementById("minFInput").value);
      const max_f = parseFloat(document.getElementById("maxFInput").value);
      const max_a = parseFloat(document.getElementById("maxAInput").value);
  
      const obj = new ComplexSines(n, min_f, max_f, max_a);
      noiseList.push(obj);
      renderNoiseList();
    };
  
    addBluntBtn.onclick = function () {
      const a      = parseFloat(document.getElementById("bluntAInput").value);
      const dur_ms = parseFloat(document.getElementById("bluntDurInput").value);
      const start_ms = tSim;
      const obj = new BluntSound(a, start_ms, dur_ms);
      noiseList.push(obj);
      renderNoiseList();
    };
  
    // ------------ INPUTS (inputList) ------------
    addInputComplexBtn.onclick = function () {
      const n     = parseInt(document.getElementById("inputNInput").value);
      const min_f = parseFloat(document.getElementById("inputMinFInput").value);
      const max_f = parseFloat(document.getElementById("inputMaxFInput").value);
      const max_a = parseFloat(document.getElementById("inputMaxAInput").value);
  
      const obj = new ComplexSines(n, min_f, max_f, max_a);
      inputList.push(obj);
      renderInputList();
    };
  
    // Renders y helpers
    function removeNoiseAt(index) {
      noiseList.splice(index, 1);
      renderNoiseList();
    }
  
    function renderNoiseList() {
      listEl.innerHTML = "";
      noiseList.forEach((noise, i) => {
        const li = document.createElement("li");
        if (noise instanceof ComplexSines) {
          li.textContent = `ComplexSines(n=${noise.sins.length}, ... )`;
        } else if (noise instanceof BluntSound) {
          li.textContent = `BluntSound(a=${noise.a}, start=${noise.tn}s, dur=${noise.t * 1000}ms)`;
        } else {
          li.textContent = "Ruido";
        }
        const btn = document.createElement("button");
        btn.textContent = "Quitar";
        btn.style.marginLeft = "10px";
        btn.onclick = () => removeNoiseAt(i);
        li.appendChild(btn);
        listEl.appendChild(li);
      });
    }
  
    function removeInputAt(index) {
      inputList.splice(index, 1);
      renderInputList();
    }
  
    function renderInputList() {
      inputListEl.innerHTML = "";
      inputList.forEach((noise, i) => {
        const li = document.createElement("li");
        if (noise instanceof ComplexSines) {
          li.textContent = `ComplexSines(n=${noise.sins.length}, ... )`;
        } else if (noise instanceof BluntSound) {
          li.textContent = `BluntSound(a=${noise.a}, start=${noise.tn}s, dur=${noise.t * 1000}ms)`;
        } else {
          li.textContent = "Input";
        }
        const btn = document.createElement("button");
        btn.textContent = "Quitar";
        btn.style.marginLeft = "10px";
        btn.onclick = () => removeInputAt(i);
        li.appendChild(btn);
        inputListEl.appendChild(li);
      });
    }
  
    function getControlParams() {
      return {
        lr:         parseFloat(lrSlider.value),
        delay:      parseFloat(delaySlider.value),
        frec:       parseFloat(freqSlider.value),
        pausado:    paused,
        reset:      resetRequested
      };
    }
  
    function clearResetFlag() { resetRequested = false; }
  
    const panelConfig = {
      "Valor nominal y Perturbaciones":   ["Valor nominal", "Ruido", "Salida hipotetica sin controlador"],
      "Error":            ["Error"],
      "Entrada y Salida del Sistema": ["Entrada del sistema","Salida del sistema"],
    };
  
    const errorBandConfig = {
      "Entrada y Salida del Sistema": {
        "Entrada del sistema": { min: -0.63, max: 0.63 },
        "Salida del sistema": { min: -0.63, max: 0.63 }
      },
      "Error": {
        "Error": { min: -0.63, max: 0.63 }
      }
    }
  
    // Altura dinámica según cantidad de paneles
    const PANELS = Object.keys(panelConfig).length;
    canvas.height = PANELS * 250;   // 250 px por panel
  
    // ---------- Clases de graficado ----------
    class Graph {
      constructor(name, seriesNames, panelIndex, totalPanels, windowSize) {
        this.name = name;
        this.seriesNames = seriesNames;
        this.numSeries = seriesNames.length;
        this.panelIndex = panelIndex;
        this.totalPanels = totalPanels;
        this.windowSize = windowSize;
  
        this.errorBands = {};
  
        this.xs = Array.from({ length: this.numSeries }, () => []);
        this.ys = Array.from({ length: this.numSeries }, () => []);
  
        const baseColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"];
        this.colors = [];
        for (let i = 0; i < this.numSeries; i++) {
          this.colors.push(baseColors[i % baseColors.length]);
        }
      }
  
      reset() {
        this.xs = Array.from({ length: this.numSeries }, () => []);
        this.ys = Array.from({ length: this.numSeries }, () => []);
      }
  
      pushData(t, values) {
        if (values.length !== this.numSeries) {
          console.warn(`Panel "${this.name}": esperaba ${this.numSeries} valores, recibió ${values.length}`);
          return;
        }
        const maxLen = this.windowSize * 1.5;
        for (let i = 0; i < this.numSeries; i++) {
          this.xs[i].push(t);
          this.ys[i].push(values[i]);
          if (this.xs[i].length > maxLen) {
            this.xs[i].shift();
            this.ys[i].shift();
          }
        }
      }
  
      draw(ctx, canvas, tMin, tMax) {
        const panelHeight = canvas.height / this.totalPanels;
        const top = this.panelIndex * panelHeight;
        const bottom = top + panelHeight;
  
        // fondo del panel
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, top, canvas.width, panelHeight);
  
        let tieneDatos = this.ys.some(arr => arr.length > 0);
        if (!tieneDatos) {
          ctx.fillStyle = "#000";
          ctx.font = "14px sans-serif";
          ctx.fillText(this.name + " (sin datos)", 10, top + 20);
          return;
        }
  
        // márgenes
        const marginTop = 25;
        const marginBottom = 30;
        const marginLeft = 50;
        const marginRight = 10;
  
        const plotTop = top + marginTop;
        const plotBottom = bottom - marginBottom;
  
        const availableWidth = canvas.width - marginLeft - marginRight;
        const gap = 10;
        const numCols = this.numSeries;
        const totalGaps = gap * (numCols - 1);
        const colWidth = (availableWidth - totalGaps) / numCols;
  
        // escala Y global
        let allY = [];
        for (let s = 0; s < this.numSeries; s++) {
          allY = allY.concat(this.ys[s]);
        }
  
        if (this.errorBands) {
          for (const key in this.errorBands) {
            const b = this.errorBands[key];
            if (!b) continue;
            if (typeof b.min === "number") allY.push(b.min);
            if (typeof b.max === "number") allY.push(b.max);
          }
        }
  
        let yMin = Math.min(...allY);
        let yMax = Math.max(...allY);
  
        if (!isFinite(yMin) || !isFinite(yMax)) {
          yMin = -1; yMax = 1;
        }
  
        if (yMax === yMin) { yMax += 1; yMin -= 1; }
  
        function yToPx(y) {
          return plotBottom - ((y - yMin) * (plotBottom - plotTop)) / (yMax - yMin);
        }
  
        // etiquetas Y
        ctx.fillStyle = "#000";
        ctx.font = "11px sans-serif";
        ctx.fillText(yMax.toFixed(2) + "Pa", 5, plotTop + 10);
        ctx.fillText(yMin.toFixed(2) + "Pa", 5, plotBottom);
  
        function xToPx(x, left, right) {
          if (tMax === tMin) return left;
          return left + ((x - tMin) * (right - left)) / (tMax - tMin);
        }
  
        ctx.font = "11px sans-serif";
  
        for (let s = 0; s < this.numSeries; s++) {
          const xs = this.xs[s];
          const ys = this.ys[s];
  
          const colLeft  = marginLeft + s * (colWidth + gap);
          const colRight = colLeft + colWidth;
  
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(colLeft, plotTop, colWidth, plotBottom - plotTop);
  
          ctx.strokeStyle = "#999";
          ctx.lineWidth = 1;
          ctx.strokeRect(colLeft, plotTop, colWidth, plotBottom - plotTop);
  
          ctx.fillStyle = "#000";
          ctx.fillText(this.seriesNames[s], colLeft + 5, plotTop - 5);
  
          if (0 >= yMin && 0 <= yMax) {
            const y0 = yToPx(0);
            ctx.save();
            ctx.strokeStyle = "#666";
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(colLeft, y0);
            ctx.lineTo(colRight, y0);
            ctx.stroke();
            ctx.restore();
  
            if (s === 0) {
              ctx.fillStyle = "#000";
              ctx.font = "11px sans-serif";
              ctx.fillText("0Pa", marginLeft - 30, y0 + 4);
            }
          }
  
          // banda de error
          const seriesName = this.seriesNames[s];
          let band = null;
          if (this.errorBands && this.errorBands[seriesName]) band = this.errorBands[seriesName];
          if (!band && this.errorBands && this.errorBands[s]) band = this.errorBands[s];
  
          if (band) {
            const y1 = yToPx(band.max);
            const y2 = yToPx(band.min);
            const bandTop = Math.min(y1, y2);
            const bandHeight = Math.abs(y2 - y1);
            ctx.save();
            ctx.fillStyle = "rgba(144, 238, 144, 0.2)";
            ctx.fillRect(colLeft, bandTop, colWidth, bandHeight);
            ctx.restore();
          }
  
          if (xs.length === 0) {
            ctx.fillText("(sin datos)", colLeft + 5, plotTop + 15);
            continue;
          }
  
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.strokeStyle = this.colors[s];
  
          let started = false;
          for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            const y = ys[i];
            if (x < tMin || x > tMax) continue;
            const px = xToPx(x, colLeft, colRight);
            const py = yToPx(y);
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
  
    class GraphManager {
      constructor(ctx, canvas, panelConfig, windowSize) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.windowSize = windowSize;
        this.t = -1;
  
        this.panelNames = Object.keys(panelConfig);
        this.graphs = {};
  
        this.panelNames.forEach((name, index) => {
          const seriesNames = panelConfig[name];
          const g = new Graph(name, seriesNames, index, this.panelNames.length, windowSize);
          g.errorBands = errorBandConfig[name] || {};
          this.graphs[name] = g;
        });
      }
  
      reset() {
        this.t = -1;
        for (const name of this.panelNames) this.graphs[name].reset();
        listEl.innerHTML = "";
      }
  
      step(dataDict) {
        this.t += 1;
        const t = this.t;
        for (const name of this.panelNames) {
          if (!(name in dataDict)) continue;
          this.graphs[name].pushData(t, dataDict[name]);
        }
  
        let tMin, tMax;
        if (t < this.windowSize) { tMin = 0; tMax = this.windowSize; }
        else { tMin = t - this.windowSize; tMax = t; }
  
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
        for (const name of this.panelNames) this.graphs[name].draw(this.ctx, this.canvas, tMin, tMax);
      }
    }
  
    // ---------- Modelos de ruido / entrada ----------
    class BluntSound {
      constructor(a = 5, tn = 0, t = 20) {
        this.a = a;
        this.t = t/100000;
        this.tn = tn;
      }
      get(t) { return (t < this.t + this.tn) ? this.a : 0; }
    }
  
    class ComplexSines {
      constructor(n = 20, min_f = 20, max_f = 1000, max_a = 5) {
        this.sins = [];
        for (let i = 0; i < n; i++) {
          let f = min_f + Math.random() * (max_f - min_f);
          const a = (max_a * Math.random()) / n;
          this.sins.push({ f, a });
        }
      }
      get(t) { return this.sins.reduce( (sum, s) => sum + s.a * Math.sin(2 * Math.PI * s.f * t), 0); }
    }
  
    class AdaptativeController {
      constructor(M = 64, lr = 0.5, eps = 1e-6, name = "Controller Adaptativo") {
        this.name = name;
        this.M = M;
        this.lr = lr;
        this.eps = eps;
        this.w = new Array(M).fill(0);
        this.b = new Array(M).fill(0);
      }
  
      filter(x) {
        this.b.push(x);
        if (this.b.length > this.M) this.b.shift();
        let y = 0;
        for (let i = 0; i < this.b.length; i++) y += this.w[i] * this.b[i];
        return y;
      }
  
      adapt(e) {
        let p = this.eps;
        p = this.b.reduce((sum, x) => sum + x ** 2, p);
        const mu = this.lr / p;
        for (let i = 0; i < this.M; i++) this.w[i] += mu * e * this.b[i];
      }
  
      reset() {
        this.w.fill(0);
        this.b.fill(0);
      }
    }
  
    // Loop principal
    const windowSize = 500;
    let delay = 4;
    const manager = new GraphManager(ctx, canvas, panelConfig, windowSize);
  
    let tSim = 0;
    let lastTimestamp = null;
  
    const nominal = new ComplexSines(50, 1000, 4400, 1.2);
    const ruidoPrim = new ComplexSines(20, 500, 1000, 1.8);
  
    function computeSafeLR(M, amp, safety = 0.1) {
      const A = Math.max(amp, 1e-3);
      const Px = 0.5 * A * A;
      const lr_max = 2 / (M * Px);
      return safety * lr_max;
    }
  
    const ctrl = new AdaptativeController(64, 0);
  
    // Buffer de delay
    const delayBuf = new Array(100).fill(0);
  
    function loop(timestamp) {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
  
      const params = getControlParams();
  
      // lr_used: escala exponencial suave (igual que el collab original)
      lr_used = 0.01 * Math.pow(100, params.lr/1000);
      updateLabels();
  
      if (params.reset) {
        tSim = 0;
        manager.reset();
        delayBuf.fill(0);
        ctrl.reset();
        clearResetFlag();
        inputList.length = 0;
        noiseList.length = 0;
        renderNoiseList();
        renderInputList();
      }
  
      if (!params.pausado) {
        const dt = 1 / (params.frec * 1_000);
        tSim += dt;
        ctrl.lr = lr_used;
  
        // suma de entradas
        const v = inputList.reduce((acc,i) => acc + i.get(tSim), 0);
  
        // suma de ruidos
        const ruido = noiseList.reduce((acc,n) => acc + n.get(tSim), 0);
  
        // mic externo = ruido (simplificado)
        const micExt = ruido;
  
        const x_filt = micExt;
        const u = ctrl.filter(x_filt);
  
        const contribParl = u * 1.0;
        delayBuf.push(contribParl);
  
        // obtener valor delayed (si existe)
        let parlante_delay = 0;
        const idx = delayBuf.length - params.delay;
        if (idx >= 0) parlante_delay = delayBuf[idx];
  
        const micInt = v + ruido + parlante_delay;
        const e = v - micInt;
  
        ctrl.adapt(e);
  
        const data = {
          "Valor nominal y Perturbaciones": [ v, ruido, v + ruido ],
          "Entrada y Salida del Sistema": [ v, v + ruido + parlante_delay ],
          "Error": [ e ]
        };
  
        manager.step(data);
      }
  
      requestAnimationFrame(loop);
    }
  
    window.requestAnimationFrame(loop);
  
  })();
  