# bpa-db

[Link to instructions for creating a public-ly accessible Postgres RDS instance in AWS.  These are incomplete.]

1. Go to VPC dashboard.  Click VPCs.  Click Create VPC.
   1. Give it an IPv4 block of 172.31.0.0/16.
   1. Leave the rest as default.
   1. Create the VPC.
   
   
2. go to EC2 dashboard.  Under Network and Security, click Security Groups. click Create Security Group.
   1. Give the security group a name a description.
   1. Choose the VPC that you just created.
   1. Create two inbound rules. Type: PostgreSQL. Source: Custom.  In one, put 0.0.0.0/0 and in the other, put ::/0
   1. Create the security group.


3. Create subnet groups and internet connectivity for VPC
   [need instructions for this]
   

4. Create new RDS instance on AWS 
    1. choose PostgreSQL
    1. free tier (to start)
    1. choose a db instance identifier
    1. choose a username and password
    1. Connectivity:
       1. Choose the VPC group that you created. 
       1. uncheck 'default' and add the security group you just created.
       1. make publicly accessible.
    1. Additional configuration: choose a database name
    1. export postgresql log to cloudwatch
    1. accept all other defaults
    

5. Modify repo to connect to DB
   1. Modify package.json name, version, description & repo URLs
   1. npm i
   1. copy example.env to .env
   1. view connection details for newly created database (can be done only once)
   1. copy endpoint to DB_HOST, username to DB_USER, password to DB_PASS
   1. go to configuration tab, copy DB name to DB_NAME
   1. set DB_SCHEMA to 'public' for now


6. Create connection to DB in DBVis or another DB tool
   1. Verify connection
   

7. Run migrations
   1. In project, 'cd migrate'
   1. node migrate.js
