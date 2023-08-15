yum install wget

wget https://zlib.net/fossils/zlib-1.2.9.tar.gz
tar -xf zlib-1.2.9.tar.gz
cd zlib-1.2.9
sh configure
make
cp libz.so.1.2.9 ../node_modules/canvas/build/Release/libz.so.X
cd ..

wget https://github.com/NixOS/patchelf/archive/refs/tags/0.18.0.tar.gz
tar -xf 0.18.0.tar.gz
cd patchelf-0.18.0
./bootstrap.sh
./configure --prefix="$HOME/.local"
make install
strip --strip-unneeded ~/.local/bin/patchelf
gzip -9 ~/.local/share/man/man1/patchelf.1

patchelf --replace-needed /lib64/libz.so.1 libz.so.X ./node_modules/canvas/build/Release/libpng16.so.16
patchelf --replace-needed libz.so.1 libz.so.X ./node_modules/canvas/build/Release/libpng16.so.16