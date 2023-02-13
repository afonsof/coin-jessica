export class Produto {
    id?: number  //opcinal
    nome: string
    valor: number
    estoque: number

     //id vai ser ou um numero ou undefined
    constructor(idProduto: number|undefined, nome: string, valor: number, estoque: number) {   
        this.id = idProduto
        this.nome = nome
        this.valor = valor
        this.estoque = estoque

        if(!nome) {
            throw new Error('Produto precisa ter um nome')
        }
        if(!valor) {
            throw new Error('Produto precisa ter valor')
        }
    }
}