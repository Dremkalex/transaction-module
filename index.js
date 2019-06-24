const delay = () => new Promise(resolve => setTimeout(resolve, 4000));

class Transaction {
    constructor(){
        this.store = {};
        this.logs = [];
    }

    async dispatch(scenario) {
        for(const {index, meta, call, restore} of scenario) {
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

                console.log(`STEP: ${index}, SUCCESS: ${this.store.isSuccess}`);
                console.log('logs', this.logs);
            } catch (err) {
                const { name, message, stack } = err;
                if (restore) {
                    try {
                        console.log('Trying to restore...', err);
                        await restore(this.store);
                        console.log('Restoring successful!');
                    } catch (err) {
                        console.log("Restore is failed!", err);
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

                console.log(`STEP: ${index}, SUCCESS: ${this.store.isSuccess}`);
                console.log('LOGS', this.logs);

                this.store = null;

                console.log('Rollback is completed! STORE: ', this.store);
                break;
            }
        }
    }
}


const scenario = [
    {
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async (store) => {
            console.log('calling STEP 1...');
            await delay();
        },
        restore: async (store) => {
            console.log('restoring STEP 1: ', store);
            await delay();
            throw new Error('Error in restore STEP 1!')
        }
    },
    {
        index: 2,
        meta: {
            title: 'Add customer',
            description: 'This action will add some customer'
        },
        call: async (store) => {
            console.log('calling STEP 2...');
            await delay();
            //throw new Error('Error in calling STEP 2');
        },
        restore: async (store) => {
            console.log('restoring STEP 2 ...');
            await delay();
            console.log('restoring STEP 2 completed!');
        }
    },
    {
        index: 3,
        meta: {
            title: 'Delete customer',
            description: 'This action will delete some customer'
        },
        call: async (store) => {
            console.log('calling STEP 3...');
            await delay();
            throw new Error('Error in calling STEP 3')
        },
        restore: async (store) => {
            console.log('restoring STEP 3 ...');
            await delay();
            throw new Error('Error in restore STEP 3!')
            console.log('store in restore STEP 3: ', store);
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        if(store) {
            console.log('Transaction completed successfully')
        } else {
            console.log('Transaction rollback successfully')
        }
        console.log('STORE AFTER TRANSACTION: ', store);
        console.log('LOGS AFTER TRANSACTION: ', logs);
    } catch (err) {
        console.log('broken transaction', err);
        // Send email about broken transaction
    }
})();

