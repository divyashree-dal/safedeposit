# pull official base image
FROM node:14

# set working directory
WORKDIR /usr/src/app

# install app dependencies
COPY package.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.0 -g --silent

# add app
COPY . ./
EXPOSE 3000
CMD ["npm","start"]