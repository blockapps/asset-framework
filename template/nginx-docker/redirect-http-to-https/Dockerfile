FROM nginx:alpine

EXPOSE 80

COPY nginx.conf /etc/nginx/nginx.conf

HEALTHCHECK --interval=2s --timeout=1s --start-period=300s \
  CMD ps -ef | grep nginx | grep master || \
      exit 1
