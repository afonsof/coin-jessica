import { Express} from 'express'
import { ServicoReconhecimento } from '../servico/servico-reconhecimento'

export const updateReconhecimento = (site:Express, client)=>{
    site.put('/reconhecimento/:id', async (req, res)=>{
        try{
            const servico = new ServicoReconhecimento(client)
            await servico.update(Number(req.params.id), req.body.descricao, req.body.data, req.body.qtdMoedasDoadas,
            req.body.status, req.body.idDeUsuario, req.body.idParaUsuario)
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}