#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const os = require("os");
const inquirer = require('inquirer')
const { v4 } = require('uuid')
const pkg = require('./package.json')
const crypto = require('crypto');

const SALT_SIZE = 128;

const hashPassword = (password) => {
    const passwordBuffer = Buffer.from(password, "utf-8");
    const passwordHash = crypto.createHash('sha256').update(passwordBuffer).digest();

    const saltBuffer = crypto.randomBytes(SALT_SIZE);
    const fullBuffer = Buffer.concat([passwordHash, saltBuffer]);


    const hash = crypto.createHash('sha256').update(fullBuffer).digest('hex');

    return { salt: "0x" + saltBuffer.toString('hex'), password: "0x" + hash };
}

function main() {
    program
        .version(pkg.version);

    program
        .command('init')
        .action(function () {
            console.log("Game Control Initialization");
            console.log("---------------------------");
            var questions = [

                {
                    type: 'input',
                    name: 'serverFqdn',
                    message: "What is the fully-qualified DNS name of the server endpoint that will host Game Control?",
                    default: "localhost",
                    validate: (input, answers) => { return (input.startsWith("http") ? "Please enter a domain name without 'http' or 'https'." : true) }
                },
                {
                    type: 'list',
                    name: 'dbtype',
                    message: 'What kind of database would you like to use?',
                    choices: [
                        {
                            name: "Microsoft SQL Server Developer Edition, hosted in a Docker container",
                            value: 'sqlcontainer'
                        }
                        ,
                        {
                            name: "External Microsoft SQL Server instance (for example, SQL Azure)",
                            value: 'external'
                        }
                    ]
                },
                {
                    type: "password",
                    name: "sapassword",
                    message: "What password would you like to use for the 'sa' database administrator account?  (leave blank to automatically generate a password)",
                    when: (answers) => (answers.dbtype === "sqlcontainer")
                },
                {
                    type: 'input',
                    name: 'username',
                    message: "What is the username you would like to use for the default admin login to the Game Control site?",
                    default: "admin",
                    when: (answers) => (answers.dbtype === "sqlcontainer"),
                    validate: (input, answers) => {
                        if (input.length < 2 || input.length > 50) {
                            return "Please enter a username between 2 and 50 characters long.";
                        }
                        return true;
                    }
                },
                {
                    type: 'password',
                    name: 'password',
                    message: "What is the password you would like to use for the default admin login to the Game Control site?",
                    when: (answers) => (answers.dbtype === "sqlcontainer"),
                    validate: (input, answers) => {
                        if (input.length < 4) {
                            return "Please enter a longer password.";
                        }
                        return true;
                    }
                },
                {
                    type: 'confirm',
                    name: 'acceptEula',
                    message: "Do you accept the Microsoft SQL Server Developer Edition EULA found at https://go.microsoft.com/fwlink/?LinkId=746388 ?",
                    default: false,
                    when: (answers) => (answers.dbtype === "sqlcontainer")
                },
                {
                    type: 'input',
                    name: 'sqlConnectionString',
                    message: "What is the connection string for your Microsoft SQL Server?",
                    when: (answers) => (answers.dbtype === "external")
                },
                {
                    type: 'confirm',
                    name: 'useMSA',
                    message: "Would you like to enable Microsoft Account authentication?",
                    default: true
                },
                {
                    type: 'input',
                    name: 'msaClientId',
                    message: "To enable Microsoft Account authentication, follow the instructions at https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app to register an application.\nWhat is your application (client) ID for the Microsoft identity platform?",
                    default: "",
                    when: (answers) => (answers.useMSA === true)
                },
                {
                    type: 'input',
                    name: 'azureBlobConnectionString',
                    message: "What is the connection string for your Azure Blob Storage account?"
                },
                {
                    type: 'input',
                    name: 'azureBlobBaseUrl',
                    message: "What is the base URL for your Azure Blob Storage account?  (For example, https://gamecontrolblob.example.com/events/)"
                },
                {
                    type: 'confirm',
                    name: 'confirmation',
                    message: "Ready to create configuration files?  (This will overwrite any existing settings, including credentials, and may cause data loss if you have an existing installation of Game Control!)",
                    default: false
                }];

            inquirer.prompt(questions).then((answers) => {
                let env = [];
                let clientEnv = [];
                let serverEnv = [];
                let databaseEnv = [];
                let pregameEnv = [
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__ShellName=Default",
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__SiteName=Pregame",
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__SiteTimeZone=America/Los_Angeles",
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__AdminEmail=example@example.com",
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__DatabaseProvider=SqlConnection",
                    "OrchardCore__OrchardCore_AutoSetup__Tenants__0__RecipeName=Blank",
                    // WARNING: these next few values should only be for local development
                    "Identity__Password__RequireDigit=false",
                    "Identity__Password__RequireLowercase=false",
                    "Identity__Password__RequireUppercase=false",
                    "Identity__Password__RequireNonAlphanumeric=false",
                    "Identity__Password__RequiredUniqueChars=1",
                    "Identity__Password__RequiredLength=1"
                    // End warning
                ];

                let appSettings = {
                    "Logging": {
                        "IncludeScopes": false,
                        "LogLevel": {
                            "Default": "Debug",
                            "System": "Information",
                            "Microsoft": "Information"
                        }
                    },
                    "ConnectionStrings": {},
                    "JwtIssuerOptions": { "Issuer": "GameControl" },
                    "GameControl": {}
                };

                if (answers.confirmation) {
                    console.log("Writing .env files...");
                    if (answers.acceptEula) {
                        databaseEnv.push("ACCEPT_EULA=true");
                    }

                    if (answers.dbtype === "sqlcontainer") {
                        env.push("COMPOSE_PROFILES=everything");
                        const saPassword = answers.saPassword ? answers.saPassword : v4();
                        const gcPassword = v4();
                        const pgPassword = v4();

                        databaseEnv.push("SA_PASSWORD=" + saPassword);
                        databaseEnv.push("GC_PASSWORD=" + gcPassword);
                        databaseEnv.push("PG_PASSWORD=" + pgPassword);

                        const {password, salt} = hashPassword(answers.password);
                        databaseEnv.push("LOGIN_USERNAME="+ answers.username);
                        databaseEnv.push("LOGIN_PASSWORD_HASH="+ password);
                        databaseEnv.push("LOGIN_PASSWORD_SALT="+ salt);

                        const connectionString = "Data Source=database;Initial Catalog=gamecontrol;Integrated Security=false;User ID=gc;Password=" + gcPassword + ";Connect Timeout=15;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False;MultipleActiveResultSets=true"
                        serverEnv.push("ConnectionStrings__DefaultConnection=" + connectionString);
                        appSettings.ConnectionStrings.DefaultConnection = connectionString;

                        const pregameConnectionString = "Data Source=database;Initial Catalog=pregame;Integrated Security=false;User ID=pg;Password=" + pgPassword + ";Connect Timeout=15;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False;MultipleActiveResultSets=true"
                        pregameEnv.push("OrchardCore__OrchardCore_AutoSetup__Tenants__0__DatabaseConnectionString=" + pregameConnectionString);
                    }
                    else if (answers.dbtype === "external") {
                        env.push("COMPOSE_PROFILES=clientserver");
                        serverEnv.push("ConnectionStrings__DefaultConnection=" + answers.sqlConnectionString);
                        appSettings.ConnectionStrings.DefaultConnection = answers.sqlConnectionString;
                    }

                    if (answers.useMSA && answers.msaClientId) {
                        clientEnv.push("REACT_APP_MICROSOFT_ACCOUNT_CLIENT_ID=" + answers.msaClientId);
                        serverEnv.push("GameControl__MsaClientId=" + answers.msaClientId);
                        appSettings.GameControl.MsaClientId = answers.msaClientId;
                    }

                    const origin = "http://" + answers.serverFqdn;
                    serverEnv.push("GameControl__CorsOrigin=" + origin);
                    appSettings.GameControl.CorsOrigin = origin;
                    serverEnv.push("JwtIssuerOptions__Audience=" + origin);
                    serverEnv.push("JwtIssuerOptions__Issuer=GameControl");
                    appSettings.JwtIssuerOptions.Audience = origin;

                    const gcSecretKey = v4();
                    serverEnv.push("GameControl__SecretKey=" + gcSecretKey);
                    appSettings.GameControl.SecretKey = gcSecretKey;

                    serverEnv.push("GameControl__BlobStorageConnectionString=" + answers.azureBlobConnectionString);
                    appSettings.GameControl.BlobStorageConnectionString = answers.azureBlobConnectionString;

                    let blobBaseUrl = answers.azureBlobBaseUrl;
                    if (!blobBaseUrl.endsWith("/")) {
                        blobBaseUrl += "/";
                    }
                    serverEnv.push("GameControl__BlobStorageBaseUrl=" + answers.blobBaseUrl);
                    appSettings.GameControl.BlobStorageBaseUrl = answers.blobBaseUrl;

                    // There is probably a more secure way to do this
                    pregameEnv.push("OrchardCore__OrchardCore_AutoSetup__Tenants__0__AdminUsername=" + answers.username);
                    pregameEnv.push("OrchardCore__OrchardCore_AutoSetup__Tenants__0__AdminPassword=" + answers.password);

                    fs.writeFileSync(".env", env.join(os.EOL));
                    if (answers.dbtype === "sqlcontainer") {
                        fs.writeFileSync("database.env", databaseEnv.join(os.EOL));
                    }
                    fs.writeFileSync("client.env", clientEnv.join(os.EOL));
                    fs.writeFileSync("client/.env", clientEnv.join(os.EOL));
                    fs.writeFileSync("server.env", serverEnv.join(os.EOL));
                    fs.writeFileSync("pregame.env", pregameEnv.join(os.EOL));

                    console.log("Writing server/appsettings.Development.json file...");
                    fs.writeFileSync("./server/appsettings.Development.json", JSON.stringify(appSettings));

                    console.log("Done!");
                    console.log("To launch Game Control, run: \n\tdocker-compose up");
                }
            });
        });

    program.parse(process.argv)
}

main()