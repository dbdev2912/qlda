var mysql = require('mysql');

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "qlda"
});

module.exports = {
    connector: (query, callback) => {
        conn.connect( () => {
            // try{
            //     conn.query(query, (err, result, fields) => {
            //         callback(result)
            //     })
            // }
            // catch (err){
            //     console.log(err)
            //     callback([]);
            // }
            // console.log( " \n"+query );
            conn.query(query, (err, result, fields) => {
                callback(result)
            })
        })
    }
}
