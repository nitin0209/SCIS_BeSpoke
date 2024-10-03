/*****************************************************************************************************************************************************8
 * Developer Name: Nitin Mane
 * Date: 2024-09-19
 * Title: FunderCostingController Test Class
 * Description: This test class covers the methods in the FunderCostingController,
 * ensuring proper functionality for fetching and saving costing details.

 ******************************************************************************************************************************************************8*/


 @isTest
 public class FunderCostingControllerTest {
 
     @testSetup
     static void setupTestData() {
         // Create a sample Funder_Costing__c record for testing
         Funder_Costing__c funderCosting = new Funder_Costing__c(
             Name = 'Costing Details',
             Normal_Bead__c = 100,
             Innovation_Bead__c = 150,
             RIR__c = 200,
             Loft__c = 250,
             Mechanical_Vents__c = 300,
             EPR_fee__c = 50,
             EPC_Elmhurst__c = 75,
             TM_Lodgement__c = 120,
             TM_Amendment__c = 80,
             Survey_Fee__c = 110,
             Tech_Survey__c = 160,
             Retrofit_Coodintation__c = 90,
             Land_Registry__c = 130,
             CIGA_Search__c = 60
         );
         insert funderCosting;
 
         // Create a sample Costing__c record to test the saveCosting method
         Costing__c costing = new Costing__c(
             Name = 'Existing Costing',
             Cavity_Guarantee__c = 200,
             CIGA_Search__c = 50,
             EPC_Elmhurst__c = 70,
             EPR_fee__c = 30,
             EWI__c = 300,
             Funder__c = 'a1yUE000000cwfhYAA',
             Innovation_Bead__c = 100,
             Land_Registry__c = 60,
             Loft__c = 150,
             Loft_Guarantee__c = 100,
             Mechanical_Vents__c = 80,
             Normal_Bead__c = 90,
             Retrofit_Coodintation__c = 110,
             RIR__c = 200,
             Survey_Fee__c = 120,
             Tech_Survey__c = 130,
             TM_Amendment__c = 100,
             TM_Lodgement__c = 200,
             Property_Owner__c = 'a2HUE0000004een2AA',
             Funder_Price__c = 500,
             Price_We_Get__c = 800,
             Profit_Amount__c = 300
         );
         insert costing;
     }
 
     @isTest
     static void testGetCostingDetails() {
         Test.startTest();
 
         // Call the getCostingDetails method
         Funder_Costing__c result = FunderCostingController.getCostingDetails();
 
         // Validate the results
         System.assertNotEquals(null, result, 'Result should not be null');
         System.assertEquals(100, result.Normal_Bead__c, 'Normal Bead should be 100');
         System.assertEquals(150, result.Innovation_Bead__c, 'Innovation Bead should be 150');
         System.assertEquals(200, result.RIR__c, 'RIR should be 200');
         System.assertEquals(250, result.Loft__c, 'Loft should be 250');
 
         Test.stopTest();
     }
 
     @isTest
     static void testSaveCostingNewRecord() {
         Test.startTest();
 
         // Call the saveCosting method for a new record
         FunderCostingController.saveCosting(
             'New Costing',
             100, // cavityGuarantee
             50,  // cigaSearch
             75,  // epcElmhurst
             30,  // eprFee
             200, // ewi
             'a1yUE000000cwfhYAA', // funder
             100, // innovationBead
             60,  // landRegistry
             150, // loft
             100, // loftGuarantee
             80,  // mechanicalVents
             90,  // normalBead
             110, // retrofitCoordination
             200, // rir
             120, // surveyFee
             130, // techSurvey
             100, // tmAmendment
             200, // tmLodgement
             'a2HUE0000004een2AA', // propertyOwner
             500, // funderPrice
             800, // priceWeGet
             300  // profitAmount
         );
 
         // Verify that the record has been inserted
         Costing__c insertedCosting = [SELECT Id, Name, Cavity_Guarantee__c, Funder_Price__c FROM Costing__c WHERE Name = 'New Costing' LIMIT 1];
         System.assertNotEquals(null, insertedCosting, 'Costing record should be created');
         System.assertEquals(100, insertedCosting.Cavity_Guarantee__c, 'Cavity Guarantee should be 100');
         System.assertEquals(500, insertedCosting.Funder_Price__c, 'Funder Price should be 500');
 
         Test.stopTest();
     }
 
     @isTest
     static void testSaveCostingUpdateExistingRecord() {
         Test.startTest();
 
         // Call the saveCosting method for an existing record
         FunderCostingController.saveCosting(
             'Existing Costing', // existing costing record
             300, // cavityGuarantee
             70,  // cigaSearch
             100, // epcElmhurst
             40,  // eprFee
             350, // ewi
             'a2HUE0000004een2AA', // funder
             120, // innovationBead
             80,  // landRegistry
             200, // loft
             120, // loftGuarantee
             90,  // mechanicalVents
             110, // normalBead
             130, // retrofitCoordination
             220, // rir
             150, // surveyFee
             170, // techSurvey
             130, // tmAmendment
             250, // tmLodgement
             'a2HUE0000004een2AA', // propertyOwner
             600, // funderPrice
             900, // priceWeGet
             400  // profitAmount
         );
 
         // Verify that the existing record has been updated
         Costing__c updatedCosting = [SELECT Id, Name, Cavity_Guarantee__c, Funder_Price__c, Price_We_Get__c FROM Costing__c WHERE Name = 'Existing Costing' LIMIT 1];
         System.assertEquals(300, updatedCosting.Cavity_Guarantee__c, 'Cavity Guarantee should be updated to 300');
         System.assertEquals(600, updatedCosting.Funder_Price__c, 'Funder Price should be updated to 600');
         System.assertEquals(900, updatedCosting.Price_We_Get__c, 'Price We Get should be updated to 900');
 
         Test.stopTest();
     }
 }
 