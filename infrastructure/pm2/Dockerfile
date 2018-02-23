FROM keymetrics/pm2:latest-alpine
MAINTAINER nubilfi <ibnu.habil.h@gmail.com>

RUN apk update && apk add tzdata &&\
	cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime &&\
	echo "Asia/Jakarta" > /etc/timezone &&\
	apk del tzdata