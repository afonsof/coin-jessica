import { IDatabase } from 'pg-promise'
import { ServicoCarteiraMoedasRecebidas } from '../../carteira-recebida/servico/servico-carteira-moedas-recebidas'
import { ServicoProduto } from '../../produto/servico/servico-produto'
import { ServicoUsuario} from '../../usuario/servico/servico-usuario'



interface ListarPedido {
    idPedido: number
    data: Date
    nomeUsuario: string
    status: string
}

interface GetPedidoProduto {
    id: number,
    nome: string,
    valor: number,
    qtd: number,
    total: number
}

interface GetPedido {
    idPedido: number,
    total: number,
    idUsuario: number,
    status: string,
    produtos: GetPedidoProduto[]
}

interface ProdutosDoPedido {
    idProduto: number,
    qtd: number,
}

export class ServicoPedido {
    client: IDatabase<any>
    servicoProduto: ServicoProduto
    servicoCarteiraMoedasRecebidas: ServicoCarteiraMoedasRecebidas
    servicoUsuario: ServicoUsuario

    constructor(client: IDatabase<any>) {
        this.client = client
        this.servicoProduto = new ServicoProduto(client)
        this.servicoCarteiraMoedasRecebidas = new ServicoCarteiraMoedasRecebidas(client)
        this.servicoUsuario = new ServicoUsuario(client)
    }

    async listar(): Promise<ListarPedido[]> {
        const pedidosNoBD = await this.client.query('select * from coin_pedido cp order by data, id_usuario')

        const pedidos: ListarPedido[] = []
        
        await Promise.all(pedidosNoBD.map(async pedido => {
            const usuario = await this.servicoUsuario.get(pedido.id_usuario)
            pedidos.push({
                idPedido: pedido.id,
                data: pedido.data,
                nomeUsuario: usuario.nome,
                status: pedido.status,
            })
        }))

        return pedidos
    }

    async get(idPedido: number): Promise<GetPedido> {
        const pedido = await this.client.oneOrNone('select * from coin_pedido where id = $1::int', [idPedido])
        if (!pedido) {
            throw new Error('pedido não encontrado')
        }

        const produtosDoPedido = await this.client.query(
            'select * from coin_produto_pedido where id_pedido = $1::int', 
            [idPedido],
        )   

        let totalPedido = 0
        produtosDoPedido.forEach(produtoDoPedido => {
            totalPedido = totalPedido + produtoDoPedido.valor_unitario * produtoDoPedido.qtd
        })

        return {
            idPedido: idPedido,
            total: totalPedido,
            idUsuario: pedido.id_usuario,
            status: pedido.status,
            produtos: await Promise.all(produtosDoPedido.map(async produtoDoPedido => {
                const produto = await this.servicoProduto.get(produtoDoPedido.id_produto)
                return {
                    id: produto.id,
                    nome: produto.nome,
                    valor: produtoDoPedido.valor_unitario,
                    qtd: produtoDoPedido.qtd,
                    total: (produtoDoPedido.valor_unitario * produtoDoPedido.qtd), 
                }
            })),
        }
    } 

    async aprovar(idPedido: number): Promise<void> {
    // ok ver se o idPedido do pedido encontra-se pendente
    // ver se o saldo ẽ maior que o valor do o pedido
    // ver se tem o produto em estoque
    // debitar do saldo o valor do pedido
    // fazer um update do id do pedido alterando o status para 'aprovado'

        const pedido = await this.get(idPedido)

        if (pedido.status !== 'pendente') {
            throw new Error('Pedido não encontrado ou já analisado')
        }

        const carteiraRecebida = await this.servicoCarteiraMoedasRecebidas.get(pedido.idUsuario)
        if (carteiraRecebida.saldo < pedido.total) {
            await this.reprovar(idPedido)
            throw new Error(('Usuário não tem saldo suficiente para aprovar o pedido.'))
        }

        await Promise.all(pedido.produtos.map(async produtoDoPedido => {
            console.log(produtoDoPedido)
            const produto = await this.servicoProduto.get(produtoDoPedido.id)
            if (produtoDoPedido.qtd > produto.estoque) {
                throw new Error(
                    `Foi requisitado ${produtoDoPedido.qtd} unidades do ` +
                    `produto ${produto.nome}, mas só tem ${produto.estoque} em estoque`,
                )
            }
        }))

        //nesse caso é um map da função atualiza estoque para percorrer todos os produtos
        await Promise.all(pedido.produtos.map(async produtoDoPedido => {
            return this.servicoProduto.atualizarEstoque(produtoDoPedido.id, produtoDoPedido.qtd)
        }))

        await this.servicoCarteiraMoedasRecebidas.debitar(pedido.total, pedido.idUsuario)

        await this.client.query(
            `update coin_pedido set
            status = 'aprovado'
            where id = $1::int`, 
            [idPedido],
        )
    }

    async reprovar(idPedido: number): Promise<void> {
        const pedido = await this.client.oneOrNone(
            `select * from coin_pedido
            where id = $1::int and status = 'pendente'`, 
            [idPedido],
        )

        if (!pedido) {
            throw new Error('Id pedido não encontrado')
        }

        await this.client.query(`update coin_pedido 
        set status = 'reprovado'
        where id = $1::int`, [idPedido])
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
            `insert into coin_pedido (data, id_usuario, status) values 
            ($1::date, $2::int, $3::text) RETURNING id`,
            [dataAtual, idUsuario, 'pendente'],
        )

        const idPedido = res[0].id

        await Promise.all(produtos.map(async (produto, indice) => {
            const produtoNoBanco = produtosNoBanco[indice]
            await this.client.query(
                `insert into coin_produto_pedido (id_pedido, id_produto, valor_unitario, qtd) values
                ($1::int, $2::int, $3::int, $4::int)`,
                [idPedido, produto.idProduto, produtoNoBanco.valor, produto.qtd],
            )
        }))
    }
}






