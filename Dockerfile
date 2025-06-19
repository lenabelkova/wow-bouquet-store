FROM node:18-alpine
WORKDIR /app 
COPY package*.json /app/
COPY package-lock.json /app/package-lock.json
RUN npm ci 
COPY . /app
ENTRYPOINT ["npm", "run", "start"]



