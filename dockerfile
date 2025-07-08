FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install

COPY . .

RUN ng build --configuration production



FROM nginx:stable-alpine AS production
COPY --from=build /app/dist/proyecto-o-fronttend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 83

CMD ["nginx", "-g", "daemon off;"]
