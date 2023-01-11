import express from 'express'
import bodyParser from 'body-parser'
import pgPromise from 'pg-promise'


import { getUsuarios } from './usuario/rotas/get-usuarios'
import { listarUsuarios } from './usuario/rotas/listar-usuarios'
import { createUsuarios } from './usuario/rotas/create-usuarios'
import { updateUsuario } from './usuario/rotas/update-usuario'
import { deleteUsuario } from './usuario/rotas/delete-usuario'


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
getUsuarios(site, client)
listarUsuarios(site, client)
createUsuarios(site,client)
updateUsuario(site,client)
deleteUsuario(site, client)

site.listen(port, () =>{
    console.log(`Example app listening on port ${port}`)
})