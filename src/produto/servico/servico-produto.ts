import {IDatabase} from "pg-promise"
import { Produto } from "../dominio/produto"

export class ServicoProduto {
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }

    async listar(): Promise<Produto[]>{
        const linhas = await this.client.query(`select * from coin_produto`)

        const produtos: Produto[] = []

        linhas.forEach(linha =>{
            produtos.push(new Produto(linha.id, linha.nome, linha.valor, linha.estoque))
        })

        return produtos
    }

    async get(id: number): Promise<Produto>{
        const linhas = await this.client.query(`select * from coin_produto
        where id = $1::int`,[id])

        if(linhas.length === 0){
            throw new Error ('id produto não encontrado')
        }

        const linha = linhas[0]
        
        const produto = new Produto(linha.id, linha.nome, linha.valor, linha.estoque)

        return produto
    }


    async create(nome:string, valor:number, estoque:number): Promise<void>{
        const produto = new Produto(undefined, nome, valor,estoque)
        
        await this.client.query(`insert into coin_produto (nome, valor, estoque)
        values ($1::text, $2::int, $3::int)`, [produto.nome, produto.valor, produto.estoque])


    }

    async update(id:number, nome:string, valor:number, estoque:number): Promise<void>{
        const produto = new Produto(id, nome, valor, estoque)

        await this.client.query(`update coin_produto set
        nome = $2::text,
        valor = $3::int,
        estoque = $4::int
        where id = $1::int`, [produto.id, produto.nome, produto.valor, produto.estoque])
    }

    async delete(id:number): Promise<void>{

        await this.client.query(`delete from coin_produto where id = $1::int`,[id])

    }


    async atualizarEstoque(id:number, qtdParaDebitar:number): Promise<void>{

        const localizaId: any[] = await this.client.query(`select * from coin_produto
        where id = $1::int`, [id])

        if(localizaId.length === 0){
            throw new Error('id de produto não encontrado')
        }
        const estoqueAtual = localizaId[0].estoque

        await this.client.query(`update coin_produto set
        estoque = $1::int
        where id = $2::int`, [estoqueAtual - qtdParaDebitar, id])

    }


    async conferirQtdEstoque( id:number, qtdPedido:number): Promise<void>{

        const localizaId: any[] = await this.client.query(`select * from coin_produto
        where id = $1::int`, [id])

        if(localizaId.length === 0){
            throw new Error('id de produto não encontrado')
        }

        const estoqueAtual = localizaId[0].estoque


        if(qtdPedido > estoqueAtual){
            throw new Error('quantidade pedida maior que estoque disponível')
        }
    }

 
}


