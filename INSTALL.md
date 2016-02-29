# Install Dice

#### Download Packages
- Download openresty: <https://openresty.org/>
- Download stream-lua-nginx: <https://github.com/openresty/stream-lua-nginx-module>

#### Install lua5.1 - Openresty only works with lua5.1
```
$ apt-get install lua5.1 liblua5.1-0-dev liblua50-dev liblualib50-dev
```
#### Install Openresty
```
$ apt-get install lua5.1 checkinstall libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make build-essential

$ unzip stream-lua-nginx-module-master.zip -d /opt
$ tar zxvf openresty-1.9.7.3.tar.gz
$ cd openresty-1.9.7.3
$ ./configure --with-stream --with-stream_ssl_module --add-module=/opt/stream-lua-nginx-module-master
$ make
$ checkinstall
```

#### install redis
```
$ apt-get install redis-server
```

#### install dice files
```
$ mkdir -p /var/www
$ cd /var/www/

$ git clone https://github.com/mctoyama/dice.git
$ git clone https://github.com/mctoyama/dicelib.git
$ git clone https://github.com/mctoyama/dicewebsocket.git
$ git clone https://github.com/mctoyama/dicedaemon.git
```
### TLS Certificates
#### Free TLS certificate
If you want to host a copy of pixelndice, use a free TLS certificate from <https://letsencrypt.org/>;
See their site for instructions. It is pretty simple.

#### Create self-sign certificate for TLS
HowTo: <https://devcenter.heroku.com/articles/ssl-certificate-self>
```
$ mkdir -p /etc/letsencrypt/live/pixelndice.org
$ cd /etc/letsencrypt/live/pixelndice.org

$ openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
$ openssl rsa -passin pass:x -in server.pass.key -out server.key
$ rm server.pass.key
$ openssl req -new -key server.key -out server.csr
$ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

$ ln -s server.crt cert.pem
$ ln -s server.key privkey.pem
$ ln -s server.crt bundlecert.pem
```
### Install lua copas
Lua Copas - <http://keplerproject.github.io/copas/manual.html#install>
```
$ apt-get install luarocks
$ luarocks install copas
```

### Install lua-websockets
Lua-websockets - <https://github.com/lipp/lua-websockets>
```
$ apt-get install libev-dev
$ cd /opt
$ git clone git://github.com/lipp/lua-websockets.git
$ cd lua-websockets
$ luarocks make rockspecs/lua-websockets-scm-1.rockspec
```

### Install OpenLdap
```
$ apt-get install slapd
$ dpkg-reconfigure slapd
$ apt-get install libldap2-dev
```
- Create ou=users,dc=pixelndice,dc=org
    - organizationalUnit
    - top

### Install lualdap
Lualdap - <http://git.zx2c4.com/lualdap/>
```
$ git clone git://git.zx2c4.com/lualdap
$ cd lualdap/

$ emacs Makefile
# change lines
# CFLAGS += $(shell pkg-config --cflags lua5.1)
# LDLIBS += $(shell pkg-config --libs lua5.1) -lldap
# LUA_MODULES := $(shell pkg-config --variable=INSTALL_CMOD lua5.1)

$ make
$ checkinstall
```

### Run Dice Services
Run dicewebsocket
```
$ cd /var/www/dicewebsocket
$ screen
$ lua server.lua
$ Ctrl-a d
```

Run dicedaemon
```
$ cd /var/www/dicedaemon
$ screen
$ lua server.lua
$ Ctrl-a d
```

Run dice
```
$ mkdir /var/www/dice/accounts
$ chown noboy. /var/www/dice/accounts
$ cd /var/www/dice
$ ./restart.sh
```
