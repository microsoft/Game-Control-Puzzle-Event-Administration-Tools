# The build stage uses a Node image to get all the NPM goodies preinstalled that we need.
FROM node:20 as builder
WORKDIR /client

# Start by copying just the package files.  Then, we use 'npm ci' to restore the packages.
# By doing this separately from the rest of the code, docker will cache these layers and
# avoid the time-consuming package restore process on future builds unless a new package
# dependency is added.
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN     cd /client && \
        npm ci --legacy-peer-deps && \
        npm cache clean --force && \
        rm -rf /tmp/*

# Copy the remainder of the files and build the app.
COPY tsconfig.json /client/tsconfig.json
COPY .eslintrc.json /client/.eslintrc.json
COPY vite.config.ts /client/vite.config.ts
COPY vite-env.d.ts /client/vite-env.d.ts
COPY manifest.json manifest.json
COPY index.html index.html
COPY public/ /client/public/
COPY src/ /client/src/
ENV REACT_APP_GAMECONTROL_CLIENT_API_URL /
RUN npm run build

# Now, switch to a barebones static-html-only nginx server that can serve up the resulting files.
FROM nginx:alpine

COPY --from=builder /client/build /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
ENV NGINX_PORT 80
ENV SERVERNAME localhost
ENV BACKENDNAME server:5000
