import { Express} from 'express'
import { ServicoPedido } from '../servico/servico-pedido'

export const reprovarPedido = (site:Express, client)=>{
    site.put('/pedido-reprovar/:id', async (req, res)=>{
        try{
            const servico = new ServicoPedido(client)
            await servico.reprovar(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}