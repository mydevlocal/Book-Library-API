FROM mongo:3.6-jessie
MAINTAINER nubilfi <ibnu.habil.h@gmail.com>

RUN apt-get update && apt-get install -y tzdata &&\
	cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime &&\
	echo "Asia/Jakarta" > /etc/timezone