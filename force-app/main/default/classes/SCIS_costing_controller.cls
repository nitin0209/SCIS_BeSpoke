public with sharing class SCIS_costing_controller {
    @AuraEnabled(cacheable=true)
    public static Funder_Costing__c getCostingDetails() {
        return [SELECT Normal_Bead__c, Innovation_Bead__c, RIR__c, Loft__c, Mechanical_Vents__c, EPR_fee__c,
                        EPC_Elmhurst__c, TM_Lodgement__c, TM_Amendment__c, Survey_Fee__c, Tech_Survey__c,
                        Retrofit_Coodintation__c, Land_Registry__c, CIGA_Search__c
                FROM Funder_Costing__c
                WHERE Name = 'Costing Details' LIMIT 1];
    }

    @AuraEnabled
    public static void saveCosting(
        String costingName,
        Decimal cavityGuarantee,
        Decimal cigaSearch,
        Decimal epcElmhurst,
        Decimal eprFee,
        Decimal ewi,
        Id funder,
        Decimal innovationBead,
        Decimal landRegistry,
        Decimal loft,
        Decimal loftGuarantee,
        Decimal mechanicalVents,
        Decimal normalBead,
        Decimal retrofitCoordination,
        Decimal rir,
        Decimal surveyFee,
        Decimal techSurvey,
        Decimal tmAmendment,
        Decimal tmLodgement,
        Id propertyOwner,
        Decimal funderPrice,
        Decimal priceWeGet,
        Decimal profitAmount
    ) {
        // Query for an existing Costing__c record based on the costingName
        List<Costing__c> costingRecordList = [SELECT Id, Name, Cavity_Guarantee__c, CIGA_Search__c, EPC_Elmhurst__c, EPR_fee__c, EWI__c, Funder__c, Innovation_Bead__c, Land_Registry__c, Loft__c, Loft_Guarantee__c, Mechanical_Vents__c, Normal_Bead__c, Retrofit_Coodintation__c, RIR__c, Survey_Fee__c, Tech_Survey__c, TM_Amendment__c, TM_Lodgement__c, Property_Owner__c, Funder_Price__c, Price_We_Get__c, Profit_Amount__c
        FROM Costing__c WHERE Name = :costingName LIMIT 1];

        Costing__c costingRecord;
        
        // Check if we found a matching record
        if (!costingRecordList.isEmpty()) {
            costingRecord = costingRecordList[0]; // Get the first record
        } else {
            // If no record exists, create a new one
            costingRecord = new Costing__c();
            costingRecord.Name = costingName;
        }

        // Assign the provided values to the corresponding fields
        costingRecord.Cavity_Guarantee__c = cavityGuarantee;
        costingRecord.CIGA_Search__c = cigaSearch;
        costingRecord.EPC_Elmhurst__c = epcElmhurst;
        costingRecord.EPR_fee__c = eprFee;
        costingRecord.EWI__c = ewi;
        costingRecord.Funder__c = funder;
        costingRecord.Innovation_Bead__c = innovationBead;
        costingRecord.Land_Registry__c = landRegistry;
        costingRecord.Loft__c = loft;
        costingRecord.Loft_Guarantee__c = loftGuarantee;
        costingRecord.Mechanical_Vents__c = mechanicalVents;
        costingRecord.Normal_Bead__c = normalBead;
        costingRecord.Retrofit_Coodintation__c = retrofitCoordination;
        costingRecord.RIR__c = rir;
        costingRecord.Survey_Fee__c = surveyFee;
        costingRecord.Tech_Survey__c = techSurvey;
        costingRecord.TM_Amendment__c = tmAmendment;
        costingRecord.TM_Lodgement__c = tmLodgement;
        costingRecord.Property_Owner__c = propertyOwner;
        costingRecord.Funder_Price__c = funderPrice;
        costingRecord.Price_We_Get__c = priceWeGet;
        costingRecord.Profit_Amount__c = profitAmount;

        // Upsert the record based on the Id to either update an existing record or insert a new one
        upsert costingRecord;
    }
}
