import {IDatabase} from 'pg-promise'
import { Produto } from '../dominio/produto'

export class ServicoProduto {
    client: IDatabase<any>

    constructor(client: IDatabase<any>){
        this.client = client
    }

    async listar(): Promise<Produto[]>{
        const produtosNoBD = await this.client.query(`select * from coin_produto`)

        const produtos: Produto[] = []

        produtosNoBD.forEach(produto =>{
            produtos.push(new Produto(produto.id, produto.nome, produto.valor, produto.estoque))
        })
        return produtos
    }

    async get(idProduto: number): Promise<Produto>{
        const produto = await this.client.oneOrNone(
            `select * from coin_produto
            where id = $1::int`,[idProduto],
        )

        if(!produto){
            throw new Error ('Id produto não encontrado')
        }
        return new Produto(produto.id, produto.nome, produto.valor, produto.estoque)
    }


    async create(nome:string, valor:number, estoque:number): Promise<void>{
        const produto = new Produto(undefined, nome, valor,estoque)
        
        await this.client.query(
            `insert into coin_produto (nome, valor, estoque)
            values ($1::text, $2::int, $3::int)`, 
            [produto.nome, produto.valor, produto.estoque],
        )

    }

    async update(idProduto:number, nome:string, valor:number, estoque:number): Promise<void>{
        const produtoNoBD = await this.client.oneOrNone(`select * from coin_produto
        where id = $1::int`,[idProduto])

        if(!produtoNoBD){
            throw new Error ('Id produto não encontrado')
        }
        const produto = new Produto(idProduto, nome, valor, estoque)

        await this.client.query(
            `update coin_produto set
            nome = $2::text,
            valor = $3::int,
            estoque = $4::int
            where id = $1::int`, 
            [produto.id, produto.nome, produto.valor, produto.estoque],
        )
    }

    async delete(idProduto:number): Promise<void>{

        const produto = await this.client.oneOrNone(`select * from coin_produto
        where id = $1::int`,[idProduto])

        if(!produto) {
            throw new Error('Produto não encontrado')
        }

        await this.client.query(`delete from coin_produto where id = $1::int`,[idProduto])
    }

    async atualizarEstoque(idProduto:number, qtdParaDebitar:number): Promise<void>{

        const produto = await this.client.oneOrNone(
            `select * from coin_produto
            where id = $1::int`, [idProduto],
        )

        if(!produto){
            throw new Error('Id de produto não encontrado')
        }
        const estoqueAtual = produto.estoque

        await this.client.query(`update coin_produto set
        estoque = $1::int
        where id = $2::int`, [estoqueAtual - qtdParaDebitar, idProduto])
    }

    async conferirQtdEstoque( idProduto:number, qtdPedido:number): Promise<void>{

        const produto = await this.client.oneOrNone(
            `select * from coin_produto
            where id = $1::int`, [idProduto],
        )

        if(!produto){
            throw new Error('Id de produto não encontrado')
        }

        const estoqueAtual = produto.estoque

        if(qtdPedido > estoqueAtual){
            throw new Error('Quantidade pedida maior que estoque disponível')
        }
    }
}


