import { Express} from 'express'
import { ServicoReconhecimento } from '../servico/servico-reconhecimento'

export const updateReconhecimentoAprovar = (site:Express, client)=>{
    site.put('/reconhecimento-aprovar/:id', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            await servico.aprovar(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}