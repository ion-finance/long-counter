import { Dictionary, toNano } from 'ton-core';
import { LongQueueCounter } from '../wrappers/LongQueueCounter';
import { compile, NetworkProvider } from '@ton-community/blueprint';

const QUEUE_SIZE = 100;

export async function run(provider: NetworkProvider) {
    const counters = [];
    const code = await compile('LongQueueCounter');

    for (let i = 0; i < 3; i++) {
        const counter = await provider.open(
            LongQueueCounter.createFromConfig(
                {
                    id: i,
                    counter: 0,
                    counters: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
                    queue: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
                },
                code
            )
        );

        await counter.sendDeploy(provider.sender(), toNano('0.05'));

        await provider.waitForDeploy(counter.address);

        counters.push(counter);
    }

    const counterDict = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address());
    const queue = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address());

    for (let i = 0; i < counters.length; i++) {
        counterDict.set(i, counters[i].address);
    }

    for (let i = 0; i < QUEUE_SIZE; i++) {
        queue.set(i, counters[0].address);
    }

    const longQueueCounter = provider.open(
        LongQueueCounter.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
                counters: counterDict,
                queue,
            },
            code
        )
    );

    await longQueueCounter.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(longQueueCounter.address);

    console.log(counters);
    console.log(longQueueCounter.address);

    const tx = await longQueueCounter.sendExcute(provider.sender(), {
        value: toNano('4'),
        counter: 0,
        order_index: 0,
    });

    console.log(tx);
}
