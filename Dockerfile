FROM node:12
LABEL maintainer="Austin King <aking@ripple.com>"
ADD . / payid/
RUN (cd payid/; npm install;)
RUN (cd payid/; npm run build;)
EXPOSE 8080 8081
CMD ["node", "payid/build/src/index.js"]
