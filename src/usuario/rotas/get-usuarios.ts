import { Express } from 'express'
import { ServicoUsuario } from '../servico/servico-usuario'

export const getUsuarios = (site: Express, client) =>{
    site.get('/usuario/:id', async (req, res)=>{
        try{
            const servico = new ServicoUsuario(client)
            const usuario = await servico.get(Number(req.params.id)) // converteu o params para number, pq td q vem do params vem como string e definimos em servico que id é number

            
            res.send(usuario)
        }catch(erro){
            console.error(erro)
            res.status(500)
            res.send(erro.message)
        }
    })
}

