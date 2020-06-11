FROM node:12-alpine

LABEL maintainer="Florent Uzio <fuzio@ripple.com>"

WORKDIR /opt

RUN mkdir payid

WORKDIR /opt/payid

COPY . .

# postgresql-client is needed if/when we run "wait-for-postgres.sh" (in ./scripts) to make sure Postgres is ready to execute SQL scripts.
RUN apk --no-cache add postgresql-client~=12 &&\
    npm cache clean --force &&\
    npm install &&\
    npm run build &&\
    ls -al /opt/payid/build/ &&\
    ls -al /opt/payid/build/src

EXPOSE 8080 8081

CMD ["node", "/opt/payid/build/src/index.js"]