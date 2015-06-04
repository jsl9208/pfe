#!/bin/sh

#Gotta get the new link for node.js
install_node() {
	if hash node 2>/dev/null; then
		echo "[INSTALL] Node JS already installed."
	else
		echo "[INSTALL] Installing Node JS..."
		wget http://nodejs.org/dist/v0.12.4/node-v0.12.4.tar.gz
		tar xvzf node-v0.12.4.tar.gz
		cd node-v0.12.4
		echo "[INSTALL] Go have a beer, this might take a while..."
		./configure
		make
		sudo make install
		sudo ldconfig
		rm zeromq-node-v0.12.4.tar.gz
		rm -rf node-v0.12.4
	fi
}

install_avahi_daemon() {
		echo "[INSTALL] Installing Avahi-daemon..."
		sudo apt-get install avahi-daemon libnss-mdns

}

install_avahi_utils() {
		echo "[INSTALL] Installing Avahi-utils..."
		sudo apt-get install avahi-utils
}


install_pd() {
	if hash pd-extended 2>/dev/null; then
		echo "[INSTALL] PureData already installed."
	else
		echo "[INSTALL] Installing PureData..."
		sudo apt-get install puredata
}

install_zmq() {
	echo "[INSTALL] Installing Zero MQ..."
	sudo apt-get install uuid-dev
	wget http://download.zeromq.org/zeromq-4.0.4.tar.gz
	tar xvzf zeromq-4.0.4.tar.gz
	cd zeromq-4.0.4
	./configure --with-pgm
	make
	sudo make install
	sudo ldconfig
	rm zeromq-4.0.4.tar.gz
	rm -rf zeromq-4.0.4
}

npm_install() {
	cd projects/manticore/
	npm install
}


install(){
	sudo apt-get update
	install_node
	install_avahi_daemon
	install_avahi_utils
	install_pd
	install_zmq
	npm_install
}


install

# Getting the repo from GitHub + installing all the node module
echo "[INSTALL] Getting the GitHub Repo ...."
git clone https://github.com/garnierclement/pfe
echo "Moving to pfe/projects/manticore"
cd pfe/projects/manticore
echo "[INSTALL] Installing all the node modules...."
npm install async
npm install body-parser
npm install bunyan
npm install express
npm install jade
npm install mdns
npm install osc
npm install performance-now
npm install request
npm install underscore
npm install uuid
npm install websocket
npm install ws
npm install zmq
echo "[Done] Let's run the project ...."

echo "[INSTALL] Installing Hostapd/Udhcp...."
sudo apt-get update
sudo apt-get install hostapd
sudo apt-get install udhcp


echo "[INSTALL] Activating Wireless on the Cubieboard...."

