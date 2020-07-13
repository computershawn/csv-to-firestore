// import * as admin from 'firebase-admin';
// import * as csv from 'csvtojson';
// import * as fs from 'fs-extra';

const admin = require('firebase-admin');
const csv = require('csvtojson');
const fs = require('fs-extra');

// Firebase App Initialization
const serviceAccount = require('../credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Main migration function
async function migrate(collectionPath, sourceFile, specificId) {
  try {
    // Exit if missing necesssary data
    if (!collectionPath || !sourceFile) return Promise.reject('Missing required data');
    const colRef = db.collection(collectionPath);
    const batch = db.batch();

    let data;

    if (sourceFile.includes('.json')) {
      data = await fs.readJSON(sourceFile);
    }

    if (sourceFile.includes('.csv')) {
      let lineCount = 0;
      data = await csv().fromFile(sourceFile)
        .on('data', data => {
          // fired on every row read
          lineCount++;
        })
        .on('done', data => {
          console.info(`CSV read complete. ${lineCount} rows parsed`);
        })
        .on('error', err => {
          console.log('Something went wrong :(');
        });

      data.forEach((item, count) => {
        if(count < 25) {
          const id = specificId ? item[specificId].toString() : colRef.doc().id;
          const docRef = colRef.doc(id);
          batch.set(docRef, item);
        }
      });
    }
    
    // Commit the batch
    await batch.commit()
      .then(res => console.log('Firestore updated. Migration was a success!'));
  } catch (error) {
    console.error('Migration failed', error);
  }
}

// TODO: Move CSV-to-JSON conversion out of migrate
// function and into its own function similar to this
// readCSV. This one is broken but could serve as a
// starting point
// async function readCSV(path) {
//   return new Promise((resolve, reject) => {
//     let lineCount = 0;

//     csv()
//       .fromFile(path)
//       .on('data', data => {
//         // fired on every row read
//         lineCount++;
//       })
//       .on('done', data => {
//         console.info(`CSV read complete. ${lineCount} rows parsed`);
//         resolve(data);
//       })
//       .on('error', err => {
//         console.log('noooo');
//         reject(err);
//       });
//   })
// }

// Run
const collectionPath = 'sales';
const sourceFile = 'SalesJan2009.csv';
let specificId;

migrate(collectionPath, sourceFile, specificId);
