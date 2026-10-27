#!/bin/bash

# Advertise the MediaCMS host on the local network through Bonjour.
name=mytube
interface=en0
port=80
service_pid=

stop_service() {
    if [[ -n "$service_pid" ]]; then
        kill "$service_pid" 2>/dev/null || true
        wait "$service_pid" 2>/dev/null || true
        service_pid=
    fi
}

trap 'stop_service; exit 0' INT TERM

while true; do
    ip=$(/usr/sbin/ipconfig getifaddr "$interface" 2>/dev/null || true)
    if [[ -z "$ip" ]]; then
        sleep 5
        continue
    fi

    /usr/bin/dns-sd -P "$name" _http._tcp local "$port" "$name.local" "$ip" &
    service_pid=$!

    while kill -0 "$service_pid" 2>/dev/null; do
        sleep 10
        current_ip=$(/usr/sbin/ipconfig getifaddr "$interface" 2>/dev/null || true)
        [[ "$current_ip" == "$ip" ]] || break
    done

    stop_service
    sleep 5
done
