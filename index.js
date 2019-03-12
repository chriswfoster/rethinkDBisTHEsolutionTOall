const r = require('rethinkdb')
const express = require('express');
const cors = require('cors');
const {json} = require('body-parser');


const port = 3000;

const app = express();
app.use(cors());
app.use(json());

let connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
})

// r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
//     if(err) throw err;
//     r.db('test').tableCreate('authors').run(conn, function(err, res) {
//         if(err) throw err;
//         console.log(res);
//         r.table('tv_shows').insert({ name: 'Star Trek TNG' }).run(conn, function(err, res)
//         {
//             if(err) throw err;
//             console.log(res);
//         });
//     });
// });

app.post('/api/createTable', (req, res) => {
    r.db('test').tableCreate('authors').run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    })
    res.status(200).json({message: 'Good'})
})


app.post('/api/addTvShow', (req, res) => {
    const {person} = req.body
    r.table('authors').insert(person).run(connection, function(err, result) {
        if (err) throw err;
        // console.log(JSON.stringify(result, null, 2));
        res.status(200).json({message: result})
    })
 
})

app.post('/api/addShows', (req, res)=> {
    r.table('authors').insert([
        { name: "William Adama", tv_show: "Battlestar Galactica",
          posts: [
            {title: "Decommissioning speech", content: "The Cylon War is long over..."},
            {title: "We are at war", content: "Moments ago, this ship received word..."},
            {title: "The new Earth", content: "The discoveries of the past few days..."}
          ]
        },
        { name: "Laura Roslin", tv_show: "Battlestar Galactica",
          posts: [
            {title: "The oath of office", content: "I, Laura Roslin, ..."},
            {title: "They look like us", content: "The Cylons have the ability..."}
          ]
        },
        { name: "Jean-Luc Picard", tv_show: "Star Trek TNG",
          posts: [
            {title: "Civil rights", content: "There are some words I've known since..."}
          ]
        }
    ]).run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    })
    res.status(200).json({message: 'Good'})
     
})

app.get('/api/getShows', (req, res) => {
    r.table('authors').run(connection, (err, cursor) => {
        if (err) throw err;
        cursor.toArray((err, result) => {
            if (err) throw err;
            console.log(JSON.stringify(result, null, 2));
            res.status(200).send({data: result})
        })
    })
})

app.get('/api/findAuthorByName', (req, res) => {

    const {user} = req.query;
    console.log(user)
    r.table('authors').filter(r.row('name').eq(user))
        .run(connection, (err, cursor) => {
            if (err) throw err;
            cursor.toArray((err, result) => {
                if (err) throw err;
                console.log(JSON.stringify(result, null, 2));
                res.status(200).json({data: result})
            })
        })
})

app.put('/api/setEveryoneToFictional',(req, res) => {
    r.table('authors')
    .update({type: "fictional"})
    .run(connection, (err, result) => {
        if (err) throw err;
        console.log('updated the person')
    })
})

app.delete('/api/deleteAuthorById', (req, res) => {
    r.table('authors')
    .filter(r.row('id').eq(req.query.id))
    .delete()
    .run(connection, (err, result) => {
        if (err) throw err;
        console.log('People deleted')
        res.status(200).json({data: result})
    })
})

app.put('/api/changeSomeonesType', (req, res) => {
    const {name, type} = req.query
    r.table('authors')
    .filter(r.row('name').eq(name))
    .update({type: type})
    .run(connection, function(err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
        res.status(200).json({data: result})
    });
})

setTimeout( () => {
    r.table('authors').changes().run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.each(function(err, row) {
            if (err) throw err;
            console.log(JSON.stringify(row, null, 2));
            console.log('This happened')
        });
    });
}, 3000)




app.listen(port, ()=> console.log('Listenong on port: ', port))