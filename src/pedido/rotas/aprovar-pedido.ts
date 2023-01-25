import { Express} from 'express'
import { ServicoPedido } from '../servico/servico-pedido'

export const updatePedidoAprovar = (site:Express, client)=>{
    site.put('/pedido-aprovar/:id', async (req, res)=>{
        try{
            const servico = new ServicoPedido(client)
            await servico.aprovar(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}