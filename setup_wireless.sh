#!/bin/sh

echo "[INSTALL] Installing Hostapd/Udhcp...."
sudo apt-get update
sudo apt-get install hostapd
sudo apt-get install udhcp

echo "[INFO] Activating Wireless on the Cubieboard...."
sudo modprobe bcmdhd op_mode=2
sudo ifconfig wlan0 up


