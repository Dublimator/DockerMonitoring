const pcap = require('pcap');
const { exec } = require('child_process');
const fs = require('fs');

// Пороговые значения для различных типов DOS-атак
const SYN_FLOOD_THRESHOLD = 1000;
const UDP_FLOOD_THRESHOLD = 1000;
const ICMP_FLOOD_THRESHOLD = 1000;

// Инициализация счетчиков пакетов и записей атак
let synPackets = {};
let udpPackets = {};
let icmpPackets = {};
let attackRecords = {};

// Ограничение полосы пропускания для IP-адреса
function limitBandwidth(ipAddress) {
    const limitCmd = `tc qdisc add dev eth0 root handle 1: htb default 30 && tc class add dev eth0 parent 1: classid 1:1 htb rate 300mbit ceil 300mbit && tc filter add dev eth0 protocol ip parent 1:0 prio 1 u32 match ip dst ${ipAddress} flowid 1:1`;
    exec(limitCmd, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error limiting bandwidth for ${ipAddress}: ${err}`);
            return;
        }
        console.log(`Bandwidth limited for ${ipAddress}`);
    });
}

// Запись информации об атаке в JSON
function recordAttack(attackType, srcIp, isStart) {
    const timestamp = new Date().toISOString();

    if (isStart) {
        attackRecords[srcIp] = {
            type: attackType,
            ip: srcIp,
            start: timestamp,
            end: null
        };
    } else {
        if (attackRecords[srcIp]) {
            attackRecords[srcIp].end = timestamp;
        }
    }

    fs.writeFile('dos_attacks.json', JSON.stringify(attackRecords, null, 2), (err) => {
        if (err) throw err;
    });
}

// Определение типа DOS-атак
function detectDosAttack(packet) {
    if (packet.payload.ethertype === 0x0800) { // IPv4
        const ipPacket = packet.payload.payload;
        const srcIp = ipPacket.saddr.toString();
        const now = Date.now();

        if (ipPacket.protocol === 6) { // TCP
            const tcpPacket = ipPacket.payload;
            if (tcpPacket.flags.syn && !tcpPacket.flags.ack) {
                if (!synPackets[srcIp]) {
                    synPackets[srcIp] = { count: 0, timestamp: now };
                }
                synPackets[srcIp].count += 1;
                synPackets[srcIp].timestamp = now;
                if (synPackets[srcIp].count === SYN_FLOOD_THRESHOLD) {
                    recordAttack("SYN Flood", srcIp, true);
                    limitBandwidth(srcIp);
                }
            }
        } else if (ipPacket.protocol === 17) { // UDP
            if (!udpPackets[srcIp]) {
                udpPackets[srcIp] = { count: 0, timestamp: now };
            }
            udpPackets[srcIp].count += 1;
            udpPackets[srcIp].timestamp = now;
            if (udpPackets[srcIp].count === UDP_FLOOD_THRESHOLD) {
                recordAttack("UDP Flood", srcIp, true);
                limitBandwidth(srcIp);
            }
        } else if (ipPacket.protocol === 1) { // ICMP
            if (!icmpPackets[srcIp]) {
                icmpPackets[srcIp] = { count: 0, timestamp: now };
            }
            icmpPackets[srcIp].count += 1;
            icmpPackets[srcIp].timestamp = now;
            if (icmpPackets[srcIp].count === ICMP_FLOOD_THRESHOLD) {
                recordAttack("ICMP Flood", srcIp, true);
                limitBandwidth(srcIp);
            }
        }
    }
}

// Запуск захвата пакетов
const pcapSession = pcap.createSession('eth0', 'ip');
console.log('Запуск мониторинга DOS-атак...');

pcapSession.on('packet', (rawPacket) => {
    const packet = pcap.decode.packet(rawPacket);
    detectDosAttack(packet);
});

// Отслеживание окончания атак
setInterval(() => {
    const now = Date.now();
    const attackDurationThreshold = 60000; // 60 секунд без новых пакетов

    for (let ip in synPackets) {
        if (synPackets[ip].count >= SYN_FLOOD_THRESHOLD && (now - synPackets[ip].timestamp) > attackDurationThreshold) {
            recordAttack("SYN Flood", ip, false);
            delete synPackets[ip];
        }
    }

    for (let ip in udpPackets) {
        if (udpPackets[ip].count >= UDP_FLOOD_THRESHOLD && (now - udpPackets[ip].timestamp) > attackDurationThreshold) {
            recordAttack("UDP Flood", ip, false);
            delete udpPackets[ip];
        }
    }

    for (let ip in icmpPackets) {
        if (icmpPackets[ip].count >= ICMP_FLOOD_THRESHOLD && (now - icmpPackets[ip].timestamp) > attackDurationThreshold) {
            recordAttack("ICMP Flood", ip, false);
            delete icmpPackets[ip];
        }
    }
}, 60000);
