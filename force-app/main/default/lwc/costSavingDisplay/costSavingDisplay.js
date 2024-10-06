import { LightningElement, track, api } from 'lwc';

export default class CostingComponent extends LightningElement {
    @api recordId; // The record ID (Property Owner or other relevant ID)
    
    // Manage different page states
    @track isFirstPage = true;
    @track isSecondPage = false;
    @track isThirdPage = false;

    @track fieldVisibility = {}; // Track checkbox visibility
    @track currentValues = {}; // Store current values from inputs
    @track savedValues = {}; // Store saved values
    @track previousValues = {}; // Store previously saved values for editing
    
    // Sample values, assume this is your costing data (can come from Apex or static for now)
    @track costingRecords = {
        Normal_Bead__c: 0,
        Innovation_Bead__c: 13.05,
        RIR__c: 0,
    };

    connectedCallback() {
        // Initially load any saved values if available
        this.loadCostingData();
    }

    loadCostingData() {
        // Load costing data into current values (this could come from Apex)
        this.currentValues = { ...this.costingRecords };
    }

    // Handle checkbox changes
    handleCheckboxChange(event) {
        const field = event.target.dataset.id;
        this.fieldVisibility[field] = event.target.checked; // Track if the checkbox is checked
    }

    // Handle input field changes
    handleFieldChange(event) {
        const field = event.target.dataset.id;
        this.currentValues[field] = event.target.value; // Update current value
    }

    // Handle Save on First Page
    handleSave() {
        // Save current values to savedValues and proceed to second page
        this.savedValues = { ...this.currentValues };

        // Switch to second page (show saved values)
        this.isFirstPage = false;
        this.isSecondPage = true;
    }

    // Handle Edit button on Second Page
    handleEdit() {
        // Store saved values into previousValues for comparison/editing
        this.previousValues = { ...this.savedValues };

        // Switch to third page (edit previous and new values)
        this.isSecondPage = false;
        this.isThirdPage = true;
    }

    // Handle Save on Third Page (Edit Mode)
    handleSaveEdit() {
        // Save current values after editing
        this.savedValues = { ...this.currentValues };

        // Switch back to second page (summary of saved values)
        this.isThirdPage = false;
        this.isSecondPage = true;
    }

    // Handle Cancel on Third Page
    handleCancelEdit() {
        // Discard changes and revert to second page
        this.isThirdPage = false;
        this.isSecondPage = true;
    }
}
