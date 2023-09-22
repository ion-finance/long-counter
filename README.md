# LongQueueCounter

## Introduction

Traverses multiple contracts and executes the tasks in the queue. Check the logical time and block separation of transaction messages on the testnet.


<img width="682" alt="bin" src="https://github.com/ion-finance/long-counter/assets/137777209/04e04d83-3aca-41de-82af-4e854f69810f">


## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Run scripts
Run 2 scripts.

`yarn blueprint run`

1. deployLongQueueCounter
2. incrementLongQueueCounter

### Result

Deployed Cotract : https://testnet.tonviewer.com/kQDLKYqIjBjc2X3wWbKigSeB5p2Exv-ldboLi6XiVSoVsli7

Test Tx : https://testnet.tonviewer.com/kQDLKYqIjBjc2X3wWbKigSeB5p2Exv-ldboLi6XiVSoVsli7/transaction/666912af9974f0721f217f13277519fb3d8f5d33604c895238222d105d4b6177
