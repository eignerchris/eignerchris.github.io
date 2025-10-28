// FIRE Calculator JavaScript
class FIRECalculator {
    constructor() {
        this.initializeElements();
        this.addEventListeners();
        this.calculate(); // Initial calculation
        this.setupIframeDetection();
    }

    initializeElements() {
        // Input elements
        this.currentAge = document.getElementById('current-age');
        this.targetAge = document.getElementById('target-age');
        this.currentSavings = document.getElementById('current-savings');
        this.monthlyContribution = document.getElementById('monthly-contribution');
        this.annualExpenses = document.getElementById('annual-expenses');
        this.expectedReturn = document.getElementById('expected-return');
        this.withdrawalRate = document.getElementById('withdrawal-rate');

        // Result elements
        this.yearsToFire = document.getElementById('years-to-fire');
        this.fireNumber = document.getElementById('fire-number');
        this.projectedSavings = document.getElementById('projected-savings');
        this.requiredMonthly = document.getElementById('required-monthly');
        this.currentProgress = document.getElementById('current-progress');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.scenarioMessage = document.getElementById('scenario-message');

        // Chart elements
        this.canvas = document.getElementById('fire-chart');
        this.ctx = this.canvas.getContext('2d');
        this.setupChart();

        // Collect all inputs for easy iteration
        this.inputs = [
            this.currentAge,
            this.targetAge,
            this.currentSavings,
            this.monthlyContribution,
            this.annualExpenses,
            this.expectedReturn,
            this.withdrawalRate
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
        this.chartWidth = rect.width - 80;
        this.chartHeight = rect.height - 60;
        this.chartX = 50;
        this.chartY = 20;
    }

    addEventListeners() {
        // Add input event listeners for real-time calculation
        this.inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
            });
        });

        // Add change event listeners as backup
        this.inputs.forEach(input => {
            input.addEventListener('change', () => {
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
        // Detect if we're in an iframe and adjust styling
        if (window.self !== window.top) {
            document.body.classList.add('iframe-mode');
        }
    }

    getInputValues() {
        return {
            currentAge: parseFloat(this.currentAge.value) || 30,
            targetAge: parseFloat(this.targetAge.value) || 50,
            currentSavings: parseFloat(this.currentSavings.value) || 0,
            monthlyContribution: parseFloat(this.monthlyContribution.value) || 0,
            annualExpenses: parseFloat(this.annualExpenses.value) || 40000,
            expectedReturn: (parseFloat(this.expectedReturn.value) || 7) / 100,
            withdrawalRate: (parseFloat(this.withdrawalRate.value) || 4) / 100
        };
    }

    validateInputs(values) {
        const errors = [];

        if (values.currentAge >= values.targetAge) {
            errors.push('Target retirement age must be greater than current age');
        }

        if (values.currentAge < 18 || values.currentAge > 100) {
            errors.push('Current age must be between 18 and 100');
        }

        if (values.targetAge < 25 || values.targetAge > 100) {
            errors.push('Target retirement age must be between 25 and 100');
        }

        if (values.expectedReturn < 0 || values.expectedReturn > 0.2) {
            errors.push('Expected return must be between 0% and 20%');
        }

        if (values.withdrawalRate < 0.01 || values.withdrawalRate > 0.1) {
            errors.push('Withdrawal rate must be between 1% and 10%');
        }

        return errors;
    }

    calculateFutureValue(principal, monthlyContribution, annualRate, years) {
        // Future Value of current savings with compound interest
        const futureValuePrincipal = principal * Math.pow(1 + annualRate, years);

        // Future Value of annuity (monthly contributions)
        const monthlyRate = annualRate / 12;
        const totalPayments = years * 12;
        
        let futureValueAnnuity = 0;
        if (monthlyRate > 0) {
            futureValueAnnuity = monthlyContribution * 
                (Math.pow(1 + monthlyRate, totalPayments) - 1) / monthlyRate;
        } else {
            futureValueAnnuity = monthlyContribution * totalPayments;
        }

        return futureValuePrincipal + futureValueAnnuity;
    }

    calculateRequiredMonthly(targetAmount, currentSavings, annualRate, years) {
        // Calculate how much monthly contribution is needed to reach target
        const futureValueOfCurrent = currentSavings * Math.pow(1 + annualRate, years);
        const remainingNeeded = targetAmount - futureValueOfCurrent;

        if (remainingNeeded <= 0) return 0;

        const monthlyRate = annualRate / 12;
        const totalPayments = years * 12;

        if (monthlyRate > 0) {
            return remainingNeeded * monthlyRate / 
                (Math.pow(1 + monthlyRate, totalPayments) - 1);
        } else {
            return remainingNeeded / totalPayments;
        }
    }

    calculate() {
        const values = this.getInputValues();
        const errors = this.validateInputs(values);

        if (errors.length > 0) {
            this.displayErrors(errors);
            return;
        }

        try {
            // Calculate FIRE number (25x annual expenses is the 4% rule)
            const fireNumber = values.annualExpenses / values.withdrawalRate;

            // Calculate years to retirement
            const yearsToRetirement = values.targetAge - values.currentAge;

            // Calculate projected savings at target retirement age
            const projectedSavings = this.calculateFutureValue(
                values.currentSavings,
                values.monthlyContribution,
                values.expectedReturn,
                yearsToRetirement
            );

            // Calculate required monthly savings to reach FIRE number
            const requiredMonthly = this.calculateRequiredMonthly(
                fireNumber,
                values.currentSavings,
                values.expectedReturn,
                yearsToRetirement
            );

            // Calculate current progress towards FIRE
            const currentProgress = (values.currentSavings / fireNumber) * 100;

            // Determine if they'll reach FIRE with current plan
            const willReachFire = projectedSavings >= fireNumber;

            // Calculate actual years to FIRE with current savings rate
            const actualYearsToFire = this.calculateYearsToFire(
                values.currentSavings,
                values.monthlyContribution,
                fireNumber,
                values.expectedReturn
            );

            // Calculate wealth projection over time
            const wealthProjection = this.calculateWealthProjection(values, Math.max(actualYearsToFire, yearsToRetirement) + 5);

            // Update the display
            this.updateDisplay({
                fireNumber,
                yearsToRetirement,
                projectedSavings,
                requiredMonthly,
                currentProgress,
                willReachFire,
                actualYearsToFire,
                values,
                wealthProjection
            });

        } catch (error) {
            console.error('Calculation error:', error);
            this.displayErrors(['An error occurred during calculation. Please check your inputs.']);
        }
    }

    calculateYearsToFire(currentSavings, monthlyContribution, targetAmount, annualRate) {
        if (currentSavings >= targetAmount) return 0;
        if (monthlyContribution <= 0) return Infinity;

        const monthlyRate = annualRate / 12;
        let balance = currentSavings;
        let months = 0;
        const maxMonths = 50 * 12; // Prevent infinite loops

        while (balance < targetAmount && months < maxMonths) {
            balance = balance * (1 + monthlyRate) + monthlyContribution;
            months++;
        }

        return months / 12;
    }

    calculateWealthProjection(values, totalYears) {
        const projection = [];
        const monthlyRate = values.expectedReturn / 12;
        let currentWealth = values.currentSavings;
        
        // Add starting point
        projection.push({ year: 0, wealth: currentWealth });
        
        // Project wealth growth year by year
        for (let year = 1; year <= totalYears; year++) {
            // Add 12 months of contributions and growth
            for (let month = 0; month < 12; month++) {
                currentWealth = currentWealth * (1 + monthlyRate) + values.monthlyContribution;
            }
            projection.push({ year, wealth: currentWealth });
        }
        
        return projection;
    }

    updateDisplay(results) {
        // Update main result
        this.animateValueChange(this.yearsToFire, 
            results.actualYearsToFire === Infinity ? '∞' : 
            Math.round(results.actualYearsToFire * 10) / 10);

        // Update other results
        this.animateValueChange(this.fireNumber, this.formatCurrency(results.fireNumber));
        this.animateValueChange(this.projectedSavings, this.formatCurrency(results.projectedSavings));
        this.animateValueChange(this.requiredMonthly, this.formatCurrency(results.requiredMonthly));
        this.animateValueChange(this.currentProgress, Math.round(results.currentProgress) + '%');

        // Update progress bar
        const progressPercent = Math.min(results.currentProgress, 100);
        this.progressFill.style.width = progressPercent + '%';
        this.progressText.textContent = 
            `${this.formatCurrency(results.values.currentSavings)} of ${this.formatCurrency(results.fireNumber)}`;

        // Update scenario analysis
        this.updateScenarioAnalysis(results);

        // Draw the chart
        this.drawChart(results);
    }

    animateValueChange(element, newValue) {
        if (element.textContent !== newValue) {
            element.classList.add('updating');
            setTimeout(() => {
                element.textContent = newValue;
                element.classList.remove('updating');
            }, 150);
        }
    }

    updateScenarioAnalysis(results) {
        let message = '';
        let messageClass = '';

        if (results.willReachFire) {
            const excess = results.projectedSavings - results.fireNumber;
            message = `🎉 Great news! You're on track to reach FIRE by age ${results.values.targetAge}. ` +
                     `You'll have an extra ${this.formatCurrency(excess)} beyond your FIRE number, ` +
                     `giving you additional security.`;
            messageClass = 'success';
        } else {
            const shortfall = results.fireNumber - results.projectedSavings;
            const additionalMonthly = results.requiredMonthly - results.values.monthlyContribution;
            
            if (additionalMonthly > 0) {
                message = `⚠️ You'll be ${this.formatCurrency(shortfall)} short of your FIRE goal by age ${results.values.targetAge}. ` +
                         `Consider increasing your monthly savings by ${this.formatCurrency(additionalMonthly)} ` +
                         `or adjusting your target retirement age.`;
            } else {
                message = `✅ You're saving more than needed! You could reduce your monthly savings ` +
                         `by ${this.formatCurrency(Math.abs(additionalMonthly))} and still reach your goal.`;
                messageClass = 'success';
            }
        }

        // Add timeline information
        if (results.actualYearsToFire !== Infinity && results.actualYearsToFire < 50) {
            const fireAge = results.values.currentAge + results.actualYearsToFire;
            message += ` At your current savings rate, you'll reach FIRE at age ${Math.round(fireAge * 10) / 10}.`;
        }

        this.scenarioMessage.textContent = message;
        this.scenarioMessage.className = `scenario-message ${messageClass}`;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    }

    displayErrors(errors) {
        // Clear existing results
        this.yearsToFire.textContent = '--';
        this.fireNumber.textContent = '$0';
        this.projectedSavings.textContent = '$0';
        this.requiredMonthly.textContent = '$0';
        this.currentProgress.textContent = '0%';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '$0 of $0';
        
        // Show error message
        this.scenarioMessage.textContent = '❌ ' + errors.join('. ');
        this.scenarioMessage.className = 'scenario-message error';
    }

    drawChart(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!results.wealthProjection || results.wealthProjection.length < 2) return;

        const maxWealth = Math.max(...results.wealthProjection.map(p => p.wealth), results.fireNumber);
        const maxYears = results.wealthProjection[results.wealthProjection.length - 1].year;

        // Draw grid and axes
        this.drawGrid(maxWealth, maxYears);

        // Draw FIRE target line
        this.drawFireTarget(results.fireNumber, maxWealth, maxYears);

        // Draw wealth accumulation line
        this.drawWealthLine(results.wealthProjection, maxWealth, maxYears);

        // Highlight FIRE achievement point
        this.highlightFirePoint(results);

        // Add labels
        this.addChartLabels();
    }

    drawGrid(maxWealth, maxYears) {
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 1;
        this.ctx.font = '11px sans-serif';
        this.ctx.fillStyle = '#6c757d';

        // Vertical grid lines (years)
        const yearStep = Math.max(1, Math.ceil(maxYears / 8));
        for (let year = 0; year <= maxYears; year += yearStep) {
            const x = this.chartX + (year / maxYears) * this.chartWidth;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.chartY);
            this.ctx.lineTo(x, this.chartY + this.chartHeight);
            this.ctx.stroke();

            // Year labels
            this.ctx.textAlign = 'center';
            this.ctx.fillText(year.toString(), x, this.chartY + this.chartHeight + 15);
        }

        // Horizontal grid lines (wealth)
        const wealthStep = this.getNiceStep(maxWealth / 6);
        for (let wealth = 0; wealth <= maxWealth; wealth += wealthStep) {
            const y = this.chartY + this.chartHeight - (wealth / maxWealth) * this.chartHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.chartX, y);
            this.ctx.lineTo(this.chartX + this.chartWidth, y);
            this.ctx.stroke();

            // Wealth labels
            this.ctx.textAlign = 'right';
            this.ctx.fillText(this.formatCurrencyShort(wealth), this.chartX - 5, y + 3);
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

    drawFireTarget(fireNumber, maxWealth, maxYears) {
        const y = this.chartY + this.chartHeight - (fireNumber / maxWealth) * this.chartHeight;
        
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.chartX, y);
        this.ctx.lineTo(this.chartX + this.chartWidth, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // FIRE target label
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('FIRE Target: ' + this.formatCurrencyShort(fireNumber), this.chartX + 10, y - 5);
    }

    drawWealthLine(projection, maxWealth, maxYears) {
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        
        this.ctx.beginPath();
        projection.forEach((point, index) => {
            const x = this.chartX + (point.year / maxYears) * this.chartWidth;
            const y = this.chartY + this.chartHeight - (point.wealth / maxWealth) * this.chartHeight;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
    }

    highlightFirePoint(results) {
        if (results.actualYearsToFire === Infinity || results.actualYearsToFire > 50) return;
        
        const fireYear = results.actualYearsToFire;
        const maxWealth = Math.max(...results.wealthProjection.map(p => p.wealth), results.fireNumber);
        const maxYears = results.wealthProjection[results.wealthProjection.length - 1].year;
        
        const x = this.chartX + (fireYear / maxYears) * this.chartWidth;
        const y = this.chartY + this.chartHeight - (results.fireNumber / maxWealth) * this.chartHeight;
        
        // Draw FIRE achievement circle
        this.ctx.fillStyle = '#28a745';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Add FIRE achievement label
        this.ctx.fillStyle = '#28a745';
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('FIRE!', x, y - 10);
    }

    addChartLabels() {
        this.ctx.fillStyle = '#495057';
        this.ctx.font = 'bold 12px sans-serif';
        
        // X-axis label
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Years', this.chartX + this.chartWidth / 2, this.chartY + this.chartHeight + 35);
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(15, this.chartY + this.chartHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Portfolio Value', 0, 0);
        this.ctx.restore();
    }

    getNiceStep(rawStep) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalizedStep = rawStep / magnitude;
        
        if (normalizedStep <= 1) return magnitude;
        if (normalizedStep <= 2) return 2 * magnitude;
        if (normalizedStep <= 5) return 5 * magnitude;
        return 10 * magnitude;
    }

    formatCurrencyShort(amount) {
        if (amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '$' + Math.round(amount / 1000) + 'K';
        } else {
            return '$' + Math.round(amount);
        }
    }
}

// Add CSS for success/error states
const style = document.createElement('style');
style.textContent = `
    .scenario-message.success {
        background: #d1edff;
        border-color: #bee5eb;
        color: #0c5460;
    }
    
    .scenario-message.error {
        background: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
    }
`;
document.head.appendChild(style);

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FIRECalculator();
});

// Export for potential use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIRECalculator;
}