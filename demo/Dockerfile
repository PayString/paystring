FROM postgres:12-alpine

ADD . / payid/

RUN apk add npm
RUN (cd payid/; npm cache clean --force;)
RUN (cd payid/; npm install;)
RUN (cd payid/; npm run build;)

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
                  node payid/build/src/index.js"]
