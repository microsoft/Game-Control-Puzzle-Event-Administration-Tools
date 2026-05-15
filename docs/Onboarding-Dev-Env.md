# Onboarding the Developer Environment

## Installation

1. Install docker compose
2. Install Node.JS
  - Would highly recommend using [NVM](https://github.com/nvm-sh/nvm)
3. In the root of this repository, run `npm install`
4. Invoke the Game Control initialization script with `node init.js init`. For the following prompts:
  - What is the fully-qualified DNS name of the server endpoint that will host Game Control?
    - Input `local.game-control.com`
  - What is the connection string for your Azure Blob Storage account?
    - If you don't have an Azure Blob Storage account, then input `UseDevelopmentStorage=true`
5. The dev environment assumes that the application will be hosted on `local.game-control.com`. Add this entry to your `/etc/hosts` file:
```
127.0.0.1 local.game-control.com
```
- `C:\Windows\System32\drivers\etc\hosts` is the Windows equivalent

## Running the application
1. Start the application:
```
docker compose -f docker-compose.dev.yml up -d
```
2. In your browser go to `http://local.game-control.com/login`
