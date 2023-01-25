import {Express} from "express";
import { ServicoPedido } from "../servico/servico-pedido";

export const createPedido = (site:Express, client) =>{
    site.post('/pedido', async (req, res)=>{
        try{
            const servico = new ServicoPedido(client)
            await servico.create(req.body.idUsuario,req.body.data,
            req.body.idProduto,req.body.qtd)

            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}