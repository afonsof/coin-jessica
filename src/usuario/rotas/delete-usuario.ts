import { Express } from 'express'
import { ServicoUsuario } from '../servico/servico-usuario'

export const deleteUsuario = (site: Express, client) =>{
    site.delete('/usuario/:id', async (req, res)=>{
        try{
            const servico = new ServicoUsuario(client)
            await servico.delete(Number(req.params.id))
            res.send()
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send('deu erro')
        }
    })
}

