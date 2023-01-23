import { IDatabase } from "pg-promise"
import { Empresa } from "../dominio/empresa" 

export class ServicoEmpresa {
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }

    async listar(): Promise<Empresa[]>{
        const linhas = await this.client.query(`select * from coin_empresa`)

        const empresas: Empresa[] = []

        linhas.forEach(linha =>{
            empresas.push(new Empresa(linha.id, linha.nome, linha.responsavel))
        })

        return empresas
    }

    async get(id:number): Promise<Empresa>{
        const linhas = await this.client.query(`select * from coin_empresa
        where id = $1::int`, [id])

        if(linhas.length === 0){
            throw new Error('empresa não existe')
        }

        const linha = linhas[0]
        const empresa = new Empresa(linha.id, linha.nome,  linha.responsavel)

        return empresa
    }

    async update(id:number, nome: string,  responsavel:string): Promise<void>{
        const empresa = new Empresa(id,nome, responsavel)

        await this.client.query(`update  coin_empresa set
        nome = $2::text,
        responsavel = $3::text
        where id = $1::int`,[empresa.id, empresa.nome, empresa.responsavel])
    }

    async create(nome: string,  responsavel:string): Promise<void>{
        const empresa = new Empresa(undefined, nome, responsavel)

        await this.client.query(`insert into coin_empresa (nome, responsavel) values
            ($1::text, $2:: text)`,
            [empresa.nome, empresa.responsavel]
        )

    }

    async delete(id:number): Promise<void>{
        
        await this.client.query(`delete from coin_empresa where id = $1::int`,[id])
    }
    
}
