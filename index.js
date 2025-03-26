const PS4Debug = require('./Utils/PS4Debug');

(async () => {
    const CF = new PS4Debug();

    try {
        await CF.connect('192.168.X.X');
        await CF.notify(222, 'Hello, World');

        const { processArray } = await CF.getProcessList();
        const pid = processArray.find(process => process.name.toLowerCase() === 'eboot.bin');

        if (pid) { 
            console.log('eboot.bin found!');

            path = '/data/';
            await CF.loadPRX(pid.name, path)
        }

    } catch (error) {
        console.log(error);
    } finally {
        CF.disconnect();
    }
})();