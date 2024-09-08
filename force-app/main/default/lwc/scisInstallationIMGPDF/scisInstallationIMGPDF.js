import { LightningElement, api, wire, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/SCISInstallationImgPdfController.getRelatedFilesByRecordId';
import { refreshApex } from '@salesforce/apex';

export default class scisInstallationIMGPDF extends LightningElement {
    @api recordId;
    @track pdfs = [];
    @track images = [];
    wiredResult;

    @wire(getRelatedFilesByRecordId, { parentRecordId: '$recordId' })
    wiredFiles(result) {
        this.wiredResult = result; // Store the result to use in refreshApex
        const { data, error } = result;
        if (data) {
            console.log('Fetched data:', data);
            this.pdfs = data.pdfs ? Object.entries(data.pdfs).map(([id, title]) => ({
                id,
                title,
                url: `/sfc/servlet.shepherd/version/download/${id}`
            })) : [];
            
            this.images = data.images ? Object.entries(data.images).map(([id, title]) => ({
                id,
                title,
                url: `/sfc/servlet.shepherd/version/download/${id}`
            })) : [];
        } else if (error) {
            console.error('Error fetching files:', error);
        }
    }

    handlePdfClick(event) {
        const url = event.target.getAttribute('data-url');
        if (url) {
            window.open(url, '_blank');
        }
    }

    refreshData() {
        return refreshApex(this.wiredResult);
    }
}