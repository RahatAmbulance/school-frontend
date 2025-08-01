FROM node:16-alpine

RUN mkdir /opt/school-frontend
WORKDIR /opt/school-frontend

COPY package*.json ./
RUN npm install --force

COPY . .

# Increase memory limit for Node.js build
RUN NODE_OPTIONS="--max_old_space_size=4096" npm run build


ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]
