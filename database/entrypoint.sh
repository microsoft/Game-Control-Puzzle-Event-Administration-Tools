#!/bin/bash
echo Game Control database starting up.

mkdir -p /var/opt/mssql/gcconfig
if [ -f /var/opt/mssql/gcconfig/firstrun-completed.1 ]; then
    echo First run tasks already completed.
else
    echo Running first run tasks.
    ./create.sh
    touch /var/opt/mssql/gcconfig/firstrun-completed.1
    echo First run tasks now complete.
fi

echo Launching SQL Server
/opt/mssql/bin/sqlservr