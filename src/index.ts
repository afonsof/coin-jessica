import express from 'express'
import bodyParser from 'body-parser'
import pgPromise from 'pg-promise'

import { listarUsuarios } from './usuario/rotas/listar-usuarios'

const pgp = pgPromise()

const site = express()                      
site.use(bodyParser.json())    
const port = 3000  

const client = pgp({
    host: 'localhost',
    port: 5432,
    user: 'example',
    password: 'example',
    database: 'postgres'
})

// aqui vão todas as todas as rotas
listarUsuarios(site, client)

site.listen(port, () =>{
    console.log(`Example app listening on port ${port}`)
})