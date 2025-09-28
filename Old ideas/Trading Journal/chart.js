const SYMBOL = '%5ENDX';  // URL-encoded ^NDX for Yahoo
const INTERVAL = '5m';
const TIMEZONE = 'America/Los_Angeles';  // UTC-7 / PDT
const CORS_PROXY = 'https://corsproxy.io/?';  // Free 2025 proxy—bypasses CORS

const grid = document.getElementById('grid');
const addBtn = document.getElementById('add-btn');
let entries = JSON.parse(localStorage.getItem('nasdaqJournal') || '[]');

// Get today's date in PDT (YYYY-MM-DD)
function getTodayPDT() {
    return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

// Save entries to localStorage
function saveEntries() {
    localStorage.setItem('nasdaqJournal', JSON.stringify(entries));
}

// Fetch ^NDX intraday data from Yahoo via CORS proxy (5-min, date-filtered)
async function fetchNasdaqData(targetDate) {
    const now = Math.floor(Date.now() / 1000);
    const start = Math.floor(new Date(`${targetDate}T00:00:00-07:00`).getTime() / 1000);
    const end = targetDate === getTodayPDT() ? now : Math.floor(new Date(`${targetDate}T23:59:59-07:00`).getTime() / 1000);
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${SYMBOL}?interval=${INTERVAL}&period1=${start}&period2=${end}`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(yahooUrl);  // CORS fix: Proxy wraps Yahoo
    try {
        console.log(`Fetching ^NDX for ${targetDate} via proxy:`, proxyUrl);
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status} via proxy`);
        const json = await response.json();
        console.log('Raw Yahoo Response:', json);

        const result = json.chart?.result?.[0];
        if (!result) throw new Error('No chart data—check date/symbol');

        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};
        if (timestamps.length === 0) throw new Error('No timestamps—empty day?');

        // Parse to TradingView format: Filter valid bars
        const data = timestamps.map((time, i) => ({
            time,
            open: quote.open?.[i] || 0,
            high: quote.high?.[i] || 0,
            low: quote.low?.[i] || 0,
            close: quote.close?.[i] || 0
        })).filter(bar => bar.close > 0 && bar.time > 0);  // Valid bars only

        console.log(`Parsed ${data.length} ^NDX candles for ${targetDate}:`, data.slice(0, 3));
        return data;
    } catch (error) {
        console.error('Yahoo Fetch Error:', error);
        throw error;
    }
}


// Render TradingView chart in box
function renderChart(chartDiv, data) {
    chartDiv.classList.remove('loading', 'error');
    chartDiv.innerHTML = '';
    const chart = LightweightCharts.createChart(chartDiv, {
        width: chartDiv.offsetWidth,
        height: chartDiv.offsetHeight,
        layout: { background: { type: 'solid', color: '#222' }, textColor: '#DDD' },
        grid: { vertLines: { color: '#444' }, horzLines: { color: '#444' } },
        timeScale: { borderColor: '#ccc' },
        rightPriceScale: { borderColor: '#ccc' }
    });

    const candlestickSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
    });
    chart.applyOptions({
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();
}

// Show error in chart div
function showChartError(chartDiv, message) {
    chartDiv.className = 'box-chart error';
    chartDiv.innerHTML = `<strong>^NDX Chart Error:</strong> ${message}<br><small>Console (F12) for details. Refresh or check date.</small>`;
}

// Create/load single box (no index—uses date for saves)
function createBox(entry) {
    const box = document.createElement('div');
    box.className = 'box';
    const currentDate = entry.date;  // Capture for saves
    const chartId = `chart-${currentDate}`;
    box.innerHTML = `
        <div class="box-header">Nasdaq-100 (^NDX): ${currentDate} PDT</div>
        <div class="box-text" contenteditable="true">${entry.text || 'Notes: Macro forces, top tech components, open trade setup...'}</div>
        <div id="${chartId}" class="box-chart loading"></div>
    `;
    grid.appendChild(box);

    // Save notes on blur (find by date)
    const textEl = box.querySelector('.box-text');
    textEl.addEventListener('blur', () => {
        const text = textEl.innerText;
        const entryToUpdate = entries.find(e => e.date === currentDate);
        if (entryToUpdate) {
            entryToUpdate.text = text;
            saveEntries();
        }
    });

    // Load chart (cached or fetch)
    const chartDiv = document.getElementById(chartId);
    if (entry.chartData && entry.chartData.length > 0) {
        renderChart(chartDiv, entry.chartData);
    } else {
        fetchNasdaqData(currentDate).then(data => {
            const entryToUpdate = entries.find(e => e.date === currentDate);
            if (entryToUpdate) {
                entryToUpdate.chartData = data;
                saveEntries();
            }
            renderChart(chartDiv, data);
        }).catch(error => {
            showChartError(chartDiv, error.message);
        });
    }

    return box;
}

// Render all entries (sort newest first by date)
function renderEntries() {
    grid.innerHTML = '';
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));  // Descending: Newest top
    sortedEntries.forEach(entry => createBox(entry));
}

// Add/refresh today's box (PDT, update if exists—array stays chronological)
async function addTodayBox() {
    const today = getTodayPDT();
    let todayEntry = entries.find(e => e.date === today);
    if (!todayEntry) {
        entries.push({ date: today, text: '', chartData: [] });  // Push for chronological storage
        saveEntries();
    }
    // Refresh data for today (unfinished)
    try {
        const data = await fetchNasdaqData(today);
        todayEntry = entries.find(e => e.date === today);  // Re-find
        if (todayEntry) {
            todayEntry.chartData = data;
            saveEntries();
        }
        renderEntries();  // Re-render sorted
    } catch (error) {
        console.error('Add Error:', error);
        renderEntries();  // Box for notes anyway
    }
}

// Events (run on DOM load)
document.addEventListener('DOMContentLoaded', () => {
    addBtn.addEventListener('click', addTodayBox);
    renderEntries();  // Load on start
});

