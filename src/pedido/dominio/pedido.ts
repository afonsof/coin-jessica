export class ProdutoDoPedido {
    idProduto:number
    qtd: number
    valorUnitario: number 
    



    constructor(idProduto:number, qtd:number, valorUnitario:number){
        this.idProduto = idProduto
        this.qtd = qtd
        this.valorUnitario = valorUnitario

        if(!idProduto){
            throw new Error('Produto do pedido precisa de idProduto')
        }
        if(typeof idProduto !== "number"){
            throw new Error('O idProduto precisa ser uma number')
        }
        if(!qtd){
            throw new Error('Produto do pedido precisa de quantidade do produto')
        }
        if(typeof qtd !== "number"){
            throw new Error('A qtd precisa ser um number')
        }
        if(qtd <= 0){
            throw new Error('Produto do pedido precisa que a quantidade do produto seja maio que zero')
        }
        if(typeof valorUnitario !== "number"){
            throw new Error('O valor unitatio precisa ser um number')
        }
        
    }
}

export class Pedido {
    id?: number
    data: Date
    idUsuario: number
    status: string

    produtos: ProdutoDoPedido[]

    constructor(idPedido:number|undefined, data:Date, idUsuario: number, status: string){
        this.id = idPedido
        this.data = data
        this.idUsuario = idUsuario
        this.status = status

        if(!idUsuario){
            throw new Error('Pedido precisa de um usuário')
        }
        if(typeof status !== "string"){
            throw new Error('O status precisa ser uma string')
        }
    }
}