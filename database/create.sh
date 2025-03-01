/opt/mssql/bin/sqlservr &

for i in {1..50};
do
    /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "$SA_PASSWORD" -d master -i gamecontrol.sql
    if [ $? -eq 0 ]
    then
        echo "Database created."
        break
    else
        echo "Database not ready yet."
        sleep 1
    fi
done

echo "Creating login user..."
sed "s/!!!GCUSERNAME!!!/gc/g;s/!!!GCPASSWORD!!!/${GC_PASSWORD}/g" createlogin.sql > /tmp/createlogin.sql
for i in {1..50};
do
    /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "$SA_PASSWORD" -d master -i /tmp/createlogin.sql
    if [ $? -eq 0 ]
    then
        echo "Login user created."
        break
    else
        echo "Database not ready yet."
        sleep 1
    fi
done
rm /tmp/createlogin.sql

sed "s/!!!USERNAME!!!/${LOGIN_USERNAME}/g;s/!!!PASSWORDHASH!!!/${LOGIN_PASSWORD_HASH}/g;s/!!!PASSWORDSALT!!!/${LOGIN_PASSWORD_SALT}/g" defaultdata.sql > /tmp/defaultdata.sql
for i in {1..50};
do
    /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P "$SA_PASSWORD" -d master -i /tmp/defaultdata.sql
    if [ $? -eq 0 ]
    then
        echo "Default data created."
        break
    else
        echo "Database not ready yet."
        sleep 1
    fi
done
rm /tmp/defaultdata.sql


echo "Waiting for SQL Server to terminate and restart..."
pkill -P $$
sleep 10