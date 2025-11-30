// Smart Recommendations Engine
class RecommendationsEngine {
    constructor() {
        this.recommendations = [];
        this.priorityLevels = {
            CRITICAL: 'critical',
            HIGH: 'high', 
            MEDIUM: 'medium',
            LOW: 'low'
        };
    }

    analyzeScenario(simulationResults, inputValues, incomeEvents) {
        this.recommendations = [];
        
        if (!simulationResults) {
            return this.getInitialRecommendations(inputValues, incomeEvents);
        }

        // Analyze different aspects of the retirement plan
        this.analyzeSuccessRate(simulationResults, inputValues);
        this.analyzeWithdrawalRate(inputValues, simulationResults);
        this.analyzePortfolioSize(simulationResults, inputValues);
        this.analyzeIncomeStrategy(incomeEvents, inputValues, simulationResults);
        this.analyzeMarketAssumptions(inputValues, simulationResults);
        this.analyzeRiskFactors(simulationResults, inputValues);
        this.analyzeTimeHorizon(inputValues);
        
        // Sort by priority
        this.recommendations.sort((a, b) => {
            const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });

        return this.recommendations.slice(0, 8); // Limit to top 8 recommendations
    }

    getInitialRecommendations(inputValues, incomeEvents) {
        const recommendations = [];
        
        recommendations.push({
            title: "🎯 Run Your First Monte Carlo Simulation",
            description: "Get a probabilistic view of your retirement plan's success by running thousands of market scenarios.",
            action: "Click 'Run Monte Carlo Simulation' to begin analysis",
            priority: this.priorityLevels.HIGH,
            category: "analysis",
            impact: "Essential first step for retirement planning"
        });

        // Basic input validation recommendations
        if (inputValues.withdrawalRate > 4.5) {
            recommendations.push({
                title: "⚠️ High Withdrawal Rate Detected",
                description: `Your ${inputValues.withdrawalRate}% withdrawal rate is above the traditional 4% safe withdrawal rate.`,
                action: "Consider reducing to 3.5-4% for safer long-term sustainability",
                priority: this.priorityLevels.HIGH,
                category: "withdrawal",
                impact: "Could significantly improve plan success rate"
            });
        }

        if (incomeEvents.length === 0) {
            recommendations.push({
                title: "💰 Add Income Sources",
                description: "Consider adding Social Security, pensions, or part-time work to reduce portfolio dependency.",
                action: "Use 'Add Income Event' to include additional retirement income",
                priority: this.priorityLevels.MEDIUM,
                category: "income",
                impact: "Reduces required portfolio size and improves flexibility"
            });
        }

        return recommendations;
    }

    analyzeSuccessRate(results, values) {
        const successRate = results.successRate;
        
        // Calculate specific improvements needed
        const currentWithdrawalRate = values.withdrawalRate * 100;
        const currentExpenses = values.annualExpenses;
        const currentPortfolio = values.portfolioValue;
        
        if (successRate < 60) {
            // Calculate specific targets for improvement
            const targetWithdrawalRate = Math.max(3.0, currentWithdrawalRate * 0.8);
            const expenseReduction = Math.round((currentWithdrawalRate - targetWithdrawalRate) / currentWithdrawalRate * 100);
            const additionalSavingsNeeded = Math.round((currentExpenses / 0.035) - currentPortfolio);
            const delayYears = Math.min(10, Math.ceil((additionalSavingsNeeded) / (currentExpenses * 0.25))); // Cap at 10 years, assume 25% savings rate
            
            this.recommendations.push({
                title: "🚨 Critical: Plan Needs Major Changes",
                description: `Your plan succeeds only ${Math.round(successRate)}% of the time. This is too risky for retirement security.`,
                action: `OPTION 1: Reduce expenses by ${expenseReduction}% (from $${this.formatCurrency(currentExpenses)} to $${this.formatCurrency(currentExpenses*(1-expenseReduction/100))} per year) OR OPTION 2: Work ${delayYears} more ${delayYears === 1 ? 'year' : 'years'} to save an additional ${this.formatCurrency(additionalSavingsNeeded)}`,
                priority: this.priorityLevels.CRITICAL,
                category: "success-rate",
                impact: "Essential - could mean the difference between comfortable retirement and running out of money"
            });
        } else if (successRate < 75) {
            const targetExpenses = currentExpenses * 0.9; // 10% reduction
            const targetWithdrawal = Math.max(3.5, currentWithdrawalRate - 0.5);
            
            this.recommendations.push({
                title: "⚠️ Moderate Risk - Needs Improvement",
                description: `${Math.round(successRate)}% success rate leaves significant risk of running out of money.`,
                action: `Reduce expenses to ${this.formatCurrency(targetExpenses)} per year (${Math.round((currentExpenses-targetExpenses)/currentExpenses*100)}% cut) OR lower withdrawal rate to ${targetWithdrawal.toFixed(1)}%`,
                priority: this.priorityLevels.HIGH,
                category: "success-rate",
                impact: "Could improve success rate to 85%+ with these changes"
            });
        } else if (successRate < 85) {
            const expenseReduction = Math.round(currentExpenses * 0.05); // 5% reduction
            
            this.recommendations.push({
                title: "📈 Good Plan - Minor Optimization",
                description: `${Math.round(successRate)}% success rate is good but could reach excellent (90%+) with small adjustments.`,
                action: `Reduce expenses by ${this.formatCurrency(expenseReduction)} per year OR delay retirement by 1 year OR increase starting portfolio by ${this.formatCurrency(100000)}`,
                priority: this.priorityLevels.MEDIUM,
                category: "optimization",
                impact: "Moves your plan from good to excellent with minimal sacrifice"
            });
        } else if (successRate >= 95) {
            this.recommendations.push({
                title: "🎉 Excellent Plan - Consider Optimizations",
                description: `Outstanding ${Math.round(successRate)}% success rate! You have room for lifestyle improvements.`,
                action: "Consider increasing annual expenses by 10-15% for a more comfortable retirement, or retiring 1-2 years earlier",
                priority: this.priorityLevels.LOW,
                category: "optimization",
                impact: "Opportunity to enjoy retirement more while maintaining strong success rate"
            });
        }
    }

    analyzeWithdrawalRate(values, results = null) {
        const withdrawalRate = values.withdrawalRate * 100;
        const currentExpenses = values.annualExpenses;
        
        if (withdrawalRate > 5) {
            const saferExpenses = values.portfolioValue * 0.04; // 4% rule
            const reduction = Math.round(currentExpenses - saferExpenses);
            
            this.recommendations.push({
                title: "⚡ Withdrawal Rate Dangerously High", 
                description: `${withdrawalRate.toFixed(1)}% withdrawal rate dramatically increases failure risk. Historical data shows rates above 5% rarely sustain long retirements.`,
                action: `Reduce expenses by ${this.formatCurrency(reduction)} per year (to ${this.formatCurrency(saferExpenses)} total) to achieve 4% withdrawal rate`,
                priority: this.priorityLevels.HIGH,
                category: "withdrawal",
                impact: "Could improve success rate by 20-30 percentage points"
            });
        } else if (withdrawalRate > 4.5) {
            const conservativeExpenses = values.portfolioValue * 0.035; // 3.5% rule
            const reduction = Math.round(currentExpenses - conservativeExpenses);
            
            this.recommendations.push({
                title: "📊 High Withdrawal Rate",
                description: `${withdrawalRate.toFixed(1)}% exceeds the traditional 4% safe withdrawal rate. Consider a more conservative approach.`,
                action: `Reduce expenses by ${this.formatCurrency(reduction)} per year to achieve 3.5% withdrawal rate for extra safety`,
                priority: this.priorityLevels.MEDIUM,
                category: "withdrawal",
                impact: `Could improve success rate by ${results ? Math.min(15, 95 - results.successRate) : 10}-15 percentage points`
            });
        }
    }

    analyzePortfolioSize(results, values) {
        const fireNumber = values.annualExpenses / values.withdrawalRate;
        const shortfall = fireNumber - values.portfolioValue;
        const successRate = results.successRate;
        
        // Only recommend portfolio growth if there's actually a problem
        if (shortfall > 0 && successRate < 80) {
            const yearsToSave = Math.min(15, Math.ceil(shortfall / (values.annualExpenses * 0.25))); // Cap at 15 years, assuming 25% savings rate
            const annualSavingsNeeded = Math.round(shortfall / yearsToSave);
            
            this.recommendations.push({
                title: "💼 Increase Portfolio Size",
                description: `Your portfolio is ${this.formatCurrency(shortfall)} below the ideal FIRE number of ${this.formatCurrency(fireNumber)} for your current expenses.`,
                action: `Save an additional ${this.formatCurrency(annualSavingsNeeded)} annually for ${yearsToSave} ${yearsToSave === 1 ? 'year' : 'years'}, OR work ${yearsToSave} extra ${yearsToSave === 1 ? 'year' : 'years'} while saving current amounts`,
                priority: successRate < 60 ? this.priorityLevels.HIGH : this.priorityLevels.MEDIUM,
                category: "portfolio",
                impact: `Would increase success rate to approximately ${Math.min(95, successRate + 20)}%`
            });
        }

        // Smart asset allocation based on both portfolio size AND success rate
        if (values.portfolioValue < 500000 && successRate > 70) {
            this.recommendations.push({
                title: "🎯 Growth-Focused Strategy",
                description: "Your plan is working well. With time to recover from market downturns, maximize growth potential.",
                action: "Consider maintaining 80-90% stock allocation to maximize long-term growth",
                priority: this.priorityLevels.LOW,
                category: "allocation",
                impact: "Could reduce years to retirement by 2-4 years"
            });
        } else if (values.portfolioValue > 2000000 && successRate > 90) {
            this.recommendations.push({
                title: "🛡️ Wealth Preservation Mode", 
                description: "With a large portfolio and excellent success rate, you can afford to be more conservative.",
                action: "Consider reducing to 50-60% stocks, 40-50% bonds for capital preservation",
                priority: this.priorityLevels.LOW,
                category: "allocation",
                impact: "Maintains excellent success rate while reducing volatility"
            });
        }
    }

    analyzeIncomeStrategy(incomeEvents, values, results = null) {
        const hasIncomeEvents = incomeEvents.length > 0;
        const totalIncome = incomeEvents.reduce((sum, event) => sum + event.amount, 0);
        const incomeCoveragePercent = totalIncome / values.annualExpenses * 100;
        const successRate = results ? results.successRate : 50;
        
        // Only recommend income diversification if success rate is concerning
        if (!hasIncomeEvents && successRate < 80) {
            const neededIncome = Math.round(values.annualExpenses * 0.4);
            this.recommendations.push({
                title: "🔄 Add Guaranteed Income Sources",
                description: "100% portfolio dependency is risky. Guaranteed income provides stability during market downturns.",
                action: `Add ${this.formatCurrency(neededIncome)} per year in Social Security + part-time work to cover 40% of expenses`,
                priority: successRate < 60 ? this.priorityLevels.HIGH : this.priorityLevels.MEDIUM,
                category: "income",
                impact: `Could improve success rate by 15-25 percentage points to ${Math.min(95, successRate + 20)}%`
            });
        } else if (hasIncomeEvents && incomeCoveragePercent < 30 && successRate < 75) {
            const additionalNeeded = Math.round(values.annualExpenses * 0.4 - totalIncome);
            this.recommendations.push({
                title: "📈 Increase Guaranteed Income",
                description: `Your ${Math.round(incomeCoveragePercent)}% income coverage is low. Target 40-50% for better stability.`,
                action: `Add ${this.formatCurrency(additionalNeeded)} per year in additional income (Social Security, part-time work, or delayed retirement benefits)`,
                priority: this.priorityLevels.MEDIUM,
                category: "income", 
                impact: `Could improve success rate by 10-15 percentage points`
            });
        }

        // Social Security optimization - only if it would meaningfully help
        const hasSocialSecurity = incomeEvents.some(event => 
            event.name.toLowerCase().includes('social') || event.name.toLowerCase().includes('security')
        );
        
        if (!hasSocialSecurity && successRate < 85) {
            this.recommendations.push({
                title: "🏛️ Optimize Social Security Strategy", 
                description: "Social Security provides guaranteed, inflation-adjusted income that reduces portfolio risk.",
                action: `Add Social Security benefits (${this.formatCurrency(25000)}-${this.formatCurrency(45000)} per year depending on earnings history). Consider delaying to age 70 for 32% higher benefits.`,
                priority: successRate < 70 ? this.priorityLevels.HIGH : this.priorityLevels.MEDIUM,
                category: "income",
                impact: "Guaranteed income reduces sequence of returns risk significantly"
            });
        }
    }

    analyzeMarketAssumptions(values, results = null) {
        const marketReturn = values.marketReturn * 100;
        const inflationRate = values.inflationRate * 100;
        const realReturn = marketReturn - inflationRate;
        const successRate = results ? results.successRate : 50;
        
        // Only flag optimistic returns if the plan is already struggling
        if (marketReturn > 8.5 && successRate < 70) {
            const conservativeReturn = 7;
            this.recommendations.push({
                title: "📉 Overly Optimistic Return Assumption",
                description: `${marketReturn}% expected return is above historical averages. Combined with your low success rate, this is concerning.`,
                action: `Reduce expected return to ${conservativeReturn}% and re-run simulation to see realistic outcomes`,
                priority: this.priorityLevels.HIGH,
                category: "assumptions",
                impact: "Reveals true risk level - may show need for significant plan changes"
            });
        } else if (marketReturn > 9 && successRate > 80) {
            this.recommendations.push({
                title: "📊 Stress Test Your Plan",
                description: `${marketReturn}% return assumption is optimistic. Your plan looks good, but test with conservative assumptions.`,
                action: "Re-run simulation with 6-7% returns to stress test your plan",
                priority: this.priorityLevels.LOW,
                category: "assumptions",
                impact: "Confirms plan robustness under various market conditions"
            });
        }
        
        // Low real returns are only problematic if already showing poor results
        if (realReturn < 3.5 && successRate < 75) {
            const additionalSavings = Math.round(values.annualExpenses * 0.1);
            this.recommendations.push({
                title: "⚖️ Low Real Return Environment",
                description: `${realReturn.toFixed(1)}% real return combined with ${Math.round(successRate)}% success rate suggests challenging conditions.`,
                action: `Increase annual savings by ${this.formatCurrency(additionalSavings)} or delay retirement by 2-3 years to compensate for low expected returns`,
                priority: this.priorityLevels.MEDIUM,
                category: "assumptions",
                impact: "Addresses the challenge of lower future market returns"
            });
        }

        // High inflation warnings only if it's creating problems
        if (inflationRate > 4 && results && results.percentile10 < values.portfolioValue * 0.3) {
            this.recommendations.push({
                title: "💸 High Inflation Risk",
                description: `${inflationRate}% inflation assumption is creating significant purchasing power erosion in your projections.`,
                action: "Consider 70-80% stock allocation and I-Bonds or TIPS for inflation protection",
                priority: this.priorityLevels.MEDIUM,
                category: "inflation",
                impact: "Protects purchasing power against sustained high inflation"
            });
        }
    }

    analyzeRiskFactors(results, values) {
        const p10 = results.percentile10;
        const p50 = results.percentile50;
        const successRate = results.successRate;
        
        // Sequence of returns risk - only if there's actual risk shown in results
        if (p10 < values.portfolioValue * 0.2 && successRate < 85) {
            this.recommendations.push({
                title: "🌊 Sequence of Returns Risk",
                description: "Poor early market returns could severely impact your plan. The 10th percentile outcome shows significant portfolio depletion.",
                action: "Consider bond tent strategy: gradually increase bond allocation from 20% to 50% in the 10 years before retirement",
                priority: this.priorityLevels.HIGH,
                category: "risk",
                impact: "Protects against early retirement market crashes"
            });
        }
        
        // Only recommend specific portfolio changes if there are actual problems
        if (successRate < 70) {
            this.recommendations.push({
                title: "🎯 Portfolio Allocation Strategy",
                description: `With a ${Math.round(successRate)}% success rate, consider a more defensive allocation as retirement approaches.`,
                action: "Reduce equity allocation to 60-70% and increase high-quality bonds to 30-40%",
                priority: this.priorityLevels.MEDIUM,
                category: "allocation",
                impact: "Reduces downside risk while maintaining growth potential"
            });
        }
    }

    analyzeTimeHorizon(values) {
        const retirementYears = values.retirementYears;
        
        if (retirementYears > 35) {
            this.recommendations.push({
                title: "⏳ Long Retirement Period",
                description: `${retirementYears}-year retirement increases longevity and inflation risk.`,
                action: "Consider healthcare cost planning and long-term care insurance",
                priority: this.priorityLevels.MEDIUM,
                category: "planning",
                impact: "Addresses extended retirement risks"
            });
        }
        
        if (retirementYears < 20) {
            this.recommendations.push({
                title: "⚡ Short Retirement Window",
                description: `${retirementYears} years may be optimistic for longevity planning.`,
                action: "Consider planning for 25-30 years to account for longevity risk",
                priority: this.priorityLevels.MEDIUM,
                category: "planning",
                impact: "Prevents outliving your money"
            });
        }
    }

    formatRecommendations() {
        return this.recommendations.map(rec => ({
            ...rec,
            priorityDisplay: this.getPriorityDisplay(rec.priority),
            categoryIcon: this.getCategoryIcon(rec.category)
        }));
    }

    getPriorityDisplay(priority) {
        const displays = {
            critical: { text: 'Critical', class: 'priority-critical' },
            high: { text: 'High Priority', class: 'priority-high' },
            medium: { text: 'Consider', class: 'priority-medium' },
            low: { text: 'Optional', class: 'priority-low' }
        };
        return displays[priority] || displays.medium;
    }

    getCategoryIcon(category) {
        const icons = {
            'success-rate': '🎯',
            'withdrawal': '📊', 
            'portfolio': '💼',
            'income': '💰',
            'assumptions': '📈',
            'risk': '🛡️',
            'planning': '⏰',
            'allocation': '🎯',
            'analysis': '🔍',
            'optimization': '⚡',
            'inflation': '💸'
        };
        return icons[category] || '💡';
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + Math.round(amount / 1000) + 'K';
        } else {
            return '$' + Math.round(amount).toLocaleString();
        }
    }
}

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
        this.expenseEvents = [];
        this.simulationResults = null;
        
        // Initialize scenario management
        this.scenarioManager = new ScenarioManager();
        this.initializeScenarios();
        this.initializeUrlSharing();
        
        // Initialize recommendations engine (will be initialized after DOM elements)
        this.recommendationsEngine = null;
        this.recommendationsSection = null;
        this.recommendationsContainer = null;
        
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
        this.addExpenseEventBtn = document.getElementById('add-expense-event');
        this.expenseEventsContainer = document.getElementById('expense-events-container');

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

        // Growth table elements
        this.growthTableSection = document.getElementById('growth-table-section');
        this.growthTableBody = document.getElementById('growth-table-body');
        this.exportCsvBtn = document.getElementById('export-csv-btn');

        // Chart elements
        this.canvas = document.getElementById('monteCarloChart');
        this.ctx = this.canvas.getContext('2d');

        // Scenario elements
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.scenarioSidebar = document.getElementById('scenario-sidebar');
        this.newScenarioBtn = document.getElementById('new-scenario');
        this.saveScenarioBtn = document.getElementById('save-scenario');
        this.shareScenarioBtn = document.getElementById('share-scenario');
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
        
        // Initialize recommendations engine after DOM elements are ready
        this.initializeRecommendations();
    }
    
    initializeRecommendations() {
        this.recommendationsEngine = new RecommendationsEngine();
        this.recommendationsSection = document.getElementById('recommendations-section');
        this.recommendationsContainer = document.getElementById('recommendations-container');
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
        this.chartWidth = rect.width - 140; // Increased from 100 to give more space for right labels
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

        // Add expense event button
        this.addExpenseEventBtn.addEventListener('click', () => {
            this.addExpenseEvent();
        });

        // Input change listeners for real-time updates
        this.inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.clearResults();
                // Update recommendations when inputs change
                setTimeout(() => this.updateRecommendations(), 100);
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

        this.shareScenarioBtn.addEventListener('click', () => {
            this.shareScenario();
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

        // Export CSV button listener
        this.exportCsvBtn.addEventListener('click', () => {
            this.exportToCSV();
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
                <label>Annual Amount</label>
                <input type="number" placeholder="25000" class="event-amount" step="1000">
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
                <button class="remove-event-btn" onclick="this.parentElement.parentElement.remove()" title="Remove this income event">×</button>
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

    addExpenseEvent() {
        const eventId = Date.now();
        const eventDiv = document.createElement('div');
        eventDiv.className = 'expense-event';
        eventDiv.innerHTML = `
            <div class="expense-event-field">
                <label>Event Name</label>
                <input type="text" placeholder="e.g., Home renovation, Medical bills" class="event-name">
            </div>
            <div class="expense-event-field">
                <label>Type</label>
                <select class="event-type">
                    <option value="one-time">One-time</option>
                    <option value="recurring">Recurring</option>
                </select>
            </div>
            <div class="expense-event-field">
                <label>Annual Amount</label>
                <input type="number" placeholder="15000" class="event-amount" step="1000">
            </div>
            <div class="expense-event-field">
                <label>Start Year</label>
                <input type="number" placeholder="1" class="event-start-year" min="1" max="50" value="1">
            </div>
            <div class="expense-event-field">
                <label>End Year</label>
                <input type="number" placeholder="1" class="event-end-year" min="1" max="50" value="1">
            </div>
            <div class="expense-event-field">
                <label>Inflation Adj.</label>
                <select class="event-inflation">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="expense-event-field">
                <label>&nbsp;</label>
                <button class="remove-event-btn" onclick="this.parentElement.parentElement.remove()" title="Remove this expense event">×</button>
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
        
        this.expenseEventsContainer.appendChild(eventDiv);
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

    getExpenseEvents() {
        const events = [];
        const eventElements = this.expenseEventsContainer.querySelectorAll('.expense-event');
        
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

    runSingleSimulation(values, incomeEvents, expenseEvents) {
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

            // Add custom expense events to current expenses
            let additionalExpenses = 0;
            expenseEvents.forEach(event => {
                // Check if this event applies to this year
                if (year >= event.startYear && year <= event.endYear) {
                    let eventAmount = event.amount;
                    
                    // Apply inflation adjustment if specified
                    if (event.inflationAdjusted) {
                        eventAmount *= Math.pow(1 + values.inflationRate, year - 1);
                    }
                    
                    additionalExpenses += eventAmount;
                }
            });

            const totalExpenses = currentExpenses + additionalExpenses;

            // Calculate net withdrawal needed
            const netWithdrawal = Math.max(0, totalExpenses - yearlyIncome);
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
        const expenseEvents = this.getExpenseEvents();

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
                const simulation = this.runSingleSimulation(values, incomeEvents, expenseEvents);
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
        
        // Update recommendations after simulation
        this.updateRecommendations();
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
        
        // Update growth table
        this.updateGrowthTable(results, values);
        
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
        const expenseEvents = this.getExpenseEvents();
        
        return {
            portfolioValue: values.portfolioValue,
            annualExpenses: values.annualExpenses,
            retirementYears: values.retirementYears,
            withdrawalRate: values.withdrawalRate * 100, // Convert back to percentage
            marketReturn: values.marketReturn * 100,
            inflationRate: values.inflationRate * 100,
            numSimulations: values.numSimulations,
            incomeEvents: incomeEvents,
            expenseEvents: expenseEvents
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
        
        // Clear existing expense events
        this.expenseEventsContainer.innerHTML = '';
        
        // Load expense events
        if (config.expenseEvents && config.expenseEvents.length > 0) {
            config.expenseEvents.forEach(event => {
                this.addExpenseEvent();
                const eventDiv = this.expenseEventsContainer.lastElementChild;
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

    shareScenario() {
        const config = this.getCurrentConfig();
        const url = this.generateShareableUrl(config);
        
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Shareable URL copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Shareable URL copied to clipboard!');
        });
    }

    generateShareableUrl(config) {
        // Encode the configuration as base64
        const configString = JSON.stringify(config);
        const encodedConfig = btoa(configString);
        
        // Create URL with encoded data
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?scenario=${encodedConfig}`;
    }

    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedScenario = urlParams.get('scenario');
        
        if (encodedScenario) {
            try {
                const configString = atob(encodedScenario);
                const config = JSON.parse(configString);
                
                // Create a new scenario with the shared configuration
                const scenarioName = `Shared Scenario - ${new Date().toLocaleDateString()}`;
                const newScenario = this.scenarioManager.createScenario(scenarioName, config);
                
                // Load the scenario
                this.loadScenario(newScenario.id);
                this.updateScenarioList();
                
                // Clean up the URL
                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                this.showNotification('Shared scenario loaded successfully!');
                
                return true;
            } catch (error) {
                console.error('Error loading shared scenario:', error);
                this.showNotification('Error loading shared scenario. Invalid URL.');
                return false;
            }
        }
        return false;
    }

    initializeUrlSharing() {
        // Check if there's a shared scenario in the URL on page load
        setTimeout(() => {
            this.loadFromUrl();
        }, 100); // Small delay to ensure everything is initialized
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
                // Convert config percentages to decimals for calculations
                const configAsValues = {
                    portfolioValue: scenario.config.portfolioValue,
                    annualExpenses: scenario.config.annualExpenses,
                    retirementYears: scenario.config.retirementYears,
                    withdrawalRate: scenario.config.withdrawalRate / 100,
                    marketReturn: scenario.config.marketReturn / 100,
                    inflationRate: scenario.config.inflationRate / 100,
                    numSimulations: scenario.config.numSimulations
                };
                this.updateResults(scenario.results, configAsValues);
                this.drawChart(scenario.results);
                this.runSimulationBtn.disabled = false;
                this.simulationStatus.textContent = 'Loaded saved simulation results';
            } else {
                this.clearResults();
            }
            
            // Update recommendations for the loaded scenario
            this.updateRecommendations();
            
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

    updateRecommendations() {
        try {
            if (!this.recommendationsEngine || !this.recommendationsSection || !this.recommendationsContainer) {
                return;
            }
            
            const inputValues = this.getInputValues();
            const incomeEvents = this.getIncomeEvents();
            const recommendations = this.recommendationsEngine.analyzeScenario(
                this.simulationResults, 
                inputValues, 
                incomeEvents
            );
            
            this.displayRecommendations(recommendations);
        } catch (error) {
            console.error('Error updating recommendations:', error);
        }
    }

    displayRecommendations(recommendations) {
        if (!this.recommendationsContainer || !this.recommendationsSection) return;
        
        // Show the recommendations section
        this.recommendationsSection.style.display = 'block';
        
        // Clear existing recommendations
        this.recommendationsContainer.innerHTML = '';
        
        if (recommendations.length === 0) {
            this.recommendationsContainer.innerHTML = `
                <div class="recommendation-card">
                    <div class="recommendation-title">🎉 Excellent Plan!</div>
                    <div class="recommendation-description">
                        Your retirement plan appears well-optimized. Continue monitoring and adjusting as needed.
                    </div>
                </div>
            `;
            return;
        }
        
        // Display recommendations
        recommendations.forEach(rec => {
            const priorityDisplay = this.recommendationsEngine.getPriorityDisplay(rec.priority);
            const categoryIcon = this.recommendationsEngine.getCategoryIcon(rec.category);
            
            const card = document.createElement('div');
            card.className = `recommendation-card priority-${rec.priority}`;
            card.innerHTML = `
                <div class="recommendation-header">
                    <div class="recommendation-title">${categoryIcon} ${rec.title}</div>
                    <div class="recommendation-priority priority-${rec.priority}">
                        ${priorityDisplay.text}
                    </div>
                </div>
                <div class="recommendation-description">${rec.description}</div>
                <div class="recommendation-action">${rec.action}</div>
                <div class="recommendation-impact">${rec.impact}</div>
            `;
            
            this.recommendationsContainer.appendChild(card);
        });
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
            const successRateHtml = scenario.results ? 
                `<div class="scenario-success-rate ${this.getSuccessRateClass(scenario.results.successRate)}">${Math.round(scenario.results.successRate)}%</div>` : 
                '';
            
            scenarioDiv.innerHTML = `
                <div class="scenario-item-content">
                    <div class="scenario-item-header">
                        <div class="scenario-item-name">${scenario.name}</div>
                        ${successRateHtml}
                    </div>
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

    getSuccessRateClass(successRate) {
        if (successRate >= 85) return 'success';
        if (successRate >= 70) return 'warning';
        return 'danger';
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
            'ANNUAL RETIREMENT INCOME': 'The initial annual income you can withdraw from your portfolio based on your starting portfolio value and withdrawal rate. This amount adjusts over time for inflation and represents what your portfolio provides in year one of retirement.',
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
        
        // Calculate annual withdrawal amount - use the planned withdrawal rate, not average withdrawals
        // This represents the retirement income you're planning to generate from your portfolio
        const annualWithdrawalAmount = initialPortfolio * values.withdrawalRate;
        
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
        // Show positive if withdrawal amount covers expenses, neutral if close, negative if insufficient
        const totalAnnualIncome = medianSimulation.totalIncome / values.retirementYears;
        const totalAnnualNeeds = values.annualExpenses;
        const canCoverExpenses = (annualWithdrawalAmount + totalAnnualIncome) >= totalAnnualNeeds;
        this.statWithdrawalRate.className = canCoverExpenses ? 'stat-value positive' : 'stat-value negative';

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
        
        // Calculate percentiles for better path selection first
        const percentilePaths = this.selectPercentilePaths(results);
        
        // Calculate percentiles for better scaling decisions
        const sortedValues = [...allValues].sort((a, b) => a - b);
        const p5 = sortedValues[Math.floor(0.05 * sortedValues.length)];
        const p95 = sortedValues[Math.floor(0.95 * sortedValues.length)];
        
        // Also include the actual percentile path values in scaling
        const p90MaxValue = Math.max(...percentilePaths.p90);
        const p10MinValue = Math.min(...percentilePaths.p10);
        
        // Use a range that captures all percentile paths with some padding
        const chartMin = Math.max(0, Math.min(p5 * 0.8, p10MinValue * 0.9));
        const chartMax = Math.max(p95 * 1.2, startingValue * 1.3, p90MaxValue * 1.1);

        // Draw grid and axes
        this.drawGrid(chartMax, maxYears, chartMin);
        
        // Set up clipping region to constrain all paths within chart boundaries
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.chartX, this.chartY, this.chartWidth, this.chartHeight);
        this.ctx.clip();
        
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

        // Restore clipping context before drawing zones and labels
        this.ctx.restore();

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

                // Position labels to the left of the Y-axis with right alignment
                this.ctx.textAlign = 'right';
                this.ctx.fillText(this.formatCurrencyShort(value), this.chartX - 5, y + 4);
                this.ctx.textAlign = 'left'; // Reset to default alignment
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
        
        // Chart title
        this.ctx.font = 'bold 18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Portfolio Value over Time', this.chartX + this.chartWidth / 2, this.chartY - 20);
        
        // Reset font for other labels
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'left';
        
        // X-axis label
        this.ctx.fillText('Years in Retirement', this.chartX + this.chartWidth / 2 - 60, this.chartY + this.chartHeight + 40);
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
        
        // Hide and clear growth table section
        this.growthTableSection.style.display = 'none';
        this.growthTableBody.innerHTML = '';
        
        // Clear chart
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clear simulation results for recommendations
        this.simulationResults = null;
    }

    generateDetailedProjection(values, incomeEvents, expenseEvents) {
        // Generate a detailed year-by-year projection using median scenario assumptions
        const projectionData = [];
        let portfolio = values.portfolioValue;
        let currentExpenses = values.annualExpenses;
        
        // Use median market return assumption for the projection
        const medianReturn = values.marketReturn;
        
        for (let year = 1; year <= values.retirementYears; year++) {
            const yearStartPortfolio = portfolio;
            
            // Apply market return
            const marketReturn = medianReturn; // Using expected return for median scenario
            portfolio *= (1 + marketReturn);
            const portfolioAfterGrowth = portfolio;
            
            // Adjust expenses for inflation
            currentExpenses *= (1 + values.inflationRate);
            
            // Calculate income for this year
            let yearlyIncome = 0;
            incomeEvents.forEach(event => {
                if (year >= event.startYear && year <= event.endYear) {
                    let eventAmount = event.amount;
                    if (event.inflationAdjusted) {
                        eventAmount *= Math.pow(1 + values.inflationRate, year - 1);
                    }
                    yearlyIncome += eventAmount;
                }
            });
            
            // Calculate additional expenses for this year
            let additionalExpenses = 0;
            expenseEvents.forEach(event => {
                if (year >= event.startYear && year <= event.endYear) {
                    let eventAmount = event.amount;
                    if (event.inflationAdjusted) {
                        eventAmount *= Math.pow(1 + values.inflationRate, year - 1);
                    }
                    additionalExpenses += eventAmount;
                }
            });
            
            const totalExpenses = currentExpenses + additionalExpenses;
            const netWithdrawal = Math.max(0, totalExpenses - yearlyIncome);
            
            // Withdraw from portfolio
            portfolio -= netWithdrawal;
            const portfolioEndValue = Math.max(0, portfolio);
            
            projectionData.push({
                year: year,
                portfolioStart: yearStartPortfolio,
                marketReturn: marketReturn,
                portfolioAfterGrowth: portfolioAfterGrowth,
                income: yearlyIncome,
                expenses: totalExpenses,
                netWithdrawal: netWithdrawal,
                portfolioEnd: portfolioEndValue
            });
            
            // Stop if portfolio is depleted
            if (portfolio <= 0) {
                portfolio = 0;
                break;
            }
        }
        
        return projectionData;
    }

    updateGrowthTable(results, values) {
        // Generate detailed projection data
        const incomeEvents = this.getIncomeEvents();
        const expenseEvents = this.getExpenseEvents();
        const projectionData = this.generateDetailedProjection(values, incomeEvents, expenseEvents);
        
        // Store projection data for CSV export
        this.currentProjectionData = projectionData;
        
        // Clear existing table data
        this.growthTableBody.innerHTML = '';
        
        // Populate table with projection data
        projectionData.forEach(rowData => {
            const row = document.createElement('tr');
            
            const marketReturnPercent = (rowData.marketReturn * 100).toFixed(1);
            const marketReturnClass = rowData.marketReturn >= 0 ? 'percentage-positive' : 'percentage-negative';
            
            row.innerHTML = `
                <td>${rowData.year}</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioStart)}</td>
                <td class="${marketReturnClass}">${marketReturnPercent}%</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioAfterGrowth)}</td>
                <td class="currency-positive">${this.formatCurrency(rowData.income)}</td>
                <td class="currency-negative">${this.formatCurrency(rowData.expenses)}</td>
                <td class="currency-negative">${this.formatCurrency(rowData.netWithdrawal)}</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioEnd)}</td>
            `;
            
            this.growthTableBody.appendChild(row);
        });
        
        // Show the growth table section
        this.growthTableSection.style.display = 'block';
    }

    exportToCSV() {
        if (!this.currentProjectionData || this.currentProjectionData.length === 0) {
            alert('No data available to export. Please run a simulation first.');
            return;
        }
        
        // Create CSV content
        const headers = [
            'Year',
            'Portfolio Start',
            'Market Return (%)', 
            'Portfolio After Growth',
            'Income',
            'Expenses',
            'Net Withdrawal',
            'Portfolio End'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        this.currentProjectionData.forEach(row => {
            const csvRow = [
                row.year,
                row.portfolioStart.toFixed(2),
                (row.marketReturn * 100).toFixed(2),
                row.portfolioAfterGrowth.toFixed(2),
                row.income.toFixed(2),
                row.expenses.toFixed(2),
                row.netWithdrawal.toFixed(2),
                row.portfolioEnd.toFixed(2)
            ];
            csvContent += csvRow.join(',') + '\n';
        });
        
        // Add summary information at the bottom
        csvContent += '\n';
        csvContent += 'Summary Information\n';
        csvContent += `Simulation Date,${new Date().toLocaleDateString()}\n`;
        
        if (this.simulationResults) {
            csvContent += `Success Rate,${this.simulationResults.successRate.toFixed(1)}%\n`;
            csvContent += `10th Percentile Final Value,${this.simulationResults.percentile10.toFixed(2)}\n`;
            csvContent += `50th Percentile Final Value,${this.simulationResults.percentile50.toFixed(2)}\n`;
            csvContent += `90th Percentile Final Value,${this.simulationResults.percentile90.toFixed(2)}\n`;
        }
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const scenarioName = this.scenarioTitle.textContent.trim().replace(/[^a-zA-Z0-9]/g, '_');
            link.setAttribute('download', `retirement_projection_${scenarioName}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
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