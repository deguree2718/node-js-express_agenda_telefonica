const express = require('express');
const { cp } = require('fs');
const cors = require("cors");
const app = express();
const port = 4235;
const mysql = require('mysql2');

    const connection = mysql.createConnection({
        host:'localhost',
        port: 3306,
        user:'root',
        password:'root',
        database:'projetosaulo',
    });

    app.listen(port);

    app.use(cors());

    connection.connect();

    const corsOpt = {
        origin: '*'
    }

    app.get('/entidade', cors(corsOpt), function(req,res){
        try{
            connection.beginTransaction();
            connection.query('SELECT * from entidade', (err, rows, fields) => {
                if (err) throw err
                res.json(rows);
              });
            return res;
        }
        catch (erro){
            connection.rollback();
        }
        finally{
            connection.commit();
        }
    });

    app.post('/new-entidade', cors(), function(req, res){
        try{
            connection.beginTransaction();
            let newId = 0;
            connection.query("select (max(identidade) +1) as new_id from entidade", (err, rows, fields)=> {
                newId = rows[0].new_id;
            })
            connection.query("insert into entidade values(" + newId + ",'"+
                req.body.nome
                +"','"+
                req.body.registro_nacional
                +"','"+
                req.body.email
                +"','"+
                req.body.sexo
                +"','"+
                req.body.login
                +"','"+
                req.body.senha
                +"');");
            let newIdEndereco = 0;
            connection.query("select (coalesce(max(idendereco),0) +1) as newIdEndereco from endereco", (err, rows, fields) => {
                newIdEndereco = rows[0].newIdEndereco;
            })
            connection.query("insert into endereco values("+
            newIdEndereco
            +",'"+
            req.body.logradouro + " "+
            req.body.numero + "', '"+
            req.body.cidade+"','"+
            req.body.estado+"', "+
            newId+")");
            res.statusCode(200)
        }
        catch(err){
            connection.rollback();
        }
        finally{
            connection.commit();
        }
    });

    app.post('/deleta-entidade', cors(corsOpt), function(req, res){
        try{
            connection.beginTransaction();
            connection.query('DELETE from entidade where identidade = '+req.body.id_entidade, (err, rows, fields) => {

            });
            connection.commit();
        }
        catch (err){
            connection.rollback;
        }
    })