import { LightningElement, track } from 'lwc';

export default class CostingCheckboxComponent extends LightningElement {
    @track fieldVisibility = {
        Normal_Bead__c: false,
        RIR__c: false,
        Loft__c: false,
        Mechanical_Vents__c: false,
        EPR_fee__c: false
    };

    costingDetails = {
        Normal_Bead__c: 185.80,
        RIR__c: 3200.00,
        Loft__c: 210.00,
        Mechanical_Vents__c: 350.00,
        EPR_fee__c: 0
    };

    mechanicalVentsQuantity = 1; // Default quantity for Mechanical Vents

    isEditMode = false; // Controls whether we are in edit mode

    // Track values that will be displayed in the template
    @track displayValues = {
        Normal_Bead__c: 0,
        RIR__c: 0,
        Loft__c: 0,
        Mechanical_Vents__c: 0,
        EPR_fee__c: 0,
        Mechanical_Vents_Cost: 0
    };

    // Handle checkbox change and toggle visibility, then update the displayed values
    handleCheckboxChange(event) {
        const field = event.target.dataset.field;
        this.fieldVisibility[field] = event.target.checked;
        this.updateDisplayValues();
    }

    // Handle the "Edit" button click
    handleEdit() {
        this.isEditMode = true;
        this.updateDisplayValues();
    }

    // Handle changes in the mechanical vents quantity
    handleMechanicalVentsQuantityChange(event) {
        this.mechanicalVentsQuantity = event.target.value;
        this.updateDisplayValues();
    }

    // Compute the total cost for mechanical vents
    get totalMechanicalVentsCost() {
        return this.mechanicalVentsQuantity * this.costingDetails.Mechanical_Vents__c;
    }

    // Update display values based on visibility and mechanical vents quantity
    updateDisplayValues() {
        this.displayValues = {
            Normal_Bead__c: this.fieldVisibility.Normal_Bead__c ? this.costingDetails.Normal_Bead__c : 0,
            RIR__c: this.fieldVisibility.RIR__c ? this.costingDetails.RIR__c : 0,
            Loft__c: this.fieldVisibility.Loft__c ? this.costingDetails.Loft__c : 0,
            Mechanical_Vents__c: this.fieldVisibility.Mechanical_Vents__c ? this.mechanicalVentsQuantity : 0,
            Mechanical_Vents_Cost: this.fieldVisibility.Mechanical_Vents__c ? this.totalMechanicalVentsCost : 0,
            EPR_fee__c: this.fieldVisibility.EPR_fee__c ? this.costingDetails.EPR_fee__c : 0
        };
    }
}
