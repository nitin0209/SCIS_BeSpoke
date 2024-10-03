@isTest
public class InstallerHandlerTest {
    @isTest
    static void testSyncInstallerToEmployee() {
        // Create a test company
        Company__c testCompany = new Company__c(
            Name = 'SCIS',
            Is_Installer__c = true,
            Working_Area__c = 'HA',
            Email__c = 'scis@gmail.com',
            Phone_Number__c = '7208147489',
            compnay_registration_number__c = 'abc - 111',
            Company_Type__c = 'Installer',
            Joining_Date__c = Date.newInstance(2024, 6, 3)
        );
        insert testCompany;

        // Create test data - Installer records
        Installer__c installer = new Installer__c(
            Name = 'Test Installer',
            Email__c = 'test.installer@example.com',
            Phone__c = '1234567890',
            Role__c = 'Lead Installer'
        );
        insert installer;

        // Create test data - Employee record linked to the Installer
        Employee__c employee = new Employee__c(
            Is_Installer__c = true,
            Name = 'Test Employee',
            Employee_Type__c = 'Lead Installer',
            Email__c = 'old.email@example.com',
            Personnel_Mobile_Number__c = '0987654321',
            Employee_Start_Date__c = Date.today(),
            Last_Date__c = Date.today().addDays(1), // Ensure Last_Date__c is after Employee_Start_Date__c
            NI_Number__c = 'AA586846C',
            Company__c = testCompany.Id,  // Assign the ID of the test company
            Date_of_Birth__c = Date.newInstance(1990, 1, 1), 
            Employee_ID__c = 'EMP001', 
            Status__c = 'Active', 
            Working_Area__c = 'HA', 
            Working_Post_Town__c = 'HA'
        );
        insert employee;

        // Update Installer record to link to the Employee
        installer.Employee2__c = employee.Id;
        update installer;

        // Start test
        Test.startTest();
        InstallerHandler.syncInstallerToEmployee(new List<Installer__c>{ installer });
        Test.stopTest();

        // Verify that the Employee record is updated with the Installer details
        Employee__c updatedEmployee = [SELECT Email__c, Personnel_Mobile_Number__c FROM Employee__c WHERE Id = :employee.Id];
        System.assertEquals('test.installer@example.com', updatedEmployee.Email__c, 'Email should be updated');
        System.assertEquals('1234567890', updatedEmployee.Personnel_Mobile_Number__c, 'Phone number should be updated');
    }
}