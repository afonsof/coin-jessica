import {Express} from 'express'
import { ServicoReconhecimento } from '../servico/servico-reconhecimento'

export const getReconhecimento = (site:Express, client)=>{
    site.get('/reconhecimento/:id', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            const reconhecimento =await servico.get(Number(req.params.id))
            res.send(reconhecimento)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}