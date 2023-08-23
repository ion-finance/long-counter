import { Blockchain, SandboxContract, printTransactionFees } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { LongQueueCounter } from '../wrappers/LongQueueCounter';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

const QUEUE_SIZE = 20;

describe('LongQueueCounter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('LongQueueCounter');
    });

    let blockchain: Blockchain;
    let longQueueCounter: SandboxContract<LongQueueCounter>;
    let counters: SandboxContract<LongQueueCounter>[] = [];

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        const deployer = await blockchain.treasury('deployer');

        for (let i = 0; i < 3; i++) {
            const counter = await blockchain.openContract(
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

            const deployResult = await counter.sendDeploy(deployer.getSender(), toNano('0.05'));
            expect(deployResult.transactions).toHaveTransaction({
                from: deployer.address,
                to: counter.address,
                deploy: true,
                success: true,
            });

            counters.push(counter);
        }

        const counterDict = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address());
        const queue = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address());

        for (let i = 0; i < counters.length; i++) {
            counterDict.set(i, counters[i].address);
        }

        for (let i = 0; i < QUEUE_SIZE; i++) {
            queue.set(i, deployer.address);
        }

        longQueueCounter = blockchain.openContract(
            LongQueueCounter.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                    counters: counterDict,
                    queue,
                },
                code
            )
        );

        const deployResult = await longQueueCounter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: longQueueCounter.address,
            deploy: true,
            success: true,
        });
    });

    it('should increase counter', async () => {
        const increaser = await blockchain.treasury('increaser');
        const increaseResult = await longQueueCounter.sendExcute(increaser.getSender(), {
            value: toNano('2'),
            counter: 0,
            order_index: 0,
        });

        printTransactionFees(increaseResult.transactions);

        const counter = await longQueueCounter.getCounter();
        expect(counter).toEqual(QUEUE_SIZE * 3 + 1);

        for (let i = 0; i < counters.length; i++) {
            const lcounter = await counters[i].getCounter();
            expect(lcounter).toEqual(QUEUE_SIZE);
        }
    });
});
