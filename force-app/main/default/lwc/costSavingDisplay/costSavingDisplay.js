import { LightningElement, api, track } from 'lwc';
import getSAPAndCostSavings from '@salesforce/apex/SAPBandCostingController.getSAPAndCostSavings';

export default class SapBandCosting extends LightningElement {
    @api recordId; // ID of the Survey record to be passed from the parent component or page
    @track currentSAPBand; // To store the current SAP band
    @track potentialSAPBand; // To store the potential SAP band
    @track costSavings; // To store the cost savings
    @track isLoading = true; // To handle the loading state
    @track isError = false; // To handle error state
    @track isDataLoaded = false; // To handle data loaded state
    @track errorMessage; // To store any error message

    // Fetch the data when the component is initialized
    connectedCallback() {
        this.fetchSAPCostingData();
    }

    // Method to fetch SAP Band and Cost Savings
    fetchSAPCostingData() {
        this.isLoading = true;
        this.isError = false;
        getSAPAndCostSavings({ surveyId: this.recordId })
            .then((result) => {
                // Store the result in component variables
                this.currentSAPBand = result.currentSAPBand || 'No Band'; // Display 'No Band' if no data
                this.potentialSAPBand = result.potentialSAPBand || 'No Band'; // Display 'No Band' if no data
                this.costSavings = result.costSavings !== undefined ? result.costSavings : 'Not Available'; // Handle case if cost savings are not available
                this.isDataLoaded = true;
                this.isLoading = false;
            })
            .catch((error) => {
                // Handle the error
                this.errorMessage = error.body ? error.body.message : 'Unknown error';
                this.isError = true;
                this.isLoading = false;
            });
    }

    // Method to handle retry in case of error
    handleRetry() {
        this.isError = false;
        this.isLoading = true;
        this.fetchSAPCostingData();
    }

    // Template getters for conditional rendering
    get showLoading() {
        return this.isLoading;
    }

    get showError() {
        return this.isError;
    }

    get showData() {
        return this.isDataLoaded && !this.isError;
    }
}
