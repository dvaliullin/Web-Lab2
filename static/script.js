document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        storageKey: 'lab2_points_history',
        fcgiEndpoint: '/fcgi-bin/server.jar',
        canvas: {
            scale: 130,
            pointRadius: 4.5,
            shapeFillColor: '#3399ff',
            hitColor: '#16a34a',
            missColor: '#dc2626'
        },
        rangeY: { min: -5, max: 5 },
        validX: [-5, -4, -3, -2, -1, 0, 1, 2, 3],
        validR: [1, 2, 3, 4, 5]
    };

    const elements = {
        canvas: document.getElementById('graph-canvas'),
        form: document.getElementById('check-form'),
        xCheckboxes: document.querySelectorAll('input[name="x-val"]'),
        yInput: document.getElementById('y-input'),
        rButtons: document.querySelectorAll('.btn-r'),
        rHidden: document.getElementById('r-value'),
        resultsBody: document.getElementById('results-body'),
        clearBtn: document.getElementById('clear-btn'),
        errors: {
            x: document.getElementById('x-error'),
            y: document.getElementById('y-error')
        }
    };

    const ctx = elements.canvas.getContext('2d');

    function normalizeNumberString(raw) {
        const cleaned = raw.trim().replace(',', '.');
        if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
            return null;
        }

        const parts = cleaned.split('.');
        if (parts.length === 2 && parts[1].length > 15) {
            return `${parts[0]}.${parts[1].substring(0, 15)}`;
        }
        return cleaned;
    }

    function getSelectedX() {
        const checked = Array.from(elements.xCheckboxes).filter(cb => cb.checked);
        return checked.length === 1 ? parseFloat(checked[0].value) : null;
    }

    function getSelectedR() {
        return parseFloat(elements.rHidden.value);
    }

    function validateX(x) {
        return x !== null && CONFIG.validX.includes(x);
    }

    function validateY(rawY) {
        const normalized = normalizeNumberString(rawY);
        if (normalized === null) {
            return { isValid: false, value: null };
        }

        const num = parseFloat(normalized);
        const isValid = !isNaN(num) && isFinite(num) &&
                        num > CONFIG.rangeY.min && num < CONFIG.rangeY.max;

        return { isValid, value: num };
    }

    function validateR(r) {
        return !isNaN(r) && CONFIG.validR.includes(r);
    }

    function validateFormInputs() {
        const x = getSelectedX();
        const yResult = validateY(elements.yInput.value);
        const r = getSelectedR();

        const isXValid = validateX(x);
        const isRValid = validateR(r);

        elements.errors.x.style.display = isXValid ? 'none' : 'block';
        elements.errors.y.style.display = yResult.isValid ? 'none' : 'block';

        if (!isXValid || !yResult.isValid || !isRValid) {
            return null;
        }

        return { x, y: yResult.value, r };
    }

    async function sendPointCheck(x, y, r) {
        const queryParams = new URLSearchParams({ x, y, r }).toString();
        const url = `${CONFIG.fcgiEndpoint}?${queryParams}`;

        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Ошибка сервера: HTTP ${response.status}`);
        }

        return await response.json();
    }

    function loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
        } catch {
            return [];
        }
    }

    function saveRecord(record) {
        const history = loadHistory();
        history.unshift(record);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(history));
    }

    function clearHistory() {
        localStorage.removeItem(CONFIG.storageKey);
    }

    function drawTriangleQ2(cx, cy, scale) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - scale, cy);
        ctx.lineTo(cx, cy - scale / 2);
        ctx.closePath();
        ctx.fill();
    }

    function drawSectorQ3(cx, cy, scale) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, scale / 2, 0.5 * Math.PI, Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawRectangleQ4(cx, cy, scale) {
        ctx.fillRect(cx, cy, scale / 2, scale);
    }

    function drawShapes(cx, cy, scale) {
        ctx.fillStyle = CONFIG.canvas.shapeFillColor;
        drawTriangleQ2(cx, cy, scale);
        drawSectorQ3(cx, cy, scale);
        drawRectangleQ4(cx, cy, scale);
    }

    function drawAxes(w, h, cx, cy) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';

        ctx.beginPath();
        ctx.moveTo(10, cy);
        ctx.lineTo(w - 10, cy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, h - 10);
        ctx.lineTo(cx, 10);
        ctx.stroke();

        ctx.fillText('x', w - 15, cy - 8);
        ctx.fillText('y', cx + 8, 15);
    }

    function drawTicks(cx, cy, scale) {
        const ticks = [
            { x: cx - scale, y: cy, label: '-R', isX: true },
            { x: cx - scale / 2, y: cy, label: '-R/2', isX: true },
            { x: cx + scale / 2, y: cy, label: 'R/2', isX: true },
            { x: cx + scale, y: cy, label: 'R', isX: true },
            { x: cx, y: cy - scale, label: 'R', isX: false },
            { x: cx, y: cy - scale / 2, label: 'R/2', isX: false },
            { x: cx, y: cy + scale / 2, label: '-R/2', isX: false },
            { x: cx, y: cy + scale, label: '-R', isX: false }
        ];

        ticks.forEach(t => {
            ctx.beginPath();
            if (t.isX) {
                ctx.moveTo(t.x, cy - 3);
                ctx.lineTo(t.x, cy + 3);
                ctx.fillText(t.label, t.x - 10, cy + 18);
            } else {
                ctx.moveTo(cx - 3, t.y);
                ctx.lineTo(cx + 3, t.y);
                ctx.fillText(t.label, cx + 8, t.y + 4);
            }
            ctx.stroke();
        });
    }

    function drawSinglePoint(pt, cx, cy, scale, currentR) {
        const px = cx + (pt.x / currentR) * scale;
        const py = cy - (pt.y / currentR) * scale;

        ctx.beginPath();
        ctx.arc(px, py, CONFIG.canvas.pointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = pt.hit ? CONFIG.canvas.hitColor : CONFIG.canvas.missColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawPoints(points, cx, cy, scale, currentR) {
        points.forEach(pt => drawSinglePoint(pt, cx, cy, scale, currentR));
    }

    function redrawCanvas() {
        const w = elements.canvas.width;
        const h = elements.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = CONFIG.canvas.scale;
        const currentR = getSelectedR();

        ctx.clearRect(0, 0, w, h);
        drawShapes(cx, cy, scale);
        drawAxes(w, h, cx, cy);
        drawTicks(cx, cy, scale);
        drawPoints(loadHistory(), cx, cy, scale, currentR);
    }

    function formatDateTime(timestamp) {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }).format(new Date(timestamp));
    }

    function createTableRow(item) {
        const tr = document.createElement('tr');
        const execTimeMcs = (item.executionTime / 1000).toFixed(2);

        tr.innerHTML = `
            <td>${item.x}</td>
            <td>${item.y}</td>
            <td>${item.r}</td>
            <td><span class="${item.hit ? 'status-hit' : 'status-miss'}">${item.hit ? 'Попадание' : 'Промах'}</span></td>
            <td>${formatDateTime(item.timestamp)}</td>
            <td>${execTimeMcs} мкс</td>
        `;
        return tr;
    }

    function renderTable() {
        const history = loadHistory();
        elements.resultsBody.innerHTML = '';

        if (history.length === 0) {
            elements.resultsBody.innerHTML = '<tr><td colspan="6" style="color: #94a3b8; padding: 15px;">Нет результатов</td></tr>';
            return;
        }

        const fragment = document.createDocumentFragment();
        history.forEach(item => fragment.appendChild(createTableRow(item)));
        elements.resultsBody.appendChild(fragment);
    }

    function updateView() {
        renderTable();
        redrawCanvas();
    }

    function setupXCheckboxes() {
        elements.xCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    elements.xCheckboxes.forEach(other => {
                        if (other !== cb) other.checked = false;
                    });
                }
            });
        });
    }

    function setupRButtons() {
        elements.rButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.rButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                elements.rHidden.value = btn.dataset.r;
                updateView();
            });
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const validData = validateFormInputs();
        if (!validData) return;

        try {
            const serverResult = await sendPointCheck(validData.x, validData.y, validData.r);
            saveRecord(serverResult);
            updateView();
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        }
    }

    function handleClearHistory() {
        clearHistory();
        updateView();
    }

    function init() {
        setupXCheckboxes();
        setupRButtons();

        elements.form.addEventListener('submit', handleFormSubmit);
        elements.clearBtn.addEventListener('click', handleClearHistory);

        updateView();
    }

    init();
});