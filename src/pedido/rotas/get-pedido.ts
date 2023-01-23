import {Express} from "express";
import { ServicoPedido } from "../servico/servico-pedido";

export const getPedido = (site:Express, client) =>{
    site.get('/pedido/:id', async (req, res)=>{
        try{
            const servico = new ServicoPedido(client)
            const pedido = await servico.get(Number(req.params.id))

            res.send(pedido)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}