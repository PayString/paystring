FROM postgres:12-alpine

ADD . / payid/

RUN apk add npm git make go
RUN (cd payid/; npm cache clean --force;)
RUN (cd payid/; npm install;)
RUN (cd payid/; npm run build;)

RUN git clone https://github.com/inconshreveable/ngrok.git; \
    cd ngrok; \
    make client; \
    cp bin/ngrok /usr/local/bin/ngrok; \
    chmod +x /usr/local/bin/ngrok; \
    echo -e "server_addr: ng.xpring.dev:4443\ntrust_host_root_certs: true" > /etc/ngrok.conf; \
    chmod 444 /etc/ngrok.conf

USER postgres

ENV DB_HOSTNAME=localhost
ENV DB_NAME=demo
ENV DB_USERNAME=demo
ENV DB_PASSWORD=demo

EXPOSE 8080 8081

CMD ["sh", "-c", "rm -f /var/lib/postgresql/data; \
                  echo 'demo' > /tmp/.password; \
                  initdb -U demo --pwfile=/tmp/.password; \
                  postgres & \
                  sleep 5; \
                  PGPASSWORD=demo; \
                  createdb -U demo demo; \
                  node payid/build/src/index.js & \
                  sleep 5; \
                  ngrok -subdomain=$NGROK_SUBDOMAIN -log=stdout -config=/etc/ngrok.conf 8080"]
