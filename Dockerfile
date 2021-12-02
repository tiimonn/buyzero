FROM node:17-alpine

# Create app directory
WORKDIR /app
# Copy and download dependencies
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY . .
CMD yarn start

