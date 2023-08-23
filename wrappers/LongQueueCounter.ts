import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Dictionary,
    Sender,
    SendMode,
} from 'ton-core';

export type LongQueueCounterConfig = {
    id: number;
    counter: number;
    counters: Dictionary<number, Address>;
    queue: Dictionary<number, Address>;
};

export function longQueueCounterConfigToCell(config: LongQueueCounterConfig): Cell {
    return beginCell()
        .storeUint(config.id, 32)
        .storeUint(config.counter, 32)
        .storeDict(config.queue)
        .storeDict(config.counters)
        .endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
    excute: 0xb762af63,
};

export class LongQueueCounter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new LongQueueCounter(address);
    }

    static createFromConfig(config: LongQueueCounterConfig, code: Cell, workchain = 0) {
        const data = longQueueCounterConfigToCell(config);
        const init = { code, data };
        return new LongQueueCounter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            counter: number;
            order_index: number;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.counter, 64)
                .storeUint(opts.order_index, 64)
                .endCell(),
        });
    }

    async sendExcute(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            counter: number;
            order_index: number;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.excute, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.counter, 64)
                .storeUint(opts.order_index, 64)
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
