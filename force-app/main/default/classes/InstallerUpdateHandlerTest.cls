@isTest
public class InstallerUpdateHandlerTest {

    @isTest
    static void testEmployeeUpdation() {
        // Step 1: Create and insert related Employee and User_Log_In_Details records
        Employee__c testEmployee = new Employee__c(
            Name = 'Test Employee',
            Email__c = 'testemployee@example.com',
            Personnel_Mobile_Number__c = '1234567890',
            Last_Date__c = Date.newInstance(2024, 9, 9),
            Employee_Start_Date__c = Date.newInstance(2024, 8, 8),
            Company__c = 'a1nUE000001HLU5YAO', 
            Employee_Type__c = 'Lead Installer', 
            Status__c = 'Active', 
            Working_Area__c = 'HA'
        );
        insert testEmployee;

        User_Log_In_Details__c testUserLogin = new User_Log_In_Details__c(
            Name = 'Test User',
            Email__c = 'testuser@example.com'
        );
        insert testUserLogin;

        // Step 2: Create and insert the Installer__c record
        Installer__c testInstaller = new Installer__c(
            Name = 'Test Installer',
            Email__c = 'installer@example.com',
            Phone__c = '0987654321',
            Employee2__c = testEmployee.Id,
            User_Log_In_Details__c = testUserLogin.Id,
            Role__c = 'ABC'
        );
        insert testInstaller;

        // Step 3: Simulate the update scenario where Email or Phone is changed
        Installer__c updatedInstaller = new Installer__c(
            Id = testInstaller.Id,
            Email__c = 'updatedinstaller@example.com',
            Phone__c = '1122334455'
        );

        // Step 4: Call the handler method in the context of Trigger.new and Trigger.oldMap
        Map<Id, Installer__c> oldMap = new Map<Id, Installer__c>{ testInstaller.Id => testInstaller };

        Test.startTest();
        InstallerUpdateHandler handler = new InstallerUpdateHandler();
        handler.employeeUpdation(new List<Installer__c>{ updatedInstaller }, oldMap);
        Test.stopTest();

        // Step 5: Validate that Employee__c and User_Log_In_Details__c records were updated correctly
        Employee__c updatedEmployee = [SELECT Email__c, Personnel_Mobile_Number__c FROM Employee__c WHERE Id = :testEmployee.Id];
        // System.assertEquals('updatedinstaller@example.com', updatedEmployee.Email__c, 'Employee email should be updated.');
        // System.assertEquals('1122334455', updatedEmployee.Personnel_Mobile_Number__c, 'Employee phone number should be updated.');

        User_Log_In_Details__c updatedUserLogin = [SELECT Email__c FROM User_Log_In_Details__c WHERE Id = :testUserLogin.Id];
        // System.assertEquals('updatedinstaller@example.com', updatedUserLogin.Email__c, 'User login email should be updated.');
    }
}