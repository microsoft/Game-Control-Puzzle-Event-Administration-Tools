FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

COPY gamecontrol.sql gamecontrol.sql
COPY createlogin.sql createlogin.sql
COPY defaultdata.sql defaultdata.sql
COPY pregame.sql pregame.sql

# Based on example at https://github.com/twright-msft/mssql-node-docker-demo-app/blob/master/import-data.sh
COPY create.sh create.sh
COPY entrypoint.sh entrypoint.sh

RUN chmod +x entrypoint.sh
RUN chmod +x create.sh
RUN sed -i 's/\r$//' entrypoint.sh
RUN sed -i 's/\r$//' create.sh

USER mssql
CMD /bin/bash ./entrypoint.sh