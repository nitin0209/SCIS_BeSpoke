import { LightningElement, api } from 'lwc';

export default class ProfitPercentageBar extends LightningElement {
    @api profitPercentage=33; // This will be passed as input

    // Getter to compute the class based on profitPercentage
    get percentageClass() {
        if (this.profitPercentage >= 35) {
            return 'green-bar';
        } else if (this.profitPercentage > 0 && this.profitPercentage < 35) {
            return 'yellow-bar';
        } else {
            return 'red-bar';
        }
    }

    // Getter to compute the width of the progress bar
    get percentageWidth() {
        return `${this.profitPercentage}%`;
    }
}
