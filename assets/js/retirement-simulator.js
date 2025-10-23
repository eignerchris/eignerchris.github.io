// Scenario Management System
class ScenarioManager {
    constructor() {
        this.storageKey = 'retirement-scenarios';
        this.lastScenarioKey = 'retirement-last-scenario';
        this.currentScenarioId = null;
        this.scenarios = this.loadScenarios();
    }

    loadScenarios() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading scenarios:', error);
            return {};
        }
    }

    saveScenarios() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scenarios));
        } catch (error) {
            console.error('Error saving scenarios:', error);
        }
    }

    generateId() {
        return 'scenario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save the last selected scenario
    saveLastScenario(scenarioId) {
        try {
            localStorage.setItem(this.lastScenarioKey, scenarioId);
        } catch (error) {
            console.error('Error saving last scenario:', error);
        }
    }

    // Load the last selected scenario
    getLastScenario() {
        try {
            return localStorage.getItem(this.lastScenarioKey);
        } catch (error) {
            console.error('Error loading last scenario:', error);
            return null;
        }
    }

    createScenario(name, config = {}) {
        const id = this.generateId();
        const scenario = {
            id: id,
            name: name || `Scenario ${Object.keys(this.scenarios).length + 1}`,
            config: config,
            results: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.scenarios[id] = scenario;
        this.saveScenarios();
        return scenario;
    }

    updateScenario(id, updates) {
        if (this.scenarios[id]) {
            this.scenarios[id] = {
                ...this.scenarios[id],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveScenarios();
            return this.scenarios[id];
        }
        return null;
    }

    deleteScenario(id) {
        if (this.scenarios[id]) {
            delete this.scenarios[id];
            this.saveScenarios();
            
            // Clear last scenario if it was the one being deleted
            if (this.getLastScenario() === id) {
                try {
                    localStorage.removeItem(this.lastScenarioKey);
                } catch (error) {
                    console.error('Error clearing last scenario:', error);
                }
            }
            
            return true;
        }
        return false;
    }

    getScenario(id) {
        return this.scenarios[id] || null;
    }

    getAllScenarios() {
        return Object.values(this.scenarios).sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
    }

    duplicateScenario(id, newName) {
        const scenario = this.getScenario(id);
        if (scenario) {
            return this.createScenario(newName || `${scenario.name} (Copy)`, scenario.config);
        }
        return null;
    }
}

// Retirement Monte Carlo Simulator
class MonteCarloRetirementSimulator {
    constructor() {
        this.initializeElements();
        this.setupChart();
        this.addEventListeners();
        this.setupIframeDetection();
        this.incomeEvents = [];
        this.simulationResults = null;
        
        // Initialize scenario management
        this.scenarioManager = new ScenarioManager();
        this.initializeScenarios();
        
        // Market parameters based on historical data
        this.marketParams = {
            meanReturn: 0.07,        // 7% average annual return
            standardDeviation: 0.15,  // 15% standard deviation
            minReturn: -0.40,        // Worst case scenario cap
            maxReturn: 0.40          // Best case scenario cap
        };
    }

    initializeElements() {
        // Input elements
        this.portfolioValue = document.getElementById('portfolio-value');
        this.annualExpenses = document.getElementById('annual-expenses');
        this.retirementYears = document.getElementById('retirement-years');
        this.withdrawalRate = document.getElementById('withdrawal-rate');
        this.marketReturn = document.getElementById('market-return');
        this.inflationRate = document.getElementById('inflation-rate');
        this.numSimulations = document.getElementById('num-simulations');

        // Control elements
        this.runSimulationBtn = document.getElementById('run-simulation');
        this.simulationStatus = document.getElementById('simulation-status');
        this.addIncomeEventBtn = document.getElementById('add-income-event');
        this.incomeEventsContainer = document.getElementById('income-events-container');

        // Result elements
        this.successRate = document.getElementById('success-rate');
        this.successRateCard = document.getElementById('success-rate-card');
        this.percentile10 = document.getElementById('percentile-10');
        this.percentile50 = document.getElementById('percentile-50');
        this.percentile90 = document.getElementById('percentile-90');
        this.monteCarloAnalysis = document.getElementById('monte-carlo-analysis');

        // Statistics elements
        this.statsSection = document.getElementById('stats-section');
        this.statFinalWorth = document.getElementById('stat-final-worth');
        this.statWithdrawalRate = document.getElementById('stat-withdrawal-rate');
        this.statTotalWithdrawn = document.getElementById('stat-total-withdrawn');
        this.statPortfolioGrowth = document.getElementById('stat-portfolio-growth');
        this.statInflationImpact = document.getElementById('stat-inflation-impact');
        this.statYearsSustained = document.getElementById('stat-years-sustained');

        // Chart elements
        this.canvas = document.getElementById('monteCarloChart');
        this.ctx = this.canvas.getContext('2d');

        // Scenario elements
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.scenarioSidebar = document.getElementById('scenario-sidebar');
        this.newScenarioBtn = document.getElementById('new-scenario');
        this.saveScenarioBtn = document.getElementById('save-scenario');
        this.scenarioTitle = document.getElementById('scenario-title');
        this.scenarioListContainer = document.getElementById('scenario-list-container');

        // Collect all inputs for easy iteration
        this.inputs = [
            this.portfolioValue,
            this.annualExpenses,
            this.retirementYears,
            this.withdrawalRate,
            this.inflationRate,
            this.numSimulations
        ];
    }

    setupChart() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Chart dimensions
        this.chartWidth = rect.width - 100;
        this.chartHeight = rect.height - 80;
        this.chartX = 60;
        this.chartY = 20;
    }

    addEventListeners() {
        // Run simulation button
        this.runSimulationBtn.addEventListener('click', () => {
            this.runMonteCarloSimulation();
        });

        // Add income event button
        this.addIncomeEventBtn.addEventListener('click', () => {
            this.addIncomeEvent();
        });

        // Input change listeners for real-time updates
        this.inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.clearResults();
            });
        });

        // Add specific formatting for percentage inputs
        [this.withdrawalRate, this.marketReturn, this.inflationRate].forEach(input => {
            input.addEventListener('blur', () => {
                const value = parseFloat(input.value);
                if (!isNaN(value)) {
                    input.value = value.toFixed(2);
                }
            });
        });

        // Scenario management listeners
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        this.newScenarioBtn.addEventListener('click', () => {
            this.createNewScenario();
        });

        this.saveScenarioBtn.addEventListener('click', () => {
            this.saveCurrentScenario();
        });

        this.scenarioTitle.addEventListener('click', () => {
            this.enableTitleEditing();
        });

        this.scenarioTitle.addEventListener('blur', () => {
            this.disableTitleEditing();
        });

        this.scenarioTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.scenarioTitle.blur();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupChart();
                if (this.simulationResults) {
                    this.drawChart(this.simulationResults);
                }
            }, 100);
        });
    }

    setupIframeDetection() {
        if (window.self !== window.top) {
            document.body.classList.add('iframe-mode');
        }
    }

    addIncomeEvent() {
        const eventId = Date.now();
        const eventDiv = document.createElement('div');
        eventDiv.className = 'income-event';
        eventDiv.innerHTML = `
            <div class="income-event-field">
                <label>Event Name</label>
                <input type="text" placeholder="e.g., Part-time work, Rental income" class="event-name">
            </div>
            <div class="income-event-field">
                <label>Type</label>
                <select class="event-type">
                    <option value="one-time">One-time</option>
                    <option value="recurring">Recurring</option>
                </select>
            </div>
            <div class="income-event-field">
                <label>Amount</label>
                <input type="number" placeholder="0" class="event-amount" step="1000">
            </div>
            <div class="income-event-field">
                <label>Start Year</label>
                <input type="number" placeholder="1" class="event-start-year" min="1" max="50" value="1">
            </div>
            <div class="income-event-field">
                <label>End Year</label>
                <input type="number" placeholder="1" class="event-end-year" min="1" max="50" value="1">
            </div>
            <div class="income-event-field">
                <label>Inflation Adj.</label>
                <select class="event-inflation">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="income-event-field">
                <label>&nbsp;</label>
                <button class="remove-event-btn" onclick="this.parentElement.remove()" title="Remove this income event">×</button>
            </div>
        `;
        
        // Add event listeners to handle type changes
        const typeSelect = eventDiv.querySelector('.event-type');
        const endYearField = eventDiv.querySelector('.event-end-year');
        
        typeSelect.addEventListener('change', function() {
            if (this.value === 'one-time') {
                endYearField.value = eventDiv.querySelector('.event-start-year').value;
                endYearField.disabled = true;
            } else {
                endYearField.disabled = false;
            }
        });
        
        // Sync start year to end year for one-time events
        eventDiv.querySelector('.event-start-year').addEventListener('input', function() {
            if (typeSelect.value === 'one-time') {
                endYearField.value = this.value;
            }
        });
        
        // Initialize as one-time event
        endYearField.disabled = true;
        
        this.incomeEventsContainer.appendChild(eventDiv);
    }

    getInputValues() {
        return {
            portfolioValue: parseFloat(this.portfolioValue.value) || 1000000,
            annualExpenses: parseFloat(this.annualExpenses.value) || 60000,
            retirementYears: parseInt(this.retirementYears.value) || 30,
            withdrawalRate: (parseFloat(this.withdrawalRate.value) || 4) / 100,
            marketReturn: (parseFloat(this.marketReturn.value) || 7) / 100,
            inflationRate: (parseFloat(this.inflationRate.value) || 2.5) / 100,
            numSimulations: parseInt(this.numSimulations.value) || 1000
        };
    }

    getIncomeEvents() {
        const events = [];
        const eventElements = this.incomeEventsContainer.querySelectorAll('.income-event');
        
        eventElements.forEach(element => {
            const name = element.querySelector('.event-name').value;
            const amount = parseFloat(element.querySelector('.event-amount').value);
            const type = element.querySelector('.event-type').value;
            const startYear = parseInt(element.querySelector('.event-start-year').value);
            const endYear = parseInt(element.querySelector('.event-end-year').value);
            const inflationAdjusted = element.querySelector('.event-inflation').value === 'true';
            
            if (name && amount && startYear) {
                events.push({ 
                    name, 
                    amount, 
                    type, 
                    startYear, 
                    endYear: endYear || startYear, 
                    inflationAdjusted 
                });
            }
        });
        
        return events;
    }

    // Box-Muller transformation for normal distribution
    generateNormalRandom(mean, stdDev) {
        let u1 = Math.random();
        let u2 = Math.random();
        
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        let result = z0 * stdDev + mean;
        
        // Cap extreme values
        return Math.max(this.marketParams.minReturn, 
               Math.min(this.marketParams.maxReturn, result));
    }

    runSingleSimulation(values, incomeEvents) {
        const portfolioPath = [];
        let portfolio = values.portfolioValue;
        let currentExpenses = values.annualExpenses;
        let totalWithdrawn = 0;
        let totalIncome = 0;
        
        portfolioPath.push(portfolio);

        for (let year = 1; year <= values.retirementYears; year++) {
            // Generate market return for this year
            const marketReturn = this.generateNormalRandom(
                this.marketParams.meanReturn,
                this.marketParams.standardDeviation
            );

            // Apply market return to portfolio
            portfolio *= (1 + marketReturn);

            // Adjust expenses for inflation
            currentExpenses *= (1 + values.inflationRate);

            // Start with no base income - all income comes from custom events
            let yearlyIncome = 0;
            
            // Add custom income events (one-time and recurring)
            incomeEvents.forEach(event => {
                // Check if this event applies to this year
                if (year >= event.startYear && year <= event.endYear) {
                    let eventAmount = event.amount;
                    
                    // Apply inflation adjustment if specified
                    if (event.inflationAdjusted) {
                        eventAmount *= Math.pow(1 + values.inflationRate, year - 1);
                    }
                    
                    yearlyIncome += eventAmount;
                }
            });

            totalIncome += yearlyIncome;

            // Calculate net withdrawal needed
            const netWithdrawal = Math.max(0, currentExpenses - yearlyIncome);
            totalWithdrawn += netWithdrawal;

            // Withdraw from portfolio
            portfolio -= netWithdrawal;

            // Record portfolio value (can go negative)
            portfolioPath.push(Math.max(0, portfolio));

            // If portfolio is depleted, it stays at 0
            if (portfolio <= 0) {
                portfolio = 0;
            }
        }

        return {
            success: portfolio > 0,
            finalValue: portfolio,
            portfolioPath: portfolioPath,
            totalWithdrawn: totalWithdrawn,
            totalIncome: totalIncome,
            yearsLasted: portfolio > 0 ? values.retirementYears : 
                        portfolioPath.findIndex(value => value <= 0)
        };
    }

    async runMonteCarloSimulation() {
        const values = this.getInputValues();
        const incomeEvents = this.getIncomeEvents();

        // Update market parameters with user input
        this.marketParams.meanReturn = values.marketReturn;

        // Update UI
        this.runSimulationBtn.disabled = true;
        this.simulationStatus.textContent = 'Running simulations...';
        this.clearResults();

        const results = {
            simulations: [],
            successCount: 0,
            finalValues: [],
            allPaths: []
        };

        // Run simulations in batches to avoid blocking UI
        const batchSize = 100;
        const totalBatches = Math.ceil(values.numSimulations / batchSize);

        for (let batch = 0; batch < totalBatches; batch++) {
            const batchStart = batch * batchSize;
            const batchEnd = Math.min((batch + 1) * batchSize, values.numSimulations);
            
            // Update progress
            const progress = Math.round((batch / totalBatches) * 100);
            this.simulationStatus.textContent = `Running simulations... ${progress}%`;

            // Run batch of simulations
            for (let i = batchStart; i < batchEnd; i++) {
                const simulation = this.runSingleSimulation(values, incomeEvents);
                results.simulations.push(simulation);
                results.allPaths.push(simulation.portfolioPath);
                results.finalValues.push(simulation.finalValue);
                
                if (simulation.success) {
                    results.successCount++;
                }
            }

            // Allow UI to update between batches
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Calculate statistics
        results.successRate = (results.successCount / values.numSimulations) * 100;
        results.finalValues.sort((a, b) => a - b);
        
        const p10Index = Math.floor(0.10 * results.finalValues.length);
        const p50Index = Math.floor(0.50 * results.finalValues.length);
        const p90Index = Math.floor(0.90 * results.finalValues.length);
        
        results.percentile10 = results.finalValues[p10Index];
        results.percentile50 = results.finalValues[p50Index];
        results.percentile90 = results.finalValues[p90Index];

        // Store results and update UI
        this.simulationResults = results;
        this.updateResults(results, values);
        this.drawChart(results);

        // Auto-save results to current scenario
        if (this.currentScenarioId) {
            this.scenarioManager.updateScenario(this.currentScenarioId, {
                config: this.getCurrentConfig(),
                results: results
            });
            this.updateScenarioList();
        }

        // Re-enable button
        this.runSimulationBtn.disabled = false;
        this.simulationStatus.textContent = `Completed ${values.numSimulations} simulations`;
    }

    updateResults(results, values) {
        // Update success rate with color coding
        this.successRate.textContent = Math.round(results.successRate) + '%';
        
        if (results.successRate >= 90) {
            this.successRateCard.className = 'probability-card success';
        } else if (results.successRate >= 75) {
            this.successRateCard.className = 'probability-card warning';
        } else {
            this.successRateCard.className = 'probability-card danger';
        }

        // Update percentiles
        this.percentile10.textContent = this.formatCurrencyForCards(results.percentile10);
        this.percentile50.textContent = this.formatCurrencyForCards(results.percentile50);
        this.percentile90.textContent = this.formatCurrencyForCards(results.percentile90);

        // Update analysis
        this.updateAnalysis(results, values);

        // Update statistics table
        this.updateStatistics(results, values);
        
        // Ensure tooltips are added to all results elements
        setTimeout(() => this.addResultsTooltips(), 100);
    }

    updateAnalysis(results, values) {
        let message = '';

        if (results.successRate >= 95) {
            message = `🎉 Excellent! Your retirement plan has a ${Math.round(results.successRate)}% chance of success. `;
            message += `Your portfolio is very likely to last the full ${values.retirementYears} years. `;
            message += `The median final portfolio value is ${this.formatCurrency(results.percentile50)}.`;
        } else if (results.successRate >= 80) {
            message = `✅ Good plan! Your retirement has an ${Math.round(results.successRate)}% success rate. `;
            message += `In the worst 10% of scenarios, you'd have ${this.formatCurrency(results.percentile10)} remaining. `;
            message += `Consider having backup plans for sequence of returns risk.`;
        } else if (results.successRate >= 60) {
            message = `⚠️ Moderate risk. Your plan succeeds ${Math.round(results.successRate)}% of the time. `;
            message += `Consider reducing expenses, delaying retirement, or increasing your starting portfolio. `;
            message += `In failed scenarios, portfolios typically last ${this.calculateAverageFailureYears(results)} years.`;
        } else {
            message = `🚨 High risk! Only ${Math.round(results.successRate)}% of scenarios succeed. `;
            message += `Your current plan needs significant adjustments. Consider: `;
            message += `reducing expenses by ${this.calculateNeededExpenseReduction(results, values)}%, `;
            message += `or increasing your starting portfolio.`;
        }

        this.monteCarloAnalysis.textContent = message;
    }

    // Scenario Management Methods
    initializeScenarios() {
        // Create default scenario if none exist
        const scenarios = this.scenarioManager.getAllScenarios();
        if (scenarios.length === 0) {
            const defaultScenario = this.scenarioManager.createScenario('Default Scenario', this.getCurrentConfig());
            this.currentScenarioId = defaultScenario.id;
        } else {
            // Try to load the last selected scenario
            const lastScenarioId = this.scenarioManager.getLastScenario();
            if (lastScenarioId && this.scenarioManager.getScenario(lastScenarioId)) {
                // Load the last selected scenario if it still exists
                this.currentScenarioId = lastScenarioId;
                this.loadScenario(this.currentScenarioId);
            } else {
                // Fall back to the most recently updated scenario
                this.currentScenarioId = scenarios[0].id;
                this.loadScenario(this.currentScenarioId);
            }
        }
        
        this.updateScenarioList();
        this.updateCurrentScenarioDisplay();
    }

    getCurrentConfig() {
        const values = this.getInputValues();
        const incomeEvents = this.getIncomeEvents();
        
        return {
            portfolioValue: values.portfolioValue,
            annualExpenses: values.annualExpenses,
            retirementYears: values.retirementYears,
            withdrawalRate: values.withdrawalRate * 100, // Convert back to percentage
            marketReturn: values.marketReturn * 100,
            inflationRate: values.inflationRate * 100,
            numSimulations: values.numSimulations,
            incomeEvents: incomeEvents
        };
    }

    loadConfigToInputs(config) {
        this.portfolioValue.value = config.portfolioValue || 1000000;
        this.annualExpenses.value = config.annualExpenses || 60000;
        this.retirementYears.value = config.retirementYears || 30;
        this.withdrawalRate.value = (config.withdrawalRate || 4).toFixed(2);
        this.marketReturn.value = (config.marketReturn || 7).toFixed(2);
        this.inflationRate.value = (config.inflationRate || 2.5).toFixed(2);
        this.numSimulations.value = config.numSimulations || 1000;
        
        // Clear existing income events
        this.incomeEventsContainer.innerHTML = '';
        
        // Load income events
        if (config.incomeEvents && config.incomeEvents.length > 0) {
            config.incomeEvents.forEach(event => {
                this.addIncomeEvent();
                const eventDiv = this.incomeEventsContainer.lastElementChild;
                eventDiv.querySelector('.event-name').value = event.name;
                eventDiv.querySelector('.event-type').value = event.type;
                eventDiv.querySelector('.event-amount').value = event.amount;
                eventDiv.querySelector('.event-start-year').value = event.startYear;
                eventDiv.querySelector('.event-end-year').value = event.endYear;
                eventDiv.querySelector('.event-inflation').value = event.inflationAdjusted ? 'true' : 'false';
                
                // Trigger type change to update UI
                const typeSelect = eventDiv.querySelector('.event-type');
                const endYearField = eventDiv.querySelector('.event-end-year');
                if (typeSelect.value === 'one-time') {
                    endYearField.disabled = true;
                }
            });
        }
    }

    saveCurrentScenario() {
        if (this.currentScenarioId) {
            const scenario = this.scenarioManager.getScenario(this.currentScenarioId);
            if (scenario) {
                const updatedScenario = this.scenarioManager.updateScenario(this.currentScenarioId, {
                    name: this.scenarioTitle.textContent.trim(),
                    config: this.getCurrentConfig(),
                    results: this.simulationResults
                });
                
                this.updateScenarioList();
                this.updateCurrentScenarioDisplay();
                
                // Show save confirmation
                this.showNotification('Scenario saved successfully!');
            }
        }
    }

    createNewScenario() {
        const newName = prompt('Enter a name for the new scenario:', 'New Scenario');
        if (newName) {
            const newScenario = this.scenarioManager.createScenario(newName, this.getCurrentConfig());
            this.loadScenario(newScenario.id);
            this.updateScenarioList();
            this.showNotification(`Scenario "${newName}" created!`);
        }
    }

    loadScenario(scenarioId) {
        const scenario = this.scenarioManager.getScenario(scenarioId);
        if (scenario) {
            this.currentScenarioId = scenarioId;
            // Remember this scenario for next page load
            this.scenarioManager.saveLastScenario(scenarioId);
            this.scenarioTitle.textContent = scenario.name;
            this.loadConfigToInputs(scenario.config);
            
            // Load saved results if available
            if (scenario.results) {
                this.simulationResults = scenario.results;
                this.updateResults(scenario.results, scenario.config);
                this.drawChart(scenario.results);
                this.runSimulationBtn.disabled = false;
                this.simulationStatus.textContent = 'Loaded saved simulation results';
            } else {
                this.clearResults();
            }
            
            this.updateCurrentScenarioDisplay();
            this.updateScenarioList();
        }
    }

    deleteScenario(scenarioId) {
        const scenario = this.scenarioManager.getScenario(scenarioId);
        if (scenario && confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
            this.scenarioManager.deleteScenario(scenarioId);
            
            // If we deleted the current scenario, load another one
            if (this.currentScenarioId === scenarioId) {
                const remainingScenarios = this.scenarioManager.getAllScenarios();
                if (remainingScenarios.length > 0) {
                    this.loadScenario(remainingScenarios[0].id);
                } else {
                    // Create a new default scenario
                    const defaultScenario = this.scenarioManager.createScenario('Default Scenario', this.getCurrentConfig());
                    this.loadScenario(defaultScenario.id);
                }
            }
            
            this.updateScenarioList();
            this.showNotification('Scenario deleted');
        }
    }

    duplicateScenario(scenarioId) {
        const scenario = this.scenarioManager.getScenario(scenarioId);
        if (scenario) {
            const newName = prompt('Enter a name for the duplicate scenario:', `${scenario.name} (Copy)`);
            if (newName) {
                const duplicate = this.scenarioManager.duplicateScenario(scenarioId, newName);
                this.loadScenario(duplicate.id);
                this.updateScenarioList();
                this.showNotification(`Scenario "${newName}" created!`);
            }
        }
    }

    updateScenarioList() {
        const scenarios = this.scenarioManager.getAllScenarios();
        this.scenarioListContainer.innerHTML = '';
        
        scenarios.forEach(scenario => {
            const scenarioDiv = document.createElement('div');
            scenarioDiv.className = `scenario-item ${scenario.id === this.currentScenarioId ? 'active' : ''}`;
            scenarioDiv.innerHTML = `
                <div class="scenario-item-content">
                    <div class="scenario-item-name">${scenario.name}</div>
                    <div class="scenario-item-details">
                        ${scenario.results ? 'Simulated' : 'Not simulated'} • 
                        ${new Date(scenario.updatedAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="scenario-item-actions">
                    <button class="scenario-action-btn" onclick="simulator.duplicateScenario('${scenario.id}')" title="Duplicate">📋</button>
                    <button class="scenario-action-btn" onclick="simulator.deleteScenario('${scenario.id}')" title="Delete">🗑️</button>
                </div>
            `;
            
            scenarioDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('scenario-action-btn')) {
                    this.loadScenario(scenario.id);
                }
            });
            
            this.scenarioListContainer.appendChild(scenarioDiv);
        });
    }

    updateCurrentScenarioDisplay() {
        if (this.currentScenarioId) {
            const scenario = this.scenarioManager.getScenario(this.currentScenarioId);
            if (scenario) {
                this.scenarioTitle.textContent = scenario.name;
            }
        }
    }

    toggleSidebar() {
        this.scenarioSidebar.classList.toggle('collapsed');
    }

    enableTitleEditing() {
        this.scenarioTitle.contentEditable = 'true';
        this.scenarioTitle.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(this.scenarioTitle);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    disableTitleEditing() {
        this.scenarioTitle.contentEditable = 'false';
        // Auto-save when title editing is finished
        this.markScenarioAsModified();
    }

    markScenarioAsModified() {
        // Visual indication that scenario has been modified
        // Could add an asterisk or change color
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add tooltips to results elements
    addResultsTooltips() {
        // Tooltips for statistics
        const statTooltips = {
            'FINAL NET WORTH': 'How much money you\'d have left at the end of retirement in the median scenario. A positive number means your portfolio lasted with money remaining; zero or negative means you may have run out of money.',
            'ANNUAL RETIREMENT INCOME': 'The average annual income you can safely withdraw from your portfolio during retirement, based on your withdrawal rate and portfolio value. This represents your spending power each year.',
            'TOTAL WITHDRAWN': 'Total amount withdrawn from your portfolio over the entire retirement period, including both living expenses and any additional withdrawals. This shows the cumulative impact of your retirement spending.',
            'PORTFOLIO GROWTH': 'How much your portfolio grew (or shrank) including all withdrawals and market performance. This accounts for investment returns minus your withdrawals and shows the net change in portfolio value.',
            'INFLATION IMPACT': 'The total additional cost of goods and services due to inflation over your retirement. This shows how much more expensive things become, reducing your purchasing power over time.',
            'YEARS SUSTAINED': 'How many years your portfolio lasted in the median scenario before running out of money. If this equals your retirement duration, your plan succeeded in the median case.'
        };

        document.querySelectorAll('.stat-label').forEach(label => {
            const statName = label.textContent.trim().toUpperCase();
            if (statTooltips[statName] && !label.querySelector('.tooltip-icon')) {
                // Create tooltip container
                const tooltipContainer = document.createElement('span');
                tooltipContainer.className = 'tooltip';
                tooltipContainer.style.marginLeft = '6px';
                
                // Create tooltip icon
                const icon = document.createElement('span');
                icon.className = 'tooltip-icon';
                icon.textContent = '?';
                icon.style.fontSize = '10px';
                icon.style.width = '14px';
                icon.style.height = '14px';
                icon.style.lineHeight = '14px';
                
                // Create tooltip text
                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                tooltipText.textContent = statTooltips[statName];
                
                // Assemble tooltip
                tooltipContainer.appendChild(icon);
                tooltipContainer.appendChild(tooltipText);
                
                // Add to label
                label.appendChild(tooltipContainer);
            }
        });

        // Tooltips for probability cards
        const probabilityTooltips = {
            'SUCCESS RATE': 'Percentage of simulations where your portfolio lasted the full retirement period without running out of money. Higher percentages indicate a more secure retirement plan. Generally, 80%+ is considered good, 90%+ is excellent.',
            '10TH PERCENTILE': 'In the worst 10% of market scenarios (like major recessions or crashes), your final portfolio value would be this amount or higher. This represents "stress testing" your plan against poor market conditions.',
            '50TH PERCENTILE': 'The middle result - in half of all scenarios, your final portfolio value would be higher than this, and in half it would be lower. This represents typical market performance over your retirement.',
            '90TH PERCENTILE': 'In the best 10% of market scenarios (strong bull markets), your final portfolio value would be this amount or higher. This represents excellent market conditions and shows your upside potential.'
        };

        document.querySelectorAll('.probability-label').forEach(label => {
            const labelText = label.textContent.trim().toUpperCase();
            if (probabilityTooltips[labelText] && !label.querySelector('.tooltip-icon')) {
                // Create tooltip container
                const tooltipContainer = document.createElement('span');
                tooltipContainer.className = 'tooltip';
                tooltipContainer.style.marginLeft = '6px';
                
                // Create tooltip icon
                const icon = document.createElement('span');
                icon.className = 'tooltip-icon';
                icon.textContent = '?';
                icon.style.fontSize = '10px';
                icon.style.width = '14px';
                icon.style.height = '14px';
                icon.style.lineHeight = '14px';
                
                // Create tooltip text
                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                tooltipText.textContent = probabilityTooltips[labelText];
                
                // Assemble tooltip
                tooltipContainer.appendChild(icon);
                tooltipContainer.appendChild(tooltipText);
                
                // Add to label
                label.appendChild(tooltipContainer);
            }
        });
    }

    updateStatistics(results, values) {
        // Show the statistics section
        this.statsSection.style.display = 'block';

        // Calculate median values for all statistics
        const medianIndex = Math.floor(results.simulations.length / 2);
        results.simulations.sort((a, b) => a.finalValue - b.finalValue);
        const medianSimulation = results.simulations[medianIndex];

        // Calculate statistics from median simulation
        const finalWorth = medianSimulation.finalValue;
        const totalWithdrawn = medianSimulation.totalWithdrawn;
        const initialPortfolio = values.portfolioValue;
        
        // Calculate annual withdrawal amount based on median outcome
        const annualWithdrawalAmount = totalWithdrawn / values.retirementYears;
        
        // Calculate portfolio growth
        const portfolioGrowth = ((finalWorth + totalWithdrawn - initialPortfolio) / initialPortfolio) * 100;
        
        // Calculate inflation impact (total cost of inflation over retirement)
        const inflationMultiplier = Math.pow(1 + values.inflationRate, values.retirementYears);
        const rawInflationImpact = (inflationMultiplier - 1) * values.annualExpenses;
        
        // Ensure inflation impact is a reasonable number and handle edge cases
        const inflationImpact = isFinite(rawInflationImpact) && rawInflationImpact > 0 && rawInflationImpact < 1e15 ? rawInflationImpact : 0;
        
        // Years sustained (always full retirement for median since we're looking at successful cases)
        const yearsSustained = medianSimulation.yearsLasted || values.retirementYears;

        // Update the display elements
        this.statFinalWorth.textContent = this.formatCurrencyForCards(finalWorth);
        this.statFinalWorth.className = finalWorth > initialPortfolio * 0.5 ? 'stat-value positive' : 
                                       finalWorth > initialPortfolio * 0.25 ? 'stat-value neutral' : 'stat-value negative';

        this.statWithdrawalRate.textContent = this.formatCurrencyForCards(annualWithdrawalAmount) + '/year';
        this.statWithdrawalRate.className = annualWithdrawalAmount >= values.annualExpenses * 0.9 ? 'stat-value positive' : 
                                           annualWithdrawalAmount >= values.annualExpenses * 0.75 ? 'stat-value neutral' : 'stat-value negative';

        this.statTotalWithdrawn.textContent = this.formatCurrencyForCards(totalWithdrawn);
        this.statTotalWithdrawn.className = 'stat-value neutral';

        this.statPortfolioGrowth.textContent = (portfolioGrowth >= 0 ? '+' : '') + portfolioGrowth.toFixed(1) + '%';
        this.statPortfolioGrowth.className = portfolioGrowth > 0 ? 'stat-value positive' : 
                                            portfolioGrowth > -25 ? 'stat-value neutral' : 'stat-value negative';

        this.statInflationImpact.textContent = this.formatCurrencyForCards(inflationImpact);
        this.statInflationImpact.className = 'stat-value neutral';

        this.statYearsSustained.textContent = yearsSustained + ' / ' + values.retirementYears + ' years';
        this.statYearsSustained.className = yearsSustained === values.retirementYears ? 'stat-value positive' : 
                                           yearsSustained >= values.retirementYears * 0.8 ? 'stat-value neutral' : 'stat-value negative';
        
        // Add tooltips to the newly updated statistics
        this.addResultsTooltips();
    }

    calculateAverageFailureYears(results) {
        const failedSimulations = results.simulations.filter(sim => !sim.success);
        if (failedSimulations.length === 0) return 0;
        
        const totalYears = failedSimulations.reduce((sum, sim) => sum + sim.yearsLasted, 0);
        return Math.round(totalYears / failedSimulations.length);
    }

    calculateNeededExpenseReduction(results, values) {
        // Simplified calculation - reduce expenses to improve success rate
        const currentWithdrawal = values.annualExpenses / values.portfolioValue;
        const safeWithdrawal = 0.035; // 3.5% rule for better success
        const reduction = ((currentWithdrawal - safeWithdrawal) / currentWithdrawal) * 100;
        return Math.max(0, Math.round(reduction));
    }

    drawChart(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!results || results.allPaths.length === 0) return;

        const maxYears = results.allPaths[0].length - 1;
        
        // Calculate better Y-axis scaling for optimal visualization
        const allValues = results.allPaths.flat();
        const startingValue = results.allPaths[0][0];
        
        // Calculate percentiles for better scaling decisions
        const sortedValues = [...allValues].sort((a, b) => a - b);
        const p5 = sortedValues[Math.floor(0.05 * sortedValues.length)];
        const p95 = sortedValues[Math.floor(0.95 * sortedValues.length)];
        
        // Use a range that captures 95% of outcomes with some padding
        const chartMin = Math.max(0, p5 * 0.8);
        const chartMax = Math.max(p95 * 1.2, startingValue * 1.3);

        // Draw grid and axes
        this.drawGrid(chartMax, maxYears, chartMin);

        // Calculate percentiles for better path selection
        const percentilePaths = this.selectPercentilePaths(results);
        
        // Draw percentile range bands first (background)
        this.drawPercentileBands(percentilePaths, chartMax, maxYears, chartMin);
        
        // Draw a more selective sample of paths
        const sampleSize = Math.min(25, results.allPaths.length); // Fewer paths for clarity
        const step = Math.floor(results.allPaths.length / sampleSize);
        
        this.ctx.globalAlpha = 0.4;
        for (let i = 0; i < results.allPaths.length; i += step) {
            const path = results.allPaths[i];
            const success = results.simulations[i].success;
            this.drawPath(path, success ? '#52c41a' : '#ff4d4f', chartMax, maxYears, 1, chartMin);
        }
        this.ctx.globalAlpha = 1.0;

        // Draw key percentile paths with labels
        this.drawPath(percentilePaths.p10, '#ff7875', chartMax, maxYears, 2, chartMin);
        this.drawPath(percentilePaths.p90, '#52c41a', chartMax, maxYears, 2, chartMin);
        
        // Draw median path (most prominent)
        const medianPath = this.calculateMedianPath(results.allPaths);
        this.drawPath(medianPath, '#2c3e50', chartMax, maxYears, 4, chartMin);

        // Draw success/failure zones
        this.drawSuccessZones(chartMax, maxYears, chartMin);

        // Add chart title and labels
        this.addChartLabels(maxYears);
        
        // Add percentile labels
        this.addPercentileLabels(percentilePaths, chartMax, maxYears, chartMin);
    }

    calculateMedianPath(allPaths) {
        const pathLength = allPaths[0].length;
        const medianPath = [];

        for (let year = 0; year < pathLength; year++) {
            const valuesAtYear = allPaths.map(path => path[year]).sort((a, b) => a - b);
            const medianIndex = Math.floor(valuesAtYear.length / 2);
            medianPath.push(valuesAtYear[medianIndex]);
        }

        return medianPath;
    }

    selectPercentilePaths(results) {
        const pathLength = results.allPaths[0].length;
        const p10Path = [];
        const p90Path = [];

        for (let year = 0; year < pathLength; year++) {
            const valuesAtYear = results.allPaths.map(path => path[year]).sort((a, b) => a - b);
            const p10Index = Math.floor(0.10 * valuesAtYear.length);
            const p90Index = Math.floor(0.90 * valuesAtYear.length);
            
            p10Path.push(valuesAtYear[p10Index]);
            p90Path.push(valuesAtYear[p90Index]);
        }

        return { p10: p10Path, p90: p90Path };
    }

    drawPercentileBands(percentilePaths, chartMax, maxYears, chartMin = 0) {
        this.ctx.fillStyle = 'rgba(82, 196, 26, 0.1)';
        this.ctx.beginPath();
        
        // Draw upper band (p90 path)
        percentilePaths.p90.forEach((value, year) => {
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            const y = this.chartY + this.chartHeight - ((value - chartMin) / (chartMax - chartMin)) * this.chartHeight;
            
            if (year === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        // Draw lower band (p10 path) in reverse
        for (let year = percentilePaths.p10.length - 1; year >= 0; year--) {
            const value = percentilePaths.p10[year];
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            const y = this.chartY + this.chartHeight - ((value - chartMin) / (chartMax - chartMin)) * this.chartHeight;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    addPercentileLabels(percentilePaths, chartMax, maxYears, chartMin = 0) {
        const endYear = maxYears;
        const x = this.chartX + this.chartWidth + 5;
        
        // Calculate actual positions
        const p90Value = percentilePaths.p90[endYear];
        const p90Y = this.chartY + this.chartHeight - ((p90Value - chartMin) / (chartMax - chartMin)) * this.chartHeight;
        
        const p10Value = percentilePaths.p10[endYear];
        const p10Y = this.chartY + this.chartHeight - ((p10Value - chartMin) / (chartMax - chartMin)) * this.chartHeight;
        
        // Calculate median position from actual median path
        const medianPath = this.calculateMedianPath([percentilePaths.p10, percentilePaths.p90]);
        const medianValue = (p90Value + p10Value) / 2; // Approximate median
        const medianY = this.chartY + this.chartHeight - ((medianValue - chartMin) / (chartMax - chartMin)) * this.chartHeight;
        
        // Prevent label overlap by adjusting positions if needed
        const labelHeight = 16;
        const minGap = 20;
        
        let positions = [
            { y: p90Y, label: '90th%', color: '#52c41a' },
            { y: medianY, label: 'Median', color: '#2c3e50' },
            { y: p10Y, label: '10th%', color: '#ff7875' }
        ];
        
        // Sort by Y position and adjust overlapping labels
        positions.sort((a, b) => a.y - b.y);
        
        for (let i = 1; i < positions.length; i++) {
            if (positions[i].y - positions[i-1].y < minGap) {
                positions[i].y = positions[i-1].y + minGap;
            }
        }
        
        // Draw labels with background for better readability
        this.ctx.font = 'bold 11px sans-serif';
        positions.forEach(pos => {
            // Draw background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(x - 2, pos.y - 8, 45, 12);
            
            // Draw text
            this.ctx.fillStyle = pos.color;
            this.ctx.fillText(pos.label, x, pos.y);
        });
    }

    drawGrid(maxPortfolio, maxYears, minPortfolio = 0) {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px sans-serif';
        this.ctx.fillStyle = '#6c757d';

        const portfolioRange = maxPortfolio - minPortfolio;

        // Vertical grid lines (years) - improved spacing
        const minXLabelSpacing = 50; // Minimum pixels between X-axis labels
        const maxXLabels = Math.floor(this.chartWidth / minXLabelSpacing);
        const targetXSteps = Math.min(maxXLabels, 10); // Maximum 10 labels
        const yearStep = Math.max(1, Math.ceil(maxYears / targetXSteps));
        
        for (let year = 0; year <= maxYears; year += yearStep) {
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartY);
            this.ctx.lineTo(x, this.chartY + this.chartHeight);
            this.ctx.stroke();

            this.ctx.fillText(year.toString(), x - 10, this.chartY + this.chartHeight + 15);
        }

        // Horizontal grid lines (portfolio value) - improved spacing to prevent overlap
        const minLabelSpacing = 25; // Minimum pixels between labels
        const maxLabels = Math.floor(this.chartHeight / minLabelSpacing);
        const targetSteps = Math.min(maxLabels, 8); // Maximum 8 labels for readability
        
        // Calculate step size that creates nice round numbers
        const roughStep = portfolioRange / targetSteps;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalized = roughStep / magnitude;
        
        let portfolioStep;
        if (normalized <= 1) portfolioStep = magnitude;
        else if (normalized <= 2) portfolioStep = 2 * magnitude;
        else if (normalized <= 5) portfolioStep = 5 * magnitude;
        else portfolioStep = 10 * magnitude;
        
        const gridStart = Math.ceil(minPortfolio / portfolioStep) * portfolioStep;
        
        for (let value = gridStart; value <= maxPortfolio; value += portfolioStep) {
            const y = this.chartY + this.chartHeight - ((value - minPortfolio) / portfolioRange) * this.chartHeight;
            
            // Only draw if within chart bounds
            if (y >= this.chartY && y <= this.chartY + this.chartHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.chartX, y);
                this.ctx.lineTo(this.chartX + this.chartWidth, y);
                this.ctx.stroke();

                this.ctx.fillText(this.formatCurrencyShort(value), 75, y + 4);
            }
        }

        // Draw axes
        this.ctx.strokeStyle = '#495057';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartX, this.chartY);
        this.ctx.lineTo(this.chartX, this.chartY + this.chartHeight);
        this.ctx.lineTo(this.chartX + this.chartWidth, this.chartY + this.chartHeight);
        this.ctx.stroke();
    }

    drawPath(path, color, maxPortfolio, maxYears, lineWidth = 1, minPortfolio = 0) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        
        const portfolioRange = maxPortfolio - minPortfolio;

        this.ctx.beginPath();
        path.forEach((value, year) => {
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            const y = this.chartY + this.chartHeight - ((value - minPortfolio) / portfolioRange) * this.chartHeight;

            if (year === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
    }

    drawSuccessZones(maxPortfolio, maxYears, minPortfolio = 0) {
        const portfolioRange = maxPortfolio - minPortfolio;
        
        // Success zone (above $0)
        const zeroLine = this.chartY + this.chartHeight - ((0 - minPortfolio) / portfolioRange) * this.chartHeight;
        this.ctx.fillStyle = 'rgba(82, 196, 26, 0.08)';
        this.ctx.fillRect(
            this.chartX, 
            this.chartY, 
            this.chartWidth, 
            zeroLine - this.chartY
        );

        // Failure zone (below $0)
        if (zeroLine < this.chartY + this.chartHeight) {
            this.ctx.fillStyle = 'rgba(255, 77, 79, 0.08)';
            this.ctx.fillRect(
                this.chartX,
                zeroLine,
                this.chartWidth,
                this.chartY + this.chartHeight - zeroLine
            );
        }
    }

    addChartLabels(maxYears) {
        this.ctx.fillStyle = '#495057';
        this.ctx.font = 'bold 14px sans-serif';
        
        // X-axis label
        this.ctx.fillText('Years in Retirement', this.chartX + this.chartWidth / 2 - 60, this.chartY + this.chartHeight + 40);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.chartY + this.chartHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Portfolio Value', -50, 0);
        this.ctx.restore();
    }

    clearResults() {
        this.successRate.textContent = '--%';
        this.percentile10.textContent = '--';
        this.percentile50.textContent = '--';
        this.percentile90.textContent = '--';
        this.successRateCard.className = 'probability-card';
        this.monteCarloAnalysis.textContent = 'Run the simulation to see detailed analysis of your retirement plan\'s probability of success.';
        
        // Hide and clear statistics section
        this.statsSection.style.display = 'none';
        this.statFinalWorth.textContent = '--';
        this.statWithdrawalRate.textContent = '--';
        this.statTotalWithdrawn.textContent = '--';
        this.statPortfolioGrowth.textContent = '--';
        this.statInflationImpact.textContent = '--';
        this.statYearsSustained.textContent = '--';

        // Reset stat value classes
        [this.statFinalWorth, this.statWithdrawalRate, this.statTotalWithdrawn, 
         this.statPortfolioGrowth, this.statInflationImpact, this.statYearsSustained].forEach(elem => {
            elem.className = 'stat-value';
        });
        
        // Clear chart
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatCurrencyShort(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + (amount / 1000).toFixed(0) + 'K';
        } else {
            return '$' + amount.toFixed(0);
        }
    }

    formatCurrencyForCards(amount) {
        // Handle edge cases
        if (!isFinite(amount) || amount < 0) {
            return '$0';
        }
        
        if (amount >= 1000000000000) { // 1T+
            return '$' + (amount / 1000000000000).toFixed(1) + 'T';
        } else if (amount >= 100000000000) { // 100B+
            return '$' + (amount / 1000000000).toFixed(0) + 'B';
        } else if (amount >= 10000000000) { // 10B+
            return '$' + (amount / 1000000000).toFixed(1) + 'B';
        } else if (amount >= 1000000000) { // 1B+
            return '$' + (amount / 1000000000).toFixed(2) + 'B';
        } else if (amount >= 100000000) { // 100M+
            return '$' + (amount / 1000000).toFixed(0) + 'M';
        } else if (amount >= 10000000) { // 10M+
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000000) { // 1M+
            return '$' + (amount / 1000000).toFixed(2) + 'M';
        } else if (amount >= 100000) { // 100K+
            return '$' + (amount / 1000).toFixed(0) + 'K';
        } else if (amount >= 1000) { // 1K+
            return '$' + (amount / 1000).toFixed(1) + 'K';
        } else {
            return '$' + amount.toFixed(0);
        }
    }
}

// Initialize the simulator when the DOM is loaded
let simulator;
document.addEventListener('DOMContentLoaded', () => {
    simulator = new MonteCarloRetirementSimulator();
});

// Export for potential use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonteCarloRetirementSimulator;
}