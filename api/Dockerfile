#Construye la imagen de la aplicación Node.js basada en la imagen oficial de Node.js 22
FROM node:22.23.3-bookworm-slim

WORKDIR /app
#Aprovecha la caché de npm para instalar las dependencias de producción debido a que package.json y package-lock.json no cambian con frecuencia
COPY package.json ./
RUN npm install --omit=dev

COPY app.js ./

USER node

EXPOSE 3000

CMD ["node", "app.js"]