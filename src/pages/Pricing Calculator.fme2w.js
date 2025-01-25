import wixWindow from 'wix-window';

$w.onReady(function () {
    // Initialize elements
    const homeValueInput = $w('#homeValueInput');
    const yearlyIncomeInput = $w('#yearlyIncomeInput');
    const projectTypeDropdown = $w('#projectTypeDropdown');
    const calculateButton = $w('#calculateButton');
    const resultsContainer = $w('#resultsContainer');

    // Hide results initially
    resultsContainer.hide();

    calculateButton.onClick(() => {
        try {
            const homeValue = Number(homeValueInput.value);
            const yearlyIncome = Number(yearlyIncomeInput.value);
            const projectType = projectTypeDropdown.value;

            // Validate inputs
            if (!homeValue || !yearlyIncome || projectType === 'select') {
                wixWindow.openLightbox("ErrorMessage", {
                    message: "Please enter valid values for all fields"
                });
                return;
            }

            // Calculate for each tier
            const results = {
                low: calculateTier(homeValue, yearlyIncome, projectType, 'low'),
                middle: calculateTier(homeValue, yearlyIncome, projectType, 'middle'),
                high: calculateTier(homeValue, yearlyIncome, projectType, 'high')
            };

            // Update display
            updateDisplay(results);
            resultsContainer.show();

        } catch (error) {
            console.error('Calculation error:', error);
            wixWindow.openLightbox("ErrorMessage", {
                message: "An error occurred while calculating. Please check your inputs and try again."
            });
        }
    });

    function calculateTier(homeValue, yearlyIncome, projectType, tier) {
        const rates = {
            low: { contingency: 0.1, monthly: 0.2 },
            middle: { contingency: 0.15, monthly: 0.25 },
            high: { contingency: 0.25, monthly: 0.3 }
        };

        // Get project coefficient
        const coefficient = getProjectCoefficient(projectType, tier);
        
        // Initial budget calculation
        const initialBudget = homeValue * coefficient;
        
        // Contingency fund
        const contingencyFund = initialBudget * rates[tier].contingency;
        
        // Monthly savings
        const monthlyIncome = yearlyIncome / 12;
        const monthlySavings = monthlyIncome * rates[tier].monthly;
        
        // Total budget
        const totalBudget = initialBudget + contingencyFund;
        
        // Time to save
        const timeToSave = totalBudget / monthlySavings;
        
        // ROI and value calculations
        const roiCoefficient = getROICoefficient(projectType, tier);
        const valueIncrease = totalBudget * roiCoefficient;
        const updatedHomeValue = homeValue + valueIncrease;
        
        return {
            initialBudget,
            contingencyFund,
            timeToSave,
            monthlySavings,
            roi: (roiCoefficient - 1) * 100,
            totalBudget,
            valueIncrease,
            updatedHomeValue
        };
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
        return coefficients[tier][projectType];
    }

    function updateDisplay(results) {
        // Update each text element with the calculated values
        Object.keys(results).forEach(tier => {
            const r = results[tier];
            $w(`#${tier}InitialBudget`).text = formatCurrency(r.initialBudget);
            $w(`#${tier}ContingencyFund`).text = formatCurrency(r.contingencyFund);
            $w(`#${tier}TimeToSave`).text = formatDecimal(r.timeToSave);
            $w(`#${tier}MonthlySavings`).text = formatCurrency(r.monthlySavings);
            $w(`#${tier}ROI`).text = `${r.roi.toFixed(2)}%`;
            $w(`#${tier}TotalBudget`).text = formatCurrency(r.totalBudget);
            $w(`#${tier}ValueIncrease`).text = formatCurrency(r.valueIncrease);
            $w(`#${tier}UpdatedHomeValue`).text = formatCurrency(r.updatedHomeValue);
        });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(value);
    }

    function formatDecimal(value) {
        return value.toFixed(2);
    }
});