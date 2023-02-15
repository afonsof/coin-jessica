import { Express } from 'express'
import { ServicoCarteiraMoedasRecebidas } from '../servico/servico-carteira-moedas-recebidas'

export const getCarteiraMoedasRecebidas = (site:Express, client)=>{
    site.get('/carteira-moedas-recebidas/:id', async (req,res)=>{
        try{
            const servico = new ServicoCarteiraMoedasRecebidas(client)
            const carteiraMoedasRecebidas = await servico.get(Number(req.params.id))

            res.send(carteiraMoedasRecebidas)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}