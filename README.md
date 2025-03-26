# PRXLoader

This script utilizes the PS4Debug module to connect to a PlayStation 4 console, send a notification, retrieve the process list, and load a PRX module into a running process.

# Configuration
- Update the IP address in CF.connect('192.168.X.X') to match your PS4.
- Ensure the PRX file exists at /data/ on the PS4.
- Place the .sprx file you want to load into the /data/ folder on your PS4. In the script, set the path as:
`path = '/data/<filename>.sprx';`

# Note
- This only works with frame4 only!
- There is still an issue or bug that needs to be fixed at some point. I'll get around to it eventually.

# Credit
  
- **Frame4** - [`DeathRGH`](https://github.com/DeathRGH/frame4)
- **PS4Debug** - [`ps4debug`](https://github.com/SiSTR0)
