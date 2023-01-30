import { IDatabase } from "pg-promise"
import { ServicoCarteiraMoedasRecebidas } from "../../carteira-recebida/servico/servico-carteiraMoedasRecebidas"
import { ServicoProduto } from "../../produto/servico/servico-produto"

interface ListarPedido {
    idPedido: number
    data: Date
    nomeUsuario: string
}

interface GetPedidoProduto {
    nome: string,
    valor: number,
    qtd: number,
    total: number
}

interface GetPedido {
    idPedido: number,
    total: number,

    produtos: GetPedidoProduto[]
}

interface GetProdutoAprovar {
    idProduto: number,
    nome: string,
    estoque: number,
    qtd: number,
    valorUnitario: number,
}

interface GetPedidoAprovar {
    idPedido: number,
    idUsuario: number,
    saldoCarteira: number,
    produtos: GetProdutoAprovar[]
}

interface ProdutosDoPedido {
    idProduto: number,
    qtd: number,
}

export class ServicoPedido {
    client: IDatabase<any>
    servicoProduto: ServicoProduto
    servicoCarteiraMoedasRecebidas: ServicoCarteiraMoedasRecebidas

    constructor(client: IDatabase<any>) {
        this.client = client
        this.servicoProduto = new ServicoProduto(client)
        this.servicoCarteiraMoedasRecebidas = new ServicoCarteiraMoedasRecebidas(client)
    }

    async listar(): Promise<ListarPedido[]> {
        const pedidosNoBD = await this.client.query(`select cp.id, data, cu.nome as usuario
        from coin_pedido cp
        join coin_usuario cu on cu.id = cp.id_usuario`)

        const pedidos: ListarPedido[] = []

        pedidosNoBD.forEach(pedido => {
            pedidos.push({
                idPedido: pedido.id,
                data: pedido.data,
                nomeUsuario: pedido.usuario
            })
        })
        return pedidos
    }

    async get(idPedido: number): Promise<GetPedido> {
        const pedidoNoBD = await this.client.query(
            `select * from coin_pedido cp
            join coin_produto_pedido cpp on cpp.id_pedido = cp.id
            join coin_produto p on p.id = cpp.id_produto
            where id_pedido = $1::int`, 
            [idPedido]
        )

        if (pedidoNoBD.length === 0) {
            throw new Error('pedido não encontrado')
        }

        const somaPedido = (await this.client.query(
            `select cast(sum(valor_unitario) as int) as total
             from coin_produto_pedido
             where id_pedido = $1::int`,
            [idPedido]
        ))

        const totalPedido = somaPedido[0].total

        const pedido: GetPedido = {
            idPedido: idPedido,
            total: totalPedido,
            produtos: pedidoNoBD.map(pedido => {
                return {
                    nome: pedido.nome,
                    valor: pedido.valor_unitario,
                    qtd: pedido.qtd,
                    total: (pedido.valor_unitario * pedido.qtd) 
                }
            })
        }
        return pedido
    }

    async aprovar(idPedido: number): Promise<void> {
        // ok ver se o idPedido do pedido encontra-se pendente
        // ver se o saldo ẽ maior que o valor do o pedido
        // ver se tem o produto em estoque
        // debitar do saldo o valor do pedido
        // fazer um update do id do pedido alterando o status para 'aprovado'

        const produtosPendentesDoPedido = await this.client.query(
            `select * from coin_produto_pedido
             where id_pedido = $1::int and status = 'pendente'`,
            [idPedido]
        )

        if (produtosPendentesDoPedido.length === 0) {
            throw new Error('Não existem produtos no pedido que estao pendentes')
        }

        const pedidos = await this.client.query(
            `select * from coin_pedido
             where idPedido = $1::int`,
            [idPedido]
        )
        const pedido = pedidos[0]

        const somatorioValorPedido = await this.client.query(
            `select cast(sum(valor_unitario) as int) as total
             from coin_produto_pedido
             where id_pedido = $1::int`,
            [idPedido]
        )
        const totalPedido = somatorioValorPedido[0].total

        const carteiraRecebida = await this.servicoCarteiraMoedasRecebidas.get(pedido.id_usuario)
        if (carteiraRecebida.saldo < totalPedido) {
            await this.reprovar(idPedido)
            throw new Error(('Usuário não tem saldo suficiente para aprovar o pedido.'))
        }

        const produtosDoPedido: any[] = await this.client.query(
            `select * from coin_produto_pedido produtoPedido
            join coin_produto produto on produto.idPedido = produtopedido.id_produto 
            where id_pedido  =  $1::int`, 
            [idPedido]
        )

        produtosDoPedido.forEach(produto => {
            if (produto.qtd > produto.estoque) {
                throw new Error(`Foi requisitado ${produto.qtd} unidades do produto ${produto.nome},
                    mas só tem ${produto.estoque} em estoque`)
            }
        })

        //nesse caso é um map da função atualiza estoque para percorrer todos os produtos
        await Promise.all(produtosDoPedido.map(async produto => {
            return this.servicoProduto.atualizarEstoque(produto.id_produto, produto.qtd)
        }))

        await this.servicoCarteiraMoedasRecebidas.debitar(totalPedido, pedido.id_usuario)

        await this.client.query(
            `update coin_produto_pedido set
            status = 'aprovado'
            where id_pedido = $1::int`, 
            [idPedido]
        )
    }

    async reprovar(idPedido: number): Promise<void> {
        const localizaId = await this.client.query(
            `select * from coin_produto_pedido
            where id_pedido = $1::int and status = 'pendente'`, 
            [idPedido]
        )

        if (localizaId.length === 0) {
            throw new Error('Id pedido não encontrado para análise')
        }

        await this.client.query(`update coin_produto_pedido set
        status = 'reprovado'
        where id_pedido = $1::int`, [idPedido])
    }


    // O que precisa para criar um pedido?
    // idPedido usuario, ids dos produtos e quantidade dos produtos
    // Funcao precisa retornar nada
    async create(idUsuario: number, produtos: ProdutosDoPedido[]): Promise<void> {

        // OK saber se o idPedido do produto existe
        // OK saber se a quantidade do produto tem disponivel em estoque
        // criar um pedido com os dados fornecidos

        const produtosNoBanco = await Promise.all(produtos.map(async produto => {
            return this.servicoProduto.get(produto.idProduto)
        }))

        await Promise.all(produtos.map(async produto => {
            return this.servicoProduto.conferirQtdEstoque(produto.idProduto, produto.qtd)
        }))

        const dataAtual = new Date()

        const res = await this.client.query(
            `insert into coin_pedido (data, id_usuario) values ($1::date, $2::int) RETURNING id`,
            [dataAtual, idUsuario]
        )

        const idPedido = res[0].id

        await Promise.all(produtos.map(async (produto, indice) => {
            const produtoNoBanco = produtosNoBanco[indice]
            await this.client.query(
                `insert into coin_produto_pedido (id_pedido, id_produto, valor_unitario, qtd, status) values
                ($1::int, $2::int, $3::int, $4::int, $5::text)`,
                [idPedido, produto.idProduto, produtoNoBanco.valor, produto.qtd, 'pendente']
            )
        }))
    }
}






