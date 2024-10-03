public with sharing class SAPBandCostingController {

    @AuraEnabled(cacheable=true)
    public static CostSavingWrapper getSAPAndCostSavings(Id surveyId) {
        system.debug('surveyId = ' + surveyId);

        // Create a wrapper class to store the result
        CostSavingWrapper result = new CostSavingWrapper();

        try {
            // Step 1: Query the related Optioneering__c record(s) for the given Survey__c
            List<Optioneering__c> optioneeringRecords = [
                SELECT Current_SAP_Rating__c, Potential_SAP_Rating__c 
                FROM Optioneering__c 
                WHERE Property_Owner__c = :surveyId 
                LIMIT 1
            ];

            system.debug('optioneeringRecords = ' + optioneeringRecords);

            if (optioneeringRecords.isEmpty()) {
                throw new AuraHandledException('No Optioneering records found for the given Survey Id.');
            }

            Optioneering__c optioneeringRecord = optioneeringRecords[0];

            // Log the fetched record for debugging purposes
            system.debug('Fetched Optioneering Record: ' + optioneeringRecord);

            // Step 2: Query the Survey__c record to get the Area_m__c field
            Survey__c surveyRecord = [
                SELECT Area_m__c 
                FROM Survey__c 
                WHERE Id = :surveyId 
                LIMIT 1
            ];

            system.debug('Fetched Survey Record: ' + surveyRecord);

            if (surveyRecord == null || String.isBlank(surveyRecord.Area_m__c)) {
                throw new AuraHandledException('No area value found for the given Survey Id.');
            }

            // Convert Area_m__c from String to Decimal
            Decimal propertyArea = Decimal.valueOf(surveyRecord.Area_m__c);

            // Step 3: Get the current and potential SAP ratings
            Decimal currentSAPRating = optioneeringRecord.Current_SAP_Rating__c;
            Decimal potentialSAPRating = optioneeringRecord.Potential_SAP_Rating__c;

            // Query SAP bands to match Current and Potential SAP Ratings to Intermediate SAP Bands
            String currentSAPBand = getIntermediateSAPBand(currentSAPRating);
            String potentialSAPBand = getIntermediateSAPBand(potentialSAPRating);

            // Set the results in the wrapper
            result.currentSAPBand = currentSAPBand;
            result.potentialSAPBand = potentialSAPBand;

            // Log intermediate bands
            system.debug('Current SAP Band: ' + currentSAPBand);
            system.debug('Potential SAP Band: ' + potentialSAPBand);

            // Step 4: Query Cost Savings based on the bands and property area
            List<Cost_Saving_Detail__c> costSavingRecords = [
                SELECT Cost_Savings__c
                FROM Cost_Saving_Detail__c 
                WHERE Min_Area__c <= :propertyArea 
                AND Max_Area__c >= :propertyArea 
                AND Starting_Band__c = :currentSAPBand
                AND Finishing_Band__c = :potentialSAPBand
                LIMIT 1
            ];

            system.debug('Fetched Cost Saving Records: ' + costSavingRecords);

            if (!costSavingRecords.isEmpty()) {
                result.costSavings = costSavingRecords[0].Cost_Savings__c;
            } else {
                result.costSavings = 0;
            }

        } catch (Exception ex) {
            system.debug('Error calculating cost savings: ' + ex.getMessage());
            throw new AuraHandledException('Error calculating cost savings: ' + ex.getMessage());
        }

        return result;
    }

    // Method to get the Intermediate SAP Band based on the SAP Rating
    public static String getIntermediateSAPBand(Decimal sapRating) {
        if (sapRating >= 96) {
            return 'High_A';
        } else if (sapRating <= 91.40 && sapRating > 86) {
            return 'High_B';
        } else if (sapRating <= 80.40 && sapRating > 74.50) {
            return 'High_C';
        } else if (sapRating <= 68.40 && sapRating > 61.50) {
            return 'High_D';
        } else if (sapRating <= 54.40 && sapRating > 46.50) {
            return 'High_E';
        } else if (sapRating <= 38.40 && sapRating > 29.50) {
            return 'High_F';
        } else if (sapRating <= 20.40 && sapRating > 10.50) {
            return 'High_G';
        
        // Low Bands
        } else if (sapRating <= 95.90 && sapRating > 91.50) {
            return 'Low_A';
        } else if (sapRating <= 85.90 && sapRating > 80.50) {
            return 'Low B';
        } else if (sapRating <= 74.40 && sapRating > 68.50) {
            return 'Low_C';
        } else if (sapRating <= 61.40 && sapRating > 54.50) {
            return 'Low_D';
        } else if (sapRating <= 46.40 && sapRating > 38.50) {
            return 'Low_E';
        } else if (sapRating <= 29.40 && sapRating > 20.50) {
            return 'Low_F';
        } else if (sapRating <= 10.50) {
            return 'Low_G';
        } else {
            return 'Unknown Band';
        }
    }

    // Wrapper class to pass SAP and cost savings data back to LWC
    public class CostSavingWrapper {
        @AuraEnabled public String currentSAPBand;
        @AuraEnabled public String potentialSAPBand;
        @AuraEnabled public Decimal costSavings;
    }
}
