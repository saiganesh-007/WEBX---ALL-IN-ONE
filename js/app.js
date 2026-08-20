/**
 * Digital Workspace - Personal Command Center (Unified Engine v4.x)
 * Pratt Parser, Live Currency, Weather, Stopwatch, Timer, Alarm, Clock, Dashboard, Tools.
 */
(function () {
    'use strict';

    // ==========================================
    // 1. STORAGE MANAGER
    // ==========================================
    const STORAGE_KEYS = {
        HISTORY: 'gc_history', SETTINGS: 'gc_settings', THEME: 'gc_theme',
        ACCENT: 'gc_accent', PROFILE: 'gc_profile', MEMORY: 'gc_memory',
        CURRENCY_CACHE: 'gc_currency_cache', FAVORITES: 'gc_favorites',
        TIMER_PRESETS: 'gc_timer_presets', ALARMS: 'gc_alarms',
        WORLD_CLOCKS: 'gc_world_clocks', LAST_LOCATION: 'gc_last_location',
        RINGTONES: 'gc_ringtones',
        TASKS: 'gc_tasks', REMINDERS: 'gc_reminders', NOTES: 'gc_notes',
        GOALS: 'gc_goals', FOCUS_SESSIONS: 'gc_focus_sessions',
        EXPENSES: 'gc_expenses', ACTIVITIES: 'gc_activities',
        DASHBOARD_LAYOUT: 'gc_dashboard_layout', FOCUS_DAILY: 'gc_focus_daily'
    };

    const DEFAULT_SETTINGS = {
        decimalPrecision: 8, thousandsSeparator: true, soundEnabled: true,
        keyboardInput: true, defaultMode: 'basic', angleUnit: 'DEG',
        showExpression: true, saveHistory: true, maxHistoryItems: 100,
        clockFormat: '24h', autoRefreshCurrency: true, weatherUnit: 'celsius',
        notifications: true, reduceMotion: false, animationIntensity: 'normal',
        timerSound: 'default', defaultAlarmRingtone: 'default',
        snoozeDuration: 5, hapticFeedback: false, dateFormat: 'medium',
        appearanceMode: 'dark', accentColor: 'emerald'
    };

    const DEFAULT_PROFILE = {
        displayName: 'Math Explorer', preferredTheme: 'midnight',
        preferredMode: 'basic', preferredCurrency: 'USD',
        preferredAngleUnit: 'DEG', createdAt: new Date().toISOString()
    };

    const StorageManager = {
        get(k, fb) {
            try {
                const r = localStorage.getItem(k);
                return r === null ? (fb === undefined ? null : fb) : JSON.parse(r);
            } catch (e) { return fb === undefined ? null : fb; }
        },
        set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
        remove(k) { try { localStorage.removeItem(k); } catch (e) {} },
        getSettings() { return { ...DEFAULT_SETTINGS, ...(this.get(STORAGE_KEYS.SETTINGS, {}) || {}) }; },
        saveSettings(s) { return this.set(STORAGE_KEYS.SETTINGS, s); },
        getProfile() { return { ...DEFAULT_PROFILE, ...(this.get(STORAGE_KEYS.PROFILE, {}) || {}) }; },
        saveProfile(p) { return this.set(STORAGE_KEYS.PROFILE, p); },
        getHistory() { return this.get(STORAGE_KEYS.HISTORY, []) || []; },
        saveHistory(h) { return this.set(STORAGE_KEYS.HISTORY, h); },
        getMemory() { return this.get(STORAGE_KEYS.MEMORY, 0) || 0; },
        saveMemory(v) { return this.set(STORAGE_KEYS.MEMORY, v); },
        getTheme() { return this.get(STORAGE_KEYS.THEME, 'midnight') || 'midnight'; },
        saveTheme(t) { return this.set(STORAGE_KEYS.THEME, t); },
        getAccent() { return this.get(STORAGE_KEYS.ACCENT, 'emerald') || 'emerald'; },
        saveAccent(a) { return this.set(STORAGE_KEYS.ACCENT, a); },
        getFavorites() {
            return this.get(STORAGE_KEYS.FAVORITES, { currencies: ['USD', 'INR'], units: [], worldClocks: [], locations: [] })
                || { currencies: [], units: [], worldClocks: [], locations: [] };
        },
        saveFavorites(f) { return this.set(STORAGE_KEYS.FAVORITES, f); },
        getAlarms() { return this.get(STORAGE_KEYS.ALARMS, []) || []; },
        saveAlarms(a) { return this.set(STORAGE_KEYS.ALARMS, a); },
        getWorldClocks() { return this.get(STORAGE_KEYS.WORLD_CLOCKS, []) || []; },
        saveWorldClocks(w) { return this.set(STORAGE_KEYS.WORLD_CLOCKS, w); },
        getLastLocation() { return this.get(STORAGE_KEYS.LAST_LOCATION, null); },
        saveLastLocation(l) { return this.set(STORAGE_KEYS.LAST_LOCATION, l); },
        getRingtones() { return this.get(STORAGE_KEYS.RINGTONES, []) || []; },
        saveRingtones(r) { return this.set(STORAGE_KEYS.RINGTONES, r); },
        getTasks() { return this.get(STORAGE_KEYS.TASKS, []) || []; },
        saveTasks(t) { return this.set(STORAGE_KEYS.TASKS, t); },
        getReminders() { return this.get(STORAGE_KEYS.REMINDERS, []) || []; },
        saveReminders(r) { return this.set(STORAGE_KEYS.REMINDERS, r); },
        getNotes() { return this.get(STORAGE_KEYS.NOTES, []) || []; },
        saveNotes(n) { return this.set(STORAGE_KEYS.NOTES, n); },
        getGoals() { return this.get(STORAGE_KEYS.GOALS, []) || []; },
        saveGoals(g) { return this.set(STORAGE_KEYS.GOALS, g); },
        getFocusSessions() { return this.get(STORAGE_KEYS.FOCUS_SESSIONS, []) || []; },
        saveFocusSessions(f) { return this.set(STORAGE_KEYS.FOCUS_SESSIONS, f); },
        getExpenses() { return this.get(STORAGE_KEYS.EXPENSES, []) || []; },
        saveExpenses(e) { return this.set(STORAGE_KEYS.EXPENSES, e); },
        getActivities() { return this.get(STORAGE_KEYS.ACTIVITIES, []) || []; },
        saveActivities(a) { return this.set(STORAGE_KEYS.ACTIVITIES, a); },
        getDashboardLayout() { return this.get(STORAGE_KEYS.DASHBOARD_LAYOUT, null); },
        saveDashboardLayout(d) { return this.set(STORAGE_KEYS.DASHBOARD_LAYOUT, d); },
        getFocusDaily() { return this.get(STORAGE_KEYS.FOCUS_DAILY, {}); },
        saveFocusDaily(d) { return this.set(STORAGE_KEYS.FOCUS_DAILY, d); },
        clearAllData() { Object.values(STORAGE_KEYS).forEach(k => this.remove(k)); }
    };

    // ==========================================
    // 2. EXPRESSION EVALUATOR (PRATT PARSER - NO EVAL)
    // ==========================================
    const Evaluator = {
        evaluate(expression, options) {
            const angleUnit = (options && options.angleUnit) || 'DEG';
            const precision = (options && options.precision !== undefined) ? options.precision : 8;
            if (!expression || expression.trim() === '') return 0;
            try {
                const tokens = this.tokenize(expression);
                if (tokens.length === 0) return 0;
                const parser = new ExpressionParser(tokens, angleUnit);
                let result = parser.parse();
                if (typeof result === 'number') {
                    if (!isFinite(result)) return 'Cannot divide by zero';
                    result = this.cleanPrecision(result, precision);
                }
                return result;
            } catch (err) { return err.message || 'Invalid Expression'; }
        },

        cleanPrecision(num, precision) {
            if (Math.abs(num) < 1e-15 && num !== 0) return 0;
            const factor = Math.pow(10, precision);
            const rounded = Math.round(num * factor) / factor;
            if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
                return parseFloat(num.toPrecision(precision));
            }
            return rounded;
        },

        tokenize(str) {
            let src = str.replace(/\u00d7/g, '*').replace(/\u00f7/g, '/').replace(/\u2212/g, '-')
                .replace(/\u03c0/g, 'pi').replace(/MOD/gi, '%').replace(/\u00b2/g, '^2').replace(/\u221a/g, 'sqrt');
            const tokens = [];
            let i = 0;
            while (i < src.length) {
                const ch = src[i];
                if (/\s/.test(ch)) { i++; continue; }
                if (/[0-9.]/.test(ch)) {
                    let n = '';
                    while (i < src.length && /[0-9.eE]/.test(src[i])) {
                        if (/[eE]/.test(src[i]) && i + 1 < src.length && /[+-]/.test(src[i + 1])) {
                            n += src[i] + src[i + 1]; i += 2; continue;
                        }
                        n += src[i]; i++;
                    }
                    if ((n.match(/\./g) || []).length > 1) throw new Error('Invalid Expression');
                    tokens.push({ type: 'NUMBER', value: parseFloat(n) });
                    continue;
                }
                if (['+', '-', '*', '/', '%', '^', '!', '(', ')', ','].includes(ch)) {
                    tokens.push({ type: 'OPERATOR', value: ch }); i++; continue;
                }
                if (/[a-zA-Z]/.test(ch)) {
                    let id = '';
                    while (i < src.length && /[a-zA-Z0-9]/.test(src[i])) { id += src[i]; i++; }
                    const lower = id.toLowerCase();
                    if (lower === 'pi') tokens.push({ type: 'NUMBER', value: Math.PI });
                    else if (lower === 'e' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'OPERATOR'))
                        tokens.push({ type: 'NUMBER', value: Math.E });
                    else tokens.push({ type: 'FUNCTION', value: lower });
                    continue;
                }
                throw new Error('Invalid Character: ' + ch);
            }
            return tokens;
        }
    };

    class ExpressionParser {
        constructor(tokens, angleUnit) { this.tokens = tokens; this.pos = 0; this.angleUnit = angleUnit || 'DEG'; }
        peek() { return this.tokens[this.pos] || null; }
        consume() { return this.tokens[this.pos++] || null; }
        parse() { const val = this.parseAddSub(); if (this.pos < this.tokens.length) throw new Error('Invalid Expression'); return val; }

        parseAddSub() {
            let left = this.parseMulDiv();
            while (this.peek() && this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
                const op = this.consume().value;
                left = op === '+' ? left + this.parseMulDiv() : left - this.parseMulDiv();
            }
            return left;
        }

        parseMulDiv() {
            let left = this.parsePower();
            while (this.peek() && this.peek().type === 'OPERATOR' && ['*', '/', '%'].includes(this.peek().value)) {
                const op = this.consume().value;
                const right = this.parsePower();
                if (op === '*') left *= right;
                else if (op === '/') { if (right === 0) throw new Error('Cannot divide by zero'); left /= right; }
                else { if (right === 0) throw new Error('Cannot divide by zero'); left %= right; }
            }
            return left;
        }

        parsePower() {
            let left = this.parsePostfix();
            if (this.peek() && this.peek().type === 'OPERATOR' && this.peek().value === '^') {
                this.consume(); left = Math.pow(left, this.parsePower());
            }
            return left;
        }

        parsePostfix() {
            let left = this.parseUnary();
            while (this.peek() && this.peek().type === 'OPERATOR' && this.peek().value === '!') {
                this.consume(); left = this.factorial(left);
            }
            return left;
        }

        parseUnary() {
            if (this.peek() && this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
                const op = this.consume().value;
                return op === '-' ? -this.parseUnary() : this.parseUnary();
            }
            return this.parsePrimary();
        }

        parsePrimary() {
            const token = this.peek();
            if (!token) throw new Error('Unexpected end of expression');
            if (token.type === 'NUMBER') { this.consume(); return token.value; }
            if (token.type === 'FUNCTION') {
                const funcName = this.consume().value;
                let arg;
                if (this.peek() && this.peek().type === 'OPERATOR' && this.peek().value === '(') {
                    this.consume();
                    arg = this.parseAddSub();
                    if (!this.peek() || this.peek().value !== ')') throw new Error('Missing closing parenthesis');
                    this.consume();
                } else { arg = this.parsePostfix(); }
                return this.applyFunction(funcName, arg);
            }
            if (token.type === 'OPERATOR' && token.value === '(') {
                this.consume();
                const expr = this.parseAddSub();
                if (!this.peek() || this.peek().value !== ')') throw new Error('Missing closing parenthesis');
                this.consume();
                return expr;
            }
            throw new Error('Unexpected token: ' + (token.value || ''));
        }

        applyFunction(name, val) {
            const toRad = (a) => this.angleUnit === 'DEG' ? a * Math.PI / 180 : this.angleUnit === 'GRAD' ? a * Math.PI / 200 : a;
            const fromRad = (r) => this.angleUnit === 'DEG' ? r * 180 / Math.PI : this.angleUnit === 'GRAD' ? r * 200 / Math.PI : r;
            switch (name) {
                case 'sin': return Math.sin(toRad(val));
                case 'cos': return Math.cos(toRad(val));
                case 'tan': return Math.tan(toRad(val));
                case 'asin': if (val < -1 || val > 1) throw new Error('Domain Error'); return fromRad(Math.asin(val));
                case 'acos': if (val < -1 || val > 1) throw new Error('Domain Error'); return fromRad(Math.acos(val));
                case 'atan': return fromRad(Math.atan(val));
                case 'sinh': return Math.sinh(val);
                case 'cosh': return Math.cosh(val);
                case 'tanh': return Math.tanh(val);
                case 'sqrt': if (val < 0) throw new Error('Domain Error'); return Math.sqrt(val);
                case 'cbrt': return Math.cbrt(val);
                case 'log': case 'log10': if (val <= 0) throw new Error('Domain Error'); return Math.log10(val);
                case 'ln': if (val <= 0) throw new Error('Domain Error'); return Math.log(val);
                case 'log2': if (val <= 0) throw new Error('Domain Error'); return Math.log2(val);
                case 'abs': return Math.abs(val);
                case 'floor': return Math.floor(val);
                case 'ceil': return Math.ceil(val);
                case 'round': return Math.round(val);
                case 'exp': return Math.exp(val);
                case 'exp10': return Math.pow(10, val);
                case 'reciprocal': if (val === 0) throw new Error('Cannot divide by zero'); return 1 / val;
                default: throw new Error('Unknown function: ' + name);
            }
        }

        factorial(n) {
            if (n < 0 || !Number.isInteger(n)) throw new Error('Domain Error');
            if (n > 170) throw new Error('Overflow Error');
            let res = 1;
            for (let i = 2; i <= n; i++) res *= i;
            return res;
        }
    }

    // ==========================================
    // 3. CALCULATOR ENGINE
    // ==========================================
    const Calculator = {
        expression: '', currentInput: '0', memory: 0, isEvaluated: false,
        angleUnit: 'DEG', decimalPrecision: 8, useThousandsSeparator: true,
        historyCallback: null, _lastMoveToExpr: false,

        init(opts) {
            this.angleUnit = (opts && opts.angleUnit) || 'DEG';
            this.decimalPrecision = (opts && opts.decimalPrecision !== undefined) ? opts.decimalPrecision : 8;
            this.useThousandsSeparator = (opts && opts.useThousandsSeparator !== undefined) ? opts.useThousandsSeparator : true;
            this.memory = StorageManager.getMemory();
        },
        setAngleUnit(u) { this.angleUnit = u; },
        setOptions(s) {
            if (s.angleUnit) this.angleUnit = s.angleUnit;
            if (s.decimalPrecision !== undefined) this.decimalPrecision = s.decimalPrecision;
            if (s.thousandsSeparator !== undefined) this.useThousandsSeparator = s.thousandsSeparator;
        },

        appendNumber(digit) {
            this._lastMoveToExpr = false;
            if (this.isEvaluated) {
                this.currentInput = digit === '.' ? '0.' : digit;
                this.expression = ''; this.isEvaluated = false; return;
            }
            if (this.currentInput === '0' && digit !== '.') this.currentInput = digit;
            else if (this.currentInput === '-0' && digit !== '.') this.currentInput = '-' + digit;
            else {
                if (digit === '.' && this.currentInput.includes('.')) return;
                if (this.currentInput.replace(/[^0-9]/g, '').length >= 16 && digit !== '.') return;
                this.currentInput += digit;
            }
        },

        appendOperator(op) {
            if (this.isEvaluated) {
                this.expression = this.currentInput + ' ' + op;
                this.currentInput = '0'; this.isEvaluated = false;
                this._lastMoveToExpr = true; return;
            }
            if (this.currentInput !== '' && !(this.currentInput === '0' && this._lastMoveToExpr)) {
                this.expression += (this.expression ? ' ' : '') + this.currentInput + ' ' + op;
                this.currentInput = '0';
                this._lastMoveToExpr = true;
            } else if (this.expression) {
                const trimmed = this.expression.trim();
                if (/[\+\-\*\/%\^]$/.test(trimmed)) {
                    this.expression = trimmed.replace(/[\+\-\*\/%\^]$/, op);
                } else { this.expression = trimmed + ' ' + op; }
            }
        },

        appendFunction(funcName) {
            if (this.isEvaluated) {
                this.expression = funcName + '(' + this.currentInput + ')';
                this.currentInput = '0'; this.isEvaluated = false;
                this._lastMoveToExpr = true;
            } else if (this.currentInput !== '0' && this.currentInput !== '') {
                this.expression += (this.expression ? ' ' : '') + funcName + '(' + this.currentInput + ')';
                this.currentInput = '0';
                this._lastMoveToExpr = true;
            } else {
                this.expression += (this.expression ? ' ' : '') + funcName + '(';
            }
        },

        appendParenthesis(paren) {
            if (paren === '(') {
                if (this.currentInput !== '0' && this.currentInput !== '') {
                    this.expression += (this.expression ? ' ' : '') + this.currentInput + ' * (';
                    this.currentInput = '0';
                } else { this.expression += (this.expression ? ' ' : '') + '('; }
            } else {
                if (this.currentInput !== '' && this.currentInput !== '0') {
                    this.expression += (this.expression ? ' ' : '') + this.currentInput + ')';
                    this.currentInput = '0';
                    this._lastMoveToExpr = true;
                } else { this.expression += ')'; }
            }
        },

        appendConstant(symbol) {
            this._lastMoveToExpr = false;
            this.currentInput = symbol === '\u03c0' ? Math.PI.toString() : Math.E.toString();
        },

        toggleSign() {
            if (this.currentInput === '0' || this.currentInput === 'Error') return;
            this.currentInput = this.currentInput.startsWith('-') ? this.currentInput.slice(1) : '-' + this.currentInput;
        },

        square() {
            const v = parseFloat(this.currentInput);
            if (isNaN(v)) return;
            this.currentInput = (v * v).toString();
            this._lastMoveToExpr = false;
        },

        reciprocal() {
            const v = parseFloat(this.currentInput);
            if (isNaN(v) || v === 0) { this.currentInput = 'Error'; return; }
            this.currentInput = (1 / v).toString();
            this._lastMoveToExpr = false;
        },

        calculatePercentage() {
            const curr = parseFloat(this.currentInput);
            if (isNaN(curr)) return;
            const trimmed = this.expression.trim();
            const lastOp = trimmed.match(/([\+\-\*\/])\s*$/);
            if (lastOp) {
                const op = lastOp[1];
                const prevExpr = trimmed.slice(0, -lastOp[0].length).trim();
                const base = Evaluator.evaluate(prevExpr, { angleUnit: this.angleUnit, precision: this.decimalPrecision });
                if (typeof base === 'number' && (op === '+' || op === '-')) {
                    this.currentInput = ((base * curr) / 100).toString(); return;
                }
            }
            this.currentInput = (curr / 100).toString();
        },

        backspace() {
            if (this.isEvaluated) { this.clear(); return; }
            if (this.currentInput.length > 1) {
                this.currentInput = this.currentInput.slice(0, -1);
                if (this.currentInput === '-' || this.currentInput === '-0') this.currentInput = '0';
            } else { this.currentInput = '0'; }
        },

        clear() {
            this.expression = ''; this.currentInput = '0';
            this.isEvaluated = false; this._lastMoveToExpr = false;
        },

        calculate() {
            let fullExpr = this.expression;
            if (this.currentInput !== '' && !(this.currentInput === '0' && this._lastMoveToExpr)) {
                fullExpr += (fullExpr ? ' ' : '') + this.currentInput;
            }
            this._lastMoveToExpr = false;
            fullExpr = fullExpr.trim();
            if (!fullExpr) return;
            const result = Evaluator.evaluate(fullExpr, { angleUnit: this.angleUnit, precision: this.decimalPrecision });
            const resultStr = typeof result === 'number' ? result.toString() : result;
            if (typeof result === 'number') {
                if (this.historyCallback) this.historyCallback(fullExpr, resultStr);
                this.expression = fullExpr;
            } else { this.expression = fullExpr; }
            this.currentInput = resultStr;
            this.isEvaluated = true;
        },

        memoryStore() { const v = parseFloat(this.currentInput); if (!isNaN(v)) { this.memory = v; StorageManager.saveMemory(this.memory); } },
        memoryRecall() { if (this.memory !== 0) { this.currentInput = this.memory.toString(); this.isEvaluated = false; } },
        memoryAdd() { const v = parseFloat(this.currentInput); if (!isNaN(v)) { this.memory += v; StorageManager.saveMemory(this.memory); } },
        memorySubtract() { const v = parseFloat(this.currentInput); if (!isNaN(v)) { this.memory -= v; StorageManager.saveMemory(this.memory); } },
        memoryClear() { this.memory = 0; StorageManager.saveMemory(0); },
        hasMemory() { return this.memory !== 0; },

        getFormattedDisplay() {
            if (this.currentInput === 'Error' || isNaN(Number(this.currentInput))) return this.currentInput;
            if (!this.useThousandsSeparator) return this.currentInput;
            const parts = this.currentInput.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return parts.join('.');
        },

        getFormattedExpression() { return this.expression.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7'); }
    };

    // ==========================================
    // 4. THEME MANAGER
    // ==========================================
    const THEME_PRESETS = [
        { id: 'midnight', name: 'Midnight', accent: '#a882ff', colors: ['#0a0a12', '#141420', '#a882ff'] },
        { id: 'aurora', name: 'Aurora', accent: '#4fd1c5', colors: ['#080d14', '#0f1928', '#4fd1c5'] },
        { id: 'ocean', name: 'Ocean', accent: '#38bdf8', colors: ['#060e18', '#0c1626', '#38bdf8'] },
        { id: 'arctic', name: 'Arctic', accent: '#67e8f9', colors: ['#0c1018', '#121824', '#67e8f9'] },
        { id: 'sunset', name: 'Sunset', accent: '#fb923c', colors: ['#100a08', '#1c120e', '#fb923c'] },
        { id: 'ember', name: 'Ember', accent: '#f87171', colors: ['#0e0606', '#190c0c', '#f87171'] },
        { id: 'cyber', name: 'Cyber', accent: '#60a5fa', colors: ['#060a10', '#0a121e', '#60a5fa'] },
        { id: 'minimal', name: 'Minimal', accent: '#a0a0a0', colors: ['#111111', '#1a1a1a', '#a0a0a0'] }
    ];

    const ACCENT_COLORS = {
        emerald: { main: '#4edea3', hover: '#10b981', rgb: '78 222 163', secondary: '#10b981', glow: 'rgba(78,222,163,0.2)', subtle: 'rgba(78,222,163,0.08)' },
        purple: { main: '#a855f7', hover: '#9333ea', rgb: '168 85 247', secondary: '#9333ea', glow: 'rgba(168,85,247,0.2)', subtle: 'rgba(168,85,247,0.08)' },
        blue: { main: '#3b82f6', hover: '#2563eb', rgb: '59 130 246', secondary: '#2563eb', glow: 'rgba(59,130,246,0.2)', subtle: 'rgba(59,130,246,0.08)' },
        cyan: { main: '#06b6d4', hover: '#0891b2', rgb: '6 182 212', secondary: '#0891b2', glow: 'rgba(6,182,212,0.2)', subtle: 'rgba(6,182,212,0.08)' },
        pink: { main: '#ec4899', hover: '#db2777', rgb: '236 72 153', secondary: '#db2777', glow: 'rgba(236,72,153,0.2)', subtle: 'rgba(236,72,153,0.08)' },
        orange: { main: '#f97316', hover: '#ea580c', rgb: '249 115 22', secondary: '#ea580c', glow: 'rgba(249,115,22,0.2)', subtle: 'rgba(249,115,22,0.08)' },
        red: { main: '#ef4444', hover: '#dc2626', rgb: '239 68 68', secondary: '#dc2626', glow: 'rgba(239,68,68,0.2)', subtle: 'rgba(239,68,68,0.08)' }
    };

    const ThemeManager = {
        currentTheme: 'midnight', currentAccent: 'emerald', listeners: [], appearanceMode: 'dark',
        _systemDark: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,

        init() {
            const settings = StorageManager.getSettings();
            this.currentAccent = settings.accentColor || StorageManager.getAccent();
            this.setAccent(this.currentAccent, false);
            this.setTheme(StorageManager.getTheme(), false);
            this.setAppearance(settings.appearanceMode || 'dark');
            document.documentElement.classList.toggle('reduce-motion', !!settings.reduceMotion);
            if (typeof window !== 'undefined' && window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    this._systemDark = e.matches;
                    if (this.appearanceMode === 'system') this._applyAppearance();
                });
            }
        },

        setTheme(id, save) {
            const v = THEME_PRESETS.some(t => t.id === id) ? id : 'midnight';
            this.currentTheme = v;
            document.documentElement.setAttribute('data-theme', v);
            this._applyAppearance();
            if (save !== false) StorageManager.saveTheme(v);
            this.listeners.forEach(fn => fn(v));
        },

        setAccent(color, save) {
            if (!ACCENT_COLORS[color]) color = 'emerald';
            this.currentAccent = color;
            const c = ACCENT_COLORS[color];
            const root = document.documentElement;
            root.style.setProperty('--gc-accent', c.main);
            root.style.setProperty('--gc-accent-hover', c.hover);
            root.style.setProperty('--gc-glow', c.glow);
            root.style.setProperty('--tw-accent', c.rgb);
            root.style.setProperty('--accent-primary', c.main);
            root.style.setProperty('--accent-secondary', c.secondary);
            root.style.setProperty('--accent-glow', c.glow);
            root.style.setProperty('--accent-subtle', c.subtle);
            document.querySelectorAll('[data-accent-select]').forEach(function(btn) {
                const isActive = btn.dataset.accentSelect === color;
                btn.style.setProperty('--tw-ring-color', isActive ? c.main : 'transparent');
                btn.style.boxShadow = isActive ? '0 0 0 2px ' + c.main + '80' : 'none';
            });
            if (save !== false) { StorageManager.saveAccent(color); SettingsManager.update({ accentColor: color }); }
        },

        setAppearance(mode) {
            this.appearanceMode = mode || 'dark';
            this._applyAppearance();
            SettingsManager.update({ appearanceMode: this.appearanceMode });
        },

        _applyAppearance() {
            let dark;
            if (this.appearanceMode === 'system') dark = this._systemDark;
            else dark = this.appearanceMode === 'dark';
            document.documentElement.classList.toggle('dark', dark);
        },

        getTheme() { return this.currentTheme; },
        onChange(fn) { this.listeners.push(fn); }
    };

    // ==========================================
    // 5. SETTINGS MANAGER
    // ==========================================
    let audioCtx = null;
    const SettingsManager = {
        settings: {},
        init() { this.settings = StorageManager.getSettings(); return this.settings; },
        get(k) { return this.settings[k]; },
        getAll() { return { ...this.settings }; },
        update(s) {
            this.settings = { ...this.settings, ...s };
            StorageManager.saveSettings(this.settings);
            return this.settings;
        },
        playClickSound() {
            if (!this.settings.soundEnabled) return;
            try {
                if (!audioCtx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (!AC) return; audioCtx = new AC();
                }
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.03);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.03);
            } catch (e) {}
        }
    };

    // ==========================================
    // 6. HISTORY MANAGER
    // ==========================================
    const HistoryManager = {
        history: [], onRecallCallback: null,
        init(onRecall) {
            this.history = StorageManager.getHistory();
            if (!Array.isArray(this.history)) this.history = [];
            this.onRecallCallback = onRecall;
            this.render();
        },
        addEntry(equation, result) {
            if (!SettingsManager.getAll().saveHistory) return;
            const now = new Date();
            this.history.unshift({
                id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                equation, result,
                timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                date: now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            });
            const max = SettingsManager.getAll().maxHistoryItems || 100;
            if (this.history.length > max) this.history = this.history.slice(0, max);
            StorageManager.saveHistory(this.history);
            this.render();
        },
        deleteEntry(id) { this.history = this.history.filter(i => i.id !== id); StorageManager.saveHistory(this.history); this.render(); },
        clearHistory() { this.history = []; StorageManager.saveHistory([]); this.render(); },
        render() {
            const el = document.getElementById('history-log-list');
            if (!el) return;
            if (this.history.length === 0) {
                el.innerHTML = '<div class="text-center text-on-surface-variant opacity-50 my-auto py-12 flex flex-col items-center gap-2"><span class="material-symbols-outlined text-3xl">history</span><span class="text-xs">No history yet</span></div>';
                return;
            }
            el.innerHTML = this.history.map(item =>
                '<div class="group relative p-3 rounded-lg bg-surface-container/50 border border-white/5 flex flex-col gap-1 hover:bg-surface-variant/40 transition-colors cursor-pointer" data-recall-id="' + item.id + '">' +
                '<div class="flex justify-between items-center text-xs text-on-surface-variant opacity-70">' +
                '<span class="truncate max-w-[180px]">' + escapeHtml(item.equation) + ' =</span>' +
                '<div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">' +
                '<button class="p-1 hover:text-primary transition-colors" data-copy="' + escapeHtml(item.result) + '" title="Copy"><span class="material-symbols-outlined text-sm">content_copy</span></button>' +
                '<button class="p-1 hover:text-red-400 transition-colors" data-delete-id="' + item.id + '" title="Delete"><span class="material-symbols-outlined text-sm">delete</span></button></div></div>' +
                '<div class="flex justify-between items-baseline">' +
                '<div class="text-[10px] opacity-40"><div>' + (item.timestamp || '') + '</div><div>' + (item.date || '') + '</div></div>' +
                '<span class="text-lg text-primary tracking-tight font-semibold">' + escapeHtml(item.result) + '</span></div></div>'
            ).join('');
            el.querySelectorAll('[data-recall-id]').forEach(div => {
                div.addEventListener('click', (e) => {
                    if (e.target.closest('[data-copy]') || e.target.closest('[data-delete-id]')) return;
                    const found = this.history.find(i => i.id === div.dataset.recallId);
                    if (found && this.onRecallCallback) this.onRecallCallback(found);
                });
            });
            el.querySelectorAll('[data-copy]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(btn.dataset.copy).then(() => {
                        const icon = btn.querySelector('.material-symbols-outlined');
                        if (icon) { icon.textContent = 'check'; setTimeout(() => icon.textContent = 'content_copy', 1500); }
                    }).catch(() => {});
                });
            });
            el.querySelectorAll('[data-delete-id]').forEach(btn => {
                btn.addEventListener('click', (e) => { e.stopPropagation(); this.deleteEntry(btn.dataset.deleteId); });
            });
        }
    };

    function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
    function genId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); }

    // ==========================================
    // 7. UNIT CONVERTER (16 categories)
    // ==========================================
    const UNIT_DATA = {
        length: { title: 'Length', units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, 'in': 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nm: 1852, um: 0.000001 } },
        weight: { title: 'Weight / Mass', units: { mg: 0.000001, g: 0.001, kg: 1, oz: 0.028349523125, lb: 0.45359237, st: 6.35029318, ton: 907.18474, t: 1000 } },
        temperature: { title: 'Temperature', units: { '\u00b0C': 'C', '\u00b0F': 'F', 'K': 'K' }, custom: true },
        area: { title: 'Area', units: { 'mm\u00b2': 0.000001, 'cm\u00b2': 0.0001, 'm\u00b2': 1, 'km\u00b2': 1000000, 'in\u00b2': 0.00064516, 'ft\u00b2': 0.09290304, acre: 4046.8564224, hectare: 10000 } },
        volume: { title: 'Volume', units: { mL: 0.001, L: 1, tsp: 0.00492892, tbsp: 0.0147868, cup: 0.24, pt: 0.473176, qt: 0.946353, gal: 3.78541, 'm\u00b3': 1000, 'cm\u00b3': 0.001 } },
        time: { title: 'Time', units: { ms: 0.001, s: 1, min: 60, hr: 3600, day: 86400, wk: 604800, month: 2629746, yr: 31556952 } },
        speed: { title: 'Speed', units: { 'm/s': 1, 'km/h': 0.277777778, mph: 0.44704, knots: 0.514444, 'ft/s': 0.3048 } },
        data: { title: 'Data Storage', units: { bit: 1, byte: 8, KB: 8192, MB: 8388608, GB: 8589934592, TB: 8796093022208, PB: 9007199254740992 } },
        pressure: { title: 'Pressure', units: { Pa: 1, kPa: 1000, bar: 100000, psi: 6894.757, atm: 101325, mmHg: 133.322 } },
        energy: { title: 'Energy', units: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3600000, BTU: 1055.06 } },
        power: { title: 'Power', units: { W: 1, kW: 1000, hp: 745.7, BTU_h: 0.29307107 } },
        angle: { title: 'Angle', units: { deg: 1, rad: 57.29577951, grad: 0.9, arcmin: 0.0166667, arcsec: 0.000277778 } },
        frequency: { title: 'Frequency', units: { Hz: 1, kHz: 1000, MHz: 1000000, GHz: 1000000000, RPM: 1 / 60 } },
        force: { title: 'Force', units: { N: 1, kN: 1000, lbf: 4.44822, kgf: 9.80665, dyn: 0.00001 } },
        torque: { title: 'Torque', units: { 'N\u00b7m': 1, 'lbf\u00b7ft': 1.35582, 'kgf\u00b7m': 9.80665, 'dyn\u00b7cm': 0.0000001 } },
        fuel: { title: 'Fuel Economy', units: { 'km/L': 1, 'L/100km': -1, 'mpg': 0.425144, 'mi/gal': 0.425144 }, custom: true }
    };

    const UnitConverter = {
        convert(cat, from, to, val) {
            const v = parseFloat(val);
            if (isNaN(v)) return '';
            const c = UNIT_DATA[cat];
            if (!c) return '';
            if (c.custom && cat === 'temperature') return this.convertTemp(from, to, v);
            if (c.custom && cat === 'fuel') return this.convertFuel(from, to, v);
            const f = c.units[from], t = c.units[to];
            if (f === undefined || t === undefined) return '';
            return this.fmt(v * f / t);
        },
        convertTemp(from, to, v) {
            let c = v;
            if (from === '\u00b0F') c = (v - 32) * 5 / 9;
            else if (from === 'K') c = v - 273.15;
            let r = c;
            if (to === '\u00b0F') r = c * 9 / 5 + 32;
            else if (to === 'K') r = c + 273.15;
            return this.fmt(r);
        },
        convertFuel(from, to, v) {
            if (v <= 0) return '';
            if (from === 'L/100km' && to === 'km/L') return this.fmt(100 / v);
            if (from === 'km/L' && to === 'L/100km') return this.fmt(100 / v);
            if (from === 'L/100km' && to === 'mpg') return this.fmt(235.215 / v);
            if (from === 'mpg' && to === 'L/100km') return this.fmt(235.215 / v);
            if (from === 'km/L' && to === 'mpg') return this.fmt(v * 2.35215);
            if (from === 'mpg' && to === 'km/L') return this.fmt(v / 2.35215);
            if (from === to) return this.fmt(v);
            return '';
        },
        fmt(n) {
            if (Math.abs(n) < 1e-6 && n !== 0) return n.toExponential(6);
            return (Math.round((n + Number.EPSILON) * 1000000) / 1000000).toString();
        }
    };

    // ==========================================
    // 8. CURRENCY SERVICE
    // ==========================================
    const CURRENCY_META = {
        INR: { sym: '\u20b9', name: 'Indian Rupee' }, USD: { sym: '$', name: 'US Dollar' },
        EUR: { sym: '\u20ac', name: 'Euro' }, GBP: { sym: '\u00a3', name: 'British Pound' },
        JPY: { sym: '\u00a5', name: 'Japanese Yen' }, CNY: { sym: '\u00a5', name: 'Chinese Yuan' },
        CAD: { sym: 'C$', name: 'Canadian Dollar' }, AUD: { sym: 'A$', name: 'Australian Dollar' },
        CHF: { sym: 'CHF', name: 'Swiss Franc' }, SGD: { sym: 'S$', name: 'Singapore Dollar' },
        AED: { sym: 'AED', name: 'UAE Dirham' }, SAR: { sym: 'SAR', name: 'Saudi Riyal' },
        KRW: { sym: '\u20a9', name: 'South Korean Won' }, BRL: { sym: 'R$', name: 'Brazilian Real' },
        RUB: { sym: '\u20bd', name: 'Russian Ruble' }, ZAR: { sym: 'R', name: 'South African Rand' },
        MXN: { sym: 'Mex$', name: 'Mexican Peso' }, NZD: { sym: 'NZ$', name: 'NZ Dollar' },
        SEK: { sym: 'kr', name: 'Swedish Krona' }, NOK: { sym: 'kr', name: 'Norwegian Krone' },
        TRY: { sym: '\u20ba', name: 'Turkish Lira' }, THB: { sym: '\u0e3f', name: 'Thai Baht' },
        IDR: { sym: 'Rp', name: 'Indonesian Rupiah' }, MYR: { sym: 'RM', name: 'Malaysian Ringgit' },
        PHP: { sym: '\u20b1', name: 'Philippine Peso' }, VND: { sym: '\u20ab', name: 'Vietnamese Dong' },
        EGP: { sym: 'E\u00a3', name: 'Egyptian Pound' }, PKR: { sym: 'Rs', name: 'Pakistani Rupee' },
        BDT: { sym: '\u09f3', name: 'Bangladeshi Taka' }, NGN: { sym: '\u20a6', name: 'Nigerian Naira' },
        ARS: { sym: '$', name: 'Argentine Peso' }, PLN: { sym: 'z\u0142', name: 'Polish Zloty' },
        CZK: { sym: 'K\u010d', name: 'Czech Koruna' }, ILS: { sym: '\u20aa', name: 'Israeli Shekel' },
        DKK: { sym: 'kr', name: 'Danish Krone' }, HUF: { sym: 'Ft', name: 'Hungarian Forint' },
        RON: { sym: 'lei', name: 'Romanian Leu' }, KWD: { sym: 'KD', name: 'Kuwaiti Dinar' },
        QAR: { sym: 'QR', name: 'Qatari Riyal' }, HKD: { sym: 'HK$', name: 'Hong Kong Dollar' },
        TWD: { sym: 'NT$', name: 'New Taiwan Dollar' }, KES: { sym: 'KSh', name: 'Kenyan Shilling' },
        GHS: { sym: 'GH\u20b5', name: 'Ghanaian Cedi' }, LKR: { sym: 'Rs', name: 'Sri Lankan Rupee' },
        NPR: { sym: 'Rs', name: 'Nepalese Rupee' }, ISK: { sym: 'kr', name: 'Icelandic Krona' },
        KZT: { sym: '\u20b8', name: 'Kazakh Tenge' }, UAH: { sym: '\u20b4', name: 'Ukrainian Hryvnia' },
        BGN: { sym: '\u043b\u0432', name: 'Bulgarian Lev' }, BAM: { sym: 'KM', name: 'Bosnia Mark' },
        JMD: { sym: 'J$', name: 'Jamaican Dollar' }, CRC: { sym: '\u20a1', name: 'Costa Rica Col\u00f3n' },
        UYU: { sym: '$U', name: 'Uruguayan Peso' }, DOP: { sym: 'RD$', name: 'Dominican Peso' },
        GTQ: { sym: 'Q', name: 'Guatemalan Quetzal' }, HNL: { sym: 'L', name: 'Honduran Lempira' },
        PYG: { sym: '\u20b2', name: 'Paraguayan Guaran\u00ed' }, BOB: { sym: 'Bs.', name: 'Bolivian Boliviano' },
        BZD: { sym: 'BZ$', name: 'Belize Dollar' }, SCR: { sym: 'SR', name: 'Seychellois Rupee' },
        MUR: { sym: 'Rs', name: 'Mauritian Rupee' }, FJD: { sym: 'FJ$', name: 'Fijian Dollar' },
        BIF: { sym: 'FBu', name: 'Burundian Franc' }, RWF: { sym: 'FRw', name: 'Rwandan Franc' },
        UGX: { sym: 'USh', name: 'Ugandan Shilling' }, TZS: { sym: 'TSh', name: 'Tanzanian Shilling' },
        ZMW: { sym: 'ZK', name: 'Zambian Kwacha' }, MZN: { sym: 'MT', name: 'Mozambican Metical' },
        XAF: { sym: 'FCFA', name: 'CFA Franc BEAC' }, XOF: { sym: 'CFA', name: 'CFA Franc BCEAO' },
        ANG: { sym: 'NA\u0192', name: 'Antillean Guilder' }, AWG: { sym: 'Afl.', name: 'Aruban Florin' },
        BBD: { sym: 'Bds$', name: 'Barbadian Dollar' }, BND: { sym: 'B$', name: 'Brunei Dollar' },
        BSD: { sym: 'B$', name: 'Bahamian Dollar' }, BYN: { sym: 'Br', name: 'Belarusian Ruble' },
        CUP: { sym: '$MN', name: 'Cuban Peso' }, ERN: { sym: 'Nfk', name: 'Eritrean Nakfa' },
        GMD: { sym: 'D', name: 'Gambian Dalasi' }, HTG: { sym: 'G', name: 'Haitian Gourde' },
        KMF: { sym: 'CF', name: 'Comorian Franc' }, LRD: { sym: 'L$', name: 'Liberian Dollar' },
        LYD: { sym: 'LD', name: 'Libyan Dinar' }, MDL: { sym: 'L', name: 'Moldovan Leu' },
        MKD: { sym: 'den', name: 'Macedonian Denar' }, MGA: { sym: 'Ar', name: 'Malagasy Ariary' },
        STN: { sym: 'Db', name: 'S\u00e3o Tom\u00e9 Dobra' }, TJS: { sym: 'SM', name: 'Tajikistani Somoni' },
        TMT: { sym: 'T', name: 'Turkmenistan Manat' }, TTD: { sym: 'TT$', name: 'Trinidad Dollar' },
        ZWL: { sym: 'Z$', name: 'Zimbabwean Dollar' },
        TND: { sym: 'DT', name: 'Tunisian Dinar' }, TOP: { sym: 'T$', name: 'Tongan Pa\'anga' },
        PGK: { sym: 'K', name: 'Papua New Guinean Kina' }, MNT: { sym: '\u20ae', name: 'Mongolian Tugrik' },
        MOP: { sym: 'MOP$', name: 'Macanese Pataca' }, MWK: { sym: 'MK', name: 'Malawian Kwacha' },
        SDG: { sym: 'SDG', name: 'Sudanese Pound' }, SOS: { sym: 'Sh', name: 'Somali Shilling' },
        SRD: { sym: '$', name: 'Surinamese Dollar' }, WST: { sym: 'WS$', name: 'Samoan Tala' },
        YER: { sym: 'YR', name: 'Yemeni Rial' }, CVE: { sym: '$', name: 'Cape Verdean Escudo' },
        DJF: { sym: 'Fdj', name: 'Djiboutian Franc' }, GNF: { sym: 'FG', name: 'Guinean Franc' },
        LAK: { sym: '\u20ad', name: 'Lao Kip' }, SLL: { sym: 'Le', name: 'Sierra Leonean Leone' },
        SSP: { sym: 'SSP', name: 'South Sudanese Pound' }, IMP: { sym: '\u00a3', name: 'Isle of Man Pound' },
        JEP: { sym: '\u00a3', name: 'Jersey Pound' }, GGP: { sym: '\u00a3', name: 'Guernsey Pound' },
        CDF: { sym: 'FC', name: 'Congolese Franc' }, MMK: { sym: 'K', name: 'Myanmar Kyat' },
        AFN: { sym: 'Af', name: 'Afghan Afghani' }, SYP: { sym: '\u00a3', name: 'Syrian Pound' },
        UZS: { sym: 'so\u02bbm', name: 'Uzbekistani Som' }, AZN: { sym: '\u20bc', name: 'Azerbaijani Manat' },
        GEL: { sym: '\u20be', name: 'Georgian Lari' }, AMD: { sym: '\u058f', name: 'Armenian Dram' },
        KGS: { sym: '\u0441', name: 'Kyrgyzstani Som' }, HTG: { sym: 'G', name: 'Haitian Gourde' },
        LBP: { sym: 'L\u00a3', name: 'Lebanese Pound' }, BHD: { sym: 'BD', name: 'Bahraini Dinar' },
        OMR: { sym: 'OMR', name: 'Omani Rial' }, JOD: { sym: 'JD', name: 'Jordanian Dinar' },
        MUR: { sym: 'Rs', name: 'Mauritian Rupee' }, SCR: { sym: 'SR', name: 'Seychellois Rupee' },
        SVC: { sym: '$', name: 'Salvadoran Colon' }, NIO: { sym: 'C$', name: 'Nicaraguan Cordoba' },
        PAB: { sym: 'B/.', name: 'Panamanian Balboa' }, GYD: { sym: 'G$', name: 'Guyanese Dollar' },
        BMD: { sym: '$', name: 'Bermudan Dollar' }, XPF: { sym: 'CFP', name: 'CFP Franc' },
        AWG: { sym: 'Afl.', name: 'Aruban Florin' }
    };
    const CURRENCY_CC = {
        INR:'India', USD:'USA', EUR:'Eurozone', GBP:'UK', JPY:'Japan', CNY:'China',
        CAD:'Canada', AUD:'Australia', CHF:'Switzerland', SGD:'Singapore', AED:'UAE', SAR:'Saudi Arabia',
        KRW:'South Korea', BRL:'Brazil', RUB:'Russia', ZAR:'South Africa', MXN:'Mexico', NZD:'New Zealand',
        SEK:'Sweden', NOK:'Norway', TRY:'Turkey', THB:'Thailand', IDR:'Indonesia', MYR:'Malaysia',
        PHP:'Philippines', VND:'Vietnam', EGP:'Egypt', PKR:'Pakistan', BDT:'Bangladesh', NGN:'Nigeria',
        ARS:'Argentina', PLN:'Poland', CZK:'Czech Republic', ILS:'Israel', DKK:'Denmark', HUF:'Hungary',
        RON:'Romania', KWD:'Kuwait', QAR:'Qatar', HKD:'Hong Kong', TWD:'Taiwan', KES:'Kenya',
        GHS:'Ghana', LKR:'Sri Lanka', NPR:'Nepal', ISK:'Iceland', KZT:'Kazakhstan', UAH:'Ukraine',
        BGN:'Bulgaria', BAM:'Bosnia', JMD:'Jamaica', CRC:'Costa Rica', UYU:'Uruguay', DOP:'Dominican Republic',
        GTQ:'Guatemala', HNL:'Honduras', PYG:'Paraguay', BOB:'Bolivia', BZD:'Belize', SCR:'Seychelles',
        MUR:'Mauritius', FJD:'Fiji', BIF:'Burundi', RWF:'Rwanda', UGX:'Uganda', TZS:'Tanzania',
        ZMW:'Zambia', MZN:'Mozambique', XAF:'Central Africa', XOF:'West Africa', ANG:'Curacao', AWG:'Aruba',
        BBD:'Barbados', BND:'Brunei', BSD:'Bahamas', BYN:'Belarus', CUP:'Cuba', ERN:'Eritrea',
        GMD:'Gambia', HTG:'Haiti', KMF:'Comoros', LRD:'Liberia', LYD:'Libya', MDL:'Moldova',
        MKD:'North Macedonia', MGA:'Madagascar', STN:'Sao Tome', TJS:'Tajikistan', TMT:'Turkmenistan',
        TTD:'Trinidad', ZWL:'Zimbabwe', TND:'Tunisia', TOP:'Tonga', PGK:'Papua New Guinea',
        MNT:'Mongolia', MOP:'Macao', MWK:'Malawi', SDG:'Sudan', SOS:'Somalia', SRD:'Suriname',
        WST:'Samoa', YER:'Yemen', CVE:'Cape Verde', DJF:'Djibouti', GNF:'Guinea', LAK:'Laos',
        SLL:'Sierra Leone', SSP:'South Sudan', CDF:'DR Congo', MMK:'Myanmar', AFN:'Afghanistan',
        SYP:'Syria', UZS:'Uzbekistan', AZN:'Azerbaijan', GEL:'Georgia', AMD:'Armenia',
        KGS:'Kyrgyzstan', LBP:'Lebanon', BHD:'Bahrain', OMR:'Oman', JOD:'Jordan',
        SVC:'El Salvador', NIO:'Nicaragua', PAB:'Panama', GYD:'Guyana', BMD:'Bermuda',
        XPF:'French Polynesia', IMP:'Isle of Man', JEP:'Jersey', GGP:'Guernsey'
    };

    const FALLBACK_RATES = {
        USD: 1.0, EUR: 0.91, GBP: 0.78, INR: 83.5, JPY: 155.0, CNY: 7.23,
        AUD: 1.50, CAD: 1.36, CHF: 0.90, SGD: 1.35, AED: 3.67, SAR: 3.75,
        KRW: 1360.0, BRL: 5.5, RUB: 90.0, ZAR: 18.2, MXN: 18.8, NZD: 1.65
    };

    const CurrencyService = {
        rates: { ...FALLBACK_RATES }, allCodes: Object.keys(FALLBACK_RATES).sort(),
        lastUpdated: null, status: 'fallback', listeners: [], refreshTimer: null,

        async init() {
            const cached = StorageManager.get(STORAGE_KEYS.CURRENCY_CACHE, null);
            if (cached && cached.timestamp && (Date.now() - cached.timestamp < 3600000)) {
                this.rates = { ...FALLBACK_RATES, ...cached.rates };
                this.allCodes = Object.keys(this.rates).sort();
                this.lastUpdated = new Date(cached.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                this.status = 'cached';
            }
            await this.fetchRates();
            this.refreshTimer = setInterval(() => this.fetchRates(), 300000);
        },
        async fetchRates() {
            try {
                const res = await fetch('https://open.er-api.com/v6/latest/USD');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                if (data && data.rates) {
                    this.rates = { ...FALLBACK_RATES, ...data.rates };
                    this.allCodes = Object.keys(this.rates).sort();
                    this.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    this.status = 'live';
                    StorageManager.set(STORAGE_KEYS.CURRENCY_CACHE, { timestamp: Date.now(), rates: data.rates });
                    this.notify();
                    return true;
                }
            } catch (e) {
                if (!this.lastUpdated) { this.lastUpdated = 'Offline'; this.status = 'fallback'; }
            }
            return false;
        },
        onUpdate(fn) { this.listeners.push(fn); },
        notify() { this.listeners.forEach(fn => fn()); },
        getLabel(code) { const m = CURRENCY_META[code]; const cc = CURRENCY_CC[code] || ''; if (m) return (cc ? cc + ' ' : '') + code + ' - ' + m.name + ' (' + m.sym + ')'; const nice = code.replace(/([A-Z])/g, ' $1').trim(); return cc ? cc + ' ' + code + ' - ' + nice : code + ' - ' + nice; },
        getSymbol(code) { return (CURRENCY_META[code] && CURRENCY_META[code].sym) || ''; },
        convert(amount, from, to) {
            const v = parseFloat(amount);
            if (isNaN(v)) return '';
            const f = this.rates[from] || 1, t = this.rates[to] || 1;
            return Math.round((v / f * t + Number.EPSILON) * 100) / 100;
        }
    };

    // ==========================================
    // 9. PERCENTAGE TOOLS
    // ==========================================
    const PercentageTools = {
        percentOf(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : ((a / 100) * b).toString(); },
        percentChange(v1, v2) {
            const a = parseFloat(v1), b = parseFloat(v2);
            if (isNaN(a) || isNaN(b) || a === 0) return '';
            return (Math.round(((b - a) / Math.abs(a)) * 10000) / 100) + '%';
        },
        increase(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : (b * (1 + a / 100)).toString(); },
        decrease(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : (b * (1 - a / 100)).toString(); },
        discount(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : (b * (1 - a / 100)).toString(); },
        tax(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : (b * (1 + a / 100)).toString(); },
        margin(s, c) { const sv = parseFloat(s), cv = parseFloat(c); if (isNaN(sv) || isNaN(cv) || sv === 0) return ''; return ((sv - cv) / sv * 100).toFixed(2) + '%'; },
        markup(c, m) { const cv = parseFloat(c), mv = parseFloat(m); return (isNaN(cv) || isNaN(mv)) ? '' : (cv * (1 + mv / 100)).toString(); },
        tip(p, t) { const a = parseFloat(p), b = parseFloat(t); return (isNaN(a) || isNaN(b)) ? '' : (b * a / 100).toString(); }
    };

    // ==========================================
    // 10. DATE/TIME TOOLS
    // ==========================================
    const DateTimeTools = {
        diff(d1, d2) {
            if (!d1 || !d2) return '';
            const a = new Date(d1), b = new Date(d2);
            if (isNaN(a) || isNaN(b)) return 'Invalid Date';
            const diff = Math.abs(b - a), days = Math.ceil(diff / 86400000);
            const w = Math.floor(days / 7), d = days % 7;
            return w > 0 ? days + ' days (' + w + ' wk ' + d + ' d)' : days + ' days';
        },
        addDays(ds, n) { const d = new Date(ds); d.setDate(d.getDate() + n); return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); },
        addWeeks(ds, n) { return this.addDays(ds, n * 7); },
        addMonths(ds, n) { const d = new Date(ds); d.setMonth(d.getMonth() + n); return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); },
        daysUntil(ds) { const d = new Date(ds), now = new Date(); return Math.ceil((d - now) / 86400000); },
        ageCalc(birthDate) {
            if (!birthDate) return '';
            const b = new Date(birthDate), now = new Date();
            if (isNaN(b) || b > now) return 'Invalid Date';
            let years = now.getFullYear() - b.getFullYear();
            let months = now.getMonth() - b.getMonth();
            let days = now.getDate() - b.getDate();
            if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
            if (months < 0) { years--; months += 12; }
            return years + 'y ' + months + 'm ' + days + 'd';
        },
        businessDays(d1, d2) {
            if (!d1 || !d2) return '';
            let a = new Date(d1), b = new Date(d2);
            if (isNaN(a) || isNaN(b)) return 'Invalid Date';
            if (a > b) { const t = a; a = b; b = t; }
            let count = 0;
            while (a <= b) { const dow = a.getDay(); if (dow !== 0 && dow !== 6) count++; a.setDate(a.getDate() + 1); }
            return count + ' business days';
        },
        unixToDate(ts) {
            const n = parseInt(ts);
            if (isNaN(n)) return 'Invalid';
            const d = new Date(n > 1e11 ? n : n * 1000);
            return d.toLocaleString();
        },
        dateToUnix(ds) { return Math.floor(new Date(ds).getTime() / 1000); }
    };

    // ==========================================
    // 11. WEATHER SERVICE
    // ==========================================
    const WeatherService = {
        currentData: null, lastCity: null, lastCoords: null,

        async autoDetect() {
            const cached = StorageManager.getLastLocation();
            if (cached && cached.lat && cached.lon && cached.label) {
                this.lastCoords = { lat: cached.lat, lon: cached.lon, label: cached.label };
                try { return await this.getWeather(cached.lat, cached.lon, cached.label, cached.timezone); } catch (e) {}
            }
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((res, rej) => {
                        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
                    });
                    if (pos && pos.coords) {
                        const { latitude: lat, longitude: lon, accuracy } = pos.coords;
                        try {
                            const r = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=en');
                            if (r.ok) {
                                const d = await r.json();
                                const city = d.city || d.locality || '';
                                const state = d.principalSubdivision || '';
                                const country = d.countryName || '';
                                const label = city ? city + ', ' + (state ? state + ', ' : '') + country : (state ? state + ', ' + country : country);
                                const loc = { lat, lon, label, city, state, country, countryCode: d.countryCode || '', timezone: '', accuracy: Math.round(accuracy || 0) };
                                StorageManager.saveLastLocation(loc);
                                return await this.getWeather(lat, lon, label || 'Current Location');
                            }
                        } catch (e) {}
                        const fallbackLoc = { lat, lon, label: 'Current Location', city: '', state: '', country: '', countryCode: '', timezone: '', accuracy: Math.round(accuracy || 0) };
                        StorageManager.saveLastLocation(fallbackLoc);
                        return await this.getWeather(lat, lon, 'Current Location');
                    }
                } catch (e) {}
            }
            return await this.getWeatherByCity('London');
        },

        async searchLocations(q) {
            if (!q || q.trim().length < 2) return [];
            try {
                const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=10&language=en&format=json');
                if (!r.ok) return [];
                const d = await r.json();
                return (d.results || []).map(x => ({
                    lat: x.latitude, lon: x.longitude,
                    name: x.name, admin: x.admin1 || '', country: x.country || '',
                    timezone: x.timezone || '',
                    label: x.name + ', ' + (x.admin1 ? x.admin1 + ', ' : '') + (x.country || '')
                }));
            } catch (e) { return []; }
        },

        async getWeatherByCity(city) {
            this.lastCity = city; this.lastCoords = null;
            const locs = await this.searchLocations(city);
            if (locs.length === 0) throw new Error('City "' + city + '" not found');
            return await this.getWeather(locs[0].lat, locs[0].lon, locs[0].label, locs[0].timezone);
        },

        async getWeather(lat, lon, label, tz) {
            this.lastCoords = { lat: lat, lon: lon, label: label };
            const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
                '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility' +
                '&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,sunrise,sunset' +
                '&hourly=temperature_2m,weather_code,precipitation_probability' +
                '&forecast_days=3&wind_speed_unit=kmh&temperature_unit=celsius&timezone=' + encodeURIComponent(tz || 'auto');
            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather fetch failed');
            const data = await res.json();
            const c = data.current || {}, d = data.daily || {};

            this.currentData = {
                location: label,
                timezone: data.timezone || 'Local',
                tempC: c.temperature_2m != null ? c.temperature_2m.toFixed(1) : 'N/A',
                tempF: c.temperature_2m != null ? ((c.temperature_2m * 9 / 5) + 32).toFixed(1) : 'N/A',
                feelsLikeC: c.apparent_temperature != null ? c.apparent_temperature.toFixed(1) : 'N/A',
                feelsLikeF: c.apparent_temperature != null ? ((c.apparent_temperature * 9 / 5) + 32).toFixed(1) : 'N/A',
                humidity: c.relative_humidity_2m != null ? c.relative_humidity_2m : 0,
                precipitation: c.precipitation || 0,
                windSpeed: c.wind_speed_10m != null ? c.wind_speed_10m.toFixed(1) : '0',
                windDir: c.wind_direction_10m || 0,
                cloudCover: c.cloud_cover || 0,
                pressure: c.pressure_msl ? Math.round(c.pressure_msl) : Math.round(c.surface_pressure || 0),
                visibility: c.visibility != null ? (c.visibility / 1000).toFixed(1) : 'N/A',
                weatherCode: c.weather_code || 0,
                condition: this.condition(c.weather_code || 0),
                icon: this.icon(c.weather_code || 0),
                isDay: c.is_day === 1,
                highC: d.temperature_2m_max ? Math.round(d.temperature_2m_max[0]) : Math.round(c.temperature_2m || 0),
                lowC: d.temperature_2m_min ? Math.round(d.temperature_2m_min[0]) : Math.round(c.temperature_2m || 0),
                uvIndex: d.uv_index_max ? d.uv_index_max[0] : 'N/A',
                sunrise: d.sunrise && d.sunrise[0] ? d.sunrise[0].split('T')[1] : 'N/A',
                sunset: d.sunset && d.sunset[0] ? d.sunset[0].split('T')[1] : 'N/A',
                hourly: data.hourly && data.hourly.time ? {
                    times: data.hourly.time.slice(0, 24),
                    temps: data.hourly.temperature_2m ? data.hourly.temperature_2m.slice(0, 24) : [],
                    codes: data.hourly.weather_code ? data.hourly.weather_code.slice(0, 24) : [],
                    precip: data.hourly.precipitation_probability ? data.hourly.precipitation_probability.slice(0, 24) : []
                } : null,
                daily: d.time ? d.time.map((t, i) => ({
                    date: t, high: Math.round(d.temperature_2m_max ? d.temperature_2m_max[i] : 0),
                    low: Math.round(d.temperature_2m_min ? d.temperature_2m_min[i] : 0),
                    code: d.weather_code ? d.weather_code[i] : 0,
                    icon: this.icon(d.weather_code ? d.weather_code[i] : 0),
                    condition: this.condition(d.weather_code ? d.weather_code[i] : 0)
                })) : null,
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            return this.currentData;
        },

        condition(code) {
            if (code === 0) return 'Clear Sky';
            if ([1, 2, 3].includes(code)) return 'Partly Cloudy';
            if ([45, 48].includes(code)) return 'Foggy';
            if ([51, 53, 55].includes(code)) return 'Drizzle';
            if ([61, 63, 65].includes(code)) return 'Rain';
            if ([71, 73, 75].includes(code)) return 'Snow';
            if ([80, 81, 82].includes(code)) return 'Rain Showers';
            if ([85, 86].includes(code)) return 'Snow Showers';
            if ([95, 96, 99].includes(code)) return 'Thunderstorm';
            return 'Cloudy';
        },
        icon(code) {
            if (code === 0) return 'wb_sunny';
            if ([1, 2, 3].includes(code)) return 'partly_cloudy_day';
            if ([45, 48].includes(code)) return 'foggy';
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
            if ([71, 73, 75, 85, 86].includes(code)) return 'ac_unit';
            if ([95, 96, 99].includes(code)) return 'thunderstorm';
            return 'cloud';
        }
    };

    // ==========================================
    // 12. LIVE CLOCK
    // ==========================================
    const LiveClock = {
        interval: null, format24: true,
        init() { this.format24 = (SettingsManager.get('clockFormat') || '24h') === '24h'; this.start(); },
        start() { this.update(); this.interval = setInterval(() => this.update(), 1000); },
        update() {
            const now = new Date();
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
            const hOpts = this.format24
                ? { hour: '2-digit', minute: '2-digit' }
                : { hour: '2-digit', minute: '2-digit', hour12: true };
            const sec = ':' + String(now.getSeconds()).padStart(2, '0');
            document.querySelectorAll('.live-clock').forEach(el => el.textContent = now.toLocaleTimeString([], hOpts));
            const secEl = document.getElementById('live-seconds');
            if (secEl) secEl.textContent = sec;
            document.querySelectorAll('.live-tz').forEach(el => el.textContent = tz);
            document.querySelectorAll('.live-date').forEach(el => el.textContent = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        },
        toggleFormat() {
            this.format24 = !this.format24;
            SettingsManager.update({ clockFormat: this.format24 ? '24h' : '12h' });
            this.update();
        }
    };

    // ==========================================
    // 13. WORLD CLOCK MANAGER
    // ==========================================
    const WorldClockManager = {
        clocks: [], init() { this.clocks = StorageManager.getWorldClocks(); this.render(); },
        add(tz) { if (this.clocks.includes(tz)) return; this.clocks.push(tz); StorageManager.saveWorldClocks(this.clocks); this.render(); },
        remove(tz) { this.clocks = this.clocks.filter(c => c !== tz); StorageManager.saveWorldClocks(this.clocks); this.render(); },
        render() {
            const el = document.getElementById('world-clocks-list');
            if (!el) return;
            if (this.clocks.length === 0) {
                el.innerHTML = '<div class="text-center text-on-surface-variant opacity-50 py-6 text-xs">No world clocks added. Use the input below to add cities.</div>';
                return;
            }
            el.innerHTML = this.clocks.map(tz => {
                const now = new Date();
                const time = now.toLocaleTimeString([], { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                const date = now.toLocaleDateString([], { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
                const city = tz.split('/').pop().replace(/_/g, ' ');
                return '<div class="flex justify-between items-center p-3 rounded-xl bg-surface-container/40 border border-white/5">' +
                    '<div><div class="text-sm font-semibold text-on-surface">' + escapeHtml(city) + '</div>' +
                    '<div class="text-[10px] text-on-surface-variant">' + escapeHtml(tz) + ' &bull; ' + date + '</div></div>' +
                    '<div class="flex items-center gap-2"><span class="font-mono text-lg font-bold text-primary">' + time + '</span>' +
                    '<button class="p-1 text-on-surface-variant hover:text-red-400 transition-colors" data-remove-wc="' + escapeHtml(tz) + '" title="Remove"><span class="material-symbols-outlined text-sm">close</span></button></div></div>';
            }).join('');
            el.querySelectorAll('[data-remove-wc]').forEach(btn => {
                btn.addEventListener('click', () => { this.remove(btn.dataset.removeWc); UIController.showToast('Clock removed'); });
            });
        }
    };

    // ==========================================
    // 14. STOPWATCH (SEPARATE START/STOP/RESUME/LAP/RESET)
    // ==========================================
    const Stopwatch = {
        running: false, paused: false, startTime: 0, elapsedAtPause: 0, elapsed: 0,
        rafId: null, laps: [], lastLapTime: 0,

        start() {
            if (this.running) return;
            this.running = true; this.paused = false;
            this.startTime = performance.now() - this.elapsedAtPause;
            this.tick();
        },
        stop() {
            if (!this.running) return;
            this.running = false; this.paused = true;
            this.elapsed = performance.now() - this.startTime;
            this.elapsedAtPause = this.elapsed;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.render();
        },
        resume() {
            if (!this.paused) return;
            this.running = true; this.paused = false;
            this.startTime = performance.now() - this.elapsedAtPause;
            this.tick();
        },
        reset() {
            this.running = false; this.paused = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.elapsedAtPause = 0; this.elapsed = 0;
            this.laps = []; this.lastLapTime = 0;
            this.render();
        },
        lap() {
            if (!this.running) return;
            const ct = this.elapsed;
            this.laps.unshift({ num: this.laps.length + 1, lapTime: ct - this.lastLapTime, totalTime: ct });
            this.lastLapTime = ct;
            this.render();
        },
        tick() {
            if (!this.running) return;
            this.elapsed = performance.now() - this.startTime;
            this.render();
            this.rafId = requestAnimationFrame(() => this.tick());
        },
        formatTime(ms) {
            const totalSec = Math.floor(ms / 1000);
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            const centis = Math.floor((ms % 1000) / 10);
            return (hrs > 0 ? String(hrs).padStart(2, '0') + ':' : '') +
                String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + '.' + String(centis).padStart(2, '0');
        },
        render() {
            const timeEl = document.getElementById('stopwatch-time');
            if (timeEl) timeEl.textContent = this.formatTime(this.elapsed);
            const stateEl = document.getElementById('stopwatch-state');
            if (stateEl) stateEl.textContent = this.running ? 'Running' : (this.paused ? 'Paused' : 'Ready');
            const lapList = document.getElementById('stopwatch-laps');
            if (lapList) {
                if (this.laps.length === 0) { lapList.innerHTML = ''; }
                else {
                    lapList.innerHTML = this.laps.map(l =>
                        '<div class="flex justify-between text-xs py-1.5 border-b border-white/5"><span class="text-on-surface-variant">Lap ' + l.num + '</span>' +
                        '<span class="text-primary font-mono">' + this.formatTime(l.lapTime) + '</span>' +
                        '<span class="text-on-surface-variant font-mono">' + this.formatTime(l.totalTime) + '</span></div>'
                    ).join('');
                }
            }
            var swStart = document.getElementById('sw-start');
            var swStop = document.getElementById('sw-stop');
            var swResume = document.getElementById('sw-resume');
            var swLap = document.getElementById('sw-lap');
            var swReset = document.getElementById('sw-reset');
            if (swStart) swStart.style.display = (!this.running && !this.paused) ? '' : 'none';
            if (swStop) swStop.style.display = this.running ? '' : 'none';
            if (swResume) swResume.style.display = this.paused ? '' : 'none';
            if (swLap) swLap.style.display = this.running ? '' : 'none';
            if (swReset) swReset.style.display = this.paused ? '' : 'none';
        }
    };

    // ==========================================
    // 15. TIMER (TIMESTAMP-BASED)
    // ==========================================
    const Timer = {
        totalMs: 0, remainingMs: 0, running: false, paused: false,
        targetTimestamp: 0, rafId: null,

        set(h, m, s) {
            this.totalMs = ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 1000;
            this.remainingMs = this.totalMs;
            this.render();
        },
        start() {
            if (this.running || this.totalMs <= 0) return;
            if (this.remainingMs <= 0) this.remainingMs = this.totalMs;
            this.targetTimestamp = Date.now() + this.remainingMs;
            this.running = true; this.paused = false;
            this.tick();
        },
        tick() {
            if (!this.running) return;
            this.remainingMs = this.targetTimestamp - Date.now();
            if (this.remainingMs <= 0) {
                this.remainingMs = 0; this.running = false;
                this.render(); this.onComplete(); return;
            }
            this.render();
            this.rafId = requestAnimationFrame(() => this.tick());
        },
        pause() {
            if (!this.running) return;
            this.remainingMs = this.targetTimestamp - Date.now();
            this.running = false; this.paused = true;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.render();
        },
        resume() {
            if (!this.paused || this.remainingMs <= 0) return;
            this.targetTimestamp = Date.now() + this.remainingMs;
            this.running = true; this.paused = false;
            this.tick();
        },
        reset() {
            this.running = false; this.paused = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = null;
            this.totalMs = 0; this.remainingMs = 0;
            this.render();
        },
        onComplete() {
            try {
                const ac = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ac.createOscillator(), gain = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ac.currentTime);
                osc.frequency.setValueAtTime(660, ac.currentTime + 0.2);
                osc.frequency.setValueAtTime(880, ac.currentTime + 0.4);
                gain.gain.setValueAtTime(0.3, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);
                osc.connect(gain); gain.connect(ac.destination);
                osc.start(); osc.stop(ac.currentTime + 0.8);
            } catch (e) {}
            UIController.showToast('Timer complete!');
        },
        formatMs(ms) {
            if (ms <= 0) return '00:00:00';
            const ts = Math.ceil(ms / 1000);
            const h = Math.floor(ts / 3600);
            const m = Math.floor((ts % 3600) / 60);
            const s = ts % 60;
            return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        },
        render() {
            var el = document.getElementById('timer-display');
            if (el) el.textContent = this.formatMs(this.remainingMs);
            var pct = this.totalMs > 0 ? (this.remainingMs / this.totalMs) * 100 : 0;
            var bar = document.getElementById('timer-progress');
            if (bar) bar.style.width = pct + '%';
            var stateEl = document.getElementById('timer-state');
            if (stateEl) {
                if (this.running) stateEl.textContent = 'Running';
                else if (this.paused) stateEl.textContent = 'Paused';
                else if (this.totalMs > 0 && this.remainingMs <= 0) stateEl.textContent = 'Finished';
                else stateEl.textContent = 'Ready';
            }
            var tStart = document.getElementById('timer-start');
            var tPause = document.getElementById('timer-pause');
            var tResume = document.getElementById('timer-resume');
            var tReset = document.getElementById('timer-reset');
            if (tStart) tStart.style.display = (!this.running && !this.paused) ? '' : 'none';
            if (tPause) tPause.style.display = this.running ? '' : 'none';
            if (tResume) tResume.style.display = this.paused ? '' : 'none';
            if (tReset) tReset.style.display = (this.paused || (this.totalMs > 0 && this.remainingMs <= 0)) ? '' : 'none';
        }
    };

    // ==========================================
    // 16. RINGTONE MANAGER (IndexedDB)
    // ==========================================
    const BUILT_IN_RINGTONE_NAMES = ['default', 'digital', 'bell', 'soft', 'classic', 'chime'];
    let _ringtoneIntervalId = null;

    function _getAlarmAudioCtx() {
        if (!audioCtx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            audioCtx = new AC();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function _playBuiltInToneOnce(type) {
        var ac = _getAlarmAudioCtx();
        if (!ac) return [];
        var nodes = [];
        var t = ac.currentTime;
        switch (type) {
            case 'digital': {
                var osc = ac.createOscillator(), g = ac.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(1000, t);
                g.gain.setValueAtTime(0.15, t);
                g.gain.setValueAtTime(0, t + 0.1);
                g.gain.setValueAtTime(0.15, t + 0.2);
                g.gain.setValueAtTime(0, t + 0.3);
                g.gain.setValueAtTime(0.15, t + 0.4);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.connect(g); g.connect(ac.destination);
                osc.start(t); osc.stop(t + 0.8); nodes.push(osc);
                break;
            }
            case 'bell': {
                [880, 1320, 1760].forEach(function(freq, i) {
                    var osc = ac.createOscillator(), g = ac.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);
                    g.gain.setValueAtTime(0.12 / (i + 1), t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                    osc.connect(g); g.connect(ac.destination);
                    osc.start(t); osc.stop(t + 1.5); nodes.push(osc);
                });
                break;
            }
            case 'soft': {
                var osc = ac.createOscillator(), g = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, t);
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                osc.connect(g); g.connect(ac.destination);
                osc.start(t); osc.stop(t + 1.5); nodes.push(osc);
                break;
            }
            case 'classic': {
                [523, 659, 784, 1047].forEach(function(freq, i) {
                    var osc = ac.createOscillator(), g = ac.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t + i * 0.2);
                    g.gain.setValueAtTime(0.2, t + i * 0.2);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.3);
                    osc.connect(g); g.connect(ac.destination);
                    osc.start(t + i * 0.2); osc.stop(t + i * 0.2 + 0.3); nodes.push(osc);
                });
                break;
            }
            case 'chime': {
                var osc = ac.createOscillator(), g = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1568, t);
                g.gain.setValueAtTime(0.2, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
                osc.connect(g); g.connect(ac.destination);
                osc.start(t); osc.stop(t + 1.2); nodes.push(osc);
                break;
            }
            default: {
                var osc = ac.createOscillator(), g = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, t);
                osc.frequency.exponentialRampToValueAtTime(1100, t + 0.3);
                osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);
                g.gain.setValueAtTime(0.25, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
                osc.connect(g); g.connect(ac.destination);
                osc.start(t); osc.stop(t + 1.0); nodes.push(osc);
                break;
            }
        }
        return nodes;
    }

    const RingtoneManager = {
        db: null,

        async openDB() {
            return new Promise(function(resolve, reject) {
                if (!window.indexedDB) { reject(new Error('IndexedDB not supported')); return; }
                var req = indexedDB.open('ringtone_db', 1);
                req.onupgradeneeded = function(e) {
                    var db = e.target.result;
                    if (!db.objectStoreNames.contains('ringtones')) {
                        db.createObjectStore('ringtones', { keyPath: 'id', autoIncrement: true });
                    }
                };
                req.onsuccess = function(e) { RingtoneManager.db = e.target.result; resolve(RingtoneManager.db); };
                req.onerror = function() { reject(new Error('IndexedDB open failed')); };
            });
        },

        async saveRingtone(name, type, data) {
            try {
                var db = this.db || await this.openDB();
                return new Promise(function(resolve, reject) {
                    var tx = db.transaction('ringtones', 'readwrite');
                    var store = tx.objectStore('ringtones');
                    var item = { name: name, type: type, data: data, createdAt: Date.now() };
                    var req = store.add(item);
                    req.onsuccess = function() { resolve(req.result); };
                    req.onerror = function() { reject(new Error('Save failed')); };
                });
            } catch (e) { return null; }
        },

        async getRingtones() {
            try {
                var db = this.db || await this.openDB();
                return new Promise(function(resolve) {
                    var tx = db.transaction('ringtones', 'readonly');
                    var req = tx.objectStore('ringtones').getAll();
                    req.onsuccess = function() { resolve(req.result || []); };
                    req.onerror = function() { resolve([]); };
                });
            } catch (e) { return []; }
        },

        async deleteRingtone(id) {
            try {
                var db = this.db || await this.openDB();
                return new Promise(function(resolve) {
                    var tx = db.transaction('ringtones', 'readwrite');
                    tx.objectStore('ringtones').delete(id);
                    tx.oncomplete = function() { resolve(true); };
                    tx.onerror = function() { resolve(false); };
                });
            } catch (e) { return false; }
        },

        async getRingtoneById(id) {
            try {
                var db = this.db || await this.openDB();
                return new Promise(function(resolve) {
                    var tx = db.transaction('ringtones', 'readonly');
                    var req = tx.objectStore('ringtones').get(id);
                    req.onsuccess = function() { resolve(req.result || null); };
                    req.onerror = function() { resolve(null); };
                });
            } catch (e) { return null; }
        }
    };

    function playRingtoneLoop(type) {
        stopRingtone();
        var isBuiltIn = BUILT_IN_RINGTONE_NAMES.indexOf(type) >= 0;
        if (isBuiltIn) {
            _playBuiltInToneOnce(type);
            _ringtoneIntervalId = setInterval(function() { _playBuiltInToneOnce(type); }, 1500);
        } else {
            RingtoneManager.getRingtoneById(parseInt(type)).then(function(item) {
                if (!item || !item.data) return;
                var ac = _getAlarmAudioCtx();
                if (!ac) return;
                ac.decodeAudioData(item.data.slice(0)).then(function(buffer) {
                    var source = ac.createBufferSource();
                    source.buffer = buffer;
                    source.connect(ac.destination);
                    source.loop = true;
                    source.start();
                    _ringtoneIntervalId = setInterval(function() {
                        try { source.stop(); } catch(e) {}
                    }, (buffer.duration + 0.1) * 1000);
                }).catch(function() {});
            }).catch(function() {});
        }
    }

    function stopRingtone() {
        if (_ringtoneIntervalId) { clearInterval(_ringtoneIntervalId); _ringtoneIntervalId = null; }
    }

    function playShortSound() {
        var ac = _getAlarmAudioCtx();
        if (!ac) return;
        var osc = ac.createOscillator(), g = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.15);
        g.gain.setValueAtTime(0.15, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
        osc.connect(g); g.connect(ac.destination);
        osc.start(); osc.stop(ac.currentTime + 0.15);
    }

    // ==========================================
    // 17. ALARM MANAGER
    // ==========================================
    const AlarmManager = {
        alarms: [], checkInterval: null,

        init() {
            this.alarms = StorageManager.getAlarms();
            this.render();
            this.checkInterval = setInterval(function() { AlarmManager.checkAlarms(); }, 1000);
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        },

        add(alarm) {
            alarm.id = genId('a');
            alarm.enabled = true;
            alarm._fired = false;
            alarm.ringtone = alarm.ringtone || SettingsManager.get('defaultAlarmRingtone') || 'default';
            alarm.repeat = alarm.repeat || 'once';
            this.alarms.push(alarm);
            StorageManager.saveAlarms(this.alarms);
            this.render();
        },

        toggle(id) {
            var a = this.alarms.find(function(x) { return x.id === id; });
            if (a) { a.enabled = !a.enabled; StorageManager.saveAlarms(this.alarms); this.render(); }
        },

        remove(id) {
            this.alarms = this.alarms.filter(function(a) { return a.id !== id; });
            StorageManager.saveAlarms(this.alarms);
            this.render();
        },

        duplicate(id) {
            var a = this.alarms.find(function(x) { return x.id === id; });
            if (!a) return;
            var copy = { hour: a.hour, minute: a.minute, label: (a.label || '') + ' (copy)', repeat: a.repeat, ringtone: a.ringtone };
            this.add(copy);
        },

        checkAlarms() {
            var now = new Date();
            var h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), dow = now.getDay();
            var changed = false;
            this.alarms.forEach(function(a) {
                if (!a.enabled || a._fired) return;
                if (a.hour === h && a.minute === m && s < 2) {
                    if (a.repeat === 'weekdays' && (dow === 0 || dow === 6)) return;
                    a._fired = true;
                    AlarmManager.fireAlarm(a);
                    if (a.repeat === 'once') { a.enabled = false; changed = true; }
                }
                if (s > 5) a._fired = false;
            });
            if (changed) StorageManager.saveAlarms(this.alarms);
        },

        fireAlarm(a) {
            var timeStr = formatAlarmTime(a.hour, a.minute);
            UIController.showToast('Alarm: ' + (a.label || timeStr));
            if ('Notification' in window && Notification.permission === 'granted') {
                try { new Notification('Alarm', { body: a.label || 'Alarm at ' + timeStr }); } catch (e) {}
            }
            playRingtoneLoop(a.ringtone || 'default');
            var modal = document.getElementById('alarm-ringing-modal');
            if (modal) {
                var timeEl = document.getElementById('alarm-ringing-time');
                var labelEl = document.getElementById('alarm-ringing-label');
                if (timeEl) timeEl.textContent = timeStr;
                if (labelEl) labelEl.textContent = a.label || '';
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
                modal._alarmData = a;
            }
        },

        dismissAlarm() {
            stopRingtone();
            playShortSound();
            var modal = document.getElementById('alarm-ringing-modal');
            if (modal) {
                var a = modal._alarmData;
                if (a && a.repeat === 'once') {
                    a.enabled = false;
                    StorageManager.saveAlarms(this.alarms);
                    this.render();
                }
                modal.classList.remove('open');
                document.body.style.overflow = '';
                modal._alarmData = null;
            }
        },

        snoozeAlarm(minutes) {
            var modal = document.getElementById('alarm-ringing-modal');
            if (!modal || !modal._alarmData) return;
            var a = modal._alarmData;
            var snoozeMins = minutes || SettingsManager.get('snoozeDuration') || 5;
            var newDate = new Date();
            newDate.setMinutes(newDate.getMinutes() + snoozeMins);
            this.add({
                hour: newDate.getHours(),
                minute: newDate.getMinutes(),
                label: 'Snoozed: ' + (a.label || formatAlarmTime(a.hour, a.minute)),
                repeat: 'once',
                ringtone: a.ringtone
            });
            a.enabled = false;
            StorageManager.saveAlarms(this.alarms);
            this.render();
            stopRingtone();
            modal.classList.remove('open');
            document.body.style.overflow = '';
            modal._alarmData = null;
            UIController.showToast('Snoozed for ' + snoozeMins + ' min');
        },

        getNextAlarm() {
            var now = new Date(), ch = now.getHours(), cm = now.getMinutes(), dow = now.getDay();
            var next = null, minDiff = Infinity;
            this.alarms.filter(function(a) { return a.enabled; }).forEach(function(a) {
                if (a.repeat === 'weekdays' && (dow === 0 || dow === 6)) return;
                var diff = (a.hour * 60 + a.minute) - (ch * 60 + cm);
                if (diff <= 0) diff += 24 * 60;
                if (diff < minDiff) { minDiff = diff; next = a; }
            });
            return next ? formatAlarmTime(next.hour, next.minute) + (next.label ? ' (' + next.label + ')' : '') : null;
        },

        render() {
            var el = document.getElementById('alarm-list');
            if (!el) return;
            if (this.alarms.length === 0) {
                el.innerHTML = '<div class="text-center text-on-surface-variant opacity-50 py-8 text-xs flex flex-col items-center gap-2"><span class="material-symbols-outlined text-3xl">alarm_off</span><span>No alarms set</span></div>';
                return;
            }
            var self = this;
            el.innerHTML = this.alarms.map(function(a) {
                var repeatLabel = a.repeat === 'daily' ? 'Daily' : a.repeat === 'weekdays' ? 'Weekdays' : 'Once';
                return '<div class="flex items-center justify-between p-4 rounded-xl bg-surface-container/40 border ' + (a.enabled ? 'border-primary/30' : 'border-white/5') + ' transition-all">' +
                '<div class="flex items-center gap-3"><button class="w-10 h-6 rounded-full relative transition-colors ' + (a.enabled ? 'bg-primary' : 'bg-surface-container') + '" data-alarm-toggle="' + a.id + '">' +
                '<span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ' + (a.enabled ? 'left-[18px]' : 'left-0.5') + '"></span></button>' +
                '<div><div class="font-mono text-xl font-bold text-on-surface">' + formatAlarmTime(a.hour, a.minute) + '</div>' +
                '<div class="text-[10px] text-on-surface-variant">' + escapeHtml(a.label || 'No label') + ' &bull; ' + repeatLabel + ' &bull; ' + (a.ringtone || 'default') + '</div></div></div>' +
                '<div class="flex items-center gap-1">' +
                '<button class="p-2 text-on-surface-variant hover:text-primary transition-colors" data-alarm-duplicate="' + a.id + '" title="Duplicate"><span class="material-symbols-outlined text-sm">content_copy</span></button>' +
                '<button class="p-2 text-on-surface-variant hover:text-red-400 transition-colors" data-alarm-delete="' + a.id + '" title="Delete"><span class="material-symbols-outlined text-sm">delete</span></button></div></div>';
            }).join('');
            el.querySelectorAll('[data-alarm-toggle]').forEach(function(btn) {
                btn.addEventListener('click', function() { self.toggle(btn.dataset.alarmToggle); });
            });
            el.querySelectorAll('[data-alarm-delete]').forEach(function(btn) {
                btn.addEventListener('click', function() { self.remove(btn.dataset.alarmDelete); UIController.showToast('Alarm deleted'); });
            });
            el.querySelectorAll('[data-alarm-duplicate]').forEach(function(btn) {
                btn.addEventListener('click', function() { self.duplicate(btn.dataset.alarmDuplicate); UIController.showToast('Alarm duplicated'); });
            });
        }
    };

    function formatAlarmTime(h, m) {
        var hh = h % 12 || 12, ampm = h < 12 ? 'AM' : 'PM';
        return hh + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    }

    // ==========================================
    // 18. FAVORITES MANAGER
    // ==========================================
    const FavoritesManager = {
        data: null,
        init() { this.data = StorageManager.getFavorites(); },
        toggle(type, value) {
            if (!this.data[type]) this.data[type] = [];
            var idx = this.data[type].indexOf(value);
            if (idx >= 0) this.data[type].splice(idx, 1); else this.data[type].push(value);
            StorageManager.saveFavorites(this.data);
        },
        has(type, value) { return this.data[type] && this.data[type].indexOf(value) >= 0; },
        getAll(type) { return this.data[type] || []; }
    };

    // ==========================================
    // 19. DASHBOARD MANAGER
    // ==========================================
    const DashboardManager = {
        refreshInterval: null,

        init() {
            this.render();
            this.refreshInterval = setInterval(function() { DashboardManager.renderLive(); }, 1000);
        },

        renderLive() {
            var now = new Date();
            var homeTime = document.getElementById('home-time');
            var homeTimeSec = document.getElementById('home-time-sec');
            if (homeTime) homeTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (homeTimeSec) homeTimeSec.textContent = ':' + String(now.getSeconds()).padStart(2, '0');
            var clockEl = document.getElementById('dash-clock-time');
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            var swEl = document.getElementById('dash-sw-time');
            if (swEl) swEl.textContent = Stopwatch.formatTime(Stopwatch.elapsed);
            var swState = document.getElementById('dash-sw-state');
            if (swState) swState.textContent = Stopwatch.running ? 'Running' : (Stopwatch.paused ? 'Paused' : 'Ready');
            var tmEl = document.getElementById('dash-tm-time');
            if (tmEl) tmEl.textContent = Timer.formatMs(Timer.remainingMs);
            var tmState = document.getElementById('dash-tm-state');
            if (tmState) tmState.textContent = Timer.running ? 'Running' : (Timer.paused ? 'Paused' : 'Ready');
        },

        render() {
            var el = document.getElementById('dashboard-content');
            if (!el) return;
            var now = new Date();
            var w = WeatherService.currentData;
            var next = AlarmManager.getNextAlarm();
            var profile = StorageManager.getProfile();
            var hist = HistoryManager.history.slice(0, 5);
            var lastResult = hist.length > 0 ? hist[0].result : null;

            var html = '';

            if (w) {
                html += '<div class="widget-mini" data-dash-nav="converters" style="cursor:pointer"><div class="widget-mini-title">Weather</div><div class="widget-mini-value">' + w.tempC + '\u00b0C</div><div class="widget-mini-sub">' + w.condition + ' \u2022 ' + escapeHtml(w.location) + '</div></div>';
            } else {
                html += '<div class="widget-mini"><div class="widget-mini-title">Weather</div><div class="widget-mini-value">\u2014</div><div class="widget-mini-sub">Loading\u2026</div></div>';
            }

            html += '<div class="widget-mini" data-dash-nav="calculator" style="cursor:pointer"><div class="widget-mini-title">Last Calc</div><div class="widget-mini-value">' + (lastResult ? lastResult : '\u2014') + '</div><div class="widget-mini-sub">' + (Calculator.expression ? Calculator.getFormattedExpression().substring(0, 30) : 'No recent calculation') + '</div></div>';

            var todayTasks = TaskManager.getToday();
            var overdueTasks = TaskManager.getOverdue();
            html += '<div class="widget-mini" data-dash-nav="tasks" style="cursor:pointer"><div class="widget-mini-title">Tasks Today</div><div class="widget-mini-value">' + todayTasks.length + '</div><div class="widget-mini-sub">' + (overdueTasks.length > 0 ? '<span class="overdue-badge">' + overdueTasks.length + ' overdue</span>' : (todayTasks.length + ' due today')) + '</div></div>';

            var focusMin = Math.round(FocusManager.totalToday / 60);
            html += '<div class="widget-mini" data-dash-nav="focus" style="cursor:pointer"><div class="widget-mini-title">Focus Today</div><div class="widget-mini-value">' + focusMin + 'm</div><div class="widget-mini-sub">' + FocusManager.sessions + ' sessions completed</div></div>';

            var monthExp = ExpenseManager.getMonthTotal('$');
            html += '<div class="widget-mini" data-dash-nav="expenses" style="cursor:pointer"><div class="widget-mini-title">Expenses This Month</div><div class="widget-mini-value">$' + monthExp.toFixed(0) + '</div><div class="widget-mini-sub">' + ExpenseManager.getMonthExpenses().length + ' transactions</div></div>';

            var activeGoals = GoalManager.getActive();
            html += '<div class="widget-mini" data-dash-nav="goals" style="cursor:pointer"><div class="widget-mini-title">Active Goals</div><div class="widget-mini-value">' + activeGoals.length + '</div><div class="widget-mini-sub">' + (activeGoals.length > 0 ? activeGoals.length + ' in progress' : 'No active goals') + '</div></div>';

            html += '<div class="widget-mini" data-dash-nav="alarm" style="cursor:pointer"><div class="widget-mini-title">Next Alarm</div><div class="widget-mini-value">' + (next || 'None') + '</div><div class="widget-mini-sub">' + (next ? 'Upcoming' : 'No alarms set') + '</div></div>';

            html += '<div class="widget-mini" data-dash-nav="stopwatch" style="cursor:pointer"><div class="widget-mini-title">Stopwatch</div><div class="widget-mini-value" id="dash-sw-time">' + Stopwatch.formatTime(Stopwatch.elapsed) + '</div><div class="widget-mini-sub" id="dash-sw-state">' + (Stopwatch.running ? 'Running' : (Stopwatch.paused ? 'Paused' : 'Ready')) + '</div></div>';

            html += '<div class="widget-mini" data-dash-nav="timer" style="cursor:pointer"><div class="widget-mini-title">Timer</div><div class="widget-mini-value" id="dash-tm-time">' + Timer.formatMs(Timer.remainingMs) + '</div><div class="widget-mini-sub" id="dash-tm-state">' + (Timer.running ? 'Running' : (Timer.paused ? 'Paused' : 'Ready')) + '</div></div>';

            var recentNotes = NoteManager.getActive().slice(0, 3);
            if (recentNotes.length > 0) {
                html += '<div class="widget-mini col-span-2" data-dash-nav="notes" style="cursor:pointer"><div class="widget-mini-title">Recent Notes</div>';
                html += recentNotes.map(function(n) { return '<div style="font-size:12px;color:var(--text-primary);margin-top:3px">\u2022 ' + escapeHtml(n.title).substring(0, 40) + '</div>'; }).join('');
                html += '</div>';
            }

            el.innerHTML = html;

            el.querySelectorAll('[data-dash-nav]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var target = btn.dataset.dashNav;
                    if (!target) return;
                    document.querySelectorAll('[data-view-tab]').forEach(function(t) { t.classList.remove('active'); });
                    document.querySelectorAll('[data-view-tab="' + target + '"]').forEach(function(t) { t.classList.add('active'); });
                    document.querySelectorAll('[data-view-panel]').forEach(function(p) {
                        p.classList.remove('active');
                        p.classList.add('hidden');
                    });
                    var panel = document.querySelector('[data-view-panel="' + target + '"]');
                    if (panel) { panel.classList.remove('hidden'); panel.classList.add('active'); }
                    if (target === 'tasks') TasksUI.render();
                    if (target === 'notes') NotesUI.render();
                    if (target === 'reminders') RemindersUI.render();
                    if (target === 'goals') GoalsUI.render();
                    if (target === 'expenses') ExpensesUI.render();
                    if (target === 'clock') WorldClockManager.render();
                });
            });
        }
    };

    // ==========================================
    // 20. PROFILE MANAGER
    // ==========================================
    const ProfileManager = {
        profile: {},
        init() { this.profile = StorageManager.getProfile(); },
        getProfile() { return { ...this.profile }; },
        updateProfile(u) { this.profile = { ...this.profile, ...u }; StorageManager.saveProfile(this.profile); },
        exportData() {
            var backup = {
                version: '4.1.0', exportedAt: new Date().toISOString(),
                history: StorageManager.getHistory(), settings: StorageManager.getSettings(),
                theme: StorageManager.getTheme(), accent: StorageManager.getAccent(),
                profile: StorageManager.getProfile(), memory: StorageManager.getMemory(),
                favorites: StorageManager.getFavorites(), alarms: StorageManager.getAlarms(),
                worldClocks: StorageManager.getWorldClocks()
            };
            var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a'); a.href = url;
            a.download = 'glasscalc-backup-' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        },
        importData(file, cb) {
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var d = JSON.parse(e.target.result);
                    if (!d || typeof d !== 'object') throw new Error('Invalid');
                    if (d.history) StorageManager.saveHistory(d.history);
                    if (d.settings) StorageManager.saveSettings(d.settings);
                    if (d.theme) StorageManager.saveTheme(d.theme);
                    if (d.accent) StorageManager.saveAccent(d.accent);
                    if (d.profile) StorageManager.saveProfile(d.profile);
                    if (d.memory !== undefined) StorageManager.saveMemory(d.memory);
                    if (d.favorites) StorageManager.saveFavorites(d.favorites);
                    if (d.alarms) StorageManager.saveAlarms(d.alarms);
                    if (d.worldClocks) StorageManager.saveWorldClocks(d.worldClocks);
                    if (cb) cb(true, 'Imported successfully!');
                } catch (err) { if (cb) cb(false, 'Import failed: Invalid JSON'); }
            };
            reader.readAsText(file);
        }
    };

    // ==========================================
    // 21. UI CONTROLLER & EVENT DELEGATION
    // ==========================================
    const UIController = {
        activeModal: null,

        init() {
            this.bindNavigation();
            this.bindModals();
            this.bindKeypad();
            this.bindKeyboard();
            this.bindConverters();
            this.bindTools();
            this.bindWeather();
            this.bindClock();
            this.bindWorldClock();
            this.bindStopwatch();
            this.bindTimer();
            this.bindAlarms();
            this.bindQuickSettings();
            this.bindSettingsForm();
            this.bindProfileForm();
            this.renderThemeGrid();
            this.updateDisplay();
        },

        showToast(msg) {
            var c = document.getElementById('toast-container');
            if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
            var t = document.createElement('div');
            t.className = 'toast';
            t.innerHTML = '<span class="material-symbols-outlined" style="color:var(--gc-accent,var(--accent-primary,#4edea3))">check_circle</span><span>' + escapeHtml(msg) + '</span>';
            c.appendChild(t);
            setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all 0.3s ease'; setTimeout(function() { t.remove(); }, 300); }, 2200);
        },

        updateDisplay() {
            var d = document.getElementById('display');
            var e = document.getElementById('history-expr');
            var m = document.getElementById('memory-badge');
            if (d) d.innerText = Calculator.getFormattedDisplay();
            if (e) e.innerText = SettingsManager.getAll().showExpression ? Calculator.getFormattedExpression() : '';
            if (m) m.style.display = Calculator.hasMemory() ? 'inline-flex' : 'none';
        },

        openModal(id) {
            this.closeAllModals();
            var modal = document.getElementById(id);
            if (modal) {
                modal.classList.add('open');
                this.activeModal = modal;
                document.body.style.overflow = 'hidden';
                if (id === 'settings-modal') this.syncSettingsForm();
            }
        },
        syncSettingsForm() {
            var form = document.getElementById('settings-form');
            if (!form) return;
            var s = SettingsManager.getAll();
            var checkboxes = ['thousandsSeparator','soundEnabled','keyboardInput','showExpression','saveHistory','autoRefreshCurrency','notifications','hapticFeedback','reduceMotion'];
            var selects = ['decimalPrecision','dateFormat','timerSound','defaultAlarmRingtone','snoozeDuration','maxHistoryItems','weatherUnit','animationIntensity','appearanceMode'];
            checkboxes.forEach(function(k) { if (form.elements[k]) form.elements[k].checked = !!s[k]; });
            selects.forEach(function(k) { if (form.elements[k] && s[k] !== undefined) form.elements[k].value = s[k]; });
        },
        closeAllModals() {
            document.querySelectorAll('.modal-overlay').forEach(function(m) { m.classList.remove('open'); });
            this.activeModal = null; document.body.style.overflow = '';
        },

        bindModals() {
            document.querySelectorAll('[data-open-modal]').forEach(function(btn) {
                btn.addEventListener('click', function(e) { e.preventDefault(); UIController.openModal(btn.dataset.openModal); });
            });
            document.querySelectorAll('[data-close-modal]').forEach(function(btn) {
                btn.addEventListener('click', function() { UIController.closeAllModals(); });
            });
            document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
                overlay.addEventListener('click', function(e) { if (e.target === overlay) UIController.closeAllModals(); });
            });
        },

        bindNavigation() {
            var self = this;
            function switchView(v) {
                document.querySelectorAll('[data-view-tab]').forEach(function(t) { t.classList.remove('active'); });
                document.querySelectorAll('[data-view-tab="' + v + '"]').forEach(function(t) { t.classList.add('active'); });
                document.querySelectorAll('[data-view-panel]').forEach(function(p) {
                    p.classList.remove('active');
                    p.classList.add('hidden');
                });
                var panel = document.querySelector('[data-view-panel="' + v + '"]');
                if (panel) { panel.classList.remove('hidden'); panel.classList.add('active'); }
                if (v === 'dashboard') DashboardManager.render();
                if (v === 'clock') WorldClockManager.render();
                if (v === 'tasks') TasksUI.render();
                if (v === 'notes') NotesUI.render();
                if (v === 'reminders') RemindersUI.render();
                if (v === 'goals') GoalsUI.render();
                if (v === 'expenses') ExpensesUI.render();
                if (v === 'focus') FocusUI.updateDisplay();
            }

            document.querySelectorAll('[data-view-tab]').forEach(function(tab) {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    switchView(tab.dataset.viewTab);
                });
            });

            document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var target = btn.dataset.viewTab;
                    if (!target) return;
                    switchView(target);
                });
            });

            document.querySelectorAll('[data-dash-nav]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var target = btn.dataset.dashNav;
                    if (!target) return;
                    switchView(target);
                });
            });

            document.querySelectorAll('[data-calc-mode]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var m = btn.dataset.calcMode;
                    document.querySelectorAll('[data-calc-mode]').forEach(function(b) { b.classList.remove('active-mode'); });
                    btn.classList.add('active-mode');
                    var sp = document.getElementById('scientific-keypad');
                    if (sp) sp.classList.toggle('hidden', m !== 'scientific');
                });
            });

            document.querySelectorAll('[data-angle-unit]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('[data-angle-unit]').forEach(function(b) { b.classList.remove('active-mode'); });
                    btn.classList.add('active-mode');
                    Calculator.setAngleUnit(btn.dataset.angleUnit);
                    UIController.showToast('Angle: ' + btn.dataset.angleUnit);
                });
            });
        },

        bindKeypad() {
            var panel = document.querySelector('[data-view-panel="calculator"]');
            if (!panel) return;
            panel.addEventListener('click', function(e) {
                var btn = e.target.closest('button');
                if (!btn) return;
                try { SettingsManager.playClickSound(); } catch (err) {}
                try {
                    if (btn.dataset.number !== undefined) Calculator.appendNumber(btn.dataset.number);
                    else if (btn.dataset.operator !== undefined) Calculator.appendOperator(btn.dataset.operator);
                    else if (btn.dataset.function !== undefined) Calculator.appendFunction(btn.dataset.function);
                    else if (btn.dataset.paren !== undefined) Calculator.appendParenthesis(btn.dataset.paren);
                    else if (btn.dataset.constant !== undefined) Calculator.appendConstant(btn.dataset.constant);
                    else if (btn.dataset.action !== undefined) {
                        switch (btn.dataset.action) {
                            case 'clear': Calculator.clear(); break;
                            case 'backspace': Calculator.backspace(); break;
                            case 'toggle-sign': Calculator.toggleSign(); break;
                            case 'percent': Calculator.calculatePercentage(); break;
                            case 'calculate': Calculator.calculate(); break;
                            case 'decimal': Calculator.appendNumber('.'); break;
                            case 'fact': Calculator.appendOperator('!'); break;
                            case 'square': Calculator.square(); break;
                            case 'reciprocal': Calculator.reciprocal(); break;
                            case 'mc': Calculator.memoryClear(); UIController.showToast('Memory Cleared'); break;
                            case 'mr': Calculator.memoryRecall(); break;
                            case 'mplus': Calculator.memoryAdd(); UIController.showToast('M+'); break;
                            case 'mminus': Calculator.memorySubtract(); UIController.showToast('M-'); break;
                            case 'ms': Calculator.memoryStore(); UIController.showToast('Stored'); break;
                        }
                    } else return;
                } catch (err) { console.error('Button action error:', err); }
                UIController.updateDisplay();
            });

            var cp = document.getElementById('copy-display-btn');
            if (cp) cp.addEventListener('click', function() {
                navigator.clipboard.writeText(Calculator.currentInput).then(function() { UIController.showToast('Copied!'); }).catch(function() {});
            });
        },

        bindKeyboard() {
            document.addEventListener('keydown', function(e) {
                if (!SettingsManager.getAll().keyboardInput) return;
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) >= 0) return;
                if (e.key === 'Escape') {
                    if (UIController.activeModal) { UIController.closeAllModals(); return; }
                    Calculator.clear(); UIController.updateDisplay(); return;
                }
                if (e.key >= '0' && e.key <= '9') Calculator.appendNumber(e.key);
                else if (e.key === '.') Calculator.appendNumber('.');
                else if (['+', '-', '*', '/'].indexOf(e.key) >= 0) Calculator.appendOperator(e.key);
                else if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); Calculator.calculate(); }
                else if (e.key === 'Backspace') Calculator.backspace();
                else if (e.key === '%') Calculator.calculatePercentage();
                else if (e.key === '(' || e.key === ')') Calculator.appendParenthesis(e.key);
                else return;
                SettingsManager.playClickSound();
                UIController.updateDisplay();
            });
        },

        bindConverters() {
            var catSel = document.getElementById('unit-category');
            var fromSel = document.getElementById('unit-from');
            var toSel = document.getElementById('unit-to');
            var inputEl = document.getElementById('unit-input');
            var resultEl = document.getElementById('unit-result');
            var swapBtn = document.getElementById('unit-swap-btn');
            if (catSel && fromSel && toSel && inputEl && resultEl) {
                var populate = function() {
                    var cat = UNIT_DATA[catSel.value];
                    if (!cat) return;
                    var keys = Object.keys(cat.units);
                    fromSel.innerHTML = keys.map(function(k) { return '<option value="' + k + '">' + k + '</option>'; }).join('');
                    toSel.innerHTML = keys.map(function(k) { return '<option value="' + k + '">' + k + '</option>'; }).join('');
                    if (keys.length > 1) toSel.selectedIndex = 1;
                    doConvert();
                };
                var doConvert = function() { resultEl.innerText = UnitConverter.convert(catSel.value, fromSel.value, toSel.value, inputEl.value) || '0'; };
                catSel.addEventListener('change', populate);
                fromSel.addEventListener('change', doConvert);
                toSel.addEventListener('change', doConvert);
                inputEl.addEventListener('input', doConvert);
                if (swapBtn) swapBtn.addEventListener('click', function() { var t = fromSel.value; fromSel.value = toSel.value; toSel.value = t; doConvert(); });
                populate();
            }

            var currFrom = document.getElementById('curr-from');
            var currTo = document.getElementById('curr-to');
            var currInput = document.getElementById('curr-input');
            var currResult = document.getElementById('curr-result');
            var currStatus = document.getElementById('curr-status');
            var currSwap = document.getElementById('curr-swap-btn');
            var currRefresh = document.getElementById('curr-refresh-btn');
            if (currFrom && currTo && currInput && currResult) {
                var renderOpts = function() {
                    var pf = currFrom.value || 'USD', pt = currTo.value || 'INR';
                    currFrom.innerHTML = CurrencyService.allCodes.map(function(c) { return '<option value="' + c + '">' + CurrencyService.getLabel(c) + '</option>'; }).join('');
                    currTo.innerHTML = CurrencyService.allCodes.map(function(c) { return '<option value="' + c + '">' + CurrencyService.getLabel(c) + '</option>'; }).join('');
                    currFrom.value = CurrencyService.allCodes.indexOf(pf) >= 0 ? pf : 'USD';
                    currTo.value = CurrencyService.allCodes.indexOf(pt) >= 0 ? pt : 'INR';
                };
                var doCurrConvert = function() {
                    var val = CurrencyService.convert(currInput.value, currFrom.value, currTo.value);
                    var sym = CurrencyService.getSymbol(currTo.value);
                    currResult.textContent = val !== '' ? sym + ' ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                    if (currStatus) {
                        var cnt = CurrencyService.allCodes.length;
                        var badge = CurrencyService.status === 'live'
                            ? '<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1 animate-pulse"></span><strong class="text-emerald-400">Live (' + cnt + ')</strong>'
                            : '<span class="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>' + (CurrencyService.status === 'cached' ? 'Cached rates' : 'Offline');
                        currStatus.innerHTML = badge + ' &bull; Updated: <strong>' + (CurrencyService.lastUpdated || 'N/A') + '</strong>';
                    }
                };
                renderOpts(); doCurrConvert();
                CurrencyService.onUpdate(function() { renderOpts(); doCurrConvert(); });
                currFrom.addEventListener('change', doCurrConvert);
                currTo.addEventListener('change', doCurrConvert);
                currInput.addEventListener('input', doCurrConvert);
                if (currSwap) currSwap.addEventListener('click', function() { var t = currFrom.value; currFrom.value = currTo.value; currTo.value = t; doCurrConvert(); });
                if (currRefresh) currRefresh.addEventListener('click', function() {
                    var icon = currRefresh.querySelector('.material-symbols-outlined');
                    if (icon) icon.classList.add('animate-spin');
                    UIController.showToast('Syncing live rates...');
                    CurrencyService.fetchRates().then(function() {
                        if (icon) icon.classList.remove('animate-spin');
                        UIController.showToast('Rates updated!');
                    });
                });
            }
        },

        bindTools() {
            var tools = [
                { inputs: ['p1-pct', 'p1-total'], result: 'p1-result', fn: function() { return PercentageTools.percentOf(v('p1-pct'), v('p1-total')); } },
                { inputs: ['p2-v1', 'p2-v2'], result: 'p2-result', fn: function() { return PercentageTools.percentChange(v('p2-v1'), v('p2-v2')); } },
                { inputs: ['p3-total', 'p3-disc'], result: 'p3-result', fn: function() { return PercentageTools.discount(v('p3-disc'), v('p3-total')); } },
                { inputs: ['p4-total', 'p4-tax'], result: 'p4-result', fn: function() { return PercentageTools.tax(v('p4-tax'), v('p4-total')); } },
                { inputs: ['p5-total', 'p5-tip'], result: 'p5-result', fn: function() { return PercentageTools.tip(v('p5-tip'), v('p5-total')); } },
                { inputs: ['p6-cost', 'p6-rev'], result: 'p6-result', fn: function() { return PercentageTools.margin(v('p6-rev'), v('p6-cost')); } },
                { inputs: ['p7-cost', 'p7-markup'], result: 'p7-result', fn: function() { return PercentageTools.markup(v('p7-cost'), v('p7-markup')); } }
            ];
            function v(id) { var el = document.getElementById(id); return el ? el.value : ''; }
            tools.forEach(function(t) {
                var r = document.getElementById(t.result);
                if (!r) return;
                var calc = function() { r.textContent = t.fn() || '0'; };
                t.inputs.forEach(function(id) { var el = document.getElementById(id); if (el) el.addEventListener('input', calc); });
            });

            var d1 = document.getElementById('date-diff-1'), d2 = document.getElementById('date-diff-2'), dr = document.getElementById('date-diff-result');
            if (d1 && d2 && dr) {
                var today = new Date().toISOString().slice(0, 10);
                d1.value = today; d2.value = today;
                var calc = function() { dr.textContent = DateTimeTools.diff(d1.value, d2.value) || '0 days'; };
                d1.addEventListener('change', calc); d2.addEventListener('change', calc);
            }
            var daInput = document.getElementById('date-add-input'), daNum = document.getElementById('date-add-num'), daResult = document.getElementById('date-add-result');
            if (daInput && daNum && daResult) {
                daInput.value = new Date().toISOString().slice(0, 10);
                var calc = function() {
                    var n = parseInt(daNum.value) || 0;
                    var unit = document.getElementById('date-add-unit');
                    var u = unit ? unit.value : 'days';
                    if (u === 'weeks') daResult.textContent = DateTimeTools.addWeeks(daInput.value, n);
                    else if (u === 'months') daResult.textContent = DateTimeTools.addMonths(daInput.value, n);
                    else daResult.textContent = DateTimeTools.addDays(daInput.value, n);
                };
                daInput.addEventListener('change', calc); daNum.addEventListener('input', calc);
                var dateAddUnit = document.getElementById('date-add-unit');
                if (dateAddUnit) dateAddUnit.addEventListener('change', calc);
            }
            var ageInput = document.getElementById('age-birth-date'), ageResult = document.getElementById('age-result');
            if (ageInput && ageResult) {
                ageInput.addEventListener('change', function() { ageResult.textContent = DateTimeTools.ageCalc(ageInput.value) || '-'; });
            }
            var bd1 = document.getElementById('bd-date-1'), bd2 = document.getElementById('bd-date-2'), bdResult = document.getElementById('bd-result');
            if (bd1 && bd2 && bdResult) {
                var today = new Date().toISOString().slice(0, 10);
                bd1.value = today; bd2.value = today;
                var calc = function() { bdResult.textContent = DateTimeTools.businessDays(bd1.value, bd2.value) || '-'; };
                bd1.addEventListener('change', calc); bd2.addEventListener('change', calc);
            }
            var unixInput = document.getElementById('unix-input'), unixResult = document.getElementById('unix-result');
            if (unixInput && unixResult) {
                unixInput.value = Math.floor(Date.now() / 1000);
                var calc = function() { unixResult.textContent = DateTimeTools.unixToDate(unixInput.value) || '-'; };
                unixInput.addEventListener('input', calc); calc();
            }
        },

        bindWeather() {
            var cityInput = document.getElementById('weather-city-input');
            var searchBtn = document.getElementById('weather-search-btn');
            var geoBtn = document.getElementById('weather-geo-btn');
            var container = document.getElementById('weather-card-container');
            var suggestions = document.getElementById('weather-suggestions');
            if (!container) return;

            var renderWeather = function(d) {
                var windDir = function(deg) { var dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; return dirs[Math.round(deg / 45) % 8]; };
                var html = '<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/10 pb-4">' +
                    '<div><div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-2xl">location_on</span>' +
                    '<h3 class="text-xl font-bold text-on-surface">' + escapeHtml(d.location) + '</h3></div>' +
                    '<div class="flex items-center gap-3 text-xs text-on-surface-variant mt-1"><span>' + escapeHtml(d.timezone) + '</span>' +
                    '<span class="flex items-center gap-1 font-mono text-primary"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>' + d.lastUpdated + '</span></div></div>' +
                    '<div class="flex items-center gap-3 bg-surface-container/80 border border-white/10 px-4 py-2.5 rounded-2xl">' +
                    '<span class="material-symbols-outlined text-4xl text-primary">' + d.icon + '</span>' +
                    '<div><span class="font-bold text-on-surface">' + d.condition + '</span>' +
                    '<span class="text-[10px] text-on-surface-variant block">' + (d.isDay ? 'Day' : 'Night') + '</span></div></div></div>';

                html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Temperature</span><div class="text-2xl font-bold font-mono text-primary">' + d.tempC + '\u00b0C</div><div class="text-xs text-on-surface-variant">' + d.tempF + '\u00b0F</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Feels Like</span><div class="text-xl font-bold font-mono text-on-surface">' + d.feelsLikeC + '\u00b0C</div><div class="text-xs text-on-surface-variant">' + d.feelsLikeF + '\u00b0F</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Humidity / Rain</span><div class="text-xl font-bold font-mono text-on-surface">' + d.humidity + '%</div><div class="text-[10px] text-on-surface-variant">Rain: ' + d.precipitation + ' mm</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Wind / Pressure</span><div class="text-xl font-bold font-mono text-on-surface">' + d.windSpeed + ' km/h ' + windDir(d.windDir) + '</div><div class="text-[10px] text-on-surface-variant">' + d.pressure + ' hPa</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Visibility</span><div class="text-xl font-bold font-mono text-on-surface">' + d.visibility + ' km</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">UV Index</span><div class="text-xl font-bold font-mono text-on-surface">' + d.uvIndex + '</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Cloud Cover</span><div class="text-xl font-bold font-mono text-on-surface">' + d.cloudCover + '%</div></div>' +
                    '<div class="p-3 rounded-xl bg-surface-container/50 border border-white/5"><span class="text-[10px] text-on-surface-variant">Sunrise / Sunset</span><div class="text-sm font-mono text-on-surface">' + d.sunrise + '</div><div class="text-[10px] text-on-surface-variant">' + d.sunset + '</div></div></div>';

                if (d.daily && d.daily.length > 0) {
                    html += '<div class="mt-3 pt-3 border-t border-white/5"><div class="text-xs font-semibold text-on-surface-variant mb-2">3-Day Forecast</div><div class="grid grid-cols-3 gap-2">';
                    d.daily.forEach(function(day) {
                        html += '<div class="p-2 rounded-lg bg-surface-container/40 border border-white/5 text-center">' +
                            '<div class="text-[10px] text-on-surface-variant">' + day.date + '</div>' +
                            '<span class="material-symbols-outlined text-primary text-lg">' + day.icon + '</span>' +
                            '<div class="text-xs font-mono"><strong>' + day.high + '\u00b0</strong> / ' + day.low + '\u00b0</div>' +
                            '<div class="text-[9px] text-on-surface-variant">' + day.condition + '</div></div>';
                    });
                    html += '</div></div>';
                }

                if (d.hourly && d.hourly.times && d.hourly.times.length > 0) {
                    html += '<div class="mt-3 pt-3 border-t border-white/5"><div class="text-xs font-semibold text-on-surface-variant mb-2">Hourly Forecast</div>';
                    html += '<div class="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">';
                    for (var i = 0; i < Math.min(12, d.hourly.times.length); i++) {
                        var hr = new Date(d.hourly.times[i]).getHours();
                        html += '<div class="flex-shrink-0 p-2 rounded-lg bg-surface-container/40 border border-white/5 text-center min-w-[60px]">' +
                            '<div class="text-[10px] text-on-surface-variant">' + String(hr).padStart(2, '0') + ':00</div>' +
                            '<span class="material-symbols-outlined text-primary text-sm">' + WeatherService.icon(d.hourly.codes[i] || 0) + '</span>' +
                            '<div class="text-xs font-mono text-on-surface">' + (d.hourly.temps[i] != null ? Math.round(d.hourly.temps[i]) + '\u00b0' : '-') + '</div>' +
                            '<div class="text-[9px] text-on-surface-variant">' + (d.hourly.precip[i] != null ? d.hourly.precip[i] + '%' : '') + '</div></div>';
                    }
                    html += '</div></div>';
                }
                container.innerHTML = html;
            };

            var fetchCity = async function(city) {
                if (!city || !city.trim()) return;
                container.innerHTML = '<div class="text-center py-8 text-xs text-on-surface-variant animate-pulse">Fetching weather for "' + escapeHtml(city) + '"...</div>';
                try { renderWeather(await WeatherService.getWeatherByCity(city)); }
                catch (err) { container.innerHTML = '<div class="text-center py-8 text-xs text-red-400">' + escapeHtml(err.message) + '</div>'; }
            };

            if (cityInput && suggestions) {
                var timer;
                cityInput.addEventListener('input', function() {
                    clearTimeout(timer);
                    timer = setTimeout(async function() {
                        if (cityInput.value.trim().length >= 2) {
                            var m = await WeatherService.searchLocations(cityInput.value);
                            suggestions.innerHTML = m.map(function(x) { return '<option value="' + escapeHtml(x.label) + '"></option>'; }).join('');
                        }
                    }, 300);
                });
            }
            if (searchBtn && cityInput) {
                searchBtn.addEventListener('click', function() { fetchCity(cityInput.value); });
                cityInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') fetchCity(cityInput.value); });
            }
            if (geoBtn) {
                geoBtn.addEventListener('click', function() {
                    container.innerHTML = '<div class="text-center py-8 text-xs text-on-surface-variant animate-pulse">Detecting location...</div>';
                    WeatherService.autoDetect().then(function(d) { renderWeather(d); UIController.showToast('Weather updated!'); }).catch(function(err) { container.innerHTML = '<div class="text-center py-8 text-xs text-red-400">' + escapeHtml(err.message) + '</div>'; });
                });
            }
            setInterval(async function() {
                if (WeatherService.lastCoords) {
                    try { renderWeather(await WeatherService.getWeather(WeatherService.lastCoords.lat, WeatherService.lastCoords.lon, WeatherService.lastCoords.label)); } catch (e) {}
                } else if (WeatherService.lastCity) {
                    try { renderWeather(await WeatherService.getWeatherByCity(WeatherService.lastCity)); } catch (e) {}
                }
            }, 300000);
            container.innerHTML = '<div class="text-center py-8 text-xs text-on-surface-variant animate-pulse">Detecting your location...</div>';
            WeatherService.autoDetect().then(function(d) { renderWeather(d); }).catch(function() { fetchCity('London'); });
        },

        bindClock() {
            LiveClock.init();
            var toggleBtn = document.getElementById('clock-format-toggle');
            if (toggleBtn) toggleBtn.addEventListener('click', function() {
                LiveClock.toggleFormat();
                UIController.showToast('Clock: ' + (LiveClock.format24 ? '24-hour' : '12-hour'));
            });
        },

        bindWorldClock() {
            WorldClockManager.init();
            var addBtn = document.getElementById('wc-add-btn');
            var input = document.getElementById('wc-city-input');
            if (addBtn && input) {
                addBtn.addEventListener('click', async function() {
                    var q = input.value.trim();
                    if (!q) return;
                    UIController.showToast('Searching...');
                    var results = await WeatherService.searchLocations(q);
                    if (results.length > 0) {
                        var selectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        try {
                            var r = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) + '&count=1&language=en&format=json');
                            if (r.ok) {
                                var d = await r.json();
                                if (d.results && d.results.length > 0 && d.results[0].timezone) selectedTz = d.results[0].timezone;
                            }
                        } catch (e) {}
                        WorldClockManager.add(selectedTz);
                        input.value = '';
                        UIController.showToast('Clock added');
                    } else { UIController.showToast('City not found'); }
                });
            }
            setInterval(function() { WorldClockManager.render(); }, 1000);
        },

        bindStopwatch() {
            var swStart = document.getElementById('sw-start');
            var swStop = document.getElementById('sw-stop');
            var swResume = document.getElementById('sw-resume');
            var swLap = document.getElementById('sw-lap');
            var swReset = document.getElementById('sw-reset');
            var swClearLaps = document.getElementById('sw-clear-laps');
            if (swStart) swStart.addEventListener('click', function() { Stopwatch.start(); });
            if (swStop) swStop.addEventListener('click', function() { Stopwatch.stop(); });
            if (swResume) swResume.addEventListener('click', function() { Stopwatch.resume(); });
            if (swLap) swLap.addEventListener('click', function() { Stopwatch.lap(); });
            if (swReset) swReset.addEventListener('click', function() { Stopwatch.reset(); });
            if (swClearLaps) swClearLaps.addEventListener('click', function() { Stopwatch.laps = []; Stopwatch.render(); });
            Stopwatch.render();
        },

        bindTimer() {
            var timerStart = document.getElementById('timer-start');
            var timerPause = document.getElementById('timer-pause');
            var timerResume = document.getElementById('timer-resume');
            var timerReset = document.getElementById('timer-reset');

            function getTimerInputs() {
                var h = parseInt(document.getElementById('timer-h').value) || 0;
                var m = parseInt(document.getElementById('timer-m').value) || 0;
                var s = parseInt(document.getElementById('timer-s').value) || 0;
                h = Math.max(0, Math.min(99, h));
                m = Math.max(0, Math.min(59, m));
                s = Math.max(0, Math.min(59, s));
                return { h: h, m: m, s: s };
            }

            function setTimerInputs(vals) {
                var hEl = document.getElementById('timer-h');
                var mEl = document.getElementById('timer-m');
                var sEl = document.getElementById('timer-s');
                if (hEl) hEl.value = vals.h;
                if (mEl) mEl.value = vals.m;
                if (sEl) sEl.value = vals.s;
            }

            if (timerStart) timerStart.addEventListener('click', function() {
                var vals = getTimerInputs();
                Timer.set(vals.h, vals.m, vals.s);
                Timer.start();
            });
            if (timerPause) timerPause.addEventListener('click', function() { Timer.pause(); });
            if (timerResume) timerResume.addEventListener('click', function() { Timer.resume(); });
            if (timerReset) timerReset.addEventListener('click', function() { Timer.reset(); });

            ['timer-h', 'timer-m', 'timer-s'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) {
                    el.addEventListener('blur', function() {
                        var v = parseInt(el.value) || 0;
                        var max = id === 'timer-h' ? 99 : 59;
                        el.value = Math.max(0, Math.min(max, v));
                    });
                }
            });

            document.querySelectorAll('[data-timer-preset]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var parts = btn.dataset.timerPreset.split(':').map(Number);
                    var h = parts[0] || 0, m = parts[1] || 0, s = parts[2] || 0;
                    setTimerInputs({ h: h, m: m, s: s });
                    Timer.reset(); Timer.set(h, m, s);
                    UIController.showToast('Timer preset: ' + Timer.formatMs(Timer.totalMs));
                });
            });

            Timer.render();
        },

        bindAlarms() {
            AlarmManager.init();
            var addBtn = document.getElementById('alarm-add-btn');
            var ringtoneSelect = document.getElementById('ringtone-select');
            var ringtonePreviewBtn = document.getElementById('ringtone-preview-btn');
            var ringtoneUploadBtn = document.getElementById('ringtone-upload-btn');
            var ringtoneFileInput = document.getElementById('ringtone-file-input');
            var dismissBtn = document.getElementById('alarm-dismiss-btn');
            var snoozeBtn = document.getElementById('alarm-snooze-btn');

            function populateRingtoneDropdown() {
                if (!ringtoneSelect) return;
                var html = '';
                BUILT_IN_RINGTONE_NAMES.forEach(function(name) {
                    html += '<option value="' + name + '">' + name.charAt(0).toUpperCase() + name.slice(1) + '</option>';
                });
                ringtoneSelect.innerHTML = html;
                RingtoneManager.getRingtones().then(function(items) {
                    items.forEach(function(item) {
                        var opt = document.createElement('option');
                        opt.value = String(item.id);
                        opt.textContent = item.name + ' (uploaded)';
                        ringtoneSelect.appendChild(opt);
                    });
                }).catch(function() {});
            }
            populateRingtoneDropdown();

            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    var hEl = document.getElementById('alarm-hour');
                    var mEl = document.getElementById('alarm-min');
                    var labelEl = document.getElementById('alarm-label');
                    var repeatEl = document.getElementById('alarm-repeat');
                    var h = parseInt(hEl ? hEl.value : '');
                    var m = parseInt(mEl ? mEl.value : '');
                    var label = labelEl ? labelEl.value : '';
                    var repeat = repeatEl ? repeatEl.value : 'once';
                    var ringtone = ringtoneSelect ? ringtoneSelect.value : 'default';
                    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
                        UIController.showToast('Invalid time'); return;
                    }
                    AlarmManager.add({ hour: h, minute: m, label: label, repeat: repeat, ringtone: ringtone });
                    UIController.showToast('Alarm set for ' + formatAlarmTime(h, m));
                    if (hEl) hEl.value = '';
                    if (mEl) mEl.value = '';
                    if (labelEl) labelEl.value = '';
                });
            }

            if (ringtonePreviewBtn) {
                ringtonePreviewBtn.addEventListener('click', function() {
                    var val = ringtoneSelect ? ringtoneSelect.value : 'default';
                    if (BUILT_IN_RINGTONE_NAMES.indexOf(val) >= 0) {
                        _playBuiltInToneOnce(val);
                    } else {
                        RingtoneManager.getRingtoneById(parseInt(val)).then(function(item) {
                            if (!item || !item.data) return;
                            var ac = _getAlarmAudioCtx();
                            if (!ac) return;
                            ac.decodeAudioData(item.data.slice(0)).then(function(buffer) {
                                var source = ac.createBufferSource();
                                source.buffer = buffer;
                                source.connect(ac.destination);
                                source.start();
                            }).catch(function() {});
                        }).catch(function() {});
                    }
                });
            }

            if (ringtoneUploadBtn && ringtoneFileInput) {
                ringtoneUploadBtn.addEventListener('click', function() { ringtoneFileInput.click(); });
                ringtoneFileInput.addEventListener('change', function(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    var validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
                    if (validTypes.indexOf(file.type) < 0 && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
                        UIController.showToast('Unsupported format'); return;
                    }
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        RingtoneManager.saveRingtone(file.name.replace(/\.[^.]+$/, ''), file.type, ev.target.result).then(function() {
                            UIController.showToast('Ringtone uploaded!');
                            populateRingtoneDropdown();
                        }).catch(function() { UIController.showToast('Upload failed'); });
                    };
                    reader.readAsArrayBuffer(file);
                    ringtoneFileInput.value = '';
                });
            }

            if (dismissBtn) dismissBtn.addEventListener('click', function() { AlarmManager.dismissAlarm(); });
            if (snoozeBtn) snoozeBtn.addEventListener('click', function() { AlarmManager.snoozeAlarm(SettingsManager.get('snoozeDuration') || 5); });
        },

        bindQuickSettings() {
            var btn = document.getElementById('quick-settings-btn');
            var panel = document.getElementById('quick-settings-panel');
            if (!btn || !panel) return;

            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.classList.toggle('hidden');
                if (!panel.classList.contains('hidden')) {
                    panel.querySelectorAll('[data-appearance]').forEach(function(b) {
                        b.classList.toggle('active-mode', b.dataset.appearance === ThemeManager.appearanceMode);
                    });
                    ThemeManager.setAccent(ThemeManager.currentAccent, false);
                }
            });

            document.addEventListener('click', function(e) {
                if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
                    panel.classList.add('hidden');
                }
            });

            panel.querySelectorAll('[data-theme-select]').forEach(function(swatch) {
                swatch.addEventListener('click', function() {
                    ThemeManager.setTheme(swatch.dataset.themeSelect);
                    UIController.renderThemeGrid();
                    UIController.showToast('Theme: ' + swatch.dataset.themeSelect);
                });
            });

            panel.querySelectorAll('[data-accent-select]').forEach(function(swatch) {
                swatch.addEventListener('click', function() {
                    ThemeManager.setAccent(swatch.dataset.accentSelect);
                    UIController.showToast('Accent: ' + swatch.dataset.accentSelect);
                });
            });

            panel.querySelectorAll('[data-appearance]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    ThemeManager.setAppearance(btn.dataset.appearance);
                    panel.querySelectorAll('[data-appearance]').forEach(function(b) { b.classList.remove('active-mode'); });
                    btn.classList.add('active-mode');
                    UIController.showToast('Appearance: ' + btn.dataset.appearance);
                });
            });

            var clockFmt = document.getElementById('qs-clock-format');
            if (clockFmt) {
                clockFmt.addEventListener('click', function() {
                    LiveClock.toggleFormat();
                    clockFmt.textContent = LiveClock.format24 ? '24h' : '12h';
                });
            }

            panel.querySelectorAll('[data-angle-unit]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    panel.querySelectorAll('[data-angle-unit]').forEach(function(b) { b.classList.remove('active-mode'); });
                    btn.classList.add('active-mode');
                    Calculator.setAngleUnit(btn.dataset.angleUnit);
                });
            });

            var notifToggle = document.getElementById('qs-notifications');
            if (notifToggle) {
                notifToggle.addEventListener('change', function() {
                    SettingsManager.update({ notifications: notifToggle.checked });
                    if (notifToggle.checked && 'Notification' in window) Notification.requestPermission();
                });
            }

            var reduceMotion = document.getElementById('qs-reduce-motion');
            if (reduceMotion) {
                reduceMotion.addEventListener('change', function() {
                    SettingsManager.update({ reduceMotion: reduceMotion.checked });
                    document.documentElement.classList.toggle('reduce-motion', reduceMotion.checked);
                });
            }

            panel.querySelectorAll('[data-appearance]').forEach(function(b) {
                b.classList.toggle('active-mode', b.dataset.appearance === ThemeManager.appearanceMode);
            });
        },

        bindSettingsForm() {
            var form = document.getElementById('settings-form');
            if (!form) return;
            var s = SettingsManager.getAll();
            var checkboxes = ['thousandsSeparator','soundEnabled','keyboardInput','showExpression','saveHistory','autoRefreshCurrency','notifications','hapticFeedback','reduceMotion'];
            var selects = ['decimalPrecision','dateFormat','timerSound','defaultAlarmRingtone','snoozeDuration','maxHistoryItems','weatherUnit','animationIntensity','appearanceMode'];
            checkboxes.forEach(function(k) {
                if (form.elements[k]) form.elements[k].checked = !!s[k];
            });
            selects.forEach(function(k) {
                if (form.elements[k] && s[k] !== undefined) form.elements[k].value = s[k];
            });
            form.addEventListener('change', function() {
                var u = {};
                checkboxes.forEach(function(k) { u[k] = !!(form.elements[k] && form.elements[k].checked); });
                selects.forEach(function(k) {
                    if (form.elements[k]) u[k] = form.elements[k].type === 'select-one' ? form.elements[k].value : parseInt(form.elements[k].value, 10) || form.elements[k].value;
                });
                SettingsManager.update(u); Calculator.setOptions(u); UIController.updateDisplay();
                if (u.appearanceMode) ThemeManager.setAppearance(u.appearanceMode);
                if (u.accentColor) ThemeManager.setAccent(u.accentColor);
                if (u.reduceMotion !== undefined) document.documentElement.classList.toggle('reduce-motion', !!u.reduceMotion);
                UIController.showToast('Settings saved');
            });
        },

        bindProfileForm() {
            var nameInput = document.getElementById('profile-name');
            var themeSelect = document.getElementById('profile-theme-select');
            var currSelect = document.getElementById('profile-currency-select');
            var createdInfo = document.getElementById('profile-created-info');
            var exportBtn = document.getElementById('export-data-btn');
            var importInput = document.getElementById('import-data-file');
            var clearBtn = document.getElementById('clear-all-data-btn');
            var profile = ProfileManager.getProfile();
            if (nameInput) {
                nameInput.value = profile.displayName || '';
                nameInput.addEventListener('change', function() { ProfileManager.updateProfile({ displayName: nameInput.value }); DashboardManager.render(); UIController.showToast('Profile updated'); });
            }
            if (themeSelect) {
                themeSelect.value = profile.preferredTheme || 'dark';
                themeSelect.addEventListener('change', function() { ProfileManager.updateProfile({ preferredTheme: themeSelect.value }); ThemeManager.setTheme(themeSelect.value); UIController.renderThemeGrid(); UIController.showToast('Theme: ' + themeSelect.value); });
            }
            if (currSelect) {
                currSelect.innerHTML = CurrencyService.allCodes.map(function(c) { return '<option value="' + c + '">' + CurrencyService.getLabel(c) + '</option>'; }).join('');
                currSelect.value = profile.preferredCurrency || 'USD';
                currSelect.addEventListener('change', function() { ProfileManager.updateProfile({ preferredCurrency: currSelect.value }); UIController.showToast('Preferred currency: ' + currSelect.value); });
            }
            if (createdInfo && profile.createdAt) {
                createdInfo.textContent = 'Using since ' + new Date(profile.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
            }
            if (exportBtn) exportBtn.addEventListener('click', function() { ProfileManager.exportData(); UIController.showToast('Backup downloaded!'); });
            if (importInput) importInput.addEventListener('change', function(e) {
                var f = e.target.files[0];
                if (!f) return;
                ProfileManager.importData(f, function(ok, msg) { if (ok) { UIController.showToast(msg); setTimeout(function() { location.reload(); }, 800); } else alert(msg); });
            });
            if (clearBtn) clearBtn.addEventListener('click', function() {
                if (confirm('This will delete ALL your data including settings, history, alarms, and preferences. This cannot be undone. Continue?')) { StorageManager.clearAllData(); UIController.showToast('All data cleared'); setTimeout(function() { location.reload(); }, 600); }
            });
        },

        renderThemeGrid() {
            var grid = document.getElementById('theme-grid');
            if (!grid) return;
            var cur = ThemeManager.getTheme();
            grid.innerHTML = THEME_PRESETS.map(function(t) {
                var bgColor = t.colors ? t.colors[0] : (t.color || '#111');
                return '<button class="p-4 rounded-2xl border-3 flex flex-col items-center gap-3 transition-all ' +
                (t.id === cur ? 'border-primary shadow-[3px_3px_8px_rgba(0,0,0,0.12),-2px_-2px_6px_rgba(255,255,255,0.4)]' : 'border-[var(--border-clay-color)] hover:translate-y-[-2px]') +
                '" data-theme-select="' + t.id + '" style="background:var(--bg-clay)">' +
                '<div class="w-12 h-12 rounded-full border-3 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.4)] flex items-center justify-center" style="background-color:' + bgColor + ';border-color:var(--border-clay-color)">' +
                (t.id === cur ? '<span class="material-symbols-outlined text-primary text-xl">check</span>' : '') +
                '</div><span class="text-xs font-bold text-on-surface">' + t.name + '</span></button>';
            }).join('');
            grid.querySelectorAll('[data-theme-select]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    ThemeManager.setTheme(btn.dataset.themeSelect);
                    UIController.renderThemeGrid();
                    UIController.showToast('Theme: ' + THEME_PRESETS.find(function(t) { return t.id === btn.dataset.themeSelect; }).name);
                });
            });
        },

        navigateTo(viewName) {
            var tabs = document.querySelectorAll('[data-view-tab="' + viewName + '"]');
            if (tabs.length > 0) tabs[0].click();
        }
    };

    // ==========================================
    // AMBIENT ENVIRONMENT
    // ==========================================
    const AmbientEnvironment = {
        canvas: null,
        ctx: null,
        particles: [],
        mouse: { x: 0.5, y: 0.5 },
        raf: null,
        active: true,
        init() {
            this.canvas = document.getElementById('ambient-canvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX / window.innerWidth;
                this.mouse.y = e.clientY / window.innerHeight;
            });
            this.createParticles();
            this.render();
        },
        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        createParticles() {
            this.particles = [];
            var count = window.innerWidth < 768 ? 15 : 30;
            var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) count = 5;
            for (var i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.3 + 0.1,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.01 + 0.005
                });
            }
        },
        render() {
            if (!this.active || !this.ctx) return;
            var w = this.canvas.width;
            var h = this.canvas.height;
            this.ctx.clearRect(0, 0, w, h);
            var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#a882ff';
            for (var i = 0; i < this.particles.length; i++) {
                var p = this.particles[i];
                p.x += p.vx + (this.mouse.x - 0.5) * 0.5;
                p.y += p.vy + (this.mouse.y - 0.5) * 0.5;
                p.pulse += p.pulseSpeed;
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;
                var alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = accent;
                this.ctx.globalAlpha = alpha * 0.15;
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = accent;
                this.ctx.globalAlpha = alpha * 0.04;
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
            this.raf = requestAnimationFrame(() => this.render());
        },
        setTimeOfDay() {
            var hour = new Date().getHours();
            var time = 'morning';
            if (hour >= 12 && hour < 17) time = 'afternoon';
            else if (hour >= 17 && hour < 21) time = 'evening';
            else if (hour >= 21 || hour < 6) time = 'night';
            document.documentElement.setAttribute('data-time', time);
        },
        destroy() {
            this.active = false;
            if (this.raf) cancelAnimationFrame(this.raf);
        }
    };

    // ==========================================
    // SOUND MANAGER
    // ==========================================
    const SoundManager = {
        ctx: null,
        enabled: true,
        volume: 0.3,
        init() {
            this.enabled = StorageManager.getSettings().soundEnabled !== false;
            this.volume = 0.3;
        },
        getCtx() {
            if (!this.ctx) {
                try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
            }
            if (this.ctx.state === 'suspended') { this.ctx.resume().catch(function(){}); }
            return this.ctx;
        },
        play(type) {
            if (!this.enabled) return;
            var ctx = this.getCtx();
            if (!ctx) return;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            var now = ctx.currentTime;
            gain.gain.setValueAtTime(this.volume * 0.15, now);
            switch (type) {
                case 'click':
                    osc.frequency.setValueAtTime(800, now);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now); osc.stop(now + 0.05);
                    break;
                case 'navigate':
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.start(now); osc.stop(now + 0.12);
                    break;
                case 'open':
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                    break;
                case 'success':
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.1);
                    osc.frequency.setValueAtTime(784, now + 0.2);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.start(now); osc.stop(now + 0.4);
                    break;
                case 'start':
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                    osc.type = 'triangle';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                    break;
                case 'complete':
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.12);
                    osc.frequency.setValueAtTime(784, now + 0.24);
                    osc.frequency.setValueAtTime(1047, now + 0.36);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
                    osc.start(now); osc.stop(now + 0.6);
                    break;
                default:
                    osc.frequency.setValueAtTime(600, now);
                    osc.type = 'sine';
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now); osc.stop(now + 0.05);
            }
        },
        setEnabled(v) { this.enabled = v; },
        setVolume(v) { this.volume = Math.max(0, Math.min(1, v)); }
    };

    // ==========================================
    // COMMAND BAR
    // ==========================================
    const CommandBar = {
        commands: [
            { name: 'Calculator', desc: 'Open calculator', icon: 'calculate', action: function() { UIController.navigateTo('calculator'); } },
            { name: 'Tasks', desc: 'Manage tasks', icon: 'task_alt', action: function() { UIController.navigateTo('tasks'); } },
            { name: 'Notes', desc: 'Quick notes', icon: 'edit_note', action: function() { UIController.navigateTo('notes'); } },
            { name: 'Reminders', desc: 'Set reminders', icon: 'notifications', action: function() { UIController.navigateTo('reminders'); } },
            { name: 'Focus', desc: 'Pomodoro timer', icon: 'psychology', action: function() { UIController.navigateTo('focus'); } },
            { name: 'Goals', desc: 'Track goals', icon: 'flag', action: function() { UIController.navigateTo('goals'); } },
            { name: 'Expenses', desc: 'Track expenses', icon: 'account_balance_wallet', action: function() { UIController.navigateTo('expenses'); } },
            { name: 'Convert', desc: 'Unit & currency converter', icon: 'swap_horiz', action: function() { UIController.navigateTo('converters'); } },
            { name: 'Stopwatch', desc: 'Start timing', icon: 'timer', action: function() { UIController.navigateTo('stopwatch'); } },
            { name: 'Timer', desc: 'Countdown timer', icon: 'hourglass_top', action: function() { UIController.navigateTo('timer'); } },
            { name: 'Alarm', desc: 'Set an alarm', icon: 'alarm', action: function() { UIController.navigateTo('alarm'); } },
            { name: 'Clock', desc: 'World clock', icon: 'public', action: function() { UIController.navigateTo('clock'); } },
            { name: 'Themes', desc: 'Change theme', icon: 'palette', action: function() { UIController.openModal('themes-modal'); } },
            { name: 'Settings', desc: 'App settings', icon: 'settings', action: function() { UIController.openModal('settings-modal'); } },
            { name: 'Help', desc: 'How to use Digital Workspace', icon: 'help', action: function() { UIController.openModal('help-modal'); } },
        ],
        init() {
            var self = this;
            var inputs = document.querySelectorAll('#home-command-bar, #command-bar-input');
            inputs.forEach(function(input) {
                var suggestionsEl = input.parentElement.querySelector('.command-suggestions');
                input.addEventListener('input', function() {
                    self.filter(input.value, suggestionsEl, input);
                });
                input.addEventListener('focus', function() {
                    if (input.value.length > 0) self.filter(input.value, suggestionsEl, input);
                });
                input.addEventListener('blur', function() {
                    setTimeout(function() { suggestionsEl.classList.remove('visible'); }, 200);
                });
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') { input.blur(); suggestionsEl.classList.remove('visible'); }
                    if (e.key === 'Enter') {
                        var selected = suggestionsEl.querySelector('.selected') || suggestionsEl.querySelector('.command-suggestion');
                        if (selected) selected.click();
                    }
                });
            });
            document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    GlobalSearch.open();
                }
            });
        },
        filter(query, suggestionsEl, input) {
            if (!suggestionsEl) return;
            if (!query || query.length === 0) {
                suggestionsEl.classList.remove('visible');
                suggestionsEl.innerHTML = '';
                return;
            }
            var q = query;
            var matches = [];
            var intentResults = IntentParser.parse(q);
            intentResults.forEach(function(r) {
                matches.push({ name: r.title, desc: r.desc, icon: r.icon, action: r.action });
            });
            if (matches.length < 5) {
                var ql = q.toLowerCase();
                var navMatches = this.commands.filter(function(c) {
                    return c.name.toLowerCase().includes(ql) || c.desc.toLowerCase().includes(ql);
                });
                navMatches.forEach(function(m) {
                    if (!matches.some(function(ex) { return ex.name === m.name; })) matches.push(m);
                });
            }
            if (matches.length === 0) {
                matches.push({ name: 'Search "' + q + '"', desc: 'Global search', icon: 'search', action: function() { GlobalSearch.open(q); } });
            }
            var html = '';
            matches.slice(0, 10).forEach(function(cmd, i) {
                html += '<div class="command-suggestion' + (i === 0 ? ' selected' : '') + '" data-cmd="' + cmd.name + '">' +
                    '<div class="command-suggestion-icon"><span class="material-symbols-outlined">' + cmd.icon + '</span></div>' +
                    '<div class="command-suggestion-text"><div class="command-suggestion-title">' + escapeHtml(cmd.name) + '</div>' +
                    '<div class="command-suggestion-desc">' + escapeHtml(cmd.desc) + '</div></div></div>';
            });
            suggestionsEl.innerHTML = html;
            suggestionsEl.classList.add('visible');
            var self = this;
            suggestionsEl.querySelectorAll('.command-suggestion').forEach(function(el, i) {
                el.addEventListener('click', function() {
                    matches[i].action();
                    input.value = '';
                    suggestionsEl.classList.remove('visible');
                    SoundManager.play('navigate');
                });
            });
        }
    };

    // ==========================================
    // ACTIVITY MANAGER
    // ==========================================
    const ActivityManager = {
        items: [],
        init() { this.items = StorageManager.getActivities(); },
        add(type, desc) {
            this.items.unshift({ id: genId('act'), type: type, desc: desc, ts: Date.now() });
            if (this.items.length > 200) this.items = this.items.slice(0, 200);
            StorageManager.saveActivities(this.items);
        },
        getFiltered(type) {
            if (!type || type === 'all') return this.items;
            return this.items.filter(function(i) { return i.type === type; });
        },
        clear() { this.items = []; StorageManager.saveActivities([]); }
    };

    // ==========================================
    // TASK MANAGER
    // ==========================================
    const TaskManager = {
        tasks: [],
        init() { this.tasks = StorageManager.getTasks(); },
        add(t) {
            t.id = genId('task');
            t.status = t.status || 'todo';
            t.priority = t.priority || 'medium';
            t.createdAt = Date.now();
            t.updatedAt = Date.now();
            t.subtasks = t.subtasks || [];
            this.tasks.unshift(t);
            this.save();
            ActivityManager.add('task', 'Created task: ' + t.title);
            return t;
        },
        update(id, changes) {
            var t = this.tasks.find(function(x) { return x.id === id; });
            if (t) { Object.assign(t, changes, { updatedAt: Date.now() }); this.save(); }
        },
        remove(id) {
            var t = this.tasks.find(function(x) { return x.id === id; });
            this.tasks = this.tasks.filter(function(x) { return x.id !== id; });
            this.save();
            if (t) ActivityManager.add('task', 'Deleted task: ' + t.title);
        },
        toggleComplete(id) {
            var t = this.tasks.find(function(x) { return x.id === id; });
            if (!t) return;
            t.status = t.status === 'completed' ? 'todo' : 'completed';
            t.completedAt = t.status === 'completed' ? Date.now() : null;
            t.updatedAt = Date.now();
            this.save();
            if (t.status === 'completed') { ActivityManager.add('task', 'Completed: ' + t.title); SoundManager.play('complete'); }
        },
        getToday() {
            var today = new Date().toDateString();
            return this.tasks.filter(function(t) {
                if (!t.dueDate) return false;
                return new Date(t.dueDate).toDateString() === today;
            });
        },
        getUpcoming() {
            var now = Date.now();
            return this.tasks.filter(function(t) { return t.dueDate && new Date(t.dueDate).getTime() > now && t.status !== 'completed'; })
                .sort(function(a, b) { return new Date(a.dueDate) - new Date(b.dueDate); });
        },
        getOverdue() {
            var now = Date.now();
            return this.tasks.filter(function(t) { return t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== 'completed'; });
        },
        search(q) {
            var ql = q.toLowerCase();
            return this.tasks.filter(function(t) {
                return (t.title && t.title.toLowerCase().includes(ql)) || (t.notes && t.notes.toLowerCase().includes(ql)) || (t.category && t.category.toLowerCase().includes(ql));
            });
        },
        save() { StorageManager.saveTasks(this.tasks); }
    };

    // ==========================================
    // REMINDER MANAGER
    // ==========================================
    const ReminderManager = {
        reminders: [],
        checkInterval: null,
        init() {
            this.reminders = StorageManager.getReminders();
            var self = this;
            this.checkInterval = setInterval(function() { self.checkReminders(); }, 15000);
        },
        add(r) {
            r.id = genId('rem');
            r.enabled = true;
            r.createdAt = Date.now();
            this.reminders.push(r);
            this.save();
            ActivityManager.add('reminder', 'Created reminder: ' + (r.text || r.title));
            return r;
        },
        update(id, changes) {
            var r = this.reminders.find(function(x) { return x.id === id; });
            if (r) { Object.assign(r, changes); this.save(); }
        },
        remove(id) { this.reminders = this.reminders.filter(function(x) { return x.id !== id; }); this.save(); },
        toggle(id) {
            var r = this.reminders.find(function(x) { return x.id === id; });
            if (r) { r.enabled = !r.enabled; this.save(); }
        },
        checkReminders() {
            var now = new Date();
            var h = now.getHours(), m = now.getMinutes(), dow = now.getDay();
            var changed = false;
            this.reminders.forEach(function(r) {
                if (!r.enabled || r._fired) return;
                if (r.time && r.date) {
                    var rd = new Date(r.date);
                    if (rd.toDateString() === now.toDateString() && r.timeH === h && r.timeM === m) {
                        r._fired = true; changed = true;
                        ReminderManager.fireReminder(r);
                    }
                } else if (r.timeH === h && r.timeM === m && !r.date) {
                    if (r.repeat === 'weekdays' && (dow === 0 || dow === 6)) return;
                    r._fired = true; changed = true;
                    ReminderManager.fireReminder(r);
                    if (r.repeat === 'once') { r.enabled = false; changed = true; }
                }
            });
            if (now.getSeconds() > 5) { this.reminders.forEach(function(r) { if (r._fired && r.repeat !== 'once') r._fired = false; }); }
            if (changed) this.save();
        },
        fireReminder(r) {
            var text = r.text || r.title || 'Reminder';
            UIController.showToast('Reminder: ' + text);
            if ('Notification' in window && Notification.permission === 'granted') {
                    try { new Notification('Reminder', { body: text }); } catch (e) {}
            }
            SoundManager.play('complete');
            ActivityManager.add('reminder', 'Reminder fired: ' + text);
        },
        getUpcoming() {
            var now = Date.now();
            return this.reminders.filter(function(r) { return r.enabled; })
                .sort(function(a, b) { return (a.timeH * 60 + a.timeM) - (b.timeH * 60 + b.timeM); });
        },
        search(q) {
            var ql = q.toLowerCase();
            return this.reminders.filter(function(r) { return (r.text && r.text.toLowerCase().includes(ql)); });
        },
        save() { StorageManager.saveReminders(this.reminders); }
    };

    // ==========================================
    // NOTE MANAGER
    // ==========================================
    const NoteManager = {
        notes: [],
        init() { this.notes = StorageManager.getNotes(); },
        add(n) {
            n.id = genId('note');
            n.createdAt = Date.now();
            n.updatedAt = Date.now();
            n.pinned = false;
            n.archived = false;
            n.tags = n.tags || [];
            this.notes.unshift(n);
            this.save();
            ActivityManager.add('note', 'Created note: ' + (n.title || 'Untitled'));
            return n;
        },
        update(id, changes) {
            var n = this.notes.find(function(x) { return x.id === id; });
            if (n) { Object.assign(n, changes, { updatedAt: Date.now() }); this.save(); }
        },
        remove(id) {
            this.notes = this.notes.filter(function(x) { return x.id !== id; });
            this.save();
        },
        togglePin(id) {
            var n = this.notes.find(function(x) { return x.id === id; });
            if (n) { n.pinned = !n.pinned; this.save(); }
        },
        toggleArchive(id) {
            var n = this.notes.find(function(x) { return x.id === id; });
            if (n) { n.archived = !n.archived; this.save(); }
        },
        search(q) {
            var ql = q.toLowerCase();
            return this.notes.filter(function(n) {
                return (n.title && n.title.toLowerCase().includes(ql)) || (n.body && n.body.toLowerCase().includes(ql)) || (n.tags && n.tags.join(' ').toLowerCase().includes(ql));
            });
        },
        getActive() { return this.notes.filter(function(n) { return !n.archived; }); },
        getArchived() { return this.notes.filter(function(n) { return n.archived; }); },
        save() { StorageManager.saveNotes(this.notes); }
    };

    // ==========================================
    // FOCUS / POMODORO MANAGER
    // ==========================================
    const FocusManager = {
        running: false, paused: false, mode: 'focus', duration: 25 * 60,
        remaining: 25 * 60, timer: null, sessions: 0, sessionTarget: 4,
        totalToday: 0,
        init() {
            var daily = StorageManager.getFocusDaily();
            var today = new Date().toDateString();
            this.totalToday = (daily[today] || 0);
        },
        start(minutes) {
            this.stop();
            this.duration = minutes * 60;
            this.remaining = this.duration;
            this.running = true;
            this.paused = false;
            this.mode = 'focus';
            SoundManager.play('start');
            ActivityManager.add('focus', 'Started ' + minutes + 'min focus session');
            var self = this;
            this.timer = setInterval(function() {
                if (self.paused) return;
                self.remaining--;
                if (self.remaining <= 0) { self.onComplete(); }
            }, 1000);
        },
        pause() { this.paused = true; },
        resume() { this.paused = false; },
        stop() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
            if (this.running && this.mode === 'focus') {
                var elapsed = this.duration - this.remaining;
                if (elapsed > 60) {
                    this.totalToday += elapsed;
                    var daily = StorageManager.getFocusDaily();
                    daily[new Date().toDateString()] = this.totalToday;
                    StorageManager.saveFocusDaily(daily);
                    var sess = { id: genId('fs'), duration: elapsed, date: Date.now() };
                    var sessions = StorageManager.getFocusSessions();
                    sessions.unshift(sess);
                    StorageManager.saveFocusSessions(sessions);
                    ActivityManager.add('focus', 'Logged ' + Math.round(elapsed / 60) + 'min focus');
                }
            }
            this.running = false; this.paused = false; this.mode = 'focus'; this.remaining = this.duration;
        },
        onComplete() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
            SoundManager.play('complete');
            if (this.mode === 'focus') {
                this.sessions++;
                var elapsed = this.duration;
                this.totalToday += elapsed;
                var daily = StorageManager.getFocusDaily();
                daily[new Date().toDateString()] = this.totalToday;
                StorageManager.saveFocusDaily(daily);
                var sess = { id: genId('fs'), duration: elapsed, date: Date.now() };
                var sessions = StorageManager.getFocusSessions();
                sessions.unshift(sess);
                StorageManager.saveFocusSessions(sessions);
                ActivityManager.add('focus', 'Completed focus session: ' + Math.round(elapsed / 60) + 'min');
                UIController.showToast('Focus session complete!');
                if ('Notification' in window && Notification.permission === 'granted') {
                    try { new Notification('Focus Complete', { body: 'Focus session complete! Take a break.' }); } catch (e) {}
                }
                var breakMin = (this.sessions % 4 === 0) ? 15 : 5;
                this.mode = 'break'; this.duration = breakMin * 60; this.remaining = this.duration;
                this.running = true; this.paused = false;
                var self = this;
                this.timer = setInterval(function() { if (self.paused) return; self.remaining--; if (self.remaining <= 0) self.onBreakEnd(); }, 1000);
            } else {
                UIController.showToast('Break over! Ready to focus?');
                this.running = false; this.mode = 'focus'; this.remaining = 25 * 60;
            }
        },
        onBreakEnd() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
            SoundManager.play('start');
            UIController.showToast('Break over! Start a new session.');
            this.running = false; this.mode = 'focus'; this.remaining = 25 * 60;
        },
        getFormattedTime(ms) {
            var s = Math.max(0, Math.floor(ms));
            var m = Math.floor(s / 60); s = s % 60;
            return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        },
        getWeeklyMinutes() {
            var sessions = StorageManager.getFocusSessions();
            var week = Date.now() - 7 * 24 * 60 * 60 * 1000;
            return sessions.filter(function(s) { return s.date > week; }).reduce(function(sum, s) { return sum + s.duration; }, 0);
        }
    };

    // ==========================================
    // GOAL MANAGER
    // ==========================================
    const GoalManager = {
        goals: [],
        init() { this.goals = StorageManager.getGoals(); },
        add(g) {
            g.id = genId('goal');
            g.progress = 0;
            g.createdAt = Date.now();
            g.milestones = g.milestones || [];
            this.goals.push(g);
            this.save();
            ActivityManager.add('goal', 'Created goal: ' + g.title);
            return g;
        },
        update(id, changes) {
            var g = this.goals.find(function(x) { return x.id === id; });
            if (g) { Object.assign(g, changes); this.save(); }
        },
        remove(id) { this.goals = this.goals.filter(function(x) { return x.id !== id; }); this.save(); },
        search(q) {
            var ql = q.toLowerCase();
            return this.goals.filter(function(g) { return g.title && g.title.toLowerCase().includes(ql); });
        },
        getActive() { return this.goals.filter(function(g) { return g.progress < 100; }); },
        save() { StorageManager.saveGoals(this.goals); }
    };

    // ==========================================
    // EXPENSE MANAGER
    // ==========================================
    const ExpenseManager = {
        expenses: [],
        init() { this.expenses = StorageManager.getExpenses(); },
        add(e) {
            e.id = genId('exp');
            e.createdAt = Date.now();
            this.expenses.unshift(e);
            this.save();
            ActivityManager.add('expense', 'Added expense: ' + (e.category || '') + ' ' + (e.currency || '$') + e.amount);
            return e;
        },
        remove(id) { this.expenses = this.expenses.filter(function(x) { return x.id !== id; }); this.save(); },
        getMonthTotal(currency) {
            var now = new Date();
            return this.expenses.filter(function(e) {
                var d = new Date(e.date || e.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && (!currency || e.currency === currency);
            }).reduce(function(sum, e) { return sum + (parseFloat(e.amount) || 0); }, 0);
        },
        getCategoryTotals() {
            var now = new Date();
            var totals = {};
            this.expenses.forEach(function(e) {
                var d = new Date(e.date || e.createdAt);
                if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                    var cat = e.category || 'Other';
                    totals[cat] = (totals[cat] || 0) + (parseFloat(e.amount) || 0);
                }
            });
            return totals;
        },
        getMonthExpenses() {
            var now = new Date();
            return this.expenses.filter(function(e) {
                var d = new Date(e.date || e.createdAt);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        },
        search(q) {
            var ql = q.toLowerCase();
            return this.expenses.filter(function(e) { return (e.note && e.note.toLowerCase().includes(ql)) || (e.category && e.category.toLowerCase().includes(ql)); });
        },
        save() { StorageManager.saveExpenses(this.expenses); }
    };

    // ==========================================
    // INTENT PARSER (Command Bar Core)
    // ==========================================
    const IntentParser = {
        intents: [],
        register(intent) { this.intents.push(intent); },
        parse(query) {
            var q = query.trim();
            if (!q) return [];
            var results = [];
            for (var i = 0; i < this.intents.length; i++) {
                var r = this.intents[i].match(q);
                if (r) results.push(r);
            }
            return results;
        },
        init() {
            var self = this;
            this.register({ name: 'calculator', match: function(q) {
                var m = q.match(/^[\d\s\+\-\*\/\.\%\(\)\^e]+$/);
                if (m && q.length > 1) {
                    try { var result = Evaluator.evaluate(ExpressionParser.parse(q)); return { intent: 'calculator', title: q + ' = ' + result, desc: 'Calculate', icon: 'calculate', action: function() { UIController.navigateTo('calculator'); Calculator.expression = q; Calculator.currentInput = String(result); Calculator.isEvaluated = true; UIController.updateDisplay(); } }; } catch (e) {}
                }
                var pct = q.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|in)\s*(\d+(?:\.\d+)?)/);
                if (pct) {
                    var res = (parseFloat(pct[1]) / 100) * parseFloat(pct[2]);
                    return { intent: 'calculator', title: pct[1] + '% of ' + pct[2] + ' = ' + res, desc: 'Percentage calculation', icon: 'calculate', action: function() { UIController.navigateTo('calculator'); Calculator.currentInput = String(res); Calculator.isEvaluated = true; UIController.updateDisplay(); } };
                }
                return null;
            }});
            this.register({ name: 'task', match: function(q) {
                var m = q.match(/^(?:add|create|new|make)\s+(?:task|todo|t)\s+(.+)/i);
                if (m) {
                    var text = m[1].trim();
                    var due = self.parseDateHint(text);
                    return { intent: 'task', title: 'Create task: ' + text, desc: due ? 'Due: ' + due.label : 'Add to tasks', icon: 'task_alt', action: function() { var t = TaskManager.add({ title: text, dueDate: due ? due.date : null }); UIController.showToast('Task created: ' + text); } };
                }
                if (/^(?:show|open|my)\s+(?:tasks|todo)/i.test(q)) {
                    return { intent: 'task', title: 'Open Tasks', desc: 'View your tasks', icon: 'task_alt', action: function() { UIController.navigateTo('tasks'); } };
                }
                return null;
            }});
            this.register({ name: 'reminder', match: function(q) {
                var m = q.match(/^remind(?:er)?\s+(?:me\s+)?(?:at|for|to)\s+(.+)/i);
                if (!m) m = q.match(/^remind(?:er)?\s+(.+)/i);
                if (m) {
                    var text = m[1].trim();
                    var time = self.parseTimeHint(text);
                    return { intent: 'reminder', title: 'Set reminder: ' + text, desc: time ? 'At ' + time.label : 'Add reminder', icon: 'notifications', action: function() { var r = ReminderManager.add({ text: text, timeH: time ? time.h : 9, timeM: time ? time.m : 0, repeat: 'once' }); UIController.showToast('Reminder set: ' + text); } };
                }
                return null;
            }});
            this.register({ name: 'note', match: function(q) {
                var m = q.match(/^(?:note|notes?|memo|jot)\s*[:\-]?\s+(.+)/i);
                if (m) {
                    var text = m[1].trim();
                    return { intent: 'note', title: 'New note: ' + text.substring(0, 40), desc: 'Create quick note', icon: 'edit_note', action: function() { NoteManager.add({ title: text.substring(0, 60), body: text }); UIController.showToast('Note created'); } };
                }
                if (/^(?:show|open|my)\s+notes?/i.test(q)) {
                    return { intent: 'note', title: 'Open Notes', desc: 'View your notes', icon: 'edit_note', action: function() { UIController.navigateTo('notes'); } };
                }
                return null;
            }});
            this.register({ name: 'focus', match: function(q) {
                var m = q.match(/(\d+)\s*(?:min(?:ute)?s?|m)\s*(?:focus|session|pomo(?:doro)?)/i);
                if (!m) m = q.match(/focus\s+(?:for\s+)?(\d+)\s*(?:min(?:ute)?s?|m)/i);
                if (m) {
                    var min = parseInt(m[1]);
                    return { intent: 'focus', title: 'Start ' + min + '-minute focus session', desc: 'Begin focused work', icon: 'psychology', action: function() { UIController.navigateTo('focus'); setTimeout(function() { FocusManager.start(min); }, 200); } };
                }
                if (/^(?:show|open)?\s*(?:focus|pomodoro)/i.test(q)) {
                    return { intent: 'focus', title: 'Focus Mode', desc: 'Open focus & productivity', icon: 'psychology', action: function() { UIController.navigateTo('focus'); } };
                }
                return null;
            }});
            this.register({ name: 'timer', match: function(q) {
                var m = q.match(/^(?:start|set|begin)\s+(?:a\s+)?timer\s+(?:for\s+)?(\d+)\s*(min(?:ute)?s?|sec(?:ond)?s?|hour|h)/i);
                if (!m) m = q.match(/timer\s+(\d+)\s*(min(?:ute)?s?|sec(?:ond)?s?|hour|h)/i);
                if (m) {
                    var val = parseInt(m[1]);
                    var unit = m[2].toLowerCase();
                    var label = val + ' ' + unit;
                    return { intent: 'timer', title: 'Start timer: ' + label, desc: 'Countdown timer', icon: 'hourglass_top', action: function() { UIController.navigateTo('timer'); } };
                }
                return null;
            }});
            this.register({ name: 'alarm', match: function(q) {
                var m = q.match(/^(?:set|add|create)?\s*alarm\s+(?:for\s+)?(.+)/i);
                if (m) {
                    var time = self.parseTimeHint(m[1]);
                    if (time) {
                        return { intent: 'alarm', title: 'Set alarm for ' + time.label, desc: 'Create alarm', icon: 'alarm', action: function() { UIController.navigateTo('alarm'); } };
                    }
                }
                return null;
            }});
            this.register({ name: 'goal', match: function(q) {
                if (/^(?:show|open|my)\s+goals?/i.test(q)) {
                    return { intent: 'goal', title: 'Open Goals', desc: 'View your goals', icon: 'flag', action: function() { UIController.navigateTo('goals'); } };
                }
                var m = q.match(/^(?:add|create|new)\s+goal\s+(.+)/i);
                if (m) {
                    return { intent: 'goal', title: 'Create goal: ' + m[1], desc: 'Track your goal', icon: 'flag', action: function() { GoalManager.add({ title: m[1].trim(), target: 100 }); UIController.showToast('Goal created: ' + m[1]); } };
                }
                return null;
            }});
            this.register({ name: 'expense', match: function(q) {
                if (/^(?:show|open|my)\s+expense/i.test(q)) {
                    return { intent: 'expense', title: 'Open Expenses', desc: 'Track expenses', icon: 'account_balance_wallet', action: function() { UIController.navigateTo('expenses'); } };
                }
                var m = q.match(/^(?:add|log|track)\s+(?:expense|spent)\s+\$?(\d+(?:\.\d+)?)\s+(?:for|on|:)\s*(.+)/i);
                if (!m) m = q.match(/\$?(\d+(?:\.\d+)?)\s+(?:for|on)\s+(.+)/i);
                if (m) {
                    return { intent: 'expense', title: 'Add expense: $' + m[1] + ' on ' + m[2], desc: 'Log expense', icon: 'account_balance_wallet', action: function() { ExpenseManager.add({ amount: parseFloat(m[1]), category: 'Other', note: m[2].trim(), currency: '$', date: new Date().toISOString() }); UIController.showToast('Expense logged: $' + m[1]); } };
                }
                return null;
            }});
            this.register({ name: 'weather', match: function(q) {
                if (/^(?:show|what'?s?\s+the)?\s*weather/i.test(q)) {
                    return { intent: 'weather', title: 'Weather', desc: 'View current weather', icon: 'cloud', action: function() { UIController.navigateTo('converters'); document.querySelector('[data-converter-tab="weather"]')?.click(); } };
                }
                return null;
            }});
            this.register({ name: 'search', match: function(q) {
                if (/^(?:search|find|look)\s+(?:for\s+)?(.+)/i.test(q)) {
                    var term = q.replace(/^(?:search|find|look)\s+(?:for\s+)?/i, '');
                    return { intent: 'search', title: 'Search: ' + term, desc: 'Global search', icon: 'search', action: function() { GlobalSearch.open(term); } };
                }
                return null;
            }});
            this.register({ name: 'nav', match: function(q) {
                var navMap = { home: 'dashboard', calc: 'calculator', calculator: 'calculator', convert: 'converters', converter: 'converters', tools: 'tools', clock: 'clock', stopwatch: 'stopwatch', timer: 'timer', alarm: 'alarm', theme: 'themes', setting: 'settings', tasks: 'tasks', task: 'tasks', notes: 'notes', note: 'notes', focus: 'focus', reminders: 'reminders', reminder: 'reminders', goals: 'goals', goal: 'goals', expenses: 'expenses', expense: 'expenses' };
                var m = q.match(/^(?:go\s+to|open|show)\s+(.+)/i);
                if (m) {
                    var target = m[1].toLowerCase().trim();
                    if (navMap[target]) {
                        return { intent: 'nav', title: 'Open ' + target, desc: 'Navigate', icon: 'open_in_new', action: function() { UIController.navigateTo(navMap[target]); } };
                    }
                }
                return null;
            }});
        },
        parseTimeHint(text) {
            var m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
            if (m) {
                var h = parseInt(m[1]);
                var min = parseInt(m[2] || '0');
                var ampm = m[3] ? m[3].toLowerCase() : null;
                if (ampm === 'pm' && h < 12) h += 12;
                if (ampm === 'am' && h === 12) h = 0;
                if (!ampm && h < 8) h += 12;
                var label = (h > 12 ? h - 12 : h) + ':' + String(min).padStart(2, '0') + (h >= 12 ? ' PM' : ' AM');
                return { h: h, m: min, label: label };
            }
            return null;
        },
        parseDateHint(text) {
            var lower = text.toLowerCase();
            if (lower.includes('today')) return { date: new Date().toISOString(), label: 'Today' };
            if (lower.includes('tomorrow')) { var d = new Date(); d.setDate(d.getDate() + 1); return { date: d.toISOString(), label: 'Tomorrow' }; }
            if (lower.includes('next week')) { var d = new Date(); d.setDate(d.getDate() + 7); return { date: d.toISOString(), label: 'Next week' }; }
            return null;
        }
    };

    // ==========================================
    // GLOBAL SEARCH
    // ==========================================
    const GlobalSearch = {
        open(prefill) {
            var modal = document.getElementById('search-modal');
            if (!modal) return;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
            var input = document.getElementById('global-search-input');
            if (input) { input.value = prefill || ''; input.focus(); this.search(prefill || ''); }
        },
        close() {
            var modal = document.getElementById('search-modal');
            if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
        },
        search(q) {
            var el = document.getElementById('search-results');
            if (!el) return;
            if (!q || q.length < 2) { el.innerHTML = '<div class="text-center text-on-surface-variant opacity-50 py-12 text-xs">Type to search across tasks, notes, reminders, goals, expenses, and more</div>'; return; }
            var ql = q.toLowerCase();
            var results = [];
            TaskManager.search(q).forEach(function(t) { results.push({ icon: 'task_alt', title: t.title, desc: 'Task', type: 'tasks', action: function() { UIController.navigateTo('tasks'); } }); });
            NoteManager.search(q).forEach(function(n) { results.push({ icon: 'edit_note', title: n.title || 'Untitled', desc: 'Note', type: 'notes', action: function() { UIController.navigateTo('notes'); } }); });
            ReminderManager.search(q).forEach(function(r) { results.push({ icon: 'notifications', title: r.text || r.title, desc: 'Reminder', type: 'reminders', action: function() { UIController.navigateTo('reminders'); } }); });
            GoalManager.search(q).forEach(function(g) { results.push({ icon: 'flag', title: g.title, desc: 'Goal', type: 'goals', action: function() { UIController.navigateTo('goals'); } }); });
            ExpenseManager.search(q).forEach(function(e) { results.push({ icon: 'account_balance_wallet', title: (e.note || e.category) + ': ' + e.amount, desc: 'Expense', type: 'expenses', action: function() { UIController.navigateTo('expenses'); } }); });
            HistoryManager.history.filter(function(h) { return (h.equation && h.equation.toLowerCase().includes(ql)) || (h.result && String(h.result).toLowerCase().includes(ql)); }).slice(0, 5).forEach(function(h) { results.push({ icon: 'calculate', title: h.equation + ' = ' + h.result, desc: 'Calculation', type: 'history', action: function() { UIController.navigateTo('calculator'); } }); });
            if (results.length === 0) { el.innerHTML = '<div class="text-center text-on-surface-variant opacity-50 py-12 text-xs">No results found for "' + escapeHtml(q) + '"</div>'; return; }
            el.innerHTML = results.slice(0, 20).map(function(r, i) {
                return '<button class="search-result-item w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3" data-si="' + i + '">' +
                    '<span class="material-symbols-outlined text-primary text-lg">' + r.icon + '</span>' +
                    '<div><div class="text-sm font-medium text-on-surface">' + escapeHtml(r.title) + '</div>' +
                    '<div class="text-[10px] text-on-surface-variant uppercase tracking-wider">' + r.desc + '</div></div></button>';
            }).join('');
            el.querySelectorAll('[data-si]').forEach(function(btn) {
                btn.addEventListener('click', function() { var idx = parseInt(btn.dataset.si); results[idx].action(); GlobalSearch.close(); });
            });
        }
    };

    // ==========================================
    // TASKS UI
    // ==========================================
    const TasksUI = {
        filter: 'all',
        init() {
            var self = this;
            document.querySelectorAll('#task-filters .task-filter-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('#task-filters .task-filter-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    self.filter = btn.dataset.filter;
                    self.render();
                });
            });
            var searchEl = document.getElementById('task-search');
            if (searchEl) searchEl.addEventListener('input', function() { self.render(); });
            var sortEl = document.getElementById('task-sort');
            if (sortEl) sortEl.addEventListener('change', function() { self.render(); });
        },
        showCreate() { var el = document.getElementById('task-create-form'); if (el) { el.classList.remove('hidden'); document.getElementById('task-title-input')?.focus(); } },
        hideCreate() { var el = document.getElementById('task-create-form'); if (el) el.classList.add('hidden'); },
        saveNew() {
            var title = document.getElementById('task-title-input')?.value?.trim();
            if (!title) { UIController.showToast('Enter a task title'); return; }
            var notes = document.getElementById('task-notes-input')?.value?.trim() || '';
            var due = document.getElementById('task-due-input')?.value || null;
            var priority = document.getElementById('task-priority-input')?.value || 'medium';
            var category = document.getElementById('task-category-input')?.value?.trim() || '';
            TaskManager.add({ title: title, notes: notes, dueDate: due, priority: priority, category: category });
            ['task-title-input', 'task-notes-input', 'task-due-input', 'task-category-input'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
            this.hideCreate();
            this.render();
            UIController.showToast('Task created');
        },
        toggle(id) { TaskManager.toggleComplete(id); this.render(); },
        remove(id) { TaskManager.remove(id); this.render(); },
        getFiltered() {
            var tasks = TaskManager.tasks;
            var searchEl = document.getElementById('task-search');
            var q = searchEl ? searchEl.value.toLowerCase() : '';
            if (q) tasks = tasks.filter(function(t) { return t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)) || (t.category && t.category.toLowerCase().includes(q)); });
            var now = Date.now();
            if (this.filter === 'todo') tasks = tasks.filter(function(t) { return t.status === 'todo'; });
            else if (this.filter === 'in_progress') tasks = tasks.filter(function(t) { return t.status === 'in_progress'; });
            else if (this.filter === 'completed') tasks = tasks.filter(function(t) { return t.status === 'completed'; });
            else if (this.filter === 'overdue') tasks = tasks.filter(function(t) { return t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== 'completed'; });
            var sort = document.getElementById('task-sort')?.value || 'created';
            if (sort === 'due') tasks.sort(function(a, b) { return (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity); });
            else if (sort === 'priority') { var p = { high: 0, medium: 1, low: 2 }; tasks.sort(function(a, b) { return (p[a.priority] || 1) - (p[b.priority] || 1); }); }
            else if (sort === 'name') tasks.sort(function(a, b) { return a.title.localeCompare(b.title); });
            else tasks.sort(function(a, b) { return b.createdAt - a.createdAt; });
            return tasks;
        },
        render() {
            var el = document.getElementById('task-list');
            if (!el) return;
            var tasks = this.getFiltered();
            if (tasks.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">task_alt</div><div class="empty-state-text">No tasks here</div></div>'; return; }
            var now = Date.now();
            el.innerHTML = tasks.map(function(t) {
                var isOverdue = t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== 'completed';
                var dueStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                return '<div class="task-item ' + (t.status === 'completed' ? 'completed' : '') + '" data-task-id="' + t.id + '">' +
                    '<button class="task-check" onclick="TasksUI.toggle(\'' + t.id + '\')">' + (t.status === 'completed' ? '<span class="material-symbols-outlined">check</span>' : '') + '</button>' +
                    '<div style="flex:1"><div class="task-title">' + escapeHtml(t.title) + '</div>' +
                    '<div class="task-meta">' +
                    '<span class="task-priority ' + t.priority + '">' + t.priority + '</span>' +
                    (isOverdue ? '<span class="overdue-badge">Overdue</span>' : '') +
                    (dueStr ? '<span>' + dueStr + '</span>' : '') +
                    (t.category ? '<span>' + escapeHtml(t.category) + '</span>' : '') +
                    '</div></div>' +
                    '<div class="task-actions"><button class="task-action-btn delete" onclick="TasksUI.remove(\'' + t.id + '\')" title="Delete"><span class="material-symbols-outlined" style="font-size:16px">delete</span></button></div>' +
                    '</div>';
            }).join('');
        }
    };

    // ==========================================
    // NOTES UI
    // ==========================================
    const NotesUI = {
        currentFilter: 'all',
        init() { this.render(); },
        setFilter(f) {
            this.currentFilter = f;
            document.querySelectorAll('[data-note-filter]').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.noteFilter === f); });
            this.render();
        },
        showCreate() { var el = document.getElementById('note-create-form'); if (el) { el.classList.remove('hidden'); document.getElementById('note-title-input')?.focus(); } },
        hideCreate() { var el = document.getElementById('note-create-form'); if (el) el.classList.add('hidden'); },
        saveNew() {
            var title = document.getElementById('note-title-input')?.value?.trim();
            var body = document.getElementById('note-body-input')?.value?.trim();
            if (!title && !body) { UIController.showToast('Enter a title or content'); return; }
            var tags = document.getElementById('note-tags-input')?.value?.split(',').map(function(t) { return t.trim(); }).filter(Boolean) || [];
            NoteManager.add({ title: title || 'Untitled', body: body || '', tags: tags });
            ['note-title-input', 'note-body-input', 'note-tags-input'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
            this.hideCreate();
            this.render();
            UIController.showToast('Note saved');
        },
        togglePin(id) { NoteManager.togglePin(id); this.render(); },
        toggleArchive(id) { NoteManager.toggleArchive(id); this.render(); },
        remove(id) { NoteManager.remove(id); this.render(); },
        render() {
            var el = document.getElementById('note-list');
            if (!el) return;
            var searchEl = document.getElementById('note-search');
            var q = searchEl ? searchEl.value.toLowerCase() : '';
            var notes = NoteManager.notes;
            if (q) notes = notes.filter(function(n) { return (n.title && n.title.toLowerCase().includes(q)) || (n.body && n.body.toLowerCase().includes(q)); });
            if (this.currentFilter === 'active') notes = notes.filter(function(n) { return !n.archived && !n.pinned; });
            else if (this.currentFilter === 'pinned') notes = notes.filter(function(n) { return n.pinned && !n.archived; });
            else if (this.currentFilter === 'archived') notes = notes.filter(function(n) { return n.archived; });
            notes.sort(function(a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt; });
            if (notes.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">edit_note</div><div class="empty-state-text">No notes here</div></div>'; return; }
            el.innerHTML = notes.map(function(n) {
                var tagsHtml = (n.tags && n.tags.length) ? '<div class="note-item-tags">' + n.tags.map(function(t) { return '<span class="note-tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '';
                return '<div class="note-item ' + (n.pinned ? 'pinned' : '') + (n.archived ? ' archived' : '') + '">' +
                    '<div class="note-item-title">' + escapeHtml(n.title) + '</div>' +
                    (n.body ? '<div class="note-item-body">' + escapeHtml(n.body) + '</div>' : '') +
                    tagsHtml +
                    '<div class="note-item-actions">' +
                    '<button class="task-action-btn" onclick="NotesUI.togglePin(\'' + n.id + '\')" title="' + (n.pinned ? 'Unpin' : 'Pin') + '"><span class="material-symbols-outlined" style="font-size:16px">' + (n.pinned ? 'push_pin' : 'push_pin') + '</span></button>' +
                    '<button class="task-action-btn" onclick="NotesUI.toggleArchive(\'' + n.id + '\')" title="' + (n.archived ? 'Unarchive' : 'Archive') + '"><span class="material-symbols-outlined" style="font-size:16px">' + (n.archived ? 'unarchive' : 'archive') + '</span></button>' +
                    '<button class="task-action-btn delete" onclick="NotesUI.remove(\'' + n.id + '\')" title="Delete"><span class="material-symbols-outlined" style="font-size:16px">delete</span></button>' +
                    '</div></div>';
            }).join('');
        }
    };

    // ==========================================
    // REMINDERS UI
    // ==========================================
    const RemindersUI = {
        init() {
            if ('Notification' in window && Notification.permission === 'default') { Notification.requestPermission(); }
        },
        save() {
            var text = document.getElementById('reminder-text-input')?.value?.trim();
            if (!text) { UIController.showToast('Enter a reminder'); return; }
            var h = parseInt(document.getElementById('reminder-hour-input')?.value || '9');
            var m = parseInt(document.getElementById('reminder-min-input')?.value || '0');
            var repeat = document.getElementById('reminder-repeat-input')?.value || 'once';
            var date = document.getElementById('reminder-date-input')?.value || null;
            ReminderManager.add({ text: text, timeH: h, timeM: m, repeat: repeat, date: date });
            document.getElementById('reminder-text-input').value = '';
            this.render();
            UIController.showToast('Reminder set');
        },
        toggle(id) { ReminderManager.toggle(id); this.render(); },
        remove(id) { ReminderManager.remove(id); this.render(); },
        render() {
            var el = document.getElementById('reminder-list');
            if (!el) return;
            var reminders = ReminderManager.reminders;
            if (reminders.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">notifications</div><div class="empty-state-text">No reminders set</div></div>'; return; }
            reminders.sort(function(a, b) { return (a.timeH * 60 + a.timeM) - (b.timeH * 60 + b.timeM); });
            el.innerHTML = reminders.map(function(r) {
                var timeStr = String(r.timeH).padStart(2, '0') + ':' + String(r.timeM).padStart(2, '0');
                return '<div class="reminder-item ' + (!r.enabled ? 'disabled' : '') + '">' +
                    '<div class="reminder-time">' + timeStr + '</div>' +
                    '<div style="flex:1"><div class="reminder-text">' + escapeHtml(r.text || r.title || 'Reminder') + '</div>' +
                    '<div class="reminder-repeat">' + (r.repeat || 'once') + (r.date ? ' • ' + r.date : '') + '</div></div>' +
                    '<button class="reminder-toggle ' + (r.enabled ? 'active' : '') + '" onclick="RemindersUI.toggle(\'' + r.id + '\')"></button>' +
                    '<button class="task-action-btn delete" onclick="RemindersUI.remove(\'' + r.id + '\')" title="Delete"><span class="material-symbols-outlined" style="font-size:16px">delete</span></button>' +
                    '</div>';
            }).join('');
        }
    };

    // ==========================================
    // FOCUS UI
    // ==========================================
    const FocusUI = {
        interval: null,
        setDuration(min) {
            document.querySelectorAll('.focus-duration-btn').forEach(function(b) { b.classList.remove('active'); });
            var active = document.querySelector('.focus-duration-btn[onclick*="' + min + '"]');
            if (active) active.classList.add('active');
            if (!FocusManager.running) { FocusManager.duration = min * 60; FocusManager.remaining = min * 60; this.updateDisplay(); }
        },
        toggle() {
            if (FocusManager.running && !FocusManager.paused) { FocusManager.pause(); this.updatePlayBtn('play_arrow'); }
            else if (FocusManager.running && FocusManager.paused) { FocusManager.resume(); this.updatePlayBtn('pause'); }
            else {
                var activeBtn = document.querySelector('.focus-duration-btn.active');
                var min = activeBtn ? parseInt(activeBtn.textContent) : 25;
                FocusManager.start(min);
                this.updatePlayBtn('pause');
            }
            var self = this;
            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(function() { self.updateDisplay(); }, 250);
        },
        stop() { FocusManager.stop(); this.updatePlayBtn('play_arrow'); this.updateDisplay(); },
        updatePlayBtn(icon) {
            var btn = document.getElementById('focus-play-btn');
            if (btn) btn.innerHTML = '<span class="material-symbols-outlined">' + icon + '</span>';
        },
        updateDisplay() {
            var timerEl = document.getElementById('focus-timer-display');
            var modeEl = document.getElementById('focus-mode-label');
            var ringEl = document.getElementById('focus-ring');
            var todayEl = document.getElementById('focus-today-min');
            var weekEl = document.getElementById('focus-week-min');
            var sessEl = document.getElementById('focus-sessions-count');
            if (timerEl) timerEl.textContent = FocusManager.getFormattedTime(FocusManager.remaining * 1000);
            if (modeEl) modeEl.textContent = FocusManager.mode === 'focus' ? 'Focus Session' : 'Break Time';
            if (ringEl) { var pct = FocusManager.duration > 0 ? (1 - FocusManager.remaining / FocusManager.duration) : 0; ringEl.style.strokeDashoffset = (565.48 * (1 - pct)).toString(); }
            if (todayEl) todayEl.textContent = Math.round(FocusManager.totalToday / 60);
            if (weekEl) weekEl.textContent = Math.round(FocusManager.getWeeklyMinutes() / 60);
            if (sessEl) sessEl.textContent = FocusManager.sessions;
        }
    };

    // ==========================================
    // GOALS UI
    // ==========================================
    const GoalsUI = {
        init() { this.render(); },
        showCreate() { var el = document.getElementById('goal-create-form'); if (el) { el.classList.remove('hidden'); document.getElementById('goal-title-input')?.focus(); } },
        hideCreate() { var el = document.getElementById('goal-create-form'); if (el) el.classList.add('hidden'); },
        saveNew() {
            var title = document.getElementById('goal-title-input')?.value?.trim();
            if (!title) { UIController.showToast('Enter a goal title'); return; }
            var desc = document.getElementById('goal-desc-input')?.value?.trim() || '';
            var target = parseInt(document.getElementById('goal-target-input')?.value || '100');
            var unit = document.getElementById('goal-unit-input')?.value?.trim() || '';
            GoalManager.add({ title: title, description: desc, target: target, unit: unit });
            ['goal-title-input', 'goal-desc-input', 'goal-unit-input'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
            this.hideCreate();
            this.render();
            UIController.showToast('Goal created');
        },
        updateProgress(id, delta) {
            var g = GoalManager.goals.find(function(x) { return x.id === id; });
            if (g) { g.progress = Math.max(0, Math.min(g.target, g.progress + delta)); GoalManager.save(); this.render(); }
        },
        remove(id) { GoalManager.remove(id); this.render(); },
        render() {
            var el = document.getElementById('goal-list');
            if (!el) return;
            var goals = GoalManager.goals;
            if (goals.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">flag</div><div class="empty-state-text">No goals yet</div></div>'; return; }
            el.innerHTML = goals.map(function(g) {
                var pct = g.target > 0 ? Math.round((g.progress / g.target) * 100) : 0;
                return '<div class="goal-item">' +
                    '<div class="goal-item-title">' + escapeHtml(g.title) + '</div>' +
                    (g.description ? '<div class="goal-item-desc">' + escapeHtml(g.description) + '</div>' : '') +
                    '<div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + pct + '%"></div></div>' +
                    '<div class="goal-progress-info"><span>' + g.progress + ' / ' + g.target + (g.unit ? ' ' + escapeHtml(g.unit) : '') + '</span><span>' + pct + '%</span></div>' +
                    '<div class="goal-actions">' +
                    '<button class="px-2 py-1 rounded bg-surface-container border border-white/10 text-[10px] text-on-surface hover:bg-white/10 transition" onclick="GoalsUI.updateProgress(\'' + g.id + '\', -1)">-1</button>' +
                    '<button class="px-2 py-1 rounded bg-surface-container border border-white/10 text-[10px] text-on-surface hover:bg-white/10 transition" onclick="GoalsUI.updateProgress(\'' + g.id + '\', 1)">+1</button>' +
                    '<button class="px-2 py-1 rounded bg-surface-container border border-white/10 text-[10px] text-on-surface hover:bg-white/10 transition" onclick="GoalsUI.updateProgress(\'' + g.id + '\', 10)">+10</button>' +
                    '<button class="ml-auto px-2 py-1 rounded bg-surface-container border border-white/10 text-[10px] text-red-400 hover:bg-red-500/10 transition" onclick="GoalsUI.remove(\'' + g.id + '\')">Delete</button>' +
                    '</div></div>';
            }).join('');
        }
    };

    // ==========================================
    // EXPENSES UI
    // ==========================================
    const ExpensesUI = {
        init() {
            var dateEl = document.getElementById('expense-date-input');
            if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().split('T')[0];
            this.render();
        },
        showCreate() { var el = document.getElementById('expense-create-form'); if (el) { el.classList.remove('hidden'); document.getElementById('expense-amount-input')?.focus(); } },
        hideCreate() { var el = document.getElementById('expense-create-form'); if (el) el.classList.add('hidden'); },
        saveNew() {
            var amount = parseFloat(document.getElementById('expense-amount-input')?.value);
            if (!amount || amount <= 0) { UIController.showToast('Enter a valid amount'); return; }
            var category = document.getElementById('expense-category-input')?.value || 'Other';
            var note = document.getElementById('expense-note-input')?.value?.trim() || '';
            var date = document.getElementById('expense-date-input')?.value || new Date().toISOString();
            var currency = document.getElementById('expense-currency-input')?.value || '$';
            ExpenseManager.add({ amount: amount, category: category, note: note, date: date, currency: currency });
            document.getElementById('expense-amount-input').value = '';
            document.getElementById('expense-note-input').value = '';
            this.hideCreate();
            this.render();
            UIController.showToast('Expense added');
        },
        remove(id) { ExpenseManager.remove(id); this.render(); },
        render() {
            var el = document.getElementById('expense-list');
            var totalEl = document.getElementById('expense-month-total');
            var countEl = document.getElementById('expense-month-count');
            var expenses = ExpenseManager.getMonthExpenses();
            expenses.sort(function(a, b) { return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt); });
            if (totalEl) totalEl.textContent = '$' + ExpenseManager.getMonthTotal('$').toFixed(2);
            if (countEl) countEl.textContent = expenses.length;
            if (!el) return;
            if (expenses.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">account_balance_wallet</div><div class="empty-state-text">No expenses this month</div></div>'; return; }
            var catIcons = { Food: 'restaurant', Transport: 'directions_car', Shopping: 'shopping_bag', Entertainment: 'movie', Bills: 'receipt_long', Health: 'local_hospital', Education: 'school', Other: 'more_horiz' };
            el.innerHTML = expenses.map(function(e) {
                var dateStr = new Date(e.date || e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return '<div class="expense-item">' +
                    '<div class="expense-icon"><span class="material-symbols-outlined">' + (catIcons[e.category] || 'more_horiz') + '</span></div>' +
                    '<div class="expense-info"><div class="expense-note">' + escapeHtml(e.note || e.category) + '</div><div class="expense-cat">' + e.category + ' • ' + dateStr + '</div></div>' +
                    '<div style="text-align:right"><div class="expense-amount">' + (e.currency || '$') + e.amount.toFixed(2) + '</div>' +
                    '<button class="task-action-btn delete" onclick="ExpensesUI.remove(\'' + e.id + '\')" title="Delete"><span class="material-symbols-outlined" style="font-size:14px">delete</span></button></div>' +
                    '</div>';
            }).join('');
        }
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    // Expose UI modules to window for inline onclick handlers
    window.TasksUI = TasksUI;
    window.NotesUI = NotesUI;
    window.RemindersUI = RemindersUI;
    window.FocusUI = FocusUI;
    window.GoalsUI = GoalsUI;
    window.ExpensesUI = ExpensesUI;
    window.GlobalSearch = GlobalSearch;

    const initApp = async function() {
        try { ThemeManager.init(); } catch (e) { console.error('ThemeManager init failed:', e); }
        var settings;
        try { settings = SettingsManager.init(); } catch (e) { console.error('SettingsManager init failed:', e); settings = {}; }
        try { ProfileManager.init(); } catch (e) { console.error('ProfileManager init failed:', e); }
        try { FavoritesManager.init(); } catch (e) { console.error('FavoritesManager init failed:', e); }
        try { ActivityManager.init(); } catch (e) { console.error('ActivityManager init failed:', e); }
        try { TaskManager.init(); } catch (e) { console.error('TaskManager init failed:', e); }
        try { ReminderManager.init(); } catch (e) { console.error('ReminderManager init failed:', e); }
        try { NoteManager.init(); } catch (e) { console.error('NoteManager init failed:', e); }
        try { FocusManager.init(); } catch (e) { console.error('FocusManager init failed:', e); }
        try { GoalManager.init(); } catch (e) { console.error('GoalManager init failed:', e); }
        try { ExpenseManager.init(); } catch (e) { console.error('ExpenseManager init failed:', e); }

        Calculator.init({
            angleUnit: (settings && settings.angleUnit) || 'DEG',
            decimalPrecision: (settings && settings.decimalPrecision) || 8,
            useThousandsSeparator: (settings && settings.thousandsSeparator !== undefined) ? settings.thousandsSeparator : true
        });
        Calculator.historyCallback = function(eq, res) { HistoryManager.addEntry(eq, res); };

        try {
            HistoryManager.init(function(item) {
                Calculator.expression = item.equation;
                Calculator.currentInput = item.result;
                Calculator.isEvaluated = true;
                UIController.updateDisplay();
                UIController.showToast('Recalled from history');
            });
        } catch (e) { console.error('HistoryManager init failed:', e); }

        try { UIController.init(); } catch (e) { console.error('UIController init failed:', e); }
        try { DashboardManager.init(); } catch (e) { console.error('DashboardManager init failed:', e); }
        try { RingtoneManager.openDB().catch(function() {}); } catch (e) {}
        CurrencyService.init().catch(function(e) { console.warn('CurrencyService init failed:', e); });
        WeatherService.autoDetect().catch(function() {});
        try { AmbientEnvironment.init(); AmbientEnvironment.setTimeOfDay(); } catch (e) { console.warn('AmbientEnvironment init failed:', e); }
        try { SoundManager.init(); } catch (e) { console.warn('SoundManager init failed:', e); }
        try { CommandBar.init(); } catch (e) { console.warn('CommandBar init failed:', e); }
        try { IntentParser.init(); } catch (e) { console.warn('IntentParser init failed:', e); }
        try { TasksUI.init(); } catch (e) { console.warn('TasksUI init failed:', e); }
        try { NotesUI.init(); } catch (e) { console.warn('NotesUI init failed:', e); }
        try { RemindersUI.init(); } catch (e) { console.warn('RemindersUI.init failed:', e); }
        try { GoalsUI.init(); } catch (e) { console.warn('GoalsUI init failed:', e); }
        try { ExpensesUI.init(); } catch (e) { console.warn('ExpensesUI init failed:', e); }
        setInterval(function() { AmbientEnvironment.setTimeOfDay(); }, 60000);

        var searchModal = document.getElementById('search-modal');
        if (searchModal) {
            searchModal.addEventListener('click', function(e) { if (e.target === searchModal) GlobalSearch.close(); });
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') { GlobalSearch.close(); }
        });

        TasksUI.render();
        NotesUI.render();
        RemindersUI.render();
        FocusUI.updateDisplay();

        var dateEl = document.getElementById('home-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        var homeTime = document.getElementById('home-time');
        var homeTimeSec = document.getElementById('home-time-sec');
        if (homeTime) {
            var now = new Date();
            homeTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (homeTimeSec) homeTimeSec.textContent = ':' + String(now.getSeconds()).padStart(2, '0');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else { initApp(); }

    // ==========================================
    // EXTRAORDINARY ANIMATIONS (UI/UX Pro Max)
    // ==========================================

    // Material Ripple Effect on Calculator Buttons
    document.addEventListener('pointerdown', function(e) {
        var btn = e.target.closest('.calc-btn');
        if (!btn) return;

        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', function() { ripple.remove(); });
    });

    // Display Glow Pulse on Result
    (function() {
        var display = document.getElementById('display');
        if (!display) return;
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                if (m.type === 'characterData' || m.type === 'childList') {
                    var displayEl = document.getElementById('display');
                    var glass = displayEl ? displayEl.closest('.display-glass') : null;
                    if (glass) {
                        glass.classList.remove('result-flash');
                        void glass.offsetWidth;
                        glass.classList.add('result-flash');
                    }
                }
            });
        });
        observer.observe(display, { childList: true, characterData: true, subtree: true });
    })();

})();