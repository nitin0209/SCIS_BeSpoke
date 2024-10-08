import { LightningElement, track, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBespokeRecords from '@salesforce/apex/SCISImageSelectorController.createBespokeRecords';
import getBespokeRecords from '@salesforce/apex/SCISImageSelectorController.getBespokeRecords';
import LEAD_FIELD from '@salesforce/schema/Survey__c.Lead__c';
import DEFINE_MEASURES_FIELD from '@salesforce/schema/Survey__c.Define_Measures_Display__c';
import { refreshApex } from '@salesforce/apex';

const FIELDS = [LEAD_FIELD, DEFINE_MEASURES_FIELD];
const COLUMNS = [
    { label: 'Measure', fieldName: 'Measure__c' },
    { label: 'Image Name', fieldName: 'Name' },
    { label: 'Image Description', fieldName: 'ImageDescription__c' }
];

export default class SCISBspoke extends LightningElement {
    @api recordId; // Survey record ID
    @track imageCount = 0; // Track the selected number of images
    @track selectedMeasure = ''; // Track the selected measure value (Loft, Ventilation, CWI)
    @track leadId = ''; // Track the Lead__c value from the Survey
    @track defineMeasures = ''; // Track the Define_Measures_Display__c value from the Survey
    @track rowList = []; // Array to hold image name and instructions
    @track bespokeRecords = []; // Track bespoke records for the data table
    @track columns = COLUMNS; // Data table columns
    @track error; // Track errors
    @track noMeasures = false; // Track whether there are no measures to display
    wiredBespokeRecordsResult; // Store the result of @wire for refresh
    @track isSaved=false;

    // Wire method to retrieve Lead__c and Define_Measures_Display__c from the current Survey record
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredSurvey({ error, data }) {
        if (data) {
            this.leadId = data.fields.Lead__c.value;
            this.defineMeasures = data.fields.Define_Measures_Display__c.value;
            this.noMeasures = !this.defineMeasures; // If defineMeasures is empty, noMeasures is true
        } else if (error) {
            this.error = error;
            console.error('Error fetching Survey data:', error);
        }
    }

    // Fetch Installation_Bespoke__c records for the data table
    @wire(getBespokeRecords, { recordId: '$recordId' })
    wiredBespokeRecords(result) {
        this.wiredBespokeRecordsResult = result; // Store the wired result for refresh
        if (result.data) {
            this.bespokeRecords = result.data;
        } else if (result.error) {
            this.error = result.error;
            console.error('Error fetching bespoke records:', this.error);
        }
    }

    // Handle tab change event
    handleTabChange(event) {
        this.selectedMeasure = event.target.value; // Store the selected tab value in selectedMeasure
    }

    // Options for selecting number of images (1-20)
    get imageOptions() {
        return Array.from({ length: 20 }, (v, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));
    }

    // Handle the number of images change
    handleImageCountChange(event) {
        this.imageCount = event.target.value; // Store the selected value
        // Generate rows based on selected image count
        this.rowList = Array.from({ length: this.imageCount }, (v, i) => ({
            id: `row_${i}`,
            name: '',
            instructions: '',
            imageNameLabel: `Image ${i + 1} Name`,
            imageInstructionsLabel: `Image ${i + 1} Instructions`
        }));
    }

    // Handle input changes for image name
    handleNameChange(event) {
        const rowId = event.target.dataset.id;
        const index = this.rowList.findIndex((row) => row.id === rowId);
        if (index !== -1) {
            this.rowList[index].name = event.target.value; // Ensure the name input is populated correctly
        }
    }

    // Handle input changes for image description
    handleDescriptionChange(event) {
        const rowId = event.target.dataset.id;
        const index = this.rowList.findIndex((row) => row.id === rowId);
        if (index !== -1) {
            this.rowList[index].instructions = event.target.value;
        }
    }

    // Method to show toast messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    // Handle Save button click
    handleSave() {
        const tabsetElement = this.template.querySelector('lightning-tabset');
        const activeTab = tabsetElement.activeTabValue; // Get the active tab value
        this.isSaved = true;
        window.scrollTo(0, 0);
        if (!activeTab) {
            this.showToast('Error', 'Please select a measure before saving12.', 'error');
            return;
        }
    
        this.selectedMeasure = activeTab; // Assign the selected tab value to selectedMeasure
    
        const allValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea')].reduce(
            (validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            },
            true
        );
    
        if (allValid) {
            const bespokeRecords = this.rowList.map((row) => ({
                Name: row.name,
                Measure__c: this.selectedMeasure,
                ImageDescription__c: row.instructions,
                Property_Owner__c: this.recordId,
                Lead__c: this.leadId
            }));
    
            createBespokeRecords({ bespokeData: bespokeRecords })
                .then(() => {
                    this.showToast('Success', 'Records created successfully!', 'success');
                    this.resetForm(); // Reset form fields after successful save
    
                    // Refresh the bespoke records and prepend the newly created ones
                    return refreshApex(this.wiredBespokeRecordsResult).then(() => {
                        this.bespokeRecords = [...this.bespokeRecords];
                    });
                })
                .catch((error) => {
                    console.error('Error creating records:', error);
                    this.showToast('Error', 'Failed to create records.', 'error');
                });
        } else {
            this.showToast('Error', 'Please fill out all required fields.', 'error');
        }
    }
    

    // Method to reset the form fields after saving
    resetForm() {
        this.imageCount = 0;
        this.selectedMeasure = '';
        this.rowList = [];
    }

     // Handle save action
    

    // Handle finish action
    handleFinish() {
        // Logic for finishing, such as navigating to another page or resetting the form
        this.resetForm();
        this.isSaved=false;

        window.scrollTo(0, 0);
    }

    // Reset the form after finishing
    resetForm() {
        this.isSaved = true;
        this.imageCount = 0;
        this.rowList = [];
    }
}
