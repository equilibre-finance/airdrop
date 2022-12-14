'use strict'

let BLOCK_START, BLOCK_END;
const fs = require('fs');
// use this rpc for the scan
const rpcArchive = 'https://rpc.ankr.com/fantom';
const Web3 = require('web3');
const web3 = new Web3(rpcArchive);

const contractAddress = '0x12e569ce813d28720894c2a0ffe6bec3ccd959b2';
let address = [], hash = {};
const abi = JSON.parse(fs.readFileSync("./MigrationBurn.abi", "utf8"));
const ctx = new web3.eth.Contract(abi, contractAddress);

async function scanBlockchain(start, end) {
    let size = 1000;
    for (let i = start; i < end; i += size) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const from = i;
        const to = (i + size) - 1;
        console.log(`i=${i}, from=${from}, to=${to}`);
        try {
            const events = await ctx.getPastEvents({fromBlock: from, toBlock: to},
                function (error, events) {
                    console.log(events);
                    if (error) {
                        console.log(error);
                    } else {
                        for (let j = 0; j < events.length; j++) {
                            const e = events[j];
                            if (!e.event) continue;
                            console.log(e);
                            if (e.event != 'burn') continue;

                            const user = e.returnValues;
                            if (!hash[user.from]) {
                                hash[user.from] = true;
                                address.push(user.from);
                                console.log(`\t${user.from}`);
                            }
                            if (!hash[user.to] ) {
                                hash[user.to] = true;
                                address.push(user.to);
                                console.log(`\t${user.to}`);
                            }
                        }
                    }
                });
        }catch(e){
            console.log(e.toString());
        }
    }
    fs.writeFileSync('../solidly-migration-ftm.txt', address.join('\n'));
}

async function main() {
    // BLOCK_START = 46270093;
    BLOCK_START = 48892002;
    BLOCK_END = parseInt(await web3.eth.getBlockNumber());
    await scanBlockchain(BLOCK_START, BLOCK_END);
}

main();
