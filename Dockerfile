FROM node:alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["yarn", "start"]
EXPOSE 8000
