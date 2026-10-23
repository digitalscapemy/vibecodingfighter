# Landing page static — Vibe Coding Fighter (Digital Scape Venture)
FROM nginx:alpine

# Konfigurasi nginx tersuai
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin fail laman ke direktori web nginx
COPY . /usr/share/nginx/html

# Buang fail yang tak perlu dihidang
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/.gitignore \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/assets/README.txt 2>/dev/null || true

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
