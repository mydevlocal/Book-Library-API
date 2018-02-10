FROM node:8.9-alpine

# Maintainer
MAINTAINER nubilfi <ibnu.habil.h@gmail.com>

# Define environment variable
ENV appDir /usr/src/app

# pm2 & ESLint globally
RUN npm install -g pm2

# Use changes to package.json to force Docker not to use the cache
# when change application's nodejs dependencies:
COPY package*.json /tmp/
RUN cd /tmp && npm install --only=production
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Add the current working folder as a mapped folder at /usr/src/app
# the previous docker "layer" thats been cached will be used if possible
COPY . ${appDir}

# App dir inside the image
WORKDIR ${appDir}

# Expose the port
EXPOSE 3245

# the --no-daemon is a minor workaround to prevent the docker container from thinking pm2 has stopped running and ending itself
CMD ["pm2", "start", "processes.json", "--no-daemon"]