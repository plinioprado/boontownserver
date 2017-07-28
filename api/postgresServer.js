import pool from '../database';
import admin from 'firebase-admin';

export function getItems() {

  return new Promise(async (res, rej) => {
    try {
       const queryText =  `SELECT itemid AS id, title, description, imageurl, itemowner, createdon, available, borrower FROM items`;
       let items = await pool.query(queryText);
       res(items.rows);
    } catch(error) {
        rej(error);
    }
  });
}

export function getItem(id) {

  return new Promise(async (res, rej) => {
    try {
       const queryText =  `SELECT i.itemid AS id, i.title, i.description, i.imageurl, itemowner, createdon, available, borrower FROM items WHERE itemid = ${id}`;
       let items = await pool.query(queryText);
       console.log(items);
       res(items.rows[0]);
    } catch(error) {
        rej(error);
    }
  });
}

export function addItem2(args) {

    try {

      return new Promise(async (resolve, reject) => {
        const itemQuery = {
          text: `INSERT INTO items () VALUES ();`,
          values: [args.a, args.b]
        }
        const newItem = await pool.query(itemQuery);
        function inserttags(tags) {
          return tags.map(tag => {
            return `(${item.id}, ${tag.id})`;
          }).join(',')
        };
      const tagQuery = {
          text: 'INSERT INTO itemtags (itemid, tagid) VALUES (${insertTags(args.tags)});'
      }
      const tags = await pool.query(tagQuery);
      resolve({id: newItem.rows[0].id});
      });

    } catch(err) {
      console.log(err);
      reject(err);
    }

  // return {
  //   title: 'newtitle',
  //   description: 'my description msnm fjksl hfjlhj fskjlh fljks hjkflsjlsf',
  //   imageurl: 'http://hjklhjklhjklhjklhjlkkhjl',
  //   tags: [{id: 1, title: 'aaaaaa'}, {id: 2, title: 'bbbbbb'}],
  //   itemowner: '1111111111111111'
  // }
};

export function getTags(id) {

  return new Promise(async (res, rej) => {
    try {
       const queryText =  `SELECT t.title FROM itemtags it INNER JOIN tags t ON it.tagid = t.tagid WHERE it.itemid = ${id}`;
       let items = await pool.query(queryText);
       res(items.rows);
    } catch(error) {
        rej(error);
    }
  });
}

export function getUser(id) {

  return new Promise(async (res, rej) => {
    try {
        let user = await pool.query(`SELECT * FROM user_profiles WHERE id='${id}'`);
        const fbUser = await admin.auth().getUser(id);
        user = user.rows[0];
        user = {...user, email: fbUser.email };
        res(user);
    } catch(error) {
        console.log(error);
        rej(error);
    }
  });
}

export function createUser2(args, context) {

    return new Promise(async (res, rej) => {

      try {

        let fbUser = await admin.auth().createUser({
          email: args.email,
          password: args.password
        });
        
        const query = {
          text: `INSERT INTO user_profiles (id, fullname, bio) VALUES ($1, $2, $3) RETURNING *`,
          values: [fbUser.uid, args.fullname, args.bio]
        }
        let pgUser = await pool.query(query);

        let user = { ...pgUser.rows[0], email: fbUser.email, id: fbUser.uid };
        res(user);

      } catch(error) {
          console.log(error);
          rej(error);
      }
  });
}
