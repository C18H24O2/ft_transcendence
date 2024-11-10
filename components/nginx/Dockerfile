# Description: A custom nginx image with ModSecurity, OWASP CRS, and ngx_brotli installed


ARG NGINX_IMAGE_VERSION=1.27.0

####################################
### Create a base w/ ModSecurity ###
####################################

FROM nginx:${NGINX_IMAGE_VERSION}-alpine
LABEL maintainer="kiroussa <oss@xtrm.me>"

ENV NGINX_IMG_VERSION=1.27.0
ENV BROTLI_NGX_REV=a71f9312c2deb28875acc7bacfdd5695a111aa53
ENV MODSEC_VERSION=3.0.12
ENV MODSEC_CONNECTOR_VERSION=1.0.3
ENV OWASP_CRS_VERSION=4.4.0

# Install tools and dependencies
RUN apk update && apk add --no-cache \
		git \
		wget \
		tar \
		gzip \
		gcc \
		g++ \
		linux-headers \
		libc-dev \
		make \
		autoconf \
		automake \
		pcre-dev \
		zlib-dev\
		openssl \
		openssl-dev \
		curl \
		cmake \
		ca-certificates

##> Download ngx_brotli <##

RUN git clone --recurse-submodules -j8 https://github.com/google/ngx_brotli.git /tmp/ngx_brotli
WORKDIR /tmp/ngx_brotli
RUN git checkout $BROTLI_NGX_REV 
RUN mkdir /tmp/ngx_brotli/deps/brotli/out -p

# Build ngx_brotli and its dependencies
WORKDIR /tmp/ngx_brotli/deps/brotli/out
RUN cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DCMAKE_C_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" -DCMAKE_CXX_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" -DCMAKE_INSTALL_PREFIX=./installed ..
RUN cmake --build . --config Release --target brotlienc

##> Download ModSecurity <##

RUN wget -O /tmp/modsecurity.tar.gz \
	https://github.com/owasp-modsecurity/ModSecurity/releases/download/v$MODSEC_VERSION/modsecurity-v$MODSEC_VERSION.tar.gz
RUN mkdir -p /tmp/modsec
RUN tar -xvzf /tmp/modsecurity.tar.gz -C /tmp/modsec

# Build ModSecurity
WORKDIR /tmp/modsec/modsecurity-v${MODSEC_VERSION}
RUN ./build.sh
RUN ./configure
RUN make -j$(nproc)
RUN make install

# Download ModSecurity Nginx Connector
RUN wget -O /tmp/modsecurity-connector.tar.gz \
	https://github.com/owasp-modsecurity/ModSecurity-nginx/releases/download/v${MODSEC_CONNECTOR_VERSION}/modsecurity-nginx-v${MODSEC_CONNECTOR_VERSION}.tar.gz
RUN mkdir -p /tmp/modsec-connector
RUN tar -xvzf /tmp/modsecurity-connector.tar.gz -C /tmp/modsec-connector

# Download nginx... again

##> Download and build nginx modules <##

# Download nginx
RUN wget -O /tmp/nginx.tar.gz \
	http://nginx.org/download/nginx-$NGINX_IMG_VERSION.tar.gz
WORKDIR /tmp
RUN tar -xvzmf nginx.tar.gz
WORKDIR /tmp/nginx-${NGINX_IMG_VERSION}

# Catch the current (docker's) nginx's configure options
RUN nginx -V 2>&1 | grep "configure arguments" > /tmp/nginx-configure-args.txt

# Build nginx modules with ModSecurity and Brotli
RUN sh -c "./configure \
	--add-dynamic-module=../modsec-connector/modsecurity-nginx-v${MODSEC_CONNECTOR_VERSION} \
	--with-compat --add-dynamic-module=/tmp/ngx_brotli \
	$(cat /tmp/nginx-configure-args.txt | cut -d' ' -f3-)"
RUN make modules -j$(nproc)

# Copy the module to the nginx modules directory
RUN mkdir -p /etc/nginx/modules
RUN cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules
RUN cp objs/ngx_http_brotli_filter_module.so /etc/nginx/modules
RUN cp objs/ngx_http_brotli_static_module.so /etc/nginx/modules

#######################################################
### Setup the OWASP ModSecurity Core Rule Set (CRS) ###
#######################################################

# Download and unpack
RUN rm -rf /usr/share/modsecurity-crs
RUN wget -O /tmp/owasp-crs.tar.gz \
	https://github.com/coreruleset/coreruleset/archive/refs/tags/v${OWASP_CRS_VERSION}.tar.gz
RUN tar -xvzf /tmp/owasp-crs.tar.gz -C /usr/local
RUN mv /usr/local/coreruleset-${OWASP_CRS_VERSION} /usr/local/modsecurity-crs

# Setup default crules
RUN mv /usr/local/modsecurity-crs/crs-setup.conf.example /usr/local/modsecurity-crs/crs-setup.conf
RUN mv /usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example \
	/usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

##> Setup ModSecurity in nginx <##

RUN mkdir -p /etc/nginx/modsec
RUN cp /tmp/modsec/modsecurity-v${MODSEC_VERSION}/unicode.mapping /etc/nginx/modsec
COPY ./config/modsec.conf /etc/nginx/modsec/modsecurity.conf
COPY ./config/modsec-main.conf /etc/nginx/modsec/main.conf

# Copy the default configuration

#######################
### Setup SSL certs ###
#######################

# Create a self-signed certificate
ENV NGINX_CERTS_DIR=/etc/nginx/certs
RUN mkdir -p $NGINX_CERTS_DIR

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ${NGINX_CERTS_DIR}/ssl.key \
		-out ${NGINX_CERTS_DIR}/ssl.crt \
		-subj "/C=FR/ST=Nouvelle Aquitaine/L=Angoulême/O=42 Angoulême/CN=ft_trans.xtrm.me"

# Files exposed via overwriting /etc/nginx in the docker-compose volumes section
