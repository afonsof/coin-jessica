import { Express } from 'express'
import { ServicoPedido } from '../servico/servico-pedido'

export const listarPedido = (site:Express, client)=>{
    site.get('/pedido', async (req, res)=>{
        try{
            const servico = new ServicoPedido(client)
            const pedidos = await servico.listar()
            res.send(pedidos)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }

    })
}