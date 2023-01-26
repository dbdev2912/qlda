const express = require('express');
const router = express.Router();
const { Table } = require('../module/table');
const { connector } = require('../db/connector');
const { id } = require('../module/modulars');

router.get('/tables', (req, res) => {
    const tablesConnector = new Table('tables');
    tablesConnector.selectAll( (result) => {
        const tables = result;
        const fieldsConnector = new Table('fields');
        fieldsConnector.selectAll( (result) => {
            const fields = result;
            connector( `
                SELECT * FROM _keys WHERE key_type = 'primary';
                `, (result) => {
                const keys = result ? result : [];
                for( let i = 0; i < fields.length; i++ ){
                    let field = fields[i]
                    for( let j = 0; j < keys.length; j++){
                        let key = keys[j]
                        if( field.field_id === key.field_id ){
                            fields[i] = { ...field, is_primary: true }
                        }
                    }
                }
                const data = tables.map( table => {
                    const { table_id } = table;
                    table.fields = fields.filter((field) => field.table_id === table_id );
                    return table;
                })
                res.send({ tables: data })
            })
        })
    })
})

router.post('/tables', (req, res) => {
    const tablesConnector = new Table('tables');
    const { table } = req.body;
    const { table_name, table_alias } = table
    const values = [
        { field: "table_name", value: table_name },
        { field: "table_alias", value: table_alias }
    ]
    tablesConnector.insertOne( values , result => {
        const table_id = result.insertId;
        connector(`
            CREATE TABLE ${table_name}( id INT PRIMARY KEY NOT NULL );
        `, rlt => {
            const fields = new Table('fields');
            fields.insertOne([
                { field: "table_id", value: table_id },
                { field: "field_alias", value: "ID" },
                { field: "field_name", value: id() },
                { field: "nullable", value: "1" },
                { field: "field_props", value: JSON.stringify({ "DEFAULT_PROPS": "DUOC CHUA ?"}) },
                { field: "field_data_type", value: "Int" },
            ], ( rlt ) => {
                const keys = new Table('_keys');
                const field_id = rlt.insertId;

                keys.insertOne([
                    { field: "field_id", value:  field_id },
                    { field: "key_type", value: "primary" },
                ], (rlt) => {
                    fields.selectOne( "field_id", field_id, result => {
                        const field = { ...result[0], is_primary: true };
                        res.send({ table_id, field })
                    })
                })
            })
        });

    })
})

const alterPrimaryKeys = ( pks ) => {

}

router.post('/alter/table', ( req, res ) => {
    const { table_id, field } = req.body;
    const tablesConnector = new Table('fields');
    const field_name = id();
    const values = [
        { field: "table_id", value: table_id },
        { field: "field_name", value: field_name },
        { field: "field_alias", value: field.field_alias },
        { field: "nullable", value: field.is_nullable === true ? "1" : "0" },
        { field: "field_data_type", value: field.data_type },
        { field: "default_value", value: field.default_value },
        { field: "field_props", value: field.props ? JSON.stringify(field.props) : null }
    ]
    if( field.is_primary ){
        /*
            new primary column
            select all old primary keys and recombine to new collection of keys
            then alter table
        */
        tablesConnector.insertOne(values, (result) => {
            const field_id = result.insertId;
            const keys = new Table('_keys');
            keys.insertOne( [
                { field: "field_id", value: field_id },
                { field: "key_type", value: "primary" },
            ], (result) => {

                connector(`

                    SELECT * FROM _keys
                    WHERE key_type = 'primary' and field_id IN (
                        SELECT field_id FROM fields WHERE table_id = ${table_id}
                    );

                `, result => {
                    const pks = result;
                    if( result.length > 0 ){
                        alterPrimaryKeys( pks );
                    }
                    tablesConnector.selectOne( "field_id", field_id, (result) => {
                        const f = result[0]
                        res.send({ field: {...f, is_primary: true} })
                    })
                })

            })
        })
    }else{

        tablesConnector.insertOne(values, (result) => {
            const field_id = result.insertId;
            tablesConnector.selectOne( "field_id", field_id, (result) => {
                const f = result[0]
                res.send({ field: f })
            })
        })
    }

})

router.get('/table/foreigns/:table_id', (req, res) => {
    const { table_id } = req.params;
    connector(`
        SELECT TABLES.table_id, table_name, table_alias, field_id, field_name, field_alias
        FROM TABLES INNER JOIN FIELDS
        ON FIELDS.TABLE_ID = TABLES.TABLE_ID
        WHERE FIELD_ID IN (
        	SELECT REFERENCE_ON FROM _keys
        	WHERE FIELD_ID IN
        	(
        		SELECT FIELD_ID
        		FROM tables AS T INNER JOIN fields AS F
        			ON T.TABLE_ID = F.TABLE_ID
        		WHERE T.TABLE_ID = ${ table_id }
        	) AND KEY_TYPE = 'foreign'
        )
    `, (result) => {
        const foreignKeys = result;
        if( foreignKeys ){

            connector(`
                SELECT * FROM FIELDS AS F INNER JOIN _KEYS AS K
                ON F.FIELD_ID = K.FIELD_ID WHERE TABLE_ID = ${table_id}
                AND KEY_TYPE = 'foreign'
                `, (result) => {

                    const fields = result.map( field => {
                        foreignKey = foreignKeys.filter( fk => fk.field_id === field.reference_on )[0];
                        return {
                            field: {
                                field_id: field.field_id,
                                field_name: field.field_name,
                                field_alias: field.field_alias,
                            },
                            reference: {
                                table_id: foreignKey.table_id,
                                table_name: foreignKey.table_name,
                                table_alias: foreignKey.table_alias
                            },
                            on: {
                                field_id: foreignKey.field_id,
                                field_name: foreignKey.field_name,
                                field_alias: foreignKey.field_alias,
                            }
                        }
                    });
                    res.send( { fields } )
                })
        }else{
            res.send({ fields: [] })
        }
    })
})

router.post('/table/key/foreign', ( req, res ) => {
    const { key } = req.body;
    const keysConnector = new Table('_keys');
    const values = [
        { field: "field_id", value: key.field.field_id },
        { field: "key_type", value: "foreign" },
        { field: "reference_on", value: key.on.field_id }
    ]
    keysConnector.insertOne( values, ( insertResult ) => {
        res.send({ insertResult })
    })
})

router.post('/alter/table/drop/column', (req, res) => {
    const { field_id } = req.body;
    const fieldsConnector = new Table('fields');
    const keysConnector = new Table('_keys');
    fieldsConnector.deleteOne( "field_id", field_id, (result) => {
        keysConnector.deleteOne("field_id", field_id, (result) => {
            res.send({ success: true })
        })
    })
})

router.post('/alter/table/modify/column', (req, res) => {
    const { data, type } = req.body;
    console.log(`IS PRIMARY: ${data.is_primary}`)
    const criteria = { field: "field_id", value: data.field_id };
    const values = [
        { field: "field_name", value: data.field_name },
        { field: "field_alias", value: data.field_alias },
        { field: "nullable", value: data.is_nullable == true ? "1" : "0" },
        { field: "field_data_type", value: type.name },
        { field: "default_value", value: data.default },
        { field: "field_props", value: data.props ? JSON.stringify(data.props) : null }
    ]

    const fieldsConnector = new Table('fields');
    fieldsConnector.updateOne( criteria, values, (result) => {
        fieldsConnector.selectOne( "field_id", data.field_id, (result) => {
            const newField = result[0];
            if( !data.is_primary ){

                connector(`
                    DELETE FROM _keys WHERE field_id = ${ data.field_id } AND key_type='primary';
                    `, (result) => {
                            res.send({ success: true, field: { ...newField, is_primary: false } })
                    })

            }else{

                const keysConnector = new Table('_keys');
                connector(`
                    SELECT * FROM _keys WHERE field_id = ${ data.field_id } AND key_type = 'primary'`
                , (result) => {
                    if( result.length > 0 ){
                        res.send({ success: true, field: { ...newField, is_primary: true } })
                    }else{
                        connector(`
                            INSERT INTO _keys(field_id, key_type) VALUES(${ data.field_id }, 'primary')`
                        , (result) => {

                            res.send({ success: true, field: { ...newField, is_primary: true } })
                        })
                    }
                })
            }
        })
    })
})

router.post('/modify/table', (req, res) => {
    const { table } = req.body;
    const tables = new Table('tables');
    tables.updateOne(
        { field: "table_id", value: table.table_id },
        [
            { field: "table_alias",  value: table.table_alias },
        ],
         ( result ) => {
             res.send( { result })
         }
    )
})

router.post('/drop/table', (req, res) => {
    const { table_id } = req.body;
    const tables = new Table('tables');
    tables.deleteOne('table_id', table_id, (result) => {
        connector(`
            DELETE FROM _keys WHERE
            field_id IN
                ( SELECT field_id FROM fields WHERE table_id = ${table_id} )
            OR reference_on IN
                ( SELECT field_id FROM fields WHERE table_id = ${table_id} )
        `, (result) => {
            res.send({ success: true })
        })
    })
})

module.exports = {
    router
}
