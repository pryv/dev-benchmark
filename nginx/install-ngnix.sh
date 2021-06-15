PREFIX=`pwd`/nginx-bin
CONF=`pwd`/nginx-test.conf
mkdir temp
mkdir $PREFIX
cd temp

wget https://ftp.pcre.org/pub/pcre/pcre-8.44.tar.gz
tar -zxf pcre-8.44.tar.gz
cd pcre-8.44
./configure
make
#$ sudo make install
cd ..

wget http://zlib.net/zlib-1.2.11.tar.gz
tar -zxf zlib-1.2.11.tar.gz
cd zlib-1.2.11
./configure
make
#$ sudo make install
cd ..

wget http://www.openssl.org/source/openssl-1.1.1g.tar.gz
tar -zxf openssl-1.1.1g.tar.gz
cd openssl-1.1.1g
./Configure  --prefix=$PREFIX/usr
make
#$ sudo make install
cd ..
wget https://nginx.org/download/nginx-1.18.0.tar.gz
tar zxf nginx-1.18.0.tar.gz
cd nginx-1.18.0

./configure --prefix=$PREFIX --pid-path=$PREFIX/nginx.pid --with-pcre=../pcre-8.44 --with-zlib=../zlib-1.2.11 --with-http_ssl_module --with-stream --with-mail=dynamic 
make install
cd ..
rm -f *.tar.gz
