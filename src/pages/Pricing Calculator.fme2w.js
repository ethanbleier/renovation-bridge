import wixWindow from 'wix-window';

$w.onReady(function () {
    // Initialize user input elements
    const homeValueInput = $w('#homeValueInput');
    const yearlyIncomeInput = $w('#yearlyIncomeInput');
    const projectTypeDropdown = $w('#projectTypeDropdown');
    const calculateButton = $w('#calculateButton');
    const resultsContainer = $w('#resultsContainer');
    const resultsContainer2 = $w('#resultsContainer2');

    // Hide results initially
    resultsContainer.hide();
    resultsContainer2.hide();
    calculateButton.onClick(() => {
        try {
            const homeValue = Number(homeValueInput.value);
            const yearlyIncome = Number(yearlyIncomeInput.value);
            const projectType = projectTypeDropdown.value;

            console.log('Input values:', { homeValue, yearlyIncome, projectType });

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

            console.log('Calculation results:', results);

            // Update display
            updateDisplay(results);
            resultsContainer.show();
            resultsContainer2.show();
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
        
        // Initial Budget (C9 * C3)
        const initialBudget = homeValue * coefficient;
        
        // Contingency rates now match the sheet
        const contingencyRates = {
            low: 0.1,    // C10
            middle: 0.15, // D10
            high: 0.25   // E10
        };
        
        // Monthly savings rates match the sheet
        const monthlySavingRates = {
            low: 0.2,    // C12
            middle: 0.25, // D12
            high: 0.3    // E12
        };

        // Calculate contingency fund (initialBudget * contingencyRate)
        const contingencyFund = initialBudget * contingencyRates[tier];
        
        // Calculate monthly savings (yearlyIncome / 12 * monthlySavingRate)
        const monthlyIncome = yearlyIncome / 12;
        const monthlySavings = monthlyIncome * monthlySavingRates[tier];
        
        // Total budget (initialBudget + contingencyFund)
        const totalBudget = initialBudget + contingencyFund;
        
        // Time to save (totalBudget / monthlySavings)
        const timeToSave = totalBudget / monthlySavings;
        
        // Get ROI coefficient from the sheet's lookup tables
        const roiCoefficient = getROICoefficient(projectType, tier);
        
        // Calculate value increase (totalBudget * (roiCoefficient - 1))
        const valueIncrease = totalBudget * (roiCoefficient - 1);
        
        // Updated home value (homeValue + valueIncrease)
        const updatedHomeValue = homeValue + valueIncrease;

        const result = {
            initialBudget,
            contingencyFund,
            timeToSave,
            monthlySavings,
            roi: roiCoefficient * 100,
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
        console.log('Updating display with results:', { results });
        
        // Update each text element with the calculated values
        // this method is only correct when there are 24 updated text elements (the size of results)
        Object.keys(results).forEach(tier => {
            const r = results[tier];
            // tier strings start in lowercase, as low, middle or high + InitialBudget, ContingencyFund, TimeToSave, MonthlySavings, ROI, TotalBudget, ValueIncrease, UpdatedHomeValue
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

    // Reset button handler
    $w('#resetButton').onClick(() => {
        // Clear input fields
        homeValueInput.value = '';
        yearlyIncomeInput.value = '';
        projectTypeDropdown.value = 'select';

        // Clear all result text elements
        const tiers = ['low', 'middle', 'high'];
        const fields = ['InitialBudget', 'ContingencyFund', 'TimeToSave', 'MonthlySavings', 
                       'ROI', 'TotalBudget', 'ValueIncrease', 'UpdatedHomeValue', 'projectType'];

        tiers.forEach(tier => {
            fields.forEach(field => {
                $w(`#${tier}${field}`).text = '';
            });
        });


        // Hide containers!
        resultsContainer.hide();
        resultsContainer2.hide();
    });
});