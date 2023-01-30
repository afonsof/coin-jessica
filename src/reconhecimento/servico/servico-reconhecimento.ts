import { IDatabase } from "pg-promise";
import { ServicoCarteiraMoedasDoadas } from "../../carteira-doacao/servico/servico-carteira-moedas-doadas";
import { ServicoCarteiraMoedasRecebidas } from "../../carteira-recebimento/servico/servico-carteiraMoedasRecebidas";
import { Reconhecimento } from "../dominio/reconhecimento";



export class ServicoReconhecimento {
    client: IDatabase<any>
    servicoCarteiraMoedaDoada: ServicoCarteiraMoedasDoadas
    servicoCarteiraMoedaRecebida: ServicoCarteiraMoedasRecebidas

    constructor(client: IDatabase<any>){
        this.client = client
        this.servicoCarteiraMoedaDoada = new ServicoCarteiraMoedasDoadas(client) //vou usar na hora do debitar, tenho q criar em carteira doacao
        this.servicoCarteiraMoedaRecebida = new ServicoCarteiraMoedasRecebidas(client)
    }

    async listar(): Promise<Reconhecimento[]>{
        const reconhecimentosAprovadoNoBD = await this.client.query(`select * from coin_reconhecimento
        where status = 'aprovado'`)

        const reconhecimentos: Reconhecimento[] = []

        reconhecimentosAprovadoNoBD.forEach(reconhecimento=>{
            reconhecimentos.push(new Reconhecimento(
                reconhecimento.id, reconhecimento.descricao, reconhecimento.data, 
                reconhecimento.qtd_moedas_doadas, reconhecimento.status, 
                reconhecimento.id_de_usuario, reconhecimento.id_para_usuario)
            )
        })
        return reconhecimentos
    }

    async get(idReconhecimento:number): Promise<Reconhecimento>{
        const reconhecimentoAprovadoBD = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'aprovado'`,[idReconhecimento])

        if(reconhecimentoAprovadoBD.length ===0){
            throw new Error('id de Reconhecimento não encontrado ou pendente aprovação')
        }

        const reconhecimentoLinha = reconhecimentoAprovadoBD[0]
        
        const reconhecimento = new Reconhecimento(
            reconhecimentoLinha.id, reconhecimentoLinha.descricao, reconhecimentoLinha.data, reconhecimentoLinha.qtd_moedas_doadas, 
            reconhecimentoLinha.status, reconhecimentoLinha.id_de_usuario, reconhecimentoLinha.id_para_usuario
        )
        return reconhecimento
    }

    async create(
        descricao:string, data: Date, qtdMoedasDoadas: number, status: string|undefined,
        idDeUsuario:number, idParaUsuario:number
    ):Promise<void >{
        const reconhecimento = new Reconhecimento(
            undefined, descricao, data, qtdMoedasDoadas, status, idDeUsuario, idParaUsuario
        )

        let valorDoacao = reconhecimento.qtdMoedasDoadas 

        await this.client.query(`insert into coin_reconhecimento (descricao,data,
            qtd_moedas_doadas, status, id_de_usuario, id_para_usuario) values 
            ($1::text, $2::Date, $3::int, $4::text, $5::int, $6::int)`,
            [reconhecimento.descricao, reconhecimento.data, reconhecimento.qtdMoedasDoadas,
            'pendente',reconhecimento.idDeUsuario, reconhecimento.idParaUsuario]
        )
        
        await this.servicoCarteiraMoedaDoada.debitar(valorDoacao, idDeUsuario)

        await this.servicoCarteiraMoedaRecebida.creditar(valorDoacao, idParaUsuario)
    }
    
    async delete(idReconhecimento:number): Promise<void>{
        const localizaId = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'pendente' or status = 'reprovado'`,[idReconhecimento])

        if(localizaId.length ===0){
            throw new Error('id de Reconhecimento não encontrado ou já aprovado')
        }
        
        await this.client.query(`delete from coin_reconhecimento
        where id = $1::int`,[idReconhecimento])
    }

    async aprovar(idReconhecimento:number): Promise<void>{         //não tem bory
        const localizaId = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'pendente' or status = 'reprovado'`,[idReconhecimento])

        if(localizaId.length === 0){
            throw new Error('id de Reconhecimento não encontrado ou já aprovado')
        }

        await this.client.query(`update coin_reconhecimento set
        status = 'aprovado'
        where id = $1::int`,[idReconhecimento])
    }

    async reprovar(id:number): Promise<void>{         //não tem bory
        const localizaId = await this.client.query(
            `select * from coin_reconhecimento
            where id = $1::int and status = 'pendente'`,[id]
        )

        if(localizaId.length === 0){
            throw new Error('id de Reconhecimento não encontrado ou já reprovado')
        }

        await this.client.query(`update coin_reconhecimento set
        status = 'reprovado'
        where id = $1::int`,[id])

        await this.servicoCarteiraMoedaDoada.creditar(localizaId.qtd_moedas_doadas, localizaId.id_de_usuario)

        await this.servicoCarteiraMoedaRecebida.debitar(localizaId.qtd_moedas_doadas, localizaId.id_para_usuario)
    }
}