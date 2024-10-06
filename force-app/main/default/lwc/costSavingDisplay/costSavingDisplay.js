import { LightningElement, api, track, wire } from 'lwc';

export default class CostSavingDisplay extends LightningElement {
    @api recordId;
    @track costingDetails = {}; // Current costing details
    @track previousCostingDetails = {}; // Previous costing details
    @track error;
    @track isSaved = false; // Track if the form is saved

    // Wire to get costing details, passing recordId dynamically
    @wire({})
    wiredCostingRecords({ error, data }) {
        if (data) {
            this.costingDetails = data.newCostingDetails; // Set current values
            this.previousCostingDetails = data.previousCostingDetails; // Set previous values
            this.isSaved = false;
        } else if (error) {
            this.error = error;
        }
    }

    // Handle checkbox change events and update costingDetails
    handleCheckboxChange(event) {
        const field = event.target.dataset.field; // Get field from dataset
        this.costingDetails[field] = event.target.checked ? 1 : 0; // Update field based on checkbox state
    }

    // Save action
    handleSave() {
        // Logic for saving the data goes here
        // E.g., calling an Apex method to save the updated costing details to Salesforce

        this.isSaved = true; // Mark the form as saved
    }

    // Edit action, move current values to previousCostingDetails and reset new values to zero
    handleEdit() {
        // Move current costingDetails to previousCostingDetails
        this.previousCostingDetails = { ...this.costingDetails };

        // Reset all new values to zero
        for (let field in this.costingDetails) {
            this.costingDetails[field] = 0;
        }

        // Mark as not saved to allow editing
        this.isSaved = false;
    }
}
