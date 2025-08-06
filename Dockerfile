# Imagen base oficial de Node
FROM node:20

# Crea el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto (Render usará este)
EXPOSE 5000

# Comando para ejecutar el backend
CMD ["node", "server.js"]
