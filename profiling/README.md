# Setup

## For Node v0.12.x

- install node-inspector using: `npm install -g node-inspector`  

- Start app in debug mode: `node --debug src/server.js`

- Start node inspector in other shell: `node-inspector`  
> Visit http://127.0.0.1:8080/?port=5858 to start debugging.

- Open profiler interface: [http://127.0.0.1:8080/?port=5858](http://127.0.0.1:8080/?port=5858)  

- go to the **Profiles** tab 

- select `Collect JavaScript CPU Profile` and press the **Start** button

- make your API calls

- press **Stop** button
