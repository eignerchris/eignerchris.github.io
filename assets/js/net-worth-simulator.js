// Net Worth Simulator JavaScript
class NetWorthSimulator {
    constructor() {
        this.initializeElements();
        this.setupChart();
        this.addEventListeners();
        this.currentTimeframe = 10; // Default to 10 years
        this.calculate(); // Initial calculation
        this.setupIframeDetection();
    }

    initializeElements() {
        // Input elements
        this.currentNetWorth = document.getElementById('current-net-worth');
        this.annualIncome = document.getElementById('annual-income');
        this.annualExpenses = document.getElementById('annual-expenses');
        this.annualSavings = document.getElementById('annual-savings');
        this.investmentReturn = document.getElementById('investment-return');
        this.incomeGrowth = document.getElementById('income-growth');
        this.inflationRate = document.getElementById('inflation-rate');

        // Result elements
        this.netWorth10y = document.getElementById('net-worth-10y');
        this.annualSavingsDisplay = document.getElementById('annual-savings-display');
        this.monthlySavingsDisplay = document.getElementById('monthly-savings');
        this.doublingTime = document.getElementById('doubling-time');
        this.projectionMessage = document.getElementById('projection-message');

        // Chart elements
        this.canvas = document.getElementById('netWorthChart');
        this.ctx = this.canvas.getContext('2d');
        this.timeSelectors = document.querySelectorAll('.time-selector');

        // Collect all inputs for easy iteration
        this.inputs = [
            this.currentNetWorth,
            this.annualIncome,
            this.annualExpenses,
            this.annualSavings,
            this.investmentReturn,
            this.incomeGrowth,
            this.inflationRate
        ];
    }

    setupChart() {
        // Set up canvas with proper DPI handling
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Chart dimensions
        this.chartWidth = rect.width - 100; // Leave margin for labels
        this.chartHeight = rect.height - 80; // Leave margin for labels
        this.chartX = 60;
        this.chartY = 20;
    }

    addEventListeners() {
        // Add input event listeners for real-time calculation
        this.inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
            });
        });

        // Time selector buttons
        this.timeSelectors.forEach(button => {
            button.addEventListener('click', (e) => {
                this.timeSelectors.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTimeframe = parseInt(e.target.dataset.years);
                this.calculate();
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.setupChart();
                this.calculate();
            }, 100);
        });
    }

    setupIframeDetection() {
        if (window.self !== window.top) {
            document.body.classList.add('iframe-mode');
        }
    }

    getInputValues() {
        const income = parseFloat(this.annualIncome.value) || 75000;
        const expenses = parseFloat(this.annualExpenses.value) || 50000;
        const savings = parseFloat(this.annualSavings.value) || 25000;

        return {
            currentNetWorth: parseFloat(this.currentNetWorth.value) || 0,
            annualIncome: income,
            annualExpenses: expenses,
            annualSavings: savings, // Direct dollar amount input
            investmentReturn: (parseFloat(this.investmentReturn.value) || 7) / 100,
            incomeGrowth: (parseFloat(this.incomeGrowth.value) || 3) / 100,
            inflationRate: (parseFloat(this.inflationRate.value) || 2.5) / 100
        };
    }

    calculateProjection(years) {
        const values = this.getInputValues();
        const projection = [];
        
        let netWorth = values.currentNetWorth;
        let annualIncome = values.annualIncome;
        let annualSavings = values.annualSavings;

        // Add starting point
        projection.push({
            year: 0,
            netWorth: netWorth,
            nominalNetWorth: netWorth,
            annualSavings: annualSavings
        });

        for (let year = 1; year <= years; year++) {
            // Grow income for informational purposes
            annualIncome *= (1 + values.incomeGrowth);
            
            // Use the direct savings amount (grows with income growth rate)
            annualSavings = values.annualSavings * Math.pow(1 + values.incomeGrowth, year);

            // Grow existing net worth with investment returns (only if positive)
            if (netWorth > 0) {
                netWorth *= (1 + values.investmentReturn);
            }
            
            // Add new savings (subtract if negative)
            netWorth += annualSavings;

            // Calculate inflation-adjusted net worth
            const realNetWorth = netWorth / Math.pow(1 + values.inflationRate, year);

            projection.push({
                year: year,
                netWorth: realNetWorth,
                nominalNetWorth: netWorth,
                annualSavings: annualSavings
            });
        }

        return projection;
    }

    calculate() {
        const values = this.getInputValues();
        const projection = this.calculateProjection(this.currentTimeframe);
        
        // Calculate key metrics
        const netWorthIn10Years = this.calculateProjection(10)[10].nominalNetWorth;
        const doublingYears = this.calculateDoublingTime(values);

        // Update statistics
        this.updateStatistics(values, netWorthIn10Years, doublingYears);

        // Draw the chart
        this.drawChart(projection);

        // Update analysis
        this.updateAnalysis(values, projection);
    }

    calculateDoublingTime(values) {
        if (values.currentNetWorth <= 0 || values.annualSavings <= 0) {
            return Infinity;
        }

        // Use rule of 72 approximation adjusted for contributions
        const effectiveRate = values.investmentReturn + (values.annualSavings / values.currentNetWorth);
        return 0.72 / effectiveRate;
    }

    updateStatistics(values, netWorthIn10Years, doublingYears) {
        this.netWorth10y.textContent = this.formatCurrency(netWorthIn10Years);
        
        // Show actual savings (income - expenses) which can be negative
        const actualSavings = values.annualSavings;
        this.annualSavingsDisplay.textContent = actualSavings >= 0 ? 
            this.formatCurrency(actualSavings) : 
            '-' + this.formatCurrency(Math.abs(actualSavings));
            
        this.monthlySavingsDisplay.textContent = actualSavings >= 0 ? 
            this.formatCurrency(actualSavings / 12) : 
            '-' + this.formatCurrency(Math.abs(actualSavings) / 12);
            
        this.doublingTime.textContent = doublingYears === Infinity ? 
            'N/A' : Math.round(doublingYears * 10) / 10 + ' years';
    }

    drawChart(projection) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (projection.length < 2) return;

        // Find max values for scaling
        const maxNetWorth = Math.max(...projection.map(p => p.nominalNetWorth));
        const maxYears = projection[projection.length - 1].year;

        // Draw grid and axes
        this.drawGrid(maxNetWorth, maxYears);

        // Draw net worth line (nominal)
        this.drawLine(projection, 'nominalNetWorth', '#667eea', 'Nominal Value', 3);

        // Draw net worth line (real/inflation-adjusted)
        this.drawLine(projection, 'netWorth', '#764ba2', 'Inflation-Adjusted', 2, [5, 5]);

        // Draw legend
        this.drawLegend();

        // Add data points on hover (simplified)
        this.addChartInteractivity(projection);
    }

    drawGrid(maxNetWorth, maxYears) {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        this.ctx.font = '12px sans-serif';
        this.ctx.fillStyle = '#6c757d';

        // Vertical grid lines (years)
        const yearStep = Math.max(1, Math.floor(maxYears / 10));
        for (let year = 0; year <= maxYears; year += yearStep) {
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartY);
            this.ctx.lineTo(x, this.chartY + this.chartHeight);
            this.ctx.stroke();

            // Year labels
            this.ctx.fillText(year.toString(), x - 10, this.chartY + this.chartHeight + 15);
        }

        // Horizontal grid lines (net worth)
        const worthStep = Math.pow(10, Math.floor(Math.log10(maxNetWorth / 5)));
        for (let worth = 0; worth <= maxNetWorth; worth += worthStep) {
            const y = this.chartY + this.chartHeight - (worth / maxNetWorth) * this.chartHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartX, y);
            this.ctx.lineTo(this.chartX + this.chartWidth, y);
            this.ctx.stroke();

            // Worth labels
            this.ctx.fillText(this.formatCurrencyShort(worth), 5, y + 4);
        }

        // Draw axes
        this.ctx.strokeStyle = '#495057';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartX, this.chartY);
        this.ctx.lineTo(this.chartX, this.chartY + this.chartHeight);
        this.ctx.lineTo(this.chartX + this.chartWidth, this.chartY + this.chartHeight);
        this.ctx.stroke();

        // Axis labels
        this.ctx.fillStyle = '#495057';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.fillText('Years', this.chartX + this.chartWidth / 2 - 20, this.chartY + this.chartHeight + 40);
        
        this.ctx.save();
        this.ctx.translate(20, this.chartY + this.chartHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Net Worth', -40, 0);
        this.ctx.restore();
    }

    drawLine(projection, valueKey, color, label, lineWidth = 2, lineDash = []) {
        if (projection.length < 2) return;

        const maxNetWorth = Math.max(...projection.map(p => p.nominalNetWorth));
        const maxYears = projection[projection.length - 1].year;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash(lineDash);

        this.ctx.beginPath();
        projection.forEach((point, index) => {
            const x = this.chartX + (point.year / maxYears) * this.chartWidth;
            const y = this.chartY + this.chartHeight - (point[valueKey] / maxNetWorth) * this.chartHeight;

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawLegend() {
        const legendY = this.chartY + 20;
        const legendX = this.chartX + this.chartWidth - 200;

        // Nominal value
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(legendX, legendY);
        this.ctx.lineTo(legendX + 30, legendY);
        this.ctx.stroke();

        this.ctx.fillStyle = '#495057';
        this.ctx.font = '12px sans-serif';
        this.ctx.fillText('Nominal Value', legendX + 35, legendY + 4);

        // Inflation-adjusted
        this.ctx.strokeStyle = '#764ba2';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(legendX, legendY + 20);
        this.ctx.lineTo(legendX + 30, legendY + 20);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillText('Inflation-Adjusted', legendX + 35, legendY + 24);
    }

    addChartInteractivity(projection) {
        // Add mouse move event for hover effects (simplified)
        this.canvas.onmousemove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Change cursor when over chart area
            if (x >= this.chartX && x <= this.chartX + this.chartWidth &&
                y >= this.chartY && y <= this.chartY + this.chartHeight) {
                this.canvas.style.cursor = 'crosshair';
            } else {
                this.canvas.style.cursor = 'default';
            }
        };
    }

    updateAnalysis(values, projection) {
        const finalYear = projection[projection.length - 1];
        const nominalGrowth = finalYear.nominalNetWorth - values.currentNetWorth;
        const realGrowth = finalYear.netWorth - values.currentNetWorth;
        
        // Handle negative net worth scenarios
        let annualGrowthRate = 0;
        if (values.currentNetWorth > 0 && finalYear.nominalNetWorth > 0) {
            annualGrowthRate = Math.pow(finalYear.nominalNetWorth / values.currentNetWorth, 1 / this.currentTimeframe) - 1;
        }

        let message = '';
        
        // Check if we have negative savings (spending more than earning)
        if (values.annualSavings < 0) {
            message = `⚠️ WARNING: You're spending ${this.formatCurrency(Math.abs(values.annualSavings))} more than you earn annually. `;
            
            if (finalYear.nominalNetWorth < values.currentNetWorth) {
                message += `Your net worth will decline from ${this.formatCurrency(values.currentNetWorth)} to `;
                message += `${this.formatCurrency(finalYear.nominalNetWorth)} over ${this.currentTimeframe} years. `;
                message += `� You need to either increase income or reduce expenses to stop wealth erosion.`;
            } else {
                message += `Despite negative cash flow, investment returns are keeping your net worth growing slowly. `;
                message += `However, this is not sustainable long-term.`;
            }
        } else {
            // Positive savings scenario
            const trendIcon = nominalGrowth >= 0 ? '�📈' : '📉';
            message = `${trendIcon} In ${this.currentTimeframe} years, your net worth is projected to `;
            
            if (nominalGrowth >= 0) {
                message += `grow from ${this.formatCurrency(values.currentNetWorth)} to `;
                message += `${this.formatCurrency(finalYear.nominalNetWorth)} (${this.formatCurrency(finalYear.netWorth)} inflation-adjusted). `;
                
                if (annualGrowthRate > 0) {
                    message += `This represents a ${(annualGrowthRate * 100).toFixed(1)}% annual growth rate. `;
                }
            } else {
                message += `decline from ${this.formatCurrency(values.currentNetWorth)} to `;
                message += `${this.formatCurrency(finalYear.nominalNetWorth)}. `;
            }

            // Provide tailored advice based on savings amount
            if (values.annualSavings < values.annualIncome * 0.1) {
                message += `💡 Consider increasing your annual savings to accelerate wealth building.`;
            } else if (values.annualSavings > values.annualIncome * 0.5) {
                message += `🎉 Excellent savings amount! You're on track for rapid wealth accumulation.`;
            } else {
                message += `✅ Good savings amount. Your wealth is growing steadily over time.`;
            }
        }

        this.projectionMessage.textContent = message;
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
}

// Initialize the simulator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NetWorthSimulator();
});

// Export for potential use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetWorthSimulator;
}