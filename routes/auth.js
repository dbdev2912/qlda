const express = require('express');
const router = express.Router()

const { Table } = require('../module/table');

router.get(`/session`, (req, res) => {
    const { auth } = req.session;
    res.send({ session: auth })
})

router.post(`/login`, (req, res) => {
    const { username, password } = req.body;
    const accounts = new Table("accounts");
    accounts.selectOne("account_string", username, ( result ) => {
        if(result.length > 0){
            const account = result[0]

            if( account.pwd_string === password ){

                req.session.auth = { ...account, pwd_string: "a hi hi sao biet dc :>" };
                res.send({ success: true, msg: "" })

            }else{
                res.send({ success: false, msg: "Sai mật khẩu gòi." })
            }
        }else{
            res.send({ success: false, msg: "Người dùng khum tồn tại." })
        }
    })
})

router.post(`/signup`, (req, res) => {
    const { auth } = req.body;
    const accounts = new Table("accounts");
    const { account_string, pwd_string, fullname, email } = auth;
    const values = [
        { field: "account_string", value: account_string },
        { field: "pwd_string", value: pwd_string },
        { field: "fullname", value: fullname },
        { field: "email", value: email }
    ]


    accounts.selectOne( "account_string", account_string, (result) => {
        if(result.length > 0){
            res.send({ success: false, msg: "Người dùng đã tồn tại!" })
        }else{
            accounts.selectOne( "email", email, (result) => {
                if( result.length > 0 ){
                    res.send({ success: false, msg: "Email này đã được dùng cho một tài khoản khác !" })
                }else{
                    accounts.insertOne( values, ( result ) => {
                        accounts.selectOne( "account_string", account_string, (result) => {
                            const account = result[0]
                            req.session.auth = { ...account, pwd_string: "a hi hi sao biet dc :>" };
                            res.send({ success: true, msg: "" })
                        })
                    })
                }
            })
        }
    })
})


router.get('/signout', ( req, res ) => {
    delete req.session.auth;
    
    res.send({ success: true });
})
module.exports = { router }
