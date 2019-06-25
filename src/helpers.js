const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});
const schema = require('./schema.json');

const isValidate = ajv.compile(schema);

const delay = () => new Promise(resolve => setTimeout(resolve, 4000));

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const isIdInDB = (db, id) => {
    return Object.keys(db).includes(id);
}

module.exports.isValidate = isValidate;
module.exports.delay = delay;
module.exports.generateId = generateId;
module.exports.isIdInDB = isIdInDB;