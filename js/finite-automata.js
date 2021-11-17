//by 2k19-it-026

class FiniteAutomata {//START STATE, STATES - ALL STATES, SYMBOLS=EX(0,1)
    constructor({ start, states, symbols } = {}) {
        // this variable holds name of state or null 
        this._start = null;
        if (start !== undefined) this.start = start;

        // this is an object which keys are state names
        // and values of the keys are an object of State class
        this.states = states || {};

        // an array of symbols. example : ['a', 'b']
        this.symbols = symbols || [];
    }
    getStateNames() {
        return Object.keys(this.states);
    }
    //predict the symbol while conversion
    _predictSymbols() {
        const symbols = [];
        console.log(this.states);
        for (const { transitions } of this.states) {
            console.log(transitions);
            console.log(transitions['']);
            for (let symbol in transitions) {
                if (!transitions.hasOwnProperty(symbol)) continue;
                if (symbol === '') continue;

                if (symbols.includes(symbol)) continue;

                symbols.push(symbol);
            }
        }
        return symbols;
    }
    get start() {
        return this._start;
    }
    set start(start) {
        if (!Object.keys(this.states).includes(start)) {
            throw new StateNotFoundError(start + ' state does not exits in this finite automata');
        }
        this._start = start;
    }
    get symbols() {
        const predictedSymbols = this._predictSymbols();
        if (predictedSymbols.length > this._symbols.length) return predictedSymbols;
        return this._symbols;
    }
    set symbols(symbols) {
        if (!Array.isArray(symbols)) {
            throw new SymbolsShouldBeArrayError();
        }

        this._symbols = symbols;
        return this;
    }
    get states() {
        return this._states;
    }
    set states(states) {
        if (typeof states !== 'object') {
            throw new StatesShouldBeObjectError();
        }

        // make this.states iterable using "for of" loop
        this._states = iterableObject(states);
    }
    isDFA() {
        for (const { transitions } of this.states) {
            // if this state had lambda symbol
            // return false, that means this is not a dfa
            if (transitions[''] !== undefined) return false;

            for (let symbol of this._predictSymbols()) {
                // if with a symbol, was connected to more than one state
                // or state has not the symbol in transitions object 
                // return false not a dfa
                if (transitions[symbol] === undefined || transitions[symbol].length !== 1) {
                    return false;
                }
            }
        }
        return true;
    }
    import(json) {
        try {
            json = JSON.parse(json);
        } catch (e) {
            throw new InvalidJsonError('imported string is not a valid json');
        }

        // clear previous data before importing
        this.states = {};
        this._start = null;
        this.symbols = [];

        if (json.hasOwnProperty('states') && typeof json.states === 'object') {
            for (let key in json.states) {
                if (!json.states.hasOwnProperty(key)) continue;

                this.states[key] = new State(json.states[key]);
            }
        }
        if (json.hasOwnProperty('states') && json.hasOwnProperty('start') && Object.keys(json.states).includes(json.start)) {
            this._start = json.start;
        }
        if (json.hasOwnProperty('symbols') && Array.isArray(json.symbols)) {
            this.symbols = json.symbols;
        }

        return this;
    }
    export() {
        return JSON.stringify({
            start: this.start,
            states: this.states,
            symbols: this.symbols,
        });
    }
    findNearestStates(x, y) {
        return Object.values(this.states).filter(state => {
            const distance = Math.sqrt(Math.pow(x - state.x, 2) + Math.pow(y - state.y, 2));

            return distance <= state.getRadius();
        });
    }
    _renderStartStateArrow(ctx) {
        if (this.states[this.start] === undefined) return;

        const state = this.states[this.start];
        const y = state.y;
        const x = state.x - state.getRadius();

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x - 30, y);

        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 10);

        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 10);

        ctx.stroke();
        ctx.closePath();
    }
    render(ctx) {
        this._renderStartStateArrow(ctx);

        for (let state of this.states) state.renderSelfSymbols(ctx);

        for (let state of this.states) state.renderSymbols(ctx);

        for (let state of this.states) state.renderState(ctx);

        return this;
    }
    removeState(name) {
        if (this.states[name] === undefined) {
            throw new StateNotFoundError(name + ' state not found');
        }

        // if state was start point, make this._start null
        if (name === this.start) {
            this._start = null;
        }

        // remove symbols from other states to this state
        for (const { transitions } of this.states) {
            for (let symbol in transitions) {
                if (!transitions.hasOwnProperty(symbol)) continue;

                transitions[symbol] = transitions[symbol].filter(target => target !== name);
            }
        }

        delete this.states[name];
        return this;
    }
    addState(data) {
        if (this.states[data.name] !== undefined) {
            throw new StateAlreadyExistsError(data.name + ' state already exits');
        }

        this.states[data.name] = new State(data);

        return this;
    }
    hasAnyTerminalState() {
        // Loop over all states and check if any state is terminal
        for (let state of this.states) {
            if (state.terminal) {
                // One terminal state found
                return true;
            }
        }

        // No terminal state found
        return false;
    }
    isNFA() {
       
        return !this.isDFA();
    }
}
