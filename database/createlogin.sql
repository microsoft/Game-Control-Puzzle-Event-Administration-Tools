CREATE LOGIN !!!GCUSERNAME!!!   
    WITH PASSWORD = '!!!GCPASSWORD!!!';  
USE [gamecontrol]
GO
CREATE USER !!!GCUSERNAME!!! FOR LOGIN !!!GCUSERNAME!!!   
    WITH DEFAULT_SCHEMA = [dbo];  
GO  
ALTER ROLE db_datareader ADD MEMBER !!!GCUSERNAME!!!
GO
ALTER ROLE db_datawriter ADD MEMBER !!!GCUSERNAME!!!
GO
GRANT EXECUTE TO !!!GCUSERNAME!!!;
GO
