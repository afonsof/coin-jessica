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
        const linhas = await this.client.query(`select * from coin_reconhecimento
        where status = 'aprovado'`)

        const reconhecimentos: Reconhecimento[] = []

        linhas.forEach(linha=>{
            reconhecimentos.push(new Reconhecimento(linha.id, linha.descricao, linha.data, 
            linha.qtd_moedas_doadas, linha.status, linha.id_de_usuario, linha.id_para_usuario))
        })

        return reconhecimentos
    }

    async get(id:number): Promise<Reconhecimento>{
        const linhas = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'aprovado'`,[id])

        if(linhas.length ===0){
            throw new Error('id de Reconhecimento não encontrado ou pendente aprovação')
        }

        const linha = linhas[0]
        const reconhecimento = new Reconhecimento(
            linha.id, linha.descricao, linha.data, linha.qtd_moedas_doadas, 
            linha.status, linha.id_de_usuario, linha.id_para_usuario
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

        await this.client.query(`insert into coin_reconhecimento (descricao,data, qtd_moedas_doadas, 
        status, id_de_usuario, id_para_usuario) values 
        ($1::text, $2::Date, $3::int, $4::text, $5::int, $6::int)`,[reconhecimento.descricao, 
        reconhecimento.data, reconhecimento.qtdMoedasDoadas, 'pendente',reconhecimento.idDeUsuario, 
        reconhecimento.idParaUsuario])

        await this.servicoCarteiraMoedaDoada.debitar(valorDoacao, idDeUsuario)

        await this.servicoCarteiraMoedaRecebida.creditar(valorDoacao, idParaUsuario)
       
    }


    
    async delete(id:number): Promise<void>{
        const localizaId = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'pendente' or status = 'reprovado'`,[id])

        if(localizaId.length ===0){
            throw new Error('id de Reconhecimento não encontrado ou já aprovado')
        }
        
        await this.client.query(`delete from coin_reconhecimento
        where id = $1::int`,[id])
    }

    async updateAprovar(id:number): Promise<void>{         //não tem bory
        const localizaId = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'pendente' or status = 'reprovado'`,[id])


        if(localizaId.length === 0){
            throw new Error('id de Reconhecimento não encontrado ou já aprovado')
        }

        await this.client.query(`update coin_reconhecimento set
        status = 'aprovado'
        where id = $1::int`,[id])
    }

    async updateReprovar(id:number): Promise<void>{         //não tem bory
        const localizaId = await this.client.query(`select * from coin_reconhecimento
        where id = $1::int and status = 'pendente'`,[id])


        if(localizaId.length === 0){
            throw new Error('id de Reconhecimento não encontrado ou já reprovado')
        }

        await this.client.query(`update coin_reconhecimento set
        status = 'reprovado'
        where id = $1::int`,[id])
    }
}