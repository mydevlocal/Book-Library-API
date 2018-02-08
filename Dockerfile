FROM debian_with_git_and_nodejs

# Maintainer
MAINTAINER nubilfi <ibnu.habil.h@gmail.com>

# Define environment variable
ENV appDir /usr/src/app
ENV MONGODB_URI=mongodb://localhost:27017/db_book 
ENV JWT_TOKEN=randomtoken88374622

# pm2 & ESLint globally
RUN npm install -g eslint pm2

# Use changes to package.json to force Docker not to use the cache
# when change application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production=false
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Add the current working folder as a mapped folder at /usr/src/app
# the previous docker "layer" thats been cached will be used if possible
ADD . ${appDir}

# App dir inside the image
WORKDIR ${appDir}

# Expose the port
EXPOSE 3245

# the --no-daemon is a minor workaround to prevent the docker container from thinking pm2 has stopped running and ending itself
CMD ["pm2", "start", "processes.json", "--no-daemon"]