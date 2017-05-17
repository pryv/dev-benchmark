# NodeJS profiling guide

Here is a profiling guide for multiple Node versions

## Node v0.12.x

- install node-inspector using: `npm install -g node-inspector`  

- Start app in debug mode: `node --debug src/server.js`

- Start node inspector in other shell: `node-inspector`  
> Visit http://127.0.0.1:8080/?port=5858 to start debugging.

- Open profiler interface: [http://127.0.0.1:8080/?port=5858](http://127.0.0.1:8080/?port=5858)  

- go to the **Profiles** tab 

### CPU profiling

- select `Collect JavaScript CPU Profile` and press the **Start** button

- make your API calls

- press **Stop** button

- You can save the result by clicking "Save" in the left column. This can later be viewed in the profiler by pressing **Load** when `Collect JavaScript CPU Profile` is selected and choosing your file. Node-inspector requires your file to have the `.cpuprofile` extension in order to load it.

### Memory profiling

- Select `Record Heap Allocations`  

- Press **Start** and launch your call, you will review memory allocations plotted against time.

- When ready, you can take a snapshot of the Heap by pressing the *red* button

## Node v6.x.x

TODO
