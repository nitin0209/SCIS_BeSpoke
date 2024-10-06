public with sharing class SCIS_CostingController {
    
    @AuraEnabled(cacheable=true)
    public static List<Costing__c> getCostingRecordsByPropertyOwner(Id propertyOwnerId) {
        try {
            // Query the Costing__c records where Property_Owner__c matches the given Id
            return [
                SELECT Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, 
                       SystemModstamp, LastActivityDate, LastViewedDate, LastReferencedDate, UserRecordAccessId,
                       Cavity_Guarantee__c, CIGA_Search__c, EPC_Elmhurst__c, EPR_fee__c, EWI__c, Funder__c,
                       Innovation_Bead__c, Land_Registry__c, Loft__c, Loft_Guarantee__c, Mechanical_Vents__c, 
                       Normal_Bead__c, Retrofit_Coodintation__c, RIR__c, Survey_Fee__c, Tech_Survey__c,
                       TM_Amendment__c, TM_Lodgement__c
                FROM Costing__c
                WHERE Property_Owner__c = :propertyOwnerId
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Unable to retrieve costing records: ' + e.getMessage());
        }
    }
}
