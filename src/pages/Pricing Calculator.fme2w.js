import wixWindow from 'wix-window';

$w.onReady(function () {
    // user input elements
    const homeValueInput = $w('#homeValueInput');
    const yearlyIncomeInput = $w('#yearlyIncomeInput');
    const projectTypeDropdown = $w('#projectTypeDropdown');
    const calculateButton = $w('#calculateButton');

    // results elements
    const resultsContainer = $w('#resultsContainer');
    const resultsContainer2 = $w('#resultsContainer2');
    const resetButton = $w('#resetButton');
    const applicationLink = $w('#applicationLink');

    // hide results and disable reset button initially
    resultsContainer.hide();
    resultsContainer2.hide();
    resetButton.disable();
    applicationLink.hide();

    // config constants
    const CONFIG = {
        LIMITS: {
            MIN_HOME_VALUE: 50000,
            MAX_HOME_VALUE: 10000000,
            MIN_YEARLY_INCOME: 8000,
            MAX_YEARLY_INCOME: 10000000
        },
        RATES: {
            CONTINGENCY: {
                low: 0.1,
                middle: 0.15,
                high: 0.25
            },
            MONTHLY_SAVINGS: {
                low: 0.2,
                middle: 0.25,
                high: 0.3
            }
        }
    };

    calculateButton.onClick(() => {
        try {
            // input sanitization
            homeValueInput.value = homeValueInput.value.replace(/[^0-9.]/g, '');
            yearlyIncomeInput.value = yearlyIncomeInput.value.replace(/[^0-9.]/g, '');

            const homeValue = Number(homeValueInput.value);
            const yearlyIncome = Number(yearlyIncomeInput.value);
            const projectType = projectTypeDropdown.value;

            // maximum value validation
            if (homeValue > 10000000 || yearlyIncome > 10000000) {
                wixWindow.openLightbox("ErrorMessage", {
                    message: "Please enter reasonable values (less than $10 million)"
                });
                return;
            }

            // minimum value validation
            if (!homeValue || !yearlyIncome || projectType === 'select' || 
                homeValue < 50000 || yearlyIncome < 8000) {
                wixWindow.openLightbox("ErrorMessage", {
                    message: "Please check your inputs:\n• Home value must be at least $50,000\n• Yearly income must be at least $8,000\n• Project type must be selected"
                });
                return;
            }

            console.log('Input values:', { homeValue, yearlyIncome, projectType });

            // calculate for each tier
            const results = {
                low: calculateTier(homeValue, yearlyIncome, projectType, 'low'),
                middle: calculateTier(homeValue, yearlyIncome, projectType, 'middle'),
                high: calculateTier(homeValue, yearlyIncome, projectType, 'high')
            };

            console.log('Calculation results:', results);

            updateDisplay(results);

            resultsContainer.show();
            resultsContainer2.show();
            resetButton.enable();
            applicationLink.show();
        } catch (error) {
            console.error('Calculation error:', error);
            wixWindow.openLightbox("ErrorMessage", {
                message: "An error occurred while calculating. Please check your inputs and try again."
            });
        }
    });

    function calculateTier(homeValue, yearlyIncome, projectType, tier) {
        console.log(`Calculating ${tier} tier for ${projectType}`);
        
        // Project coefficient (this is the C9 formula in the sheet)
        const coefficient = getProjectCoefficient(projectType, tier);
        console.log(`Project coefficient for ${tier}: ${coefficient}`);
        
        // initial budget (C9 * C3)
        const initialBudget = homeValue * coefficient;
        
        // contingency rates match the sheet
        const contingencyRates = {
            low: 0.1,      // C10
            middle: 0.15, // D10
            high: 0.25   // E10
        };
        
        // monthly savings rates match the sheet
        const monthlySavingRates = {
            low: 0.2,      // C12
            middle: 0.25, // D12
            high: 0.3    // E12
        };

        // contingency fund (initialBudget * contingencyRate)
        const contingencyFund = initialBudget * contingencyRates[tier];
        
        // monthly savings (yearlyIncome / 12 * monthlySavingRate)
        const monthlyIncome = yearlyIncome / 12;
        const monthlySavings = monthlyIncome * monthlySavingRates[tier];
        
        // total budget (initialBudget + contingencyFund)
        const totalBudget = initialBudget + contingencyFund;
        
        // time to save (totalBudget / monthlySavings)
        const timeToSave = totalBudget / monthlySavings;
        
        // roi coefficient from the sheet's lookup tables
        const roiCoefficient = getROICoefficient(projectType, tier);
        
        // value increase (totalBudget * roiCoefficient)
        const valueIncrease = totalBudget * roiCoefficient;
        
        // home value (homeValue + valueIncrease)
        const updatedHomeValue = homeValue + valueIncrease;

        const result = {
            initialBudget,
            contingencyFund,
            timeToSave,
            monthlySavings,
            roi: roiCoefficient * 100, // they want roi as a percentage
            totalBudget,
            valueIncrease,
            updatedHomeValue,
            projectType
        };
        
        console.log(`${tier} tier calculations:`, result);
        return result;
    }

    function getProjectCoefficient(projectType, tier) {
        const coefficients = {
            low: {
                "Bathroom": 0.025, 
                "Kitchen": 0.05, 
                "Roof Replacement": 0.02, 
                "Window Replacement": 0.015, 
                "Garage Door Replacement": 0.01, 
                "Deck Addition": 0.02, 
                "Attic Insulation": 0.005, 
                "Siding Replacement": 0.02, 
                "Room Addition": 0.1, 
                "Accessory Dwelling Unit": 0.15, 
                "ADU": 0.15, 
                "Landscaping": 0.05, 
                "Solar Panel Installation": 0.05
            },
            middle: {
                "Bathroom": 0.0625, 
                "Kitchen": 0.1, 
                "Roof Replacement": 0.035, 
                "Window Replacement": 0.0325, 
                "Garage Door Replacement": 0.015, 
                "Deck Addition": 0.04, 
                "Attic Insulation": 0.0075, 
                "Siding Replacement": 0.045, 
                "Room Addition": 0.15, 
                "Accessory Dwelling Unit": 0.225, 
                "ADU": 0.225, 
                "Landscaping": 0.075, 
                "Solar Panel Installation": 0.075, 
            },
            high: {
                "Bathroom": 0.1, 
                "Kitchen": 0.15, 
                "Roof Replacement": 0.05, 
                "Window Replacement": 0.05, 
                "Garage Door Replacement": 0.02, 
                "Deck Addition": 0.06, 
                "Attic Insulation": 0.01, 
                "Siding Replacement": 0.07, 
                "Room Addition": 0.2, 
                "Accessory Dwelling Unit": 0.3, 
                "ADU": 0.3, 
                "Landscaping": 0.1, 
                "Solar Panel Installation": 0.1
            }

        };

        // input validation
        if (!coefficients[tier] || !coefficients[tier][projectType]) {
            console.error(`Invalid tier or project type: ${tier}, ${projectType}`);
            throw new Error('Invalid project configuration');
        }


        return coefficients[tier][projectType];
    }

    function getROICoefficient(projectType, tier) {
        const coefficients = {
            low: {
                "Kitchen": 0.9, 
                "Minor Remodel": 0.9, 
                "Major Remodel": 0.8, 
                "Bathroom": 0.8, 
                "Midrange Remodel": 0.85, 
                "Upscale Remodel": 0.8, 
                "Roof Replacement": 0.75, 
                "Asphalt Shingles": 0.65, 
                "Metal Roof": 0.75, 
                "Window Replacement": 0.8, 
                "Vinyl Windows": 0.8, 
                "Wood Windows": 0.75, 
                "Garage Door Replacement": 0.95, 
                "Deck Addition": 0.8, 
                "Wood Deck": 0.8, 
                "Composite Deck": 0.7, 
                "Attic Insulation": 0.85, 
                "Entry Door Replacement": 0.9, 
                "Steel": 0.9, 
                "Siding Replacement": 0.8, 
                "Vinyl Siding": 0.8, 
                "Fiber Cement Siding": 0.85, 
                "Room Addition": 0.65, 
                "Family Room Addition": 0.65, 
                "Master Suite Addition": 0.6, 
                "Accessory Dwelling Unit": 1.05, 
                "ADU": 1.05, 
                "Landscaping": 0.85, 
                "Solar Panel Installation": 0.85
            },
            middle: {
                "Kitchen": 1.05, 
                "Minor Remodel": 0.9, 
                "Major Remodel": 0.8, 
                "Bathroom": 0.9, 
                "Midrange Remodel": 0.85, 
                "Upscale Remodel": 0.8, 
                "Roof Replacement": 0.83, 
                "Asphalt Shingles": 0.65, 
                "Metal Roof": 0.75, 
                "Window Replacement": 0.85, 
                "Vinyl Windows": 0.8, 
                "Wood Windows": 0.75, 
                "Garage Door Replacement": 1.1, 
                "Deck Addition": 0.87, 
                "Wood Deck": 0.8, 
                "Composite Deck": 0.7, 
                "Attic Insulation": 0.92, 
                "Entry Door Replacement": 0.9, 
                "Steel": 0.9, 
                "Siding Replacement": 0.9, 
                "Vinyl Siding": 0.8, 
                "Fiber Cement Siding": 0.85, 
                "Room Addition": 0.75, 
                "Family Room Addition": 0.65, 
                "Master Suite Addition": 0.6, 
                "Accessory Dwelling Unit": 1.5, 
                "ADU": 1.05, 
                "Landscaping": 1, 
                "Solar Panel Installation": 1
            },
            high: {
                "Kitchen": 1.2, 
                "Minor Remodel": 0.9, 
                "Major Remodel": 0.8, 
                "Bathroom": 1, 
                "Midrange Remodel": 0.85, 
                "Upscale Remodel": 0.8, 
                "Roof Replacement": 0.9, 
                "Asphalt Shingles": 0.65, 
                "Metal Roof": 0.75, 
                "Window Replacement": 0.95, 
                "Vinyl Windows": 0.8, 
                "Wood Windows": 0.75, 
                "Garage Door Replacement": 1.2, 
                "Deck Addition": 0.9, 
                "Wood Deck": 0.8, 
                "Composite Deck": 0.7, 
                "Attic Insulation": 1, 
                "Entry Door Replacement": 0.9, 
                "Steel": 0.9, 
                "Siding Replacement": 1, 
                "Vinyl Siding": 0.8, 
                "Fiber Cement Siding": 0.85, 
                "Room Addition": 0.85, 
                "Family Room Addition": 0.65, 
                "Master Suite Addition": 0.6, 
                "Accessory Dwelling Unit": 2.5, 
                "ADU": 1.05, 
                "Landscaping": 1.1, 
                "Solar Panel Installation": 1.1
            }
        };

        // input validation
        if (!coefficients[tier] || !coefficients[tier][projectType]) {
            console.error(`Invalid tier or project type: ${tier}, ${projectType}`);
            throw new Error('Invalid project configuration');
        }

        return coefficients[tier][projectType];
    }

    function updateDisplay(results) {
        if (!results || typeof results !== 'object') {
            console.error('Invalid results object:', results);
            return;
        }
        console.log('Updating display with results:', { results });
        
        // this method is only correct when there are 24 updated text elements (the size of results)
        // There are 8 variables per tier, and 3 tiers, so we are updating 24 text elements
        // This doesn't seem the best way to do it but it works for now
        Object.keys(results).forEach(tier => {
            const r = results[tier];
            // tier strings start in lowercase, as low, middle or high + variable name
            $w(`#${tier}InitialBudget`).text = formatCurrency(r.initialBudget);
            $w(`#${tier}ContingencyFund`).text = formatCurrency(r.contingencyFund);
            $w(`#${tier}TimeToSave`).text = formatDecimal(r.timeToSave);
            $w(`#${tier}MonthlySavings`).text = formatCurrency(r.monthlySavings);
            $w(`#${tier}ROI`).text = `${r.roi.toFixed(2)}%`;
            $w(`#${tier}TotalBudget`).text = formatCurrency(r.totalBudget);
            $w(`#${tier}ValueIncrease`).text = formatCurrency(r.valueIncrease);
            $w(`#${tier}UpdatedHomeValue`).text = formatCurrency(r.updatedHomeValue);
            $w(`#projectType`).text = r.projectType;
        });
    }

    // W javascript
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(value);
    }

    function formatDecimal(value) {
        return Math.round(value) + " months";
    }

    // Reset button handler
    resetButton.onClick(() => {
        // clear input fields
        homeValueInput.value = '';
        yearlyIncomeInput.value = '';
        projectTypeDropdown.value = 'select';

        // clear all result text elements
        const tiers = ['low', 'middle', 'high'];
        const fields = ['InitialBudget', 'ContingencyFund', 'TimeToSave', 'MonthlySavings', 
                       'ROI', 'TotalBudget', 'ValueIncrease', 'UpdatedHomeValue', 'projectType'];

        tiers.forEach(tier => {
            fields.forEach(field => {
                $w(`#${tier}${field}`).text = '';
            });
        });

        // hide containers and disable reset button!
        resultsContainer.hide();
        resultsContainer2.hide();
        resetButton.disable();
        applicationLink.hide();
    });
});