#!/usr/bin/env bash

wget http://dev.mysql.com/get/mysql-apt-config_0.7.3-1_all.deb
sudo dpkg -i mysql-apt-config_0.7.3-1_all.deb
apt-get update
apt-get upgrade

apt-get install build-essential vim supervisor openssh-server libffi-dev python-debian git libpq-dev python-dev python-dev libffi-dev libjpeg-dev  python-debian git zip unzip nano nginx landscape-client libmysqlclient-dev gunicorn g++ libzmq3-dev gcc python-m2crypto libssl-dev libxml2-dev libxslt1-dev python-dev libcurl4-openssl-dev libffi-dev libmysqlclient-dev unixodbc unixodbc-dev -y

adduser brizeo

cd /home/brizeo

mkdir django

cd django

mkdir api_brizeo_com

cd api_brizeo_com

vim repo.sh

#add following start
#!/bin/bash
source env/bin/activate

BRANCH=$1

if [[ -z "$1" ]]
  then
    echo "please provide branch name"
    exit
fi

clear
git fetch --all
git reset --hard origin/$BRANCH
./manage.py collectstatic --noinput
pip install -r requirements.txt
./manage.py crontab remove
./manage.py crontab add
chown brizeo /home/brizeo/django -R
chgrp brizeo /home/brizeo/django -R
supervisorctl reread
supervisorctl update
supervisorctl restart api_brizeo_com
#add following end

chmod +x repo.sh

vim run.sh

#add following start

#!/bin/bash
source /home/brizeo/django/api_brizeo_com/env/bin/activate

exec gunicorn \
    --name=api_brizeo_com \
    --chdir=/home/brizeo/django/api_brizeo_com \
    --pythonpath=python \
    --workers=16 \
    --worker-connections=1000 \
    --timeout=3600 \
    --graceful-timeout=3600 \
    --bind=unix:/home/brizeo/django/api_brizeo_com/api_brizeo_com.sock \
    api_brizeo_com.wsgi:application

#add following end

chmod +x run.sh

cd /etc/nginx/sites-available

vim api_brizeo_com


mkdir /etc/nginx/ssl/brizeo.com -p
mkdir /etc/nginx/logs/api_brizeo_com -p
touch /etc/nginx/ssl/brizeo.com/ssl-bundle.crt
touch /etc/nginx/ssl/brizeo.com/private.key


#add following start
server {
       listen         80;
       server_name    api.brizeo.com;
       return         301 https://$server_name$request_uri;
}

server {

    listen 443 ssl;

    root /usr/share/nginx/html;
    index index.html index.htm;

    client_max_body_size 4G;
    server_name brizeo.com;
    ssl on;
    ssl_certificate /etc/nginx/ssl/brizeo.com/ssl-bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/brizeo.com/private.key;

    keepalive_timeout 5;

    error_log  /etc/nginx/logs/api_brizeo_com/error.log warn;

    # your Django project's static files - amend as required
    location /static {
        alias /home/brizeo/django/api_brizeo_com/static;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_connect_timeout 3600s;
        proxy_read_timeout 3600s;
        proxy_redirect off;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://unix:/home/brizeo/django/api_brizeo_com/api_brizeo_com.sock;
    }
}
#add following end

cd ../sites-enabled/

ln -s ../sites-available/api_brizeo_com api_brizeo_com


cd /etc/supervisor/

mkdir logs

cd logs

touch api_brizeo_com.log

cd ../

cd conf.d/

vim api_brizeo_com.conf

#add following start
[program:api_brizeo_com]
command = /home/brizeo/django/api_brizeo_com/run.sh
user = brizeo
stdout_logfile = /etc/supervisor/logs/api_brizeo_com.log
redirect_stderr = true
environment=LANG=en_US.UTF-8,LC_ALL=en_US.UTF-8
#add following end


mysql -uroot -p


GRANT ALL ON *.* TO root@'67.215.140.195' IDENTIFIED BY '@Mysql414';
GRANT ALL PRIVILEGES ON *.* TO root@"67.215.140.195" WITH GRANT OPTION;

GRANT ALL ON *.* TO root@'149.56.171.0' IDENTIFIED BY '@Mysql414';
GRANT ALL PRIVILEGES ON *.* TO root@"149.56.171.0" WITH GRANT OPTION;

sed -i 's/bind-address/#bind-address/g' /etc/mysql/mysql.conf.d/mysqld.cnf
service mysql restart


cd ~
ssh-keygen -t rsa -b 4096 -C "email@bilal.me"

cat ~/.ssh/id_rsa.pub


cd  /home/brizeo/django/api_brizeo_com
wget https://files.oddovo.com/django/.gitignore
git init
git remote add origin git@github.com:JoshAdler/api_brizeo_com.git
chmod +x repo.sh
./repo.sh dev



#mysql on centos 7
wget https://dev.mysql.com/get/mysql57-community-release-el7-7.noarch.rpm
sudo rpm -ivh mysql57-community-release-el7-7.noarch.rpm