FROM node:12-alpine

LABEL maintainer="Florent Uzio <fuzio@ripple.com>"

WORKDIR /opt

RUN mkdir payid

WORKDIR /opt/payid

COPY . .

# create a group and user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# postgresql-client is needed if/when we run "wait-for-postgres.sh" (in ./scripts) to make sure Postgres is ready to execute SQL scripts.
RUN apk --no-cache add postgresql-client~=12 &&\
    npm cache clean --force &&\
    npm install &&\
    npm run build 

EXPOSE 8080 8081

# run all future commands as this user
USER appuser 

CMD ["node", "/opt/payid/build/src/index.js"]
