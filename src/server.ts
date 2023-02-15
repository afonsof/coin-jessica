import express from 'express'
import bodyParser from 'body-parser'
import pgPromise from 'pg-promise'


import { getUsuarios } from './usuario/rotas/get-usuarios'
import { listarUsuarios } from './usuario/rotas/listar-usuarios'
import { createUsuarios } from './usuario/rotas/create-usuarios'
import { updateUsuario } from './usuario/rotas/update-usuario'
import { deleteUsuario } from './usuario/rotas/delete-usuario'
import { listarEmpresas } from './empresa/rotas/listar-empresas'
import { getEmpresas } from './empresa/rotas/get-empresa'
import { updateEmpresa } from './empresa/rotas/update-empresa'
import { createEmpresa } from './empresa/rotas/create-empresa'
import { deleteEmpresa } from './empresa/rotas/delete-empresa'
import { listarProduto } from './produto/rotas/listar-produtos'
import { getProduto } from './produto/rotas/get-produto'
import { createProduto } from './produto/rotas/create-produto'
import { updateProduto } from './produto/rotas/update-produto'
import { deleteProduto } from './produto/rotas/delete-produto'
import { listarPedido } from './pedido/rotas/listar-pedidos'
import { listarReconhecimentos } from './reconhecimento/rotas/listar-reconhecimento'
import { getReconhecimento } from './reconhecimento/rotas/get-reconhecimento'
import { createReconhecimento } from './reconhecimento/rotas/create-reconhecimento'
import { deleteReconhecimento } from './reconhecimento/rotas/delete-reconhecimento'
import { getCarteiraMoedasRecebidas } from './carteira-recebida/rotas/get-carteira-moedas-recebidas'
import { getCarteiraMoedasDoadas } from './carteira-doacao/rotas/get-carteira-moedas-doadas'
import { aprovarReconhecimento } from './reconhecimento/rotas/aprovar-reconhecimento'
import { reprovarReconhecimento } from './reconhecimento/rotas/reprovar-reconhecimento'
import { getPedido } from './pedido/rotas/get-pedido'
import { createPedido } from './pedido/rotas/create-pedido'
import { aprovarPedido } from './pedido/rotas/aprovar-pedido'
import { reprovarPedido } from './pedido/rotas/reprovar-pedido'

export function createServer() {

    const pgp = pgPromise()

    const site = express()                      
    site.use(bodyParser.json())    
    const port = 3000  

    const client = pgp({
        host: 'localhost',
        port: 5432,
        user: 'example',
        password: 'example',
        database: 'postgres',
    })

    // aqui vão todas as todas as rotas
    getUsuarios(site, client)
    listarUsuarios(site, client)
    createUsuarios(site,client)
    updateUsuario(site,client)
    deleteUsuario(site, client)
    listarEmpresas(site, client)
    getEmpresas(site,client)
    updateEmpresa(site, client)
    createEmpresa(site, client)
    deleteEmpresa(site, client)
    listarProduto(site, client)
    getProduto(site, client)
    createProduto(site, client)
    updateProduto(site, client)
    deleteProduto(site, client)
    listarPedido(site, client)
    listarReconhecimentos(site, client)
    getReconhecimento(site, client)
    createReconhecimento(site, client)
    deleteReconhecimento(site, client)
    getCarteiraMoedasRecebidas(site, client)
    getCarteiraMoedasDoadas(site, client)
    aprovarReconhecimento(site, client)
    reprovarReconhecimento(site, client)
    getPedido(site,client)
    aprovarPedido(site, client)
    reprovarPedido(site,client)
    createPedido(site, client)

    const server = site.listen(port, () =>{
        console.log(`Example app listening on port ${port}`)
    })

    return { site, server }
}