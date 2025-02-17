FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    --repository=https://dl-cdn.alpinelinux.org/alpine/v3.21/community/ \
    yt-dlp

# Create directories with proper permissions
RUN mkdir -p /app/public/downloads && \
    chmod -R 777 /app/public

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]