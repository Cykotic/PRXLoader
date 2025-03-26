class Utils {
    constructor() {
        this.CMDS = {
            CMD_PACKET_MAGIC: 0xFFAABBCC,
            CMD_CONSOLE_NOTIFY: 0xBDDD0004,
            CMD_PROC_LIST: 0xBDAA0001,
            CMD_CONSOLE_REBOOT: 0xBDDD0001,
            CMD_PROC_PRX_LOAD: 0xBDAA000F,
            CMD_PROC_PRX_UNLOAD: 0xBDAA0010,
            CMD_PROC_PRX_UNLOAD_PACKET_SIZE: 4,
            PROC_LIST_ENTRY_SIZE: 36,
            CMD_CONSOLE_NOTIFY_PACKET_SIZE: 8,
            CMD_PROC_PRX_LOAD_RESPONSE_SIZE: 4,
            CMD_PACKET_SIZE: 12,
            NET_MAX_LENGTH: 1024,
        };
    }

    /**
     * Sends data through the socket in chunks.
     * @param {object} socket - The socket object.
     * @param {Buffer} data - The data to be sent.
     */
    async sendData(socket, data) {
        let offset = 0;
        while (offset < data.length) {
            const chunkSize = Math.min(this.CMDS.NET_MAX_LENGTH, data.length - offset);
            const chunk = data.subarray(offset, offset + chunkSize);
            await socket.write(chunk);
            offset += chunkSize;
        }
    }

    /**
     * Sends a command packet with specified fields.
     * @param {object} socket - The socket object.
     * @param {number} cmd - The command identifier.
     * @param {number} length - The length of the data.
     * @param {...any} fields - Additional fields for the packet.
     */
    sendCMDPacket(socket, cmd, length, ...fields) {
        const packet = Buffer.alloc(this.CMDS.CMD_PACKET_SIZE);
        packet.writeUInt32LE(this.CMDS.CMD_PACKET_MAGIC, 0);
        packet.writeUInt32LE(cmd, 4);
        packet.writeUInt32LE(length, 8);

        const buffers = fields.map(field => {
            if (typeof field === 'string') {
                return Buffer.from([field.charCodeAt(0)]);
            } else if (typeof field === 'number') {
                const buffer = Buffer.alloc(4);
                buffer.writeInt32LE(field, 0);
                return buffer;
            } else if (typeof field === 'bigint') {
                const buffer = Buffer.alloc(8);
                buffer.writeBigInt64LE(field, 0);
                return buffer;
            } else if (typeof field === 'boolean') {
                const buffer = Buffer.alloc(1);
                buffer.writeUInt8(field ? 1 : 0, 0);
                return buffer;
            } else if (Buffer.isBuffer(field)) {
                return field;
            }
        });

        const data = Buffer.concat(buffers);

        this.sendData(socket, packet);
        if (data.length > 0) {
            this.sendData(socket, data);
        }
    }

    /**
     * Receives data from the socket.
     * @param {object} socket - The socket object.
     * @param {number} length - The length of the data to be received.
     * @returns {Promise<Buffer>} - A promise that resolves to the received data.
     */
    async receiveData(socket, length) {
        const buffer = Buffer.alloc(length);
        let offset = 0;

        while (offset < length) {
            const chunk = await socket.read(Math.min(this.CMDS.NET_MAX_LENGTH, length - offset));
            chunk.copy(buffer, offset);
            offset += chunk.length;
        }

        return buffer;
    }

    /**
     * Receives status from the socket.
     * @param {object} socket - The socket object.
     * @returns {Promise<void>} - A promise that resolves when the status is received.
     */
    async CheckStatus(socket) {
        await socket.read(4);
    }
}

module.exports = new Utils();