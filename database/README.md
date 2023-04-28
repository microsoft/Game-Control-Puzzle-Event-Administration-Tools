# Using the Game Control SQL Server 2019 Developer Edition Docker Image
## Building
    docker build .

### Example Output
    Sending build context to Docker daemon  402.4kB
    Step 1/8 : FROM mcr.microsoft.com/mssql/server:2019-latest
    ---> 244309caf158
    ...
    Step 8/8 : CMD /bin/bash ./entrypoint.sh
    ---> Using cache
    ---> 92b7b517d055
    Successfully built 92b7b517d055

## Running
Replace the password listed with a secure password that meets SQL Server 2019's minimum complexity requirements, and replace `92b7...` with your image ID from the previous step.

    docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassw0rdGoesHere!" -p 1433:1433 92b7b517d055
