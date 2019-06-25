const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

const { scenario } = require('./scenario');
const { delay, isValidate } = require('./helpers');

class Transaction {
    constructor(){
        this.store = {};
        this.logs = [];
        this.restoredData = [];
    }

    async dispatch(scenario) {
        for(const step of scenario) {
            if (!isValidate(step)) {
                throw new Error(`The STEP ${JSON.stringify(step)} doesn't valid: ${ajv.errorsText(isValidate.errors)}`);
            }
        }

        for(const {index, meta, call} of scenario) {
            const storeBefore = this.store;

            this.store = {
                index,
                isSuccess: false
            };

            try {
                await call(this.store);

                this.store.isSuccess = true;

                this.logs = [
                    ...this.logs,
                    {
                        index,
                        meta,
                        storeBefore,
                        storeAfter: this.store,
                        error: null
                    }
                ];
            } catch (err) {
                const { name, message, stack } = err;
                console.log(message);

                const stepsForRestore = scenario.slice(0, index).reverse();

                for(const step of stepsForRestore) {

                    if (step.restore) {
                        try {
                            console.log(`Trying to restore STEP ${step.index}...`);
                            await step.restore(this.store);
                            this.restoredData.push({ index: step.index, restored: true, err: null});
                        } catch (err) {
                            const { name, message, stack } = err;
                            console.log("Restore is failed!", message);
                            
                            this.restoredData.push({ index: step.index, restored: false, error: { name, message, stack }});
                        }
                    }
                }

                this.logs = [
                    ...this.logs,
                    {
                        index,
                        meta,
                        storeBefore,
                        storeAfter: this.store,
                        error: {
                            name,
                            message,
                            stack
                        }
                    }
                ];

                this.store = null;

                break;
            }
        }
    }
}



const transaction = new Transaction();

(async() => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        const restoredData = transaction.restoredData; // []

        const isRestoreFailed = restoredData.length > 0 && restoredData.some(data => !data.restored);

        console.log('******************************');
        if(store && restoredData.length === 0) {
            console.log('Transaction completed successfully!')
        } else if (isRestoreFailed) {
            console.log('Transaction rollback with errors!');
        } else {
            console.log('Transaction rollback successfully!');
        }

        await delay();
        console.log('******************************');
        console.log('STORE AFTER TRANSACTION: ', store);
        console.log('******************************');
        console.log('TRANSACTION LOGS: ', logs);
        console.log('******************************');
        console.log('RESTORED INFO', restoredData);

    } catch (err) {
        console.log('Broken transaction', err);
        // Send email about broken transaction
    }
})();

