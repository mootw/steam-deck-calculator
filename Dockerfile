FROM nginx:1.20.2
EXPOSE 80
ADD  public /usr/share/nginx/html/
