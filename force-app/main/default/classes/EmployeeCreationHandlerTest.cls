@isTest
public class EmployeeCreationHandlerTest {

    static void setupTestData() {
        try {
            // Create a valid Employee__c record with proper picklist values and valid date fields
            Employee__c emp = new Employee__c();
            emp.Name = 'Test Employee';
            emp.Email__c = 'test@example.com';
            emp.Employee_Type__c = 'Surveyor'; // Ensure this is a valid picklist value in your org
            emp.Employment_Type__c = 'Contract'; // Use a valid value to trigger User_Log_In_Details__c creation
            
            emp.Personnel_Mobile_Number__c = '1234567890'; // Add required mobile number field
            emp.Status__c = 'Active'; // Add required status field with a valid picklist value
            emp.Working_Area__c = 'Area 1'; // Add a valid value for the Working_Area__c field

            // Set Start_Date__c and Last_Date__c such that Last_Date__c is after Start_Date__c
            emp.Employee_Start_Date__c = Date.today(); // Set start date as today
            emp.Last_Date__c = Date.today().addDays(1); // Set last date as tomorrow

            // Insert the employee record
            insert emp;

            // Log the inserted employee record
            System.debug('Employee record inserted successfully: ' + emp);

        } catch (Exception e) {
            System.debug('Exception during Employee insertion: ' + e.getMessage());
            System.assert(false, 'Failed to insert Employee__c record: ' + e.getMessage());
        }
    }

    @isTest
    static void testRelatedRecordCreation() {
        // First, call the setupTestData to create Employee record
        setupTestData();

        // Fetch the created employee
        List<Employee__c> newEmployeeList = [SELECT Id, Name, Employment_Type__c, Email__c, Employee_Type__c FROM Employee__c];

        // Adding debug statement to check if employee is inserted
        System.debug('Number of Employee Records Found: ' + newEmployeeList.size());

        if (!newEmployeeList.isEmpty()) {
            Test.startTest();

            // Call the handler method to create related records
            EmployeeCreationHandler handler = new EmployeeCreationHandler();
            handler.relatedRecordCreation(newEmployeeList);

            Test.stopTest();

            // Fetch User_Log_In_Details__c records to verify related record creation
            List<User_Log_In_Details__c> userDetails = [SELECT Id, Name, Email__c, Employee__c FROM User_Log_In_Details__c WHERE Employee__c = :newEmployeeList[0].Id];
            System.debug('Number of User Log In Details created: ' + userDetails.size());

            // Assert that at least one User Log In Details record is created
            System.assertEquals(1, userDetails.size(), 'User Log In Details should be created');
            
            // Fetch Installer__c records to verify related record creation
            List<Installer__c> installerDetails = [SELECT Id, Name, Email__c, Employee__c FROM Installer__c WHERE Employee__c = :newEmployeeList[0].Id];
            System.debug('Number of Installer records created: ' + installerDetails.size());

            // Assert that an installer record is created for Assistant or Lead Installer
            System.assertEquals(1, installerDetails.size(), 'Installer should be created for Assistant or Lead Installer');

        } else {
            // Fail the test if no Employee records are found
            System.debug('No employee records were found, skipping test.');
            System.assert(false, 'No employee records found for testing.');
        }
    }
}
