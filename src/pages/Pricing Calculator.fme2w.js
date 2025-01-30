import wixWindow from 'wix-window';
import wixWindowFrontend from "wix-window-frontend";

$w.onReady(function () {
    // Initialize user input elements
    const homeValueInput = $w('#homeValueInput');
    const yearlyIncomeInput = $w('#yearlyIncomeInput');
    const projectTypeDropdown = $w('#projectTypeDropdown');
    const projectTypeOptions = projectTypeDropdown.options;
    const calculateButton = $w('#calculateButton');
    const resultsContainer = $w('#resultsContainer');
    const resultsContainer2 = $w('#resultsContainer2');
    const resetButton = $w('#resetButton');

    // Hide results and disable reset button initially
    if (wixWindowFrontend.formFactor !== "Mobile") {
        resultsContainer.hide();
    }
    
    resultsContainer2.hide();
    resetButton.disable();

    // calculateButton.disable();



    calculateButton.onClick(() => {
        try {
            const homeValue = Number(homeValueInput.value);
            const yearlyIncome = Number(yearlyIncomeInput.value);
            const projectType = projectTypeDropdown.value;
            console.log('Project type:', projectType);

            // Validate project type against allowed options
            if (!isValidProjectType(projectType)) {
                wixWindow.openLightbox("ErrorMessage", {
                    message: "Please select a valid project type"
                });
                return;
            }

            // Add input validation with minimum values
            if (!homeValue || !yearlyIncome || projectType === 'select' || 
                homeValue < 50000 || yearlyIncome < 8000) {
                wixWindow.openLightbox("ErrorMessage", {
                    message: "Please check your inputs:\n• Home value must be at least $50,000\n• Yearly income must be at least $8,000\n• Project type must be selected"
                });
                return;
            }

            console.log('Input values:', { homeValue, yearlyIncome, projectType });

            // Calculate for each tier
            const results = {
                low: calculateTier(homeValue, yearlyIncome, projectType, 'low'),
                middle: calculateTier(homeValue, yearlyIncome, projectType, 'middle'),
                high: calculateTier(homeValue, yearlyIncome, projectType, 'high')
            };

            console.log('Calculation results:', results);

            // Update this logic to properly handle mobile/tablet
            if (wixWindowFrontend.formFactor === "Mobile") {
                updateDisplay(results);  // Add this line to ensure values are updated
                resultsContainer2.show();
            } else {
                updateDisplay(results);
                resultsContainer.show();
                resultsContainer2.show();
            }

            resetButton.enable();
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
        
        // As you can see, the contingency rates match the sheet
        const contingencyRates = {
            low: 0.1,      // C10
            middle: 0.15, // D10
            high: 0.25   // E10
        };
        
        // Monthly savings rates match the sheet
        const monthlySavingRates = {
            low: 0.2,      // C12
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
        
        // Calculate value increase (totalBudget * roiCoefficient)
        const valueIncrease = totalBudget * roiCoefficient;
        
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
                "Bathroom": 0.8, 
                "Roof Replacement": 0.75, 
                "Window Replacement": 0.8, 
                "Garage Door Replacement": 0.95, 
                "Deck Addition": 0.8, 
                "Attic Insulation": 0.85, 
                "Siding Replacement": 0.8, 
                "Room Addition": 0.65, 
                "Accessory Dwelling Unit": 1.05, 
                "ADU": 1.05, 
                "Landscaping": 0.85, 
                "Solar Panel Installation": 0.85
            },
            middle: {
                "Kitchen": 1.05, 
                "Bathroom": 0.9, 
                "Roof Replacement": 0.83, 
                "Window Replacement": 0.85, 
                "Garage Door Replacement": 1.1, 
                "Deck Addition": 0.87, 
                "Attic Insulation": 0.92, 
                "Room Addition": 0.75, 
                "Accessory Dwelling Unit": 1.05, 
                "ADU": 1.05, 
                "Landscaping": 0.85, 
                "Solar Panel Installation": 0.85,
                "Siding Replacement": 0.9, 
            },
            high: {
                "Kitchen": 1.2, 
                "Bathroom": 1, 
                "Roof Replacement": 0.9, 
                "Window Replacement": 0.95, 
                "Garage Door Replacement": 1.2, 
                "Deck Addition": 0.9, 
                "Attic Insulation": 1, 
                "Siding Replacement": 0.9, 
                "Room Addition": 0.75, 
                "Accessory Dwelling Unit": 1.05, 
                "ADU": 1.05, 
                "Landscaping": 0.85, 
                "Solar Panel Installation": 0.85,
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
        return Math.round(value) + " months";
    }

    // Reset button handler
    resetButton.onClick(() => {
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
                const element = $w(`#${tier}${field}`);
                if (element) {
                    element.text = '';
                }
            });
        });

        // Hide containers based on form factor
        if (wixWindowFrontend.formFactor === "Mobile") {
            resultsContainer2.hide();
        } else {
            resultsContainer.hide();
            resultsContainer2.hide();
        }
        
        resetButton.disable();
    });

    // Add this new helper function
    function isValidProjectType(projectType) {
        const validTypes = [
            "Bathroom",
            "Kitchen",
            "Roof Replacement",
            "Window Replacement",
            "Garage Door Replacement",
            "Deck Addition",
            "Attic Insulation",
            "Siding Replacement",
            "Room Addition",
            "Accessory Dwelling Unit",
            "ADU",
            "Landscaping",
            "Solar Panel Installation"
        ];
        return validTypes.includes(projectType);
    }
});