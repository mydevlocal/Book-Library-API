FROM nginx:1.13.9-alpine
MAINTAINER nubilfi <ibnu.habil.h@gmail.com>

RUN apk update && apk add bash && apk add tzdata &&\
	cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime &&\
	echo "Asia/Jakarta" > /etc/timezone &&\
	apk del tzdata && rm -rf /var/cache/apk/*