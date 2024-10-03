import { LightningElement, track, wire, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getCostingDetails from '@salesforce/apex/FunderCostingController.getCostingDetails';
import getFunders from '@salesforce/apex/SCIS_FunderCostingController.getFunders'; // Import the Apex method to get funders
import saveCosting from '@salesforce/apex/FunderCostingController.saveCosting'; // Import Apex save method
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSAPAndCostSavings from '@salesforce/apex/SAPBandCostingController.getSAPAndCostSavings';


// Fields to fetch from Survey object (Name and OwnerId)
const FIELDS = ['Survey__c.Name', 'Survey__c.OwnerId'];

export default class ScisFunderCosting extends LightningElement {
    @track isSaved = false; 
    @track isFinish = false;
    @track isSummary = false;
    @api recordId2; // This holds the current Survey record ID
    @track surveyName; // To store the Survey Name
    @track propertyOwnerId; // To store the OwnerId from Survey

    @track funders = [];  // Funders array populated from Apex
    @track costingDetails = {};  // Initialize as an empty object
    @track fieldVisibility = {}; // Object to track visibility of each field
    // @track absCosting = 501.60;  // ABS Costing
    @track priceWeGet = 0;       // Price We Get, calculated dynamically
    @track mechanicalVents = 0;  // Track the value of mechanical vents (should be >= 0)
    @track totalMechanicalVentsCost = 0;  // Total cost of mechanical vents
    @track isNormalBeadChecked = false;
    @track isInnovationBeadChecked = true; 

    @api recordId; // ID of the Survey record to be passed from the parent component or page
    @track currentSAPBand; // To store the current SAP band
    @track potentialSAPBand; // To store the potential SAP band
    @track costSavings; // To store the cost savings
    @track isLoading = true; // To handle the loading state
    @track isError = false; // To handle error state
    @track isDataLoaded = false; // To handle data loaded state
    @track errorMessage; // To store any error message

    // Fetch Survey details (Name and OwnerId)
    @wire(getRecord, { recordId2: '$recordId', fields: FIELDS })
    wiredSurvey({ error, data }) {
        if (data) {
            this.surveyName = data.fields.Name.value; 
            this.propertyOwnerId = data.fields.OwnerId.value; // Fetch OwnerId to map to Property_Owner__c
        } else if (error) {
            console.error('Error fetching Survey record:', error);
        }
    }

    // Fetch funders data from the Apex controller using @wire
    @wire(getFunders)
    wiredFunders({ error, data }) {
        if (data) {
            this.funders = data.map(funder => ({
                name: funder.name,
                price: funder.price
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

            // Automatically check the Innovation Bead by default
            this.isInnovationBeadChecked = !!data.Innovation_Bead__c;
            this.fieldVisibility.Innovation_Bead__c = this.isInnovationBeadChecked;

            // Update the price we get
            this.updatePriceWeGet();
        } else if (error) {
            console.error('Error fetching costing details:', error);
        }
    }

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

    handleInnovationBeadChange(event) {
        this.isInnovationBeadChecked = event.target.checked;
        this.fieldVisibility.Innovation_Bead__c = this.isInnovationBeadChecked;
    }

    // Calculate the "Price We Get" based on ABS Costing and funder average price
    updatePriceWeGet() {
        if (!this.costingDetails || !this.funders.length) {
            return;
        }
        const costSavings = parseFloat(this.costSavings) || 0;
        const funderAveragePrice = parseFloat(this.funderAveragePrice) || 0;
        this.priceWeGet = (costSavings * funderAveragePrice).toFixed(2); // Set the tracked variable

        // Log the calculated price for debugging
        console.log('Calculated Price We Get:', this.priceWeGet);
    }

    renderedCallback() {
        if (this.costingDetails && this.costingDetails.Innovation_Bead__c) {
            this.isInnovationBeadChecked = true;
        }
    }

    // Handle checkbox changes for visibility
    handleCheckboxChange(event) {
        const fieldName = event.target.dataset.field;
        this.fieldVisibility[fieldName] = event.target.checked;
    }

    // Handle Mechanical Vents checkbox change
    handleMechanicalVentsChange(event) {
        //this.fieldVisibility.Mechanical_Vents__c = event.target.checked;

        const isChecked = event.target.checked;
    this.fieldVisibility.Mechanical_Vents__c = isChecked;

    // Set default to 1 when the checkbox is checked
    if (isChecked) {
        this.mechanicalVents = this.mechanicalVents || 1; // If it's 0 or undefined, set to 1
        this.updateMechanicalVentsCost();
    }
    }

    // Handle Mechanical Vents input change
    handleMechanicalVentsValueChange(event) {
        let value = parseFloat(event.target.value);

        // Ensure value is non-negative
        this.mechanicalVents = value >= 1 ? value : 1;
        this.updateMechanicalVentsCost();
    }

    // Update total mechanical vents cost based on input
    updateMechanicalVentsCost() {
        const mechanicalVentPricePerUnit = parseFloat(this.costingDetails.Mechanical_Vents__c) || 0;
        this.totalMechanicalVentsCost = (this.mechanicalVents * mechanicalVentPricePerUnit).toFixed(2);
    }

    // Calculate total cost
    get totalCost() {
        let total = 0;

        if (this.costingDetails) {
            // Loop through all fields except Mechanical Vents
            Object.keys(this.fieldVisibility).forEach(field => {
                if (this.fieldVisibility[field] && field !== 'Mechanical_Vents__c' && this.costingDetails[field]) {
                    total += parseFloat(this.costingDetails[field]) || 0;
                }
            });

            // Add Mechanical Vents cost based on input value
            if (this.fieldVisibility.Mechanical_Vents__c && this.mechanicalVents > 0) {
                const unitCost = parseFloat(this.costingDetails.Mechanical_Vents__c) || 0;
                total += this.mechanicalVents * unitCost;
            }
        }

        return total.toFixed(2);
    }

    // Calculate profit amount
    get profitAmount() {
        const totalWeGet = parseFloat(this.priceWeGet) || 0;
        const totalCost = parseFloat(this.totalCost) || 0;
        const profit = totalWeGet - totalCost;
        return profit > 0 ? profit.toFixed(2) : '0.00';
    }
    
    // Calculate profit percentage
    get profitPercentage() {
        const totalWeGet = parseFloat(this.priceWeGet) || 0;
        const profitAmount = parseFloat(this.profitAmount) || 0;
        return totalWeGet > 0 ? ((profitAmount / totalWeGet) * 100).toFixed(2) : '0.00';
    }

    // Calculate funder average price
    get funderAveragePrice() {
        const totalFunderPrice = this.funders.reduce((sum, funder) => sum + funder.price, 0);
        return (totalFunderPrice / this.funders.length).toFixed(2);
    }

    // Handle save button click and save the record
    handleSave() {
        let costingData = {
            costingName: this.surveyName,  // Use the Survey Name as costingName
            propertyOwner: this.recordId,  // Correctly map the Property Owner Id to Property_Owner__c
            cavityGuarantee: this.fieldVisibility.Cavity_Guarantee__c ? this.costingDetails.Cavity_Guarantee__c : 0,
            cigaSearch: this.fieldVisibility.CIGA_Search__c ? this.costingDetails.CIGA_Search__c : 0,
            epcElmhurst: this.fieldVisibility.EPC_Elmhurst__c ? this.costingDetails.EPC_Elmhurst__c : 0,
            eprFee: this.fieldVisibility.EPR_fee__c ? this.costingDetails.EPR_fee__c : 0,
            ewi: this.fieldVisibility.EWI__c ? this.costingDetails.EWI__c : 0,
            funder: this.costingDetails.Funder__c,
            innovationBead: this.fieldVisibility.Innovation_Bead__c ? this.costingDetails.Innovation_Bead__c : 0,
            landRegistry: this.fieldVisibility.Land_Registry__c ? this.costingDetails.Land_Registry__c : 0,
            loft: this.fieldVisibility.Loft__c ? this.costingDetails.Loft__c : 0,
            loftGuarantee: this.fieldVisibility.Loft_Guarantee__c ? this.costingDetails.Loft_Guarantee__c : 0,
            mechanicalVents: this.fieldVisibility.Mechanical_Vents__c ? this.mechanicalVents : 0,
            normalBead: this.fieldVisibility.Normal_Bead__c ? this.costingDetails.Normal_Bead__c : 0,
            retrofitCoordination: this.fieldVisibility.Retrofit_Coordination__c ? this.costingDetails.Retrofit_Coordination__c : 0,
            rir: this.fieldVisibility.RIR__c ? this.costingDetails.RIR__c : 0,
            surveyFee: this.fieldVisibility.Survey_Fee__c ? this.costingDetails.Survey_Fee__c : 0,
            techSurvey: this.fieldVisibility.Tech_Survey__c ? this.costingDetails.Tech_Survey__c : 0,
            tmAmendment: this.fieldVisibility.TM_Amendment__c ? this.costingDetails.TM_Amendment__c : 0,
            tmLodgement: this.fieldVisibility.TM_Lodgement__c ? this.costingDetails.TM_Lodgement__c : 0,
            funderPrice: this.funderAveragePrice,
            priceWeGet: this.priceWeGet,
            //propertyOwner: this.recordId,
            profitAmount: this.profitAmount
        };

        // Call the Apex save method
        saveCosting(costingData)
            .then(() => {
                this.isSaved = true;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Costing record saved successfully!',
                    variant: 'success'
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error saving costing record',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
             this.isFinish = true;
            
    }
    

    // Handle "Finish" button click (you can redirect or perform some other finalization logic)
    handleFinish() {
        this.isSummary = false;
        this.isSaved = false;
        this.isFinish = true;
    }
   
    
    handleFinish(){
        this.isFinish = false;
        this.isSummary = true;
        this.isSaved = true;
    }
    handleEdit(){
        this.isFinish = false;
        this.isSummary = false;
        this.isSaved = false;
        
    }

    get normalBeadStatus() {
        return this.costingDetails && this.costingDetails.Normal_Bead__c
            ? this.costingDetails.Normal_Bead__c
            : 'Not selected';
    }
    

   

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

                 // Log the costSavings for debugging purposes
                console.log('Fetched Cost Savings:', this.costSavings);

                // Trigger price calculation once cost savings data is available
                this.updatePriceWeGet();
                
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