const { db, credentials } = require('./mock');
const { delay, generateId, isIdInDB } = require('./helpers');

const id = generateId();

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Read all customers',
            description: 'This action is responsible for reading customers'
        },
        call: async (store) => {
            console.log('calling STEP 1...');
            await delay();
            console.log('STEP 1, all customers: ', Object.values(db));
        },
    },
    {
        index: 2,
        meta: {
            title: 'Add customer',
            description: 'This action will add customer to DB'
        },
        call: async (store) => {
            console.log('calling STEP 2...');
            await delay();
            
            db[id] = {
                name: 'Pit',
                profession: 'manager'
            };
            console.log('STEP 2, customers after adding: ', Object.values(db));
        },
        restore: async (store) => {
            console.log('restoring STEP 2 ...');
            await delay();

            const isCustomerInDb = isIdInDB(db,id);
            
            if(isCustomerInDb) {
                //Uncomment the next line to play scenario with failed restore the step
                //throw new Error('Server error: we can not delete the user :(')
                delete db[id];
                console.log('restoring STEP 2 completed!', db);
            } else {
                console.log('User does not exist in DB', db);
            }
        }
    },
    {
        index: 3,
        meta: {
            title: 'Add customer credentials',
            description: 'This action will add the customer credentials'
        },
        call: async (store) => {
            console.log('calling STEP 3...');
            await delay();

            credentials[id] = {
                login: 'pit@gmail.com',
                password: '54321',
           };
           console.log('STEP 3, credentials after adding: ', Object.values(credentials));
           //Uncomment the next line to play scenario with restore data the step
           //throw new Error('Add customer credentials failed!');
        },
        restore: async (store) => {
            console.log('restoring STEP 3 ...');
            await delay();
            
            const isCustomerInDb = isIdInDB(credentials, id);
            
            if(isCustomerInDb) {
                //Uncomment the next line to play scenario with failed restore the step
                //throw new Error('Server error: we can not delete user data :(')
                delete credentials[id];
                console.log('restoring STEP 3 completed!', credentials);
            } else {
                console.log('User data does not exist in Credentials', credentials);
            }
        }
    }
];

module.exports.scenario = scenario;