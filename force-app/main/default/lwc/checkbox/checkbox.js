import { LightningElement, api, track, wire } from 'lwc';
import getCostingRecordsByPropertyOwner from '@salesforce/apex/SCIS_CostingController.getCostingRecordsByPropertyOwner';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CostingComponent extends LightningElement {
    @api recordId; // This will hold the Property_Owner__c ID
    @track costingRecords; // To store the costing records
    @track error; // To handle error state
    @track isLoading = true; // To handle loading state

    // Fetch the Costing records based on Property_Owner__c (recordId)
    @wire(getCostingRecordsByPropertyOwner, { propertyOwnerId: '$recordId' })
    wiredCostingRecords({ error, data }) {
        if (data) {
            this.costingRecords = data;
            this.isLoading = false;
        } else if (error) {
            this.error = error;
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading costing records',
                    message: error.body.message,
                    variant: 'error',
                })
            );
        }
    }
}
