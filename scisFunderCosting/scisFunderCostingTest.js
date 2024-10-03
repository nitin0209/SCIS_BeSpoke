import { LightningElement, track, wire } from 'lwc';
import getCostingDetails from '@salesforce/apex/FunderCostingController.getCostingDetails';
import getFunders from '@salesforce/apex/SCIS_FunderCostingController.getFunders'; // Import the Apex method to get funders

export default class scisFunderCostingTest extends LightningElement {

    @track funders = [];  // Funders array populated from Apex
    @track costingDetails = {};  // Initialize as an empty object
    @track funderOptions = [];   // To hold the funder options for the combobox
    @track fieldVisibility = {}; // Object to track visibility of each field
    @track absCosting = 501.60;  // ABS Costing
    @track priceWeGet = 0;       // Now a tracked variable, will be calculated and updated dynamically

    // New tracked variables for beads and Mechanical Vents
    @track isNormalBeadChecked = false;
    @track isInnovationBeadChecked = true;  // Set to true by default for Innovation Bead
    @track mechanicalVents = 0;  // Track the value of mechanical vents (should be >= 0)
    @track totalMechanicalVentsCost = 0;  // Track the total cost of mechanical vents

    // Fetch funders data from the Apex controller using @wire
    @wire(getFunders)
    wiredFunders({ error, data }) {
        if (data) {
            this.funders = data.map(funder => ({
                name: funder.name,  // Assuming funder has 'name' property
                price: funder.price  // Assuming funder has 'price' property
            }));
        } else if (error) {
            console.error('Error fetching funders:', error);
        }
    }

    // Fetch costing details from the Apex controller using @wire
    @wire(getCostingDetails)
    wiredCostingDetails({ error, data }) {
        if (data) {
            this.costingDetails = data;

            // Automatically check the Innovation Bead by default and set its visibility
            this.isInnovationBeadChecked = !!data.Innovation_Bead__c;
            this.fieldVisibility.Innovation_Bead__c = this.isInnovationBeadChecked;

            // Calculate the priceWeGet based on initial costing details
            this.updatePriceWeGet();
        } else if (error) {
            console.error('Error fetching costing details:', error);
        }
    }

    renderedCallback() {
        // Only set the value if costingDetails exist
        if (this.costingDetails && this.costingDetails.Innovation_Bead__c) {
            this.isInnovationBeadChecked = true;
            console.log('Innovation Bead is checked after rendering.');
        }
    }

    // Handle checkbox change for visibility and affect total cost
    handleCheckboxChange(event) {
        const fieldName = event.target.dataset.field; // Get the field from the data-field attribute
        this.fieldVisibility[fieldName] = event.target.checked; // Toggle the visibility
        console.log('Updated field visibility:', this.fieldVisibility);
    }

    // Update costing details based on the selected funder
   

    // Handle Normal Bead Checkbox Change
    handleNormalBeadChange(event) {
        this.isNormalBeadChecked = event.target.checked;
        this.fieldVisibility.Normal_Bead__c = this.isNormalBeadChecked;

        if (this.isNormalBeadChecked) {
            // If Normal Bead is checked, hide Innovation Bead
            this.isInnovationBeadChecked = false;
            this.fieldVisibility.Innovation_Bead__c = false;
        } else {
            // If Normal Bead is unchecked, show Innovation Bead
            this.isInnovationBeadChecked = true;
            this.fieldVisibility.Innovation_Bead__c = true;
        }
    }

    // Handle Innovation Bead Checkbox Change
    handleInnovationBeadChange(event) {
        this.isInnovationBeadChecked = event.target.checked;
        this.fieldVisibility.Innovation_Bead__c = this.isInnovationBeadChecked;
    }

    // Handle Mechanical Vents Checkbox Change
    handleMechanicalVentsChange(event) {
        this.fieldVisibility.Mechanical_Vents__c = event.target.checked;
    }

    // Handle Mechanical Vents Value Input Change
    handleMechanicalVentsValueChange(event) {
        let value = parseFloat(event.target.value);

        // Validate the input to ensure it's not less than 0
        if (value < 0) {
            this.mechanicalVents = 0;  // Set to 0 if negative value
        } else {
            this.mechanicalVents = value;
        }

        // Update the mechanical vents cost whenever the input changes
        this.updateMechanicalVentsCost();
    }

    // Update the total cost of mechanical vents based on input
    updateMechanicalVentsCost() {
        // Ensure we are using the mechanical vents price from the costing details
        const mechanicalVentPricePerUnit = parseFloat(this.costingDetails.Mechanical_Vents__c) || 0;

        // Multiply input value by the cost from costing details
        this.totalMechanicalVentsCost = (this.mechanicalVents * mechanicalVentPricePerUnit).toFixed(2);
    }

    // Calculate the "Price We Get" based on ABS Costing and funder average price
    updatePriceWeGet() {
        const absCosting = parseFloat(this.absCosting) || 0;
        const funderAveragePrice = parseFloat(this.funderAveragePrice) || 0;
        this.priceWeGet = (absCosting * funderAveragePrice).toFixed(2); // Set the tracked variable
    }

    // Function to calculate the total cost based on selected fields and mechanical vents
    get totalCost() {
        let total = 0;
        if (this.costingDetails) {
            Object.keys(this.fieldVisibility).forEach(field => {
                if (this.fieldVisibility[field] && this.costingDetails[field]) {
                    total += parseFloat(this.costingDetails[field]) || 0;
                }
            });
            // Add the mechanical vents cost to the total cost
            total += parseFloat(this.totalMechanicalVentsCost) || 0;
        }
        return total.toFixed(2); // Return total cost formatted to 2 decimal places
    }

    // Update "Profit Amount" Formula
    get profitAmount() {
        const totalWeGet = parseFloat(this.priceWeGet) || 0;
        const additionOfAllFormula = parseFloat(this.totalCost) || 0;
        return (totalWeGet - additionOfAllFormula).toFixed(2);
    }

    // Update "Profit Percent" Formula
    get profitPercentage() {
        const totalWeGet = parseFloat(this.priceWeGet) || 0;
        const profitAmount = parseFloat(this.profitAmount) || 0;
        if (totalWeGet > 0) {
            return ((profitAmount / totalWeGet) * 100).toFixed(2);
        }
        return '0.00';
    }

    // Calculate the funder average price
    get funderAveragePrice() {
        const totalFunderPrice = this.funders.reduce((sum, funder) => sum + funder.price, 0);
        return (totalFunderPrice / this.funders.length).toFixed(2); // Return average price
    }

    // Dynamically set the width of the profit bar
    get profitBarWidth() {
        return this.profitPercentage + '%'; // Sets the width of the profit bar
    }

    // Calculate color for profit bar based on profit percentage
    get profitBarColor() {
        const profitPercentage = parseFloat(this.profitPercentage) || 0;
        if (profitPercentage > 35) {
            return 'green'; // Green if profit percentage is above 35%
        } else if (profitPercentage >= 0 && profitPercentage <= 35) {
            // Gradient from red to green
            const greenValue = Math.floor((profitPercentage / 35) * 255); // Calculate green intensity
            return `rgb(${255 - greenValue}, ${greenValue}, 0)`; // Red to Green transition
        } else {
            return 'red'; // Red if profit percentage is less than 0%
        }
    }

    // Handle previous button click
    handlePrevious() {
        alert('This component is under Development');
    }

    // Handle save button click
    handleSave() {
        // Capture all selected field values
        alert('this component is under development');
    }

}
