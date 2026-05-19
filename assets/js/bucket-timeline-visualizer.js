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
            title: "🗓️ Run Your First Bucket Projection",
            description: "Generate a year-by-year drawdown timeline based on your account balances, access dates, and return assumptions.",
            action: "Click 'Update Timeline' to build your projection",
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
        this.storageKey = 'bucket-timeline-scenarios';
        this.lastScenarioKey = 'bucket-timeline-last-scenario';
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
        this.setupSpendChart();
        this.addEventListeners();
        this.setupIframeDetection();
        this.incomeEvents = [];
        this.expenseEvents = [];
        this.simulationResults = null;
        this.currentProjectionData = [];
        this.currentProjectionAccounts = [];
        this.hoveredTimelineYear = null;
        this.hoveredSpendYear = null;
        
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
        this.addAccountBucketBtn = document.getElementById('add-account-bucket');
        this.accountBucketsContainer = document.getElementById('account-buckets-container');

        // Result elements
        this.timelineStartingBalance = document.getElementById('timeline-starting-balance');
        this.timelineEndingBalance = document.getElementById('timeline-ending-balance');
        this.timelineYearOneSpend = document.getElementById('timeline-year-one-spend');
        this.timelineBucketsUsed = document.getElementById('timeline-buckets-used');
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
        this.timelineChartLegend = document.getElementById('timeline-chart-legend');
        this.timelineChartTooltip = document.getElementById('timeline-chart-tooltip');
        this.spendChartTooltip = document.getElementById('spend-chart-tooltip');

        // Chart elements
        this.canvas = document.getElementById('monteCarloChart');
        this.ctx = this.canvas.getContext('2d');
        this.chartContainer = this.canvas.closest('.simulation-container');
        this.spendCanvas = document.getElementById('spendTimelineChart');
        this.spendCtx = this.spendCanvas ? this.spendCanvas.getContext('2d') : null;
        this.spendChartContainer = this.spendCanvas ? this.spendCanvas.closest('.simulation-container') : null;

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
            this.retirementYears,
            this.withdrawalRate,
            this.marketReturn,
            this.inflationRate,
            this.numSimulations
        ].filter(Boolean);
        
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
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Chart dimensions
        this.chartWidth = rect.width - 140; // Increased from 100 to give more space for right labels
        this.chartHeight = rect.height - 80;
        this.chartX = 60;
        this.chartY = 20;
    }

    setupSpendChart() {
        if (!this.spendCanvas || !this.spendCtx) return;

        const rect = this.spendCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.spendCanvas.width = rect.width * dpr;
        this.spendCanvas.height = rect.height * dpr;
        this.spendCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.spendCtx.scale(dpr, dpr);
        this.spendCanvas.style.width = rect.width + 'px';
        this.spendCanvas.style.height = rect.height + 'px';

        this.spendChartWidth = rect.width - 110;
        this.spendChartHeight = rect.height - 70;
        this.spendChartX = 60;
        this.spendChartY = 20;
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

        this.addAccountBucketBtn.addEventListener('click', () => {
            this.addAccountBucket();
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
        if (this.exportCsvBtn) {
            this.exportCsvBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        this.canvas.addEventListener('mousemove', (event) => {
            this.handleTimelineHover(event);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.clearTimelineHover();
        });

        if (this.spendCanvas) {
            this.spendCanvas.addEventListener('mousemove', (event) => {
                this.handleSpendHover(event);
            });

            this.spendCanvas.addEventListener('mouseleave', () => {
                this.clearSpendHover();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupChart();
                this.setupSpendChart();
                if (this.simulationResults) {
                    this.drawChart(this.simulationResults);
                    this.drawSpendChart(this.simulationResults);
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
                <input type="text" inputmode="numeric" placeholder="$25,000" class="event-amount">
            </div>
            <div class="income-event-field">
                <label>Start Year</label>
                <input type="number" placeholder="1" class="event-start-year" min="1" max="50" value="1">
            </div>
            <div class="income-event-field">
                <label>End Year</label>
                <input type="number" placeholder="1" class="event-end-year" min="1" max="50" value="1">
            </div>
            <button class="remove-event-btn" type="button" onclick="this.parentElement.remove()" title="Remove this income event" aria-label="Remove this income event">&minus;</button>
        `;
        
        // Add event listeners to handle type changes
        const typeSelect = eventDiv.querySelector('.event-type');
        const amountInput = eventDiv.querySelector('.event-amount');
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
        this.initializeCurrencyInput(amountInput);
        
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
                <input type="text" inputmode="numeric" placeholder="$15,000" class="event-amount">
            </div>
            <div class="expense-event-field">
                <label>Start Year</label>
                <input type="number" placeholder="1" class="event-start-year" min="1" max="50" value="1">
            </div>
            <div class="expense-event-field">
                <label>End Year</label>
                <input type="number" placeholder="1" class="event-end-year" min="1" max="50" value="1">
            </div>
            <button class="remove-event-btn" type="button" onclick="this.parentElement.remove()" title="Remove this expense event" aria-label="Remove this expense event">&minus;</button>
        `;
        
        // Add event listeners to handle type changes
        const typeSelect = eventDiv.querySelector('.event-type');
        const amountInput = eventDiv.querySelector('.event-amount');
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
        this.initializeCurrencyInput(amountInput);
        
        this.expenseEventsContainer.appendChild(eventDiv);
    }

    addAccountBucket(account = {}) {
        const bucketDiv = document.createElement('div');
        bucketDiv.className = 'account-bucket';
        bucketDiv.innerHTML = `
            <div class="account-bucket-field">
                <label>Account Name</label>
                <input type="text" placeholder="e.g., Taxable Brokerage, Roth IRA" class="bucket-name">
            </div>
            <div class="account-bucket-field">
                <label>Type</label>
                <select class="bucket-type">
                    <option value="taxable">Taxable</option>
                    <option value="traditional">Trad IRA/401k</option>
                    <option value="roth">Roth</option>
                    <option value="inheritance">Windfall</option>
                    <option value="cash">Cash/HYSA</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="account-bucket-field">
                <label>Balance at Start Year</label>
                <input type="text" inputmode="numeric" placeholder="$500,000" class="bucket-balance">
            </div>
            <div class="account-bucket-field">
                <label>Start Year</label>
                <input type="number" placeholder="1" class="bucket-start-year" min="1" max="50" value="1">
            </div>
            <div class="account-bucket-field">
                <label>Draw Year</label>
                <input type="number" placeholder="1" class="bucket-draw-year" min="1" max="50" value="1">
            </div>
            <div class="account-bucket-field">
                <label>Priority</label>
                <input type="number" placeholder="1" class="bucket-priority" min="1" max="10" value="1">
            </div>
            <button class="remove-event-btn" type="button" title="Remove this account bucket" aria-label="Remove this account bucket">&minus;</button>
        `;

        const typeSelect = bucketDiv.querySelector('.bucket-type');
        const nameInput = bucketDiv.querySelector('.bucket-name');
        const balanceInput = bucketDiv.querySelector('.bucket-balance');
        const startYearInput = bucketDiv.querySelector('.bucket-start-year');
        const drawYearInput = bucketDiv.querySelector('.bucket-draw-year');
        const priorityInput = bucketDiv.querySelector('.bucket-priority');
        const removeButton = bucketDiv.querySelector('.remove-event-btn');

        typeSelect.value = account.type || 'taxable';
        nameInput.value = account.name || '';
        this.setCurrencyInputValue(balanceInput, account.balance ?? '');
        startYearInput.value = account.startYear || 1;
        drawYearInput.value = account.drawStartYear || account.startYear || 1;
        priorityInput.value = account.drawPriority || this.getDefaultBucketPriority(typeSelect.value);

        const refreshResults = () => {
            this.clearResults();
            setTimeout(() => this.updateRecommendations(), 100);
        };

        const applyBucketType = () => {
            bucketDiv.className = `account-bucket bucket-type-${typeSelect.value}`;
        };

        typeSelect.addEventListener('change', () => {
            applyBucketType();
            if (!priorityInput.dataset.customized) {
                priorityInput.value = this.getDefaultBucketPriority(typeSelect.value);
            }
            refreshResults();
        });

        priorityInput.addEventListener('input', () => {
            priorityInput.dataset.customized = 'true';
            refreshResults();
        });

        startYearInput.addEventListener('input', () => {
            const startYear = parseInt(startYearInput.value, 10) || 1;
            const drawYear = parseInt(drawYearInput.value, 10) || 1;
            if (drawYear < startYear) {
                drawYearInput.value = startYear;
            }
            refreshResults();
        });

        drawYearInput.addEventListener('input', () => {
            const startYear = parseInt(startYearInput.value, 10) || 1;
            const drawYear = parseInt(drawYearInput.value, 10) || 1;
            if (drawYear < startYear) {
                drawYearInput.value = startYear;
            }
            refreshResults();
        });

        [nameInput, balanceInput].forEach(input => {
            input.addEventListener('input', refreshResults);
            input.addEventListener('change', refreshResults);
        });

        removeButton.addEventListener('click', () => {
            bucketDiv.remove();
            refreshResults();
        });

        applyBucketType();
        this.initializeCurrencyInput(balanceInput);
        this.accountBucketsContainer.appendChild(bucketDiv);
    }

    getDefaultBucketPriority(type) {
        switch (type) {
            case 'cash':
                return 1;
            case 'taxable':
                return 2;
            case 'inheritance':
                return 3;
            case 'traditional':
                return 4;
            case 'roth':
                return 5;
            default:
                return 3;
        }
    }

    getAccounts() {
        const buckets = [];
        const bucketElements = this.accountBucketsContainer.querySelectorAll('.account-bucket');

        bucketElements.forEach((element, index) => {
            const type = element.querySelector('.bucket-type').value;
            const balance = this.parseCurrencyInput(element.querySelector('.bucket-balance').value);
            const startYear = parseInt(element.querySelector('.bucket-start-year').value, 10);
            const drawStartYear = parseInt(element.querySelector('.bucket-draw-year').value, 10);
            const drawPriority = parseInt(element.querySelector('.bucket-priority').value, 10);
            const fallbackReturn = (parseFloat(this.marketReturn.value) || 7) / 100;

            if (Number.isFinite(balance) && balance >= 0) {
                const normalizedStartYear = Math.max(1, startYear || 1);
                buckets.push({
                    id: `bucket-${index + 1}`,
                    name: element.querySelector('.bucket-name').value.trim() || `Account ${index + 1}`,
                    type,
                    balance,
                    startYear: normalizedStartYear,
                    drawStartYear: Math.max(normalizedStartYear, drawStartYear || normalizedStartYear),
                    annualReturn: fallbackReturn,
                    drawPriority: Math.max(1, drawPriority || this.getDefaultBucketPriority(type))
                });
            }
        });

        return buckets;
    }

    getSimulationAccounts(values, accounts = this.getAccounts()) {
        if (accounts.length > 0) {
            return accounts;
        }

        return [{
            id: 'bucket-default',
            name: 'Starting Portfolio',
            type: 'other',
            balance: values.portfolioValue,
            startYear: 1,
            drawStartYear: 1,
            annualReturn: values.marketReturn,
            drawPriority: 1
        }];
    }

    getStartingBucketBalance(accounts) {
        return accounts
            .filter(account => account.startYear === 1)
            .reduce((sum, account) => sum + account.balance, 0);
    }

    getDrawableBucketBalance(accounts, year = 1) {
        return accounts
            .filter(account => account.startYear <= year && account.drawStartYear <= year)
            .reduce((sum, account) => sum + account.balance, 0);
    }

    getBalanceSummary(bucketStates, year) {
        const total = bucketStates.reduce((sum, state) => sum + state.currentBalance, 0);
        const drawable = bucketStates.reduce((sum, state) => {
            if (state.currentBalance <= 0 || year < state.drawStartYear) {
                return sum;
            }

            return sum + state.currentBalance;
        }, 0);

        return {
            total,
            drawable,
            locked: Math.max(0, total - drawable)
        };
    }

    calculateEventAmount(events, year, inflationRate, includedTypes = null) {
        return events.reduce((total, event) => {
            if (year < event.startYear || year > event.endYear) {
                return total;
            }

            if (includedTypes && !includedTypes.includes(event.type)) {
                return total;
            }

            let eventAmount = event.amount;
            eventAmount *= Math.pow(1 + inflationRate, year - 1);

            return total + eventAmount;
        }, 0);
    }

    buildBucketStates(accounts) {
        return accounts.map(account => ({
            ...account,
            currentBalance: 0,
            deployed: false
        }));
    }

    getDailyCompoundedAnnualRate(rate, periodsPerYear = 365) {
        const periodicRate = rate / periodsPerYear;
        if (periodicRate <= -1) {
            return -0.999999;
        }

        return Math.pow(1 + periodicRate, periodsPerYear) - 1;
    }

    getBucketDeploymentBalance(account, values) {
        if (account.type === 'inheritance' && account.startYear > 1) {
            const effectiveAnnualRate = this.getDailyCompoundedAnnualRate(values.marketReturn);
            return account.balance * Math.pow(1 + effectiveAnnualRate, account.startYear - 1);
        }

        return account.balance;
    }

    deployBucketsForYear(bucketStates, year, values) {
        bucketStates.forEach(state => {
            if (!state.deployed && year >= state.startYear) {
                state.currentBalance += this.getBucketDeploymentBalance(state, values);
                state.deployed = true;
            }
        });
    }

    calculateBucketReturn(account, values, marketReturn) {
        const relativeAdjustment = account.annualReturn - values.marketReturn;
        const nominalAnnualReturn = marketReturn + relativeAdjustment;
        const dailyCompoundedReturn = this.getDailyCompoundedAnnualRate(nominalAnnualReturn);
        return Math.max(-0.95, Math.min(0.95, dailyCompoundedReturn));
    }

    withdrawFromBuckets(bucketStates, year, amountNeeded) {
        let remaining = amountNeeded;
        const withdrawals = {};

        const eligibleBuckets = bucketStates
            .filter(state => state.currentBalance > 0 && year >= state.drawStartYear)
            .sort((a, b) => a.drawPriority - b.drawPriority || a.drawStartYear - b.drawStartYear);

        eligibleBuckets.forEach(state => {
            if (remaining <= 0) return;

            const withdrawal = Math.min(state.currentBalance, remaining);
            state.currentBalance -= withdrawal;
            remaining -= withdrawal;
            withdrawals[state.id] = withdrawal;
        });

        return {
            withdrawals,
            withdrawn: amountNeeded - remaining,
            shortfall: remaining
        };
    }

    addCapitalContribution(bucketStates, year, amount) {
        if (amount <= 0) {
            return null;
        }

        const typePreference = {
            taxable: 1,
            cash: 2,
            other: 3,
            inheritance: 4,
            roth: 5,
            traditional: 6
        };

        const candidates = bucketStates
            .filter(state => state.deployed && year >= state.startYear)
            .sort((a, b) =>
                (typePreference[a.type] || 9) - (typePreference[b.type] || 9)
                || a.drawPriority - b.drawPriority
                || a.startYear - b.startYear
            );

        const targetBucket = candidates[0];
        if (!targetBucket) {
            return null;
        }

        targetBucket.currentBalance += amount;
        return targetBucket.id;
    }

    runBucketProjection(values, incomeEvents, expenseEvents, accounts, options = {}) {
        const bucketStates = this.buildBucketStates(accounts);
        const projectionData = [];
        const portfolioPath = [this.getStartingBucketBalance(accounts)];
        const spendPath = [];
        let totalWithdrawn = 0;
        let totalIncome = 0;
        let totalCapitalContributions = 0;
        let totalExpenseAdjustments = 0;
        let firstShortfallYear = null;

        for (let year = 1; year <= values.retirementYears; year++) {
            this.deployBucketsForYear(bucketStates, year, values);

            const startBalances = this.getBalanceSummary(bucketStates, year);
            const portfolioStart = startBalances.total;
            const marketReturn = options.marketReturnGenerator
                ? options.marketReturnGenerator(year)
                : values.marketReturn;

            bucketStates.forEach(state => {
                if (state.currentBalance <= 0) return;
                const bucketReturn = options.useBucketReturns === false
                    ? marketReturn
                    : this.calculateBucketReturn(state, values, marketReturn);
                state.currentBalance *= (1 + bucketReturn);
            });

            const growthBalances = this.getBalanceSummary(bucketStates, year);
            const portfolioAfterGrowth = growthBalances.total;
            const blendedReturn = portfolioStart > 0
                ? (portfolioAfterGrowth - portfolioStart) / portfolioStart
                : marketReturn;

            const yearlyIncome = this.calculateEventAmount(incomeEvents, year, values.inflationRate, ['recurring']);
            const capitalContribution = this.calculateEventAmount(incomeEvents, year, values.inflationRate, ['one-time']);
            const expenseAdjustment = this.calculateEventAmount(expenseEvents, year, values.inflationRate);
            const sustainableWithdrawal = growthBalances.drawable * values.withdrawalRate;
            const availableSpend = sustainableWithdrawal + yearlyIncome - expenseAdjustment;
            const drawdownResult = this.withdrawFromBuckets(bucketStates, year, sustainableWithdrawal);

            totalIncome += yearlyIncome;
            totalCapitalContributions += capitalContribution;
            totalWithdrawn += drawdownResult.withdrawn;
            totalExpenseAdjustments += expenseAdjustment;
            spendPath.push(availableSpend);

            if (drawdownResult.shortfall > 0 && firstShortfallYear === null) {
                firstShortfallYear = year;
            }

            const capitalContributionBucketId = this.addCapitalContribution(bucketStates, year, capitalContribution);
            const endBalances = this.getBalanceSummary(bucketStates, year);
            const portfolioEnd = endBalances.total;
            portfolioPath.push(portfolioEnd);

            if (options.captureProjection) {
                const accountBalances = {};
                const accountWithdrawals = {};

                bucketStates.forEach(state => {
                    accountBalances[state.id] = state.currentBalance;
                    accountWithdrawals[state.id] = drawdownResult.withdrawals[state.id] || 0;
                });

                projectionData.push({
                    year,
                    portfolioStart,
                    drawableStart: startBalances.drawable,
                    lockedStart: startBalances.locked,
                    marketReturn: blendedReturn,
                    portfolioAfterGrowth,
                    drawableAfterGrowth: growthBalances.drawable,
                    sustainableWithdrawal,
                    availableSpend,
                    income: yearlyIncome,
                    capitalContribution,
                    capitalContributionBucketId,
                    expenses: expenseAdjustment,
                    expenseAdjustment,
                    netWithdrawal: drawdownResult.withdrawn,
                    shortfall: drawdownResult.shortfall,
                    portfolioEnd,
                    drawableEnd: endBalances.drawable,
                    accountBalances,
                    accountWithdrawals
                });
            }
        }

        return {
            success: firstShortfallYear === null,
            finalValue: portfolioPath[portfolioPath.length - 1],
            portfolioPath,
            spendPath,
            totalWithdrawn,
            totalIncome,
            totalCapitalContributions,
            totalExpenseAdjustments,
            yearsLasted: firstShortfallYear === null ? values.retirementYears : Math.max(0, firstShortfallYear - 1),
            firstShortfallYear,
            projectionData
        };
    }

    getInputValues() {
        const values = {
            portfolioValue: this.portfolioValue ? (parseFloat(this.portfolioValue.value) || 0) : 0,
            annualExpenses: 0,
            retirementYears: parseInt(this.retirementYears.value) || 30,
            withdrawalRate: (parseFloat(this.withdrawalRate.value) || 4) / 100,
            marketReturn: (parseFloat(this.marketReturn.value) || 7) / 100,
            inflationRate: (parseFloat(this.inflationRate.value) || 2.5) / 100,
            numSimulations: this.numSimulations ? (parseInt(this.numSimulations.value) || 1) : 1
        };

        const accounts = this.getAccounts();
        const simulationAccounts = this.getSimulationAccounts(values, accounts);
        values.totalStartingBalance = this.getStartingBucketBalance(simulationAccounts);
        values.drawableStartingBalance = this.getDrawableBucketBalance(simulationAccounts);

        if (accounts.length > 0) {
            values.portfolioValue = values.totalStartingBalance;
        }

        return values;
    }

    getIncomeEvents() {
        const events = [];
        const eventElements = this.incomeEventsContainer.querySelectorAll('.income-event');
        
        eventElements.forEach(element => {
            const name = element.querySelector('.event-name').value;
            const amount = this.parseCurrencyInput(element.querySelector('.event-amount').value);
            const type = element.querySelector('.event-type').value;
            const startYear = parseInt(element.querySelector('.event-start-year').value);
            const endYear = parseInt(element.querySelector('.event-end-year').value);
            
            if (name && amount && startYear) {
                events.push({ 
                    name, 
                    amount, 
                    type, 
                    startYear, 
                    endYear: endYear || startYear
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
            const amount = this.parseCurrencyInput(element.querySelector('.event-amount').value);
            const type = element.querySelector('.event-type').value;
            const startYear = parseInt(element.querySelector('.event-start-year').value);
            const endYear = parseInt(element.querySelector('.event-end-year').value);
            
            if (name && amount && startYear) {
                events.push({ 
                    name, 
                    amount, 
                    type, 
                    startYear, 
                    endYear: endYear || startYear
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

    runSingleSimulation(values, incomeEvents, expenseEvents, accounts) {
        return this.runBucketProjection(values, incomeEvents, expenseEvents, accounts, {
            marketReturnGenerator: () => this.generateNormalRandom(
                this.marketParams.meanReturn,
                this.marketParams.standardDeviation
            )
        });
    }

    async runMonteCarloSimulation() {
        const values = this.getInputValues();
        const incomeEvents = this.getIncomeEvents();
        const expenseEvents = this.getExpenseEvents();
        const accounts = this.getSimulationAccounts(values);

        // Update UI
        this.runSimulationBtn.disabled = true;
        this.simulationStatus.textContent = 'Updating timeline...';
        this.clearResults();

        await new Promise(resolve => setTimeout(resolve, 10));

        const results = this.runBucketProjection(values, incomeEvents, expenseEvents, accounts, {
            marketReturnGenerator: () => values.marketReturn,
            captureProjection: true
        });

        // Store results and update UI
        this.simulationResults = results;
        this.currentProjectionAccounts = accounts;
        this.currentProjectionData = results.projectionData;
        this.updateResults(results, values);
        this.drawChart(results);
        this.drawSpendChart(results);

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
        this.simulationStatus.textContent = 'Timeline updated';
    }

    updateResults(results, values) {
        const accounts = this.getSimulationAccounts(values);
        const projectionData = results.projectionData || [];
        const spendMetrics = this.getSpendMetrics(results);
        this.currentProjectionAccounts = accounts;
        this.currentProjectionData = projectionData;
        const bucketsUsed = accounts.filter(account =>
            projectionData.some(row => (row.accountWithdrawals[account.id] || 0) > 0)
        ).length;
        const drawableStart = projectionData[0]
            ? (projectionData[0].drawableStart ?? projectionData[0].portfolioStart)
            : (values.drawableStartingBalance ?? values.portfolioValue);

        this.timelineStartingBalance.textContent = this.formatCurrencyForCards(drawableStart);
        this.timelineYearOneSpend.textContent = this.formatCurrencyForCards(spendMetrics.yearOneSpend) + '/yr';
        this.timelineEndingBalance.textContent = this.formatCurrencyForCards(results.finalValue);
        this.timelineBucketsUsed.textContent = `${bucketsUsed} / ${accounts.length}`;

        // Update analysis
        this.updateAnalysis(results, values);

        // Update statistics table
        this.updateStatistics(results, values);

        // Ensure tooltips are added to all results elements
        setTimeout(() => this.addResultsTooltips(), 100);
    }

    updateAnalysis(results, values) {
        const spendMetrics = this.getSpendMetrics(results);
        let message = '';

        message = `At a ${this.withdrawalRate.value}% SWR, the model estimates ${this.formatCurrency(spendMetrics.yearOneSpend)} of year-one spend. `;
        message += `The lowest modeled spend is ${this.formatCurrency(spendMetrics.lowestSpend)} in year ${spendMetrics.lowestSpendYear}, and the highest is ${this.formatCurrency(spendMetrics.peakSpend)} in year ${spendMetrics.peakSpendYear}. `;
        message += `The projected ending balance is ${this.formatCurrency(results.finalValue)} after ${values.retirementYears} years.`;

        this.monteCarloAnalysis.textContent = message;
    }

    getSpendMetrics(results) {
        const spendPath = results.spendPath || results.projectionData.map(row => row.availableSpend || 0);
        const yearOneSpend = spendPath[0] || 0;
        let peakSpend = yearOneSpend;
        let peakSpendYear = 1;
        let lowestSpend = yearOneSpend;
        let lowestSpendYear = 1;

        spendPath.forEach((value, index) => {
            const year = index + 1;
            if (value > peakSpend) {
                peakSpend = value;
                peakSpendYear = year;
            }
            if (value < lowestSpend) {
                lowestSpend = value;
                lowestSpendYear = year;
            }
        });

        const averageSpend = spendPath.length > 0
            ? spendPath.reduce((sum, value) => sum + value, 0) / spendPath.length
            : 0;

        return {
            yearOneSpend,
            averageSpend,
            peakSpend,
            peakSpendYear,
            lowestSpend,
            lowestSpendYear
        };
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
        const accounts = this.getAccounts();
        
        return {
            portfolioValue: values.portfolioValue,
            retirementYears: values.retirementYears,
            withdrawalRate: values.withdrawalRate * 100, // Convert back to percentage
            marketReturn: values.marketReturn * 100,
            inflationRate: values.inflationRate * 100,
            numSimulations: values.numSimulations,
            accounts: accounts.map(({ annualReturn, ...account }) => account),
            incomeEvents: incomeEvents,
            expenseEvents: expenseEvents
        };
    }

    loadConfigToInputs(config) {
        if (this.portfolioValue) {
            this.portfolioValue.value = config.portfolioValue || 0;
        }
        this.retirementYears.value = config.retirementYears || 30;
        this.withdrawalRate.value = (config.withdrawalRate || 4).toFixed(2);
        this.marketReturn.value = (config.marketReturn || 7).toFixed(2);
        this.inflationRate.value = (config.inflationRate || 2.5).toFixed(2);
        if (this.numSimulations) {
            this.numSimulations.value = config.numSimulations || 1;
        }

        this.accountBucketsContainer.innerHTML = '';
        if (config.accounts && config.accounts.length > 0) {
            config.accounts.forEach(account => {
                this.addAccountBucket(account);
            });
        }
        
        // Clear existing income events
        this.incomeEventsContainer.innerHTML = '';
        
        // Load income events
        if (config.incomeEvents && config.incomeEvents.length > 0) {
            config.incomeEvents.forEach(event => {
                this.addIncomeEvent();
                const eventDiv = this.incomeEventsContainer.lastElementChild;
                eventDiv.querySelector('.event-name').value = event.name;
                eventDiv.querySelector('.event-type').value = event.type;
                this.setCurrencyInputValue(eventDiv.querySelector('.event-amount'), event.amount);
                eventDiv.querySelector('.event-start-year').value = event.startYear;
                eventDiv.querySelector('.event-end-year').value = event.endYear;
                
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
                this.setCurrencyInputValue(eventDiv.querySelector('.event-amount'), event.amount);
                eventDiv.querySelector('.event-start-year').value = event.startYear;
                eventDiv.querySelector('.event-end-year').value = event.endYear;
                
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
                const scenarioAccounts = (scenario.config.accounts || []).map((account, index) => ({
                    ...account,
                    id: account.id || `bucket-${index + 1}`,
                    annualReturn: (scenario.config.marketReturn || 7) / 100
                }));
                // Convert config percentages to decimals for calculations
                const configAsValues = {
                    portfolioValue: scenarioAccounts.length > 0
                        ? this.getStartingBucketBalance(scenarioAccounts)
                        : scenario.config.portfolioValue,
                    totalStartingBalance: scenarioAccounts.length > 0
                        ? this.getStartingBucketBalance(scenarioAccounts)
                        : scenario.config.portfolioValue,
                    drawableStartingBalance: scenarioAccounts.length > 0
                        ? this.getDrawableBucketBalance(scenarioAccounts)
                        : scenario.config.portfolioValue,
                    annualExpenses: 0,
                    retirementYears: scenario.config.retirementYears,
                    withdrawalRate: scenario.config.withdrawalRate / 100,
                    marketReturn: scenario.config.marketReturn / 100,
                    inflationRate: scenario.config.inflationRate / 100,
                    numSimulations: scenario.config.numSimulations
                };
                this.updateResults(scenario.results, configAsValues);
                this.drawChart(scenario.results);
                this.drawSpendChart(scenario.results);
                this.runSimulationBtn.disabled = false;
                this.simulationStatus.textContent = 'Loaded saved timeline';
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
            const statusHtml = scenario.results ? 
                `<div class="scenario-success-rate ${this.getScenarioStatusClass(scenario.results)}">${this.getScenarioStatusLabel(scenario.results)}</div>` : 
                '';
            
            scenarioDiv.innerHTML = `
                <div class="scenario-item-content">
                    <div class="scenario-item-header">
                        <div class="scenario-item-name">${scenario.name}</div>
                        ${statusHtml}
                    </div>
                    <div class="scenario-item-details">
                        ${scenario.results ? this.getScenarioDetailText(scenario.results) : 'Not projected'} • 
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

    getScenarioStatusClass(results) {
        const metrics = this.getSpendMetrics(results);
        if (metrics.lowestSpend > 0) return 'success';
        if (metrics.lowestSpend > -25000) return 'warning';
        return 'danger';
    }

    getScenarioStatusLabel(results) {
        const metrics = this.getSpendMetrics(results);
        return this.formatCurrencyShort(metrics.yearOneSpend);
    }

    getScenarioDetailText(results) {
        const metrics = this.getSpendMetrics(results);
        return `Low ${this.formatCurrencyShort(metrics.lowestSpend)} in Y${metrics.lowestSpendYear}`;
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
            'FINAL NET WORTH': 'How much money the modeled bucket plan leaves at the end of the timeline after annual SWR withdrawals and return assumptions.',
            'YEAR 1 AVAILABLE SPEND': 'Your modeled spending power in the first year, combining SWR-based withdrawals from drawable accounts plus income and minus major expense adjustments.',
            'AVERAGE AVAILABLE SPEND': 'The average annual spend available across the full timeline after combining SWR withdrawals, income events, and major expense adjustments.',
            'PORTFOLIO GROWTH': 'How much your portfolio grew (or shrank) including all withdrawals and market performance. This accounts for investment returns minus your withdrawals and shows the net change in portfolio value.',
            'PEAK SPEND': 'The highest annual spend available in the modeled timeline.',
            'LOWEST SPEND': 'The lowest annual spend available in the modeled timeline, which helps identify the tightest years in the plan.'
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
            'DRAWABLE START': 'How much money is actually available to support year-one withdrawals after applying each bucket\'s Draw From Year rule.',
            'YEAR 1 SPEND': 'Your modeled spending power in the first year based on SWR, income events, and any major expense adjustments.',
            'ENDING BALANCE': 'How much total wealth remains across all buckets at the end of the modeled timeline.',
            'BUCKETS USED': 'How many buckets were actually tapped for withdrawals during the modeled timeline.'
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

        const finalWorth = results.finalValue;
        const initialPortfolio = values.totalStartingBalance ?? values.portfolioValue;
        const spendMetrics = this.getSpendMetrics(results);
        
        // Calculate portfolio growth
        const portfolioGrowth = initialPortfolio > 0
            ? ((finalWorth + results.totalWithdrawn - initialPortfolio) / initialPortfolio) * 100
            : 0;

        // Update the display elements
        this.statFinalWorth.textContent = this.formatCurrencyForCards(finalWorth);
        this.statFinalWorth.className = finalWorth > initialPortfolio * 0.5 ? 'stat-value positive' : 
                                       finalWorth > initialPortfolio * 0.25 ? 'stat-value neutral' : 'stat-value negative';

        this.statWithdrawalRate.textContent = this.formatCurrencyForCards(spendMetrics.yearOneSpend) + '/year';
        this.statWithdrawalRate.className = spendMetrics.yearOneSpend >= 0 ? 'stat-value positive' : 'stat-value negative';

        this.statTotalWithdrawn.textContent = this.formatCurrencyForCards(spendMetrics.averageSpend) + '/year';
        this.statTotalWithdrawn.className = 'stat-value neutral';

        this.statPortfolioGrowth.textContent = (portfolioGrowth >= 0 ? '+' : '') + portfolioGrowth.toFixed(1) + '%';
        this.statPortfolioGrowth.className = portfolioGrowth > 0 ? 'stat-value positive' : 
                                            portfolioGrowth > -25 ? 'stat-value neutral' : 'stat-value negative';

        this.statInflationImpact.textContent = this.formatCurrencyForCards(spendMetrics.peakSpend) + '/year';
        this.statInflationImpact.className = 'stat-value positive';

        this.statYearsSustained.textContent = this.formatCurrencyForCards(spendMetrics.lowestSpend) + '/year';
        this.statYearsSustained.className = spendMetrics.lowestSpend >= 0 ? 'stat-value neutral' : 'stat-value negative';
        
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
        if (values.portfolioValue <= 0) {
            return 100;
        }
        const currentWithdrawal = values.annualExpenses / values.portfolioValue;
        const safeWithdrawal = 0.035; // 3.5% rule for better success
        const reduction = ((currentWithdrawal - safeWithdrawal) / currentWithdrawal) * 100;
        return Math.max(0, Math.round(reduction));
    }

    drawChart(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!results || !results.portfolioPath || results.portfolioPath.length === 0) return;

        const path = results.portfolioPath;
        const accountSeries = this.getTimelineAccountSeries();
        const maxYears = path.length - 1;
        const chartMin = 0;
        const chartMax = Math.max(
            ...path,
            ...accountSeries.flatMap(series => series.path),
            1
        ) * 1.15;

        this.drawGrid(chartMax, maxYears, chartMin);
        this.drawSuccessZones(chartMax, maxYears, chartMin);
        accountSeries.forEach(series => {
            this.drawPath(series.path, series.color, chartMax, maxYears, 2, chartMin);
        });
        this.drawPath(path, '#2c3e50', chartMax, maxYears, 4, chartMin);

        if (results.firstShortfallYear) {
            const x = this.chartX + (results.firstShortfallYear / maxYears) * this.chartWidth;
            this.ctx.save();
            this.ctx.setLineDash([6, 6]);
            this.ctx.strokeStyle = '#dc3545';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartY);
            this.ctx.lineTo(x, this.chartY + this.chartHeight);
            this.ctx.stroke();
            this.ctx.restore();
        }

        if (this.hoveredTimelineYear !== null) {
            this.drawTimelineHoverState(path, accountSeries, chartMax, maxYears, chartMin);
        }

        this.addChartLabels(maxYears, accountSeries.length > 0);
        this.updateTimelineChartLegend(accountSeries);
    }

    drawSpendChart(results) {
        if (!this.spendCtx || !this.spendCanvas) return;

        this.spendCtx.clearRect(0, 0, this.spendCanvas.width, this.spendCanvas.height);

        const spendPath = results?.spendPath || [];
        if (spendPath.length === 0) return;

        const maxYears = Math.max(1, spendPath.length - 1);
        const maxValue = Math.max(...spendPath, 0, 1);
        const minValue = Math.min(...spendPath, 0);
        const padding = Math.max((maxValue - minValue) * 0.15, maxValue * 0.1, 1000);
        const chartMax = maxValue + padding;
        const chartMin = minValue - (minValue < 0 ? padding * 0.35 : 0);

        this.drawSecondaryGrid(this.spendCtx, {
            x: this.spendChartX,
            y: this.spendChartY,
            width: this.spendChartWidth,
            height: this.spendChartHeight,
            minValue: chartMin,
            maxValue: chartMax,
            maxYears
        });
        this.drawSecondaryZones(this.spendCtx, {
            x: this.spendChartX,
            y: this.spendChartY,
            width: this.spendChartWidth,
            height: this.spendChartHeight,
            minValue: chartMin,
            maxValue: chartMax
        });
        this.drawSecondaryPath(this.spendCtx, spendPath, '#6f42c1', {
            x: this.spendChartX,
            y: this.spendChartY,
            width: this.spendChartWidth,
            height: this.spendChartHeight,
            minValue: chartMin,
            maxValue: chartMax,
            maxYears
        }, 3);

        if (this.hoveredSpendYear !== null) {
            this.drawSecondaryHoverState(this.spendCtx, spendPath, '#6f42c1', {
                x: this.spendChartX,
                y: this.spendChartY,
                width: this.spendChartWidth,
                height: this.spendChartHeight,
                minValue: chartMin,
                maxValue: chartMax,
                maxYears,
                hoveredYear: this.hoveredSpendYear
            });
        }

        this.addSecondaryChartLabels(this.spendCtx, {
            x: this.spendChartX,
            y: this.spendChartY,
            width: this.spendChartWidth,
            height: this.spendChartHeight
        }, 'Annual Available Spend Timeline');
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

    drawSecondaryGrid(ctx, options) {
        const { x, y, width, height, minValue, maxValue, maxYears } = options;
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#6c757d';

        const valueRange = Math.max(1, maxValue - minValue);
        const minXLabelSpacing = 50;
        const maxXLabels = Math.floor(width / minXLabelSpacing);
        const targetXSteps = Math.min(maxXLabels, 10);
        const yearStep = Math.max(1, Math.ceil((maxYears || 1) / targetXSteps));

        for (let index = 0; index <= maxYears; index += yearStep) {
            const yearLabel = index + 1;
            const xPos = x + ((maxYears === 0 ? 0 : index / maxYears) * width);

            ctx.beginPath();
            ctx.moveTo(xPos, y);
            ctx.lineTo(xPos, y + height);
            ctx.stroke();
            ctx.fillText(yearLabel.toString(), xPos - 10, y + height + 15);
        }

        const maxLabels = Math.floor(height / 25);
        const targetSteps = Math.min(maxLabels, 7);
        const roughStep = valueRange / Math.max(1, targetSteps);
        const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(roughStep, 1))));
        const normalized = roughStep / magnitude;
        let stepSize;
        if (normalized <= 1) stepSize = magnitude;
        else if (normalized <= 2) stepSize = 2 * magnitude;
        else if (normalized <= 5) stepSize = 5 * magnitude;
        else stepSize = 10 * magnitude;

        const gridStart = Math.ceil(minValue / stepSize) * stepSize;
        for (let value = gridStart; value <= maxValue; value += stepSize) {
            const yPos = y + height - ((value - minValue) / valueRange) * height;
            if (yPos < y || yPos > y + height) continue;

            ctx.beginPath();
            ctx.moveTo(x, yPos);
            ctx.lineTo(x + width, yPos);
            ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText(this.formatCurrencyShort(value), x - 6, yPos + 4);
            ctx.textAlign = 'left';
        }

        ctx.strokeStyle = '#495057';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
    }

    drawSecondaryZones(ctx, options) {
        const { x, y, width, height, minValue, maxValue } = options;
        const valueRange = Math.max(1, maxValue - minValue);
        const rawZeroLine = y + height - ((0 - minValue) / valueRange) * height;
        const zeroLine = Math.min(y + height, Math.max(y, rawZeroLine));

        ctx.fillStyle = 'rgba(111, 66, 193, 0.08)';
        ctx.fillRect(x, y, width, Math.max(0, zeroLine - y));

        if (zeroLine < y + height) {
            ctx.fillStyle = 'rgba(220, 53, 69, 0.08)';
            ctx.fillRect(x, zeroLine, width, y + height - zeroLine);
        }
    }

    drawSecondaryPath(ctx, path, color, options, lineWidth = 2) {
        const { x, y, width, height, minValue, maxValue, maxYears } = options;
        const valueRange = Math.max(1, maxValue - minValue);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        path.forEach((value, index) => {
            const xPos = x + ((maxYears === 0 ? 0 : index / maxYears) * width);
            const yPos = y + height - ((value - minValue) / valueRange) * height;
            if (index === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
        });

        ctx.stroke();
    }

    drawSecondaryHoverState(ctx, path, color, options) {
        const { x, y, width, height, minValue, maxValue, maxYears, hoveredYear } = options;
        const valueRange = Math.max(1, maxValue - minValue);
        const xPos = x + ((maxYears === 0 ? 0 : hoveredYear / maxYears) * width);
        const yPos = y + height - ((path[hoveredYear] - minValue) / valueRange) * height;

        ctx.save();
        ctx.strokeStyle = 'rgba(52, 58, 64, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xPos, y);
        ctx.lineTo(xPos, y + height);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    addSecondaryChartLabels(ctx, frame, title) {
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, frame.x + frame.width / 2, frame.y - 20);
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('Years in Plan', frame.x + frame.width / 2, frame.y + frame.height + 40);
        ctx.textAlign = 'left';
    }

    handleTimelineHover(event) {
        if (!this.simulationResults || !this.simulationResults.portfolioPath || this.simulationResults.portfolioPath.length === 0) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const insideChart = x >= this.chartX
            && x <= this.chartX + this.chartWidth
            && y >= this.chartY
            && y <= this.chartY + this.chartHeight;

        if (!insideChart) {
            this.clearTimelineHover();
            return;
        }

        const maxYears = this.simulationResults.portfolioPath.length - 1;
        const ratio = this.chartWidth > 0 ? (x - this.chartX) / this.chartWidth : 0;
        const hoverYear = Math.max(0, Math.min(maxYears, Math.round(ratio * maxYears)));

        this.hoveredTimelineYear = hoverYear;
        this.drawChart(this.simulationResults);
        this.updateTimelineChartTooltip(event, hoverYear);
    }

    clearTimelineHover() {
        if (this.hoveredTimelineYear === null && (!this.timelineChartTooltip || this.timelineChartTooltip.style.display === 'none')) {
            return;
        }

        this.hoveredTimelineYear = null;
        if (this.timelineChartTooltip) {
            this.timelineChartTooltip.style.display = 'none';
        }

        if (this.simulationResults) {
            this.drawChart(this.simulationResults);
        }
    }

    drawTimelineHoverState(path, accountSeries, maxPortfolio, maxYears, minPortfolio = 0) {
        const hoverYear = this.hoveredTimelineYear;
        if (hoverYear === null) {
            return;
        }

        const x = this.chartX + (hoverYear / maxYears) * this.chartWidth;
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(52, 58, 64, 0.35)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.chartY);
        this.ctx.lineTo(x, this.chartY + this.chartHeight);
        this.ctx.stroke();
        this.ctx.restore();

        this.drawHoverPoint(path[hoverYear], hoverYear, '#2c3e50', maxPortfolio, maxYears, minPortfolio, 5);
        accountSeries.forEach(series => {
            if ((series.path[hoverYear] || 0) <= 0) {
                return;
            }

            this.drawHoverPoint(series.path[hoverYear], hoverYear, series.color, maxPortfolio, maxYears, minPortfolio, 4);
        });
    }

    drawHoverPoint(value, year, color, maxPortfolio, maxYears, minPortfolio = 0, radius = 4) {
        const portfolioRange = maxPortfolio - minPortfolio;
        const x = this.chartX + (year / maxYears) * this.chartWidth;
        const y = this.chartY + this.chartHeight - ((value - minPortfolio) / portfolioRange) * this.chartHeight;

        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    updateTimelineChartTooltip(event, hoverYear) {
        if (!this.timelineChartTooltip || !this.chartContainer) {
            return;
        }

        const accountSeries = this.getTimelineAccountSeries();
        const row = hoverYear > 0 ? this.currentProjectionData[hoverYear - 1] : null;
        const totalValue = this.simulationResults.portfolioPath[hoverYear] || 0;
        const drawableValue = hoverYear === 0
            ? (this.currentProjectionData[0]?.drawableStart ?? totalValue)
            : (row?.drawableEnd ?? totalValue);
        const lockedValue = Math.max(0, totalValue - drawableValue);

        const tooltipRows = [
            this.buildTooltipRow('#2c3e50', 'Total Portfolio', totalValue),
            this.buildTooltipRow('#28a745', 'Drawable Balance', drawableValue),
            this.buildTooltipRow('#fd7e14', 'Locked Balance', lockedValue)
        ];

        if (row) {
            tooltipRows.push(this.buildTooltipRow('#6f42c1', 'Available Spend', row.availableSpend));
            tooltipRows.push(this.buildTooltipRow('#17a2b8', 'Income', row.income));
            if (row.capitalContribution > 0) {
                tooltipRows.push(this.buildTooltipRow('#20c997', 'Invested Windfall', row.capitalContribution));
            }
        }

        accountSeries.forEach(series => {
            const value = series.path[hoverYear] || 0;
            if (value <= 0) {
                return;
            }

            tooltipRows.push(this.buildTooltipRow(series.color, series.name, value));
        });

        if (row && row.expenseAdjustment > 0) {
            tooltipRows.push(this.buildTooltipRow('#dc3545', 'Major Expenses', row.expenseAdjustment));
        }

        this.timelineChartTooltip.innerHTML = `
            <div class="chart-tooltip-title">${hoverYear === 0 ? 'Start of Plan' : `End of Year ${hoverYear}`}</div>
            ${tooltipRows.join('')}
        `;

        const containerRect = this.chartContainer.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = this.timelineChartTooltip.offsetHeight || 220;
        let left = event.clientX - containerRect.left + 16;
        let top = event.clientY - containerRect.top + 16;

        if (left + tooltipWidth > containerRect.width - 12) {
            left = Math.max(12, event.clientX - containerRect.left - tooltipWidth - 16);
        }
        if (top + tooltipHeight > containerRect.height - 12) {
            top = Math.max(12, event.clientY - containerRect.top - tooltipHeight - 16);
        }

        this.timelineChartTooltip.style.left = `${left}px`;
        this.timelineChartTooltip.style.top = `${top}px`;
        this.timelineChartTooltip.style.display = 'block';
    }

    handleSpendHover(event) {
        if (!this.simulationResults || !this.simulationResults.spendPath || this.simulationResults.spendPath.length === 0) {
            return;
        }

        const rect = this.spendCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const insideChart = x >= this.spendChartX
            && x <= this.spendChartX + this.spendChartWidth
            && y >= this.spendChartY
            && y <= this.spendChartY + this.spendChartHeight;

        if (!insideChart) {
            this.clearSpendHover();
            return;
        }

        const maxYears = Math.max(1, this.simulationResults.spendPath.length - 1);
        const ratio = this.spendChartWidth > 0 ? (x - this.spendChartX) / this.spendChartWidth : 0;
        const hoverYear = Math.max(0, Math.min(maxYears, Math.round(ratio * maxYears)));

        this.hoveredSpendYear = hoverYear;
        this.drawSpendChart(this.simulationResults);
        this.updateSpendChartTooltip(event, hoverYear);
    }

    clearSpendHover() {
        if (this.hoveredSpendYear === null && (!this.spendChartTooltip || this.spendChartTooltip.style.display === 'none')) {
            return;
        }

        this.hoveredSpendYear = null;
        if (this.spendChartTooltip) {
            this.spendChartTooltip.style.display = 'none';
        }

        if (this.simulationResults) {
            this.drawSpendChart(this.simulationResults);
        }
    }

    updateSpendChartTooltip(event, hoverYear) {
        if (!this.spendChartTooltip || !this.spendChartContainer) {
            return;
        }

        const row = this.currentProjectionData[hoverYear];
        if (!row) {
            return;
        }

        this.spendChartTooltip.innerHTML = `
            <div class="chart-tooltip-title">Year ${row.year}</div>
            ${this.buildTooltipRow('#6f42c1', 'Available Spend', row.availableSpend)}
            ${this.buildTooltipRow('#28a745', 'SWR Draw', row.sustainableWithdrawal)}
            ${this.buildTooltipRow('#17a2b8', 'Recurring Income', row.income)}
            ${this.buildTooltipRow('#20c997', 'Invested Windfall', row.capitalContribution || 0)}
            ${this.buildTooltipRow('#fd7e14', 'Major Expenses', row.expenseAdjustment)}
        `;

        const containerRect = this.spendChartContainer.getBoundingClientRect();
        const tooltipWidth = 280;
        const tooltipHeight = this.spendChartTooltip.offsetHeight || 180;
        let left = event.clientX - containerRect.left + 16;
        let top = event.clientY - containerRect.top + 16;

        if (left + tooltipWidth > containerRect.width - 12) {
            left = Math.max(12, event.clientX - containerRect.left - tooltipWidth - 16);
        }
        if (top + tooltipHeight > containerRect.height - 12) {
            top = Math.max(12, event.clientY - containerRect.top - tooltipHeight - 16);
        }

        this.spendChartTooltip.style.left = `${left}px`;
        this.spendChartTooltip.style.top = `${top}px`;
        this.spendChartTooltip.style.display = 'block';
    }

    buildTooltipRow(color, label, value) {
        return `
            <div class="chart-tooltip-row">
                <span class="chart-tooltip-label">
                    <span class="chart-tooltip-dot" style="background:${color}"></span>
                    ${label}
                </span>
                <span class="chart-tooltip-value">${this.formatCurrency(value)}</span>
            </div>
        `;
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

    getTimelineAccountSeries() {
        if (!this.currentProjectionData || this.currentProjectionData.length === 0 || !this.currentProjectionAccounts) {
            return [];
        }

        return this.currentProjectionAccounts.map((account, index) => {
            const path = [account.startYear === 1 ? account.balance : 0];
            this.currentProjectionData.forEach(row => {
                path.push(row.accountBalances[account.id] || 0);
            });

            return {
                name: account.name,
                color: this.getBucketColor(index),
                path
            };
        });
    }

    updateTimelineChartLegend(accountSeries) {
        if (!this.timelineChartLegend) {
            return;
        }

        const legendItems = [
            `<div class="legend-item"><span class="legend-line" style="background:#2c3e50;height:4px;"></span><span>Total Portfolio</span></div>`
        ];

        accountSeries.forEach(series => {
            legendItems.push(
                `<div class="legend-item"><span class="legend-line" style="background:${series.color};"></span><span>${series.name}</span></div>`
            );
        });

        this.timelineChartLegend.innerHTML = legendItems.join('');
    }

    addChartLabels(maxYears, showAccountSeries = false) {
        this.ctx.fillStyle = '#495057';
        this.ctx.font = 'bold 14px sans-serif';
        
        // Chart title
        this.ctx.font = 'bold 18px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            showAccountSeries ? 'Timeline Projection by Account' : 'Total Portfolio Timeline',
            this.chartX + this.chartWidth / 2,
            this.chartY - 20
        );
        
        // Reset font for other labels
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'left';
        
        // X-axis label
        this.ctx.fillText('Years in Plan', this.chartX + this.chartWidth / 2 - 45, this.chartY + this.chartHeight + 40);
    }

    clearResults() {
        this.timelineStartingBalance.textContent = '--';
        this.timelineYearOneSpend.textContent = '--';
        this.timelineEndingBalance.textContent = '--';
        this.timelineBucketsUsed.textContent = '--';
        this.monteCarloAnalysis.textContent = 'Update the timeline to see how much annual spend your buckets can support over time.';
        
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
        
        // Clear any stored projection table state
        if (this.growthTableSection) {
            this.growthTableSection.style.display = 'none';
        }
        if (this.growthTableBody) {
            this.growthTableBody.innerHTML = '';
        }
        this.currentProjectionData = [];
        this.currentProjectionAccounts = [];

        if (this.timelineChartLegend) {
            this.timelineChartLegend.innerHTML = '';
        }
        if (this.timelineChartTooltip) {
            this.timelineChartTooltip.style.display = 'none';
        }
        this.hoveredTimelineYear = null;
        if (this.spendChartTooltip) {
            this.spendChartTooltip.style.display = 'none';
        }
        this.hoveredSpendYear = null;
        
        // Clear chart
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.spendCtx && this.spendCanvas) {
            this.spendCtx.clearRect(0, 0, this.spendCanvas.width, this.spendCanvas.height);
        }
        
        // Clear simulation results for recommendations
        this.simulationResults = null;
    }

    generateDetailedProjection(values, incomeEvents, expenseEvents, accounts) {
        return this.runBucketProjection(values, incomeEvents, expenseEvents, accounts, {
            marketReturnGenerator: () => values.marketReturn,
            captureProjection: true
        }).projectionData;
    }

    updateGrowthTable(results, values) {
        const accounts = this.getSimulationAccounts(values);
        const projectionData = (results && results.projectionData && results.projectionData.length > 0)
            ? results.projectionData
            : this.generateDetailedProjection(values, this.getIncomeEvents(), this.getExpenseEvents(), accounts);
        
        // Store projection data for CSV export
        this.currentProjectionData = projectionData;
        this.currentProjectionAccounts = accounts;
        
        // Clear existing table data
        this.growthTableBody.innerHTML = '';
        
        // Populate table with projection data
        projectionData.forEach(rowData => {
            const row = document.createElement('tr');
            
            const drawableStart = rowData.drawableStart ?? rowData.portfolioStart;
            const lockedStart = rowData.lockedStart ?? 0;
            const drawableAfterGrowth = rowData.drawableAfterGrowth ?? rowData.portfolioAfterGrowth;
            const drawableEnd = rowData.drawableEnd ?? rowData.portfolioEnd;
            const marketReturnPercent = (rowData.marketReturn * 100).toFixed(1);
            const marketReturnClass = rowData.marketReturn >= 0 ? 'percentage-positive' : 'percentage-negative';
            const shortfallClass = rowData.shortfall > 0 ? 'currency-warning' : 'currency-neutral';
            
            row.innerHTML = `
                <td>${rowData.year}</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioStart)}</td>
                <td class="currency-positive">${this.formatCurrency(drawableStart)}</td>
                <td class="currency-warning">${this.formatCurrency(lockedStart)}</td>
                <td class="${marketReturnClass}">${marketReturnPercent}%</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioAfterGrowth)}</td>
                <td class="currency-positive">${this.formatCurrency(drawableAfterGrowth)}</td>
                <td class="currency-positive">${this.formatCurrency(rowData.income)}</td>
                <td class="currency-negative">${this.formatCurrency(rowData.expenses)}</td>
                <td class="currency-negative">${this.formatCurrency(rowData.netWithdrawal)}</td>
                <td class="${shortfallClass}">${this.formatCurrency(rowData.shortfall)}</td>
                <td class="currency-neutral">${this.formatCurrency(rowData.portfolioEnd)}</td>
                <td class="currency-positive">${this.formatCurrency(drawableEnd)}</td>
            `;
            
            this.growthTableBody.appendChild(row);
        });
        
        // Show the growth table section
        this.growthTableSection.style.display = 'block';
    }

    getBucketColor(index) {
        const palette = ['#007bff', '#6f42c1', '#fd7e14', '#28a745', '#20c997', '#dc3545', '#17a2b8', '#6610f2'];
        return palette[index % palette.length];
    }

    exportToCSV() {
        if (!this.currentProjectionData || this.currentProjectionData.length === 0) {
            alert('No data available to export. Please run a simulation first.');
            return;
        }
        
        // Create CSV content
        const accountHeaders = this.currentProjectionAccounts.flatMap(account => [
            `${account.name} Withdrawal`,
            `${account.name} End Balance`
        ]);

        const headers = [
            'Year',
            'Total Start',
            'Drawable Start',
            'Locked Start',
            'Market Return (%)', 
            'Total After Growth',
            'Drawable After Growth',
            'Income',
            'Expenses',
            'Net Withdrawal',
            'Shortfall',
            'Total End',
            'Drawable End'
        ].concat(accountHeaders);
        
        let csvContent = headers.join(',') + '\n';
        
        this.currentProjectionData.forEach(row => {
            const drawableStart = row.drawableStart ?? row.portfolioStart;
            const lockedStart = row.lockedStart ?? 0;
            const drawableAfterGrowth = row.drawableAfterGrowth ?? row.portfolioAfterGrowth;
            const drawableEnd = row.drawableEnd ?? row.portfolioEnd;
            const csvRow = [
                row.year,
                row.portfolioStart.toFixed(2),
                drawableStart.toFixed(2),
                lockedStart.toFixed(2),
                (row.marketReturn * 100).toFixed(2),
                row.portfolioAfterGrowth.toFixed(2),
                drawableAfterGrowth.toFixed(2),
                row.income.toFixed(2),
                row.expenses.toFixed(2),
                row.netWithdrawal.toFixed(2),
                row.shortfall.toFixed(2),
                row.portfolioEnd.toFixed(2),
                drawableEnd.toFixed(2)
            ];

            this.currentProjectionAccounts.forEach(account => {
                csvRow.push((row.accountWithdrawals[account.id] || 0).toFixed(2));
                csvRow.push((row.accountBalances[account.id] || 0).toFixed(2));
            });
            csvContent += csvRow.join(',') + '\n';
        });
        
        // Add summary information at the bottom
        csvContent += '\n';
        csvContent += 'Summary Information\n';
        csvContent += `Projection Date,${new Date().toLocaleDateString()}\n`;
        
        if (this.simulationResults) {
            const peakValue = Math.max(...this.simulationResults.portfolioPath);
            const firstRow = this.currentProjectionData[0];
            const spendMetrics = this.getSpendMetrics(this.simulationResults);
            csvContent += `Projection Basis,SWR-driven spend capacity\n`;
            if (firstRow) {
                csvContent += `Drawable Start,${(firstRow.drawableStart ?? firstRow.portfolioStart).toFixed(2)}\n`;
                csvContent += `Locked Start,${(firstRow.lockedStart ?? 0).toFixed(2)}\n`;
            }
            csvContent += `Year 1 Available Spend,${spendMetrics.yearOneSpend.toFixed(2)}\n`;
            csvContent += `Average Available Spend,${spendMetrics.averageSpend.toFixed(2)}\n`;
            csvContent += `Peak Spend,${spendMetrics.peakSpend.toFixed(2)}\n`;
            csvContent += `Lowest Spend,${spendMetrics.lowestSpend.toFixed(2)}\n`;
            csvContent += `Ending Portfolio Value,${this.simulationResults.finalValue.toFixed(2)}\n`;
            csvContent += `Peak Portfolio Value,${peakValue.toFixed(2)}\n`;
        }
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const scenarioName = this.scenarioTitle.textContent.trim().replace(/[^a-zA-Z0-9]/g, '_');
            link.setAttribute('download', `bucket_timeline_${scenarioName}_${new Date().toISOString().split('T')[0]}.csv`);
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

    parseCurrencyInput(value) {
        if (typeof value === 'number') {
            return value;
        }

        const normalized = String(value || '').replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    formatCurrencyInput(value) {
        if (value === '' || value === null || value === undefined) {
            return '';
        }

        const parsed = typeof value === 'number' ? value : this.parseCurrencyInput(value);
        if (!Number.isFinite(parsed)) {
            return '';
        }

        return this.formatCurrency(parsed);
    }

    setCurrencyInputValue(input, value) {
        if (!input) {
            return;
        }

        input.value = this.formatCurrencyInput(value);
    }

    initializeCurrencyInput(input) {
        if (!input || input.dataset.currencyInitialized === 'true') {
            return;
        }

        input.dataset.currencyInitialized = 'true';

        input.addEventListener('focus', () => {
            if (input.value.trim() === '') {
                return;
            }

            const parsed = this.parseCurrencyInput(input.value);
            input.value = Number.isFinite(parsed) ? parsed.toString() : '';
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                return;
            }

            input.value = this.formatCurrencyInput(input.value);
        });

        if (input.value.trim() !== '') {
            input.value = this.formatCurrencyInput(input.value);
        }
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
