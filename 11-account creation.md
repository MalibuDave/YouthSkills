User Account Interactions 

Create Account
    User
        - age 
            - Under 13? Accounts cannot be created at this time 
        - first name
        - last name
        - email address
        - password (8 to 12 char long)
        - ward (drop down list)
        - Request for Bishopric role 
            - Provide phone for follow-up verification


Email Verification Post Account Creation
    
    - Unverified email 
        Status
            → Pending 
            → Active
                → See Bishopric → Active / Rejected
                → Wrong Ward → (new ward) Pending
                → Rejected → (bishop reverses) Active


Pending Ward Approval -> 
    - approval states
        - active
        - rejected
        - incorrect ward
        - other 
        - see bishopric (this is if the bishopric needs to speak with the user)


User Account Interactions 

Type
    Admin - cannot be created at the user account creation page
        - Super User - assigned at the db level 
            - Add, Modify, Delete Content Admin  
            - Add, Modify, Delete Users 
            - Add, Modify, Delete Bishopric 
            - Add, Modify, Delete Content 
            - Add, Modify, Delete Wards 

        - Content 
            - Add, Modify, Delete Content 
            - Add, Modify, Delete Wards 

    Bishopric
        - Add, Modify, Delete Users from Assigned Ward 
         
    User 