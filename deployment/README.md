# Deployment
## Prerequisites:

- Linux or Windows with WSL2
- Docker or Docker for Windows with WSL2 enabled
- Azure CLI

Note:  All commands run from root

## Deployment Process

#### To build:

```
docker login interngame.azurecr.io
docker build -t interngame.azurecr.io/gamecontrol-client:dev ./client
docker push interngame.azurecr.io/gamecontrol-client:dev
docker build -t interngame.azurecr.io/gamecontrol-server:dev ./server
docker push interngame.azurecr.io/gamecontrol-server:dev
```

#### To deploy:

```
az login
az container create --resource-group gamecontrol --file deployment/gamecontrol.yaml
az container create --resource-group gamecontrol --file deployment/gamecontrolserver.yaml
```

#### To shut down and save money when you are no longer working actively:

```
az container delete --resource-group gamecontrol -n gamecontrol
az container delete --resource-group gamecontrol -n gamecontrolserver
```
