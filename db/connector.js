var mysql = require('mysql');

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "mlcms"
});

module.exports = {
    connector: (query, callback) => {
        conn.connect( () => {
            try{
                conn.query(query, (err, result, fields) => {
                    callback(result)
                })
            }
            catch (err){
                console.log(err)
                callback([]);
            }
        })
    }
}
