# Description: A custom nginx image with ModSecurity, OWASP CRS, and ngx_brotli installed

####################################
### Create a base w/ ModSecurity ###
####################################

FROM nginx:1.27.3-alpine3.20-slim AS builder
LABEL maintainer="kiroussa <ft@xtrm.me>"

ENV BROTLI_NGX_REV=a71f9312c2deb28875acc7bacfdd5695a111aa53
ENV MODSEC_VERSION=3.0.13
ENV MODSEC_CONNECTOR_VERSION=1.0.3
ENV OWASP_CRS_VERSION=4.10.0

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
RUN git checkout $BROTLI_NGX_REV \
	&& mkdir /tmp/ngx_brotli/deps/brotli/out -p

# Build ngx_brotli and its dependencies
WORKDIR /tmp/ngx_brotli/deps/brotli/out
RUN cmake -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DCMAKE_C_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" -DCMAKE_CXX_FLAGS="-Ofast -m64 -march=native -mtune=native -flto -funroll-loops -ffunction-sections -fdata-sections -Wl,--gc-sections" -DCMAKE_INSTALL_PREFIX=./installed .. \
	&& cmake --build . --config Release --target brotlienc

##> Download ModSecurity <##

RUN wget -O /tmp/modsecurity.tar.gz \
	https://github.com/owasp-modsecurity/ModSecurity/releases/download/v$MODSEC_VERSION/modsecurity-v$MODSEC_VERSION.tar.gz
RUN mkdir -p /tmp/modsec
RUN tar -xvzf /tmp/modsecurity.tar.gz -C /tmp/modsec

# Build ModSecurity
WORKDIR /tmp/modsec/modsecurity-v${MODSEC_VERSION}
RUN ./build.sh \
	&& ./configure \
	&& make -j$(nproc) \
	&& make install

# Download ModSecurity Nginx Connector
RUN wget -O /tmp/modsecurity-connector.tar.gz \
		https://github.com/owasp-modsecurity/ModSecurity-nginx/releases/download/v${MODSEC_CONNECTOR_VERSION}/modsecurity-nginx-v${MODSEC_CONNECTOR_VERSION}.tar.gz \
	&& mkdir -p /tmp/modsec-connector \
	&& tar -xvzf /tmp/modsecurity-connector.tar.gz -C /tmp/modsec-connector

##> Download and build nginx modules <##

# Download nginx... again
WORKDIR /tmp
RUN wget -O /tmp/nginx.tar.gz \
		http://nginx.org/download/nginx-$(nginx -v 2>&1 | cut -d'/' -f2).tar.gz \
	&& tar -xvzmf nginx.tar.gz \
	&& mv /tmp/nginx-$(nginx -v 2>&1 | cut -d'/' -f2) /tmp/nginx
WORKDIR /tmp/nginx

# Catch the current (docker's) nginx's configure options
RUN nginx -V 2>&1 | grep "configure arguments" > /tmp/nginx-configure-args.txt

# Build nginx modules with ModSecurity and Brotli
RUN sh -c "./configure \
		--add-dynamic-module=../modsec-connector/modsecurity-nginx-v${MODSEC_CONNECTOR_VERSION} \
		--with-compat --add-dynamic-module=/tmp/ngx_brotli \
		$(cat /tmp/nginx-configure-args.txt | cut -d' ' -f3-)" \
	&& make modules -j$(nproc)

# Copy the module to the nginx modules directory
RUN mkdir -p /etc/nginx/modules \
	&& cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules \
	&& cp objs/ngx_http_brotli_filter_module.so /etc/nginx/modules \
	&& cp objs/ngx_http_brotli_static_module.so /etc/nginx/modules \
	&& rm -rf /tmp/nginx

#######################################################
### Setup the OWASP ModSecurity Core Rule Set (CRS) ###
#######################################################

# Download and unpack
RUN rm -rf /usr/share/modsecurity-crs \
	&& wget -O /tmp/owasp-crs.tar.gz \
		https://github.com/coreruleset/coreruleset/archive/refs/tags/v${OWASP_CRS_VERSION}.tar.gz \
	&& tar -xvzf /tmp/owasp-crs.tar.gz -C /usr/local \
	&& mv /usr/local/coreruleset-${OWASP_CRS_VERSION} /usr/local/modsecurity-crs

# Setup default crules
RUN mv /usr/local/modsecurity-crs/crs-setup.conf.example /usr/local/modsecurity-crs/crs-setup.conf \
	&& mv /usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example \
		/usr/local/modsecurity-crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf \
	&& rm -rf /tmp/modsec-connector

##> Setup ModSecurity in nginx <##

RUN mkdir -p /etc/nginx/modsec \
	&& cp /tmp/modsec/modsecurity-v${MODSEC_VERSION}/unicode.mapping /etc/nginx/modsec \
	&& rm -rf /tmp/modsec \
	&& rm -rf /tmp/ngx_brotli

COPY ./config/modsec.conf /etc/nginx/modsec/modsecurity.conf
COPY ./config/modsec-main.conf /etc/nginx/modsec/main.conf

# Copy the default configuration

#######################
### Setup SSL certs ###
#######################

# Create a self-signed certificate
ENV NGINX_CERTS_DIR=/etc/nginx/certs
RUN mkdir -p $NGINX_CERTS_DIR \
	&& openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout ${NGINX_CERTS_DIR}/ssl.key \
		-out ${NGINX_CERTS_DIR}/ssl.crt \
		-subj "/C=FR/ST=Nouvelle Aquitaine/L=Angoulême/O=42 Angoulême/CN=ft_trans.xtrm.me"

# Runtime image, because I can't be bothered to keep a 1gb alpine image
FROM nginx:1.27.3-alpine3.20-slim AS runtime
LABEL maintainer="kiroussa <ft@xtrm.me>"

# Add dependencies
RUN apk add --no-cache pcre-dev \
    zlib-dev \
    ca-certificates

# Copy what we built/copied beforehand
COPY --from=builder /etc/nginx/certs /etc/nginx/certs
COPY --from=builder /etc/nginx/modsec /etc/nginx/modsec
COPY --from=builder /etc/nginx/modules /etc/nginx/modules
COPY --from=builder /usr/local/modsecurity /usr/local/modsecurity
COPY --from=builder /usr/local/modsecurity-crs /usr/local/modsecurity-crs

# Config files
COPY ./config/nginx.conf /etc/nginx/nginx.conf
COPY ./config/servers /etc/nginx/conf.d

# yippieeeeeee
