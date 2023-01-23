import { Express} from 'express'
import { ServicoReconhecimento } from '../servico/servico-reconhecimento'

export const updateReconhecimentoReprovar = (site:Express, client)=>{
    site.put('/reconhecimento-reprovar/:id', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            await servico.updateReprovar(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}