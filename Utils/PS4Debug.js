/**
 * PORTED FROM C# TO JS BY Cykotic
 */

const {
    default: PromiseSocket
} = require('promise-socket');
const {
    Socket
} = require('net');
const Utils = require('./utils');

class PS4Debug {
    constructor() {
        this.socket = new PromiseSocket(new Socket());
    }

    async connect(ip, port = 2811) {
        try {
            await this.socket.connect(port, ip);
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    disconnect() {
        this.socket.destroy();
        return true;
    }

    reboot() {
        Utils.sendCMDPacket(this.socket, Utils.CMDS.CMD_CONSOLE_REBOOT, 0);
    }


    async notify(messageType, message) {
        const rawMessage = `${message}\0`;
        const messageBuffer = Buffer.from(rawMessage, 'ascii');

        try {
            Utils.sendCMDPacket(
                this.socket,
                Utils.CMDS.CMD_CONSOLE_NOTIFY,
                Utils.CMDS.CMD_CONSOLE_NOTIFY_PACKET_SIZE,
                messageType,
                rawMessage.length
            );
            await this.socket.write(messageBuffer);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getProcessList() {
        try {
            Utils.sendCMDPacket(this.socket, Utils.CMDS.CMD_PROC_LIST, 0);
            await Utils.CheckStatus(this.socket);

            await this.socket.read(4); // read the first four bytes (00 00 00 08)

            const numberBuffer = await this.socket.read(4);
            const number = numberBuffer.readUInt32LE();

            const data = await this.socket.read(number * Utils.CMDS.PROC_LIST_ENTRY_SIZE);

            const processArray = Array.from({
                length: number
            }, (_, i) => {
                const offset = i * Utils.CMDS.PROC_LIST_ENTRY_SIZE;
                const processName = data.toString('ascii', offset, offset + 32).replace(/\0.*$/, '').replace(/^[^a-zA-Z0-9]+/g, '');
                const processId = data.readUInt32LE(offset + 32);
                return {
                    name: processName,
                    id: processId
                };
            });

            return {
                number,
                processArray
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    async loadPRX(procName, prxPath) {
        try {
            const procNameBuffer = Buffer.from(procName.padEnd(32, '\0'), 'ascii');
            const prxPathBuffer = Buffer.from(prxPath.padEnd(100, '\0'), 'ascii');
            Utils.sendCMDPacket(this.socket, Utils.CMDS.CMD_PROC_PRX_LOAD, 0);
            Utils.sendData(this.socket, procNameBuffer);
            Utils.sendData(this.socket, prxPathBuffer);
            await Utils.CheckStatus(this.socket);
            const dataBuffer = await Utils.receiveData(this.socket, Utils.CMDS.CMD_PROC_PRX_LOAD_RESPONSE_SIZE);
            const result = dataBuffer.readInt32LE(0);
            return result;
        } catch (error) {
            console.error(`Error loading PRX:`, error);
            throw new Error(error);
        }
    }

    async unloadPRX(procName, prxHandle) {
        try {
            const procNameArray = Buffer.from(procName.padEnd(32, '\0'), 'ascii');
            Utils.sendCMDPacket(this.socket, Utils.CMDS.CMD_PROC_PRX_UNLOAD, Utils.CMDS.CMD_PROC_PRX_UNLOAD_PACKET_SIZE, prxHandle);
            await Utils.sendData(this.socket, procNameArray);
            await Utils.CheckStatus(this.socket);
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = PS4Debug;