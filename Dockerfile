FROM node
RUN mkdir /service
WORKDIR /service
COPY . ./
EXPOSE 3000
ENTRYPOINT [ "node", "koa.js" ]