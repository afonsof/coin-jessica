import { IDatabase } from 'pg-promise'
import { Empresa } from '../dominio/empresa' 

export class ServicoEmpresa {
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }

    async listar(): Promise<Empresa[]>{
        const empresasDoBD = await this.client.query(`select * from coin_empresa`)

        const empresas: Empresa[] = []

        empresasDoBD.forEach(empresa =>{
            empresas.push(new Empresa(empresa.id, empresa.nome, empresa.responsavel))
        })
        return empresas
    }

    async get(idEmpresa:number): Promise<Empresa>{
        const empresaDoBD = await this.client.oneOrNone(
            `select * from coin_empresa
            where id = $1::int`, [idEmpresa],
        )

        if(!empresaDoBD){
            throw new Error('Empresa não encontrada')
        }

        const empresa = new Empresa(empresaDoBD.id, empresaDoBD.nome,  empresaDoBD.responsavel)

        return empresa
    }

    async update(idEmpresa:number, nome: string,  responsavel:string): Promise<void>{
        const empresaDoBD = await this.client.oneOrNone(`select * from coin_empresa
        where id = $1::int`, [idEmpresa])

        if(!empresaDoBD){
            throw new Error('Empresa não encontrada')
        }
        const empresa = new Empresa(idEmpresa,nome, responsavel)

        await this.client.query(`update  coin_empresa set
        nome = $2::text,
        responsavel = $3::text
        where id = $1::int`,[empresa.id, empresa.nome, empresa.responsavel])
    }

    async create(nome: string,  responsavel:string): Promise<void>{
        const empresa = new Empresa(undefined, nome, responsavel)

        await this.client.query(`insert into coin_empresa (nome, responsavel) values
            ($1::text, $2:: text)`,
        [empresa.nome, empresa.responsavel])
    }

    async delete(idEmpresa:number): Promise<void>{
        const empresa = await this.client.oneOrNone(`select * from coin_empresa
        where id = $1::int`,[idEmpresa])

        if(!empresa) {
            throw new Error('Empresa não encontrada')
        }
        await this.client.query(`delete from coin_empresa where id = $1::int`,[idEmpresa])
    } 
}
 