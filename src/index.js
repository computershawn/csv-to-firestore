// import * as admin from 'firebase-admin';
// import * as csv from 'csvtojson';
// import * as fs from 'fs-extra';

const admin = require('firebase-admin');
const csv = require('csvtojson');
const fs = require('fs-extra');
// import * as args from 'commander';

// args
//   .version("0.0.1")
//   .option("-s, --src <path", "Source file path")
//   .option("-i, --id [id]", "Field to use for document ID")
//   .parse(process.argv);


// Firebase App Initialization
const serviceAccount = require('../credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const colPath = 'sales';
const sourceFile = 'SalesJan2009.csv';
let specificId;


// Main migration function
async function migrate() {
  try {
    // const colPath = args.collection;
    // const file = args.src;

    // Exit if missing necesssary data
    if (!colPath || !sourceFile) return Promise.reject('Missing required data');
    const colRef = db.collection(colPath);
    const batch = db.batch();

    let data = [{"animal":"dog"}, {"animal":"cat"}, {"animal":"mouse"}];

    // if (sourceFile.includes('.json')) {
    //   data = await fs.readJSON(sourceFile);
    // }

    // if (sourceFile.includes('.csv')) {
    //   data = await readCSV(sourceFile);
    //   console.log('got data');
    // }

    // for (const item of data) {
    //   // const id = args.id ? item[args.id].toString() : colRef.doc().id;
    //   const id = specificId ? item[specificId].toString() : colRef.doc().id;
    //   const docRef = colRef.doc(id);
    //   batch.set(docRef, item);
    // }

    data.forEach((item, count) => {
      if(count < 500) {
        // const id = specificId ? item[specificId].toString() : colRef.doc().id;
        // const docRef = colRef.doc(id);
        // batch.set(docRef, item);
        const id = specificId ? item[specificId].toString() : colRef.doc().id;
        const docRef = colRef.doc(id);
        console.log(item);
        batch.set(docRef, item);
      }
    });
    
    // Commit the batch
    // await batch.commit();
    // console.log('Firestore updated. Migration was a success!');
  } catch (error) {
    console.error('Migration failed', error);
  }
}

async function readCSV(path) {
  return new Promise((resolve, reject) => {
    let lineCount = 0;

    csv()
      .fromFile(path)
      .on('data', data => {
        // fired on every row read
        lineCount++;
        // if(lineCount < 2) {
        //   const jsonStr = data.toString('utf8');
        //   console.log(jsonStr);
        // }
      })
      .on('done', data => {
        console.info(`CSV read complete. ${lineCount} rows parsed`);
        resolve(data);
      })
      .on('error', err => {
        console.log('noooo');
        reject(err);
      });
  })
}

// Minimal version probably not very good
// async function readCSV_alt(file) {
//     console.log('getting data');
//     const data = await csv().fromFile(sourceFile);
//     console.log(`CSV read complete. ${data.length} rows parsed`);
// }

// Run
migrate();
