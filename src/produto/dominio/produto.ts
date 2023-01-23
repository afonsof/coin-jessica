export class Produto {
    id?: number  //opcinal
    nome: string
    valor: number
    estoque: number

    constructor(id: number|undefined, nome: string, valor: number, estoque: number) {    //id vai ser ou um numero ou undefined
        this.id = id
        this.nome = nome
        this.valor = valor
        this.estoque = estoque

        if(!nome) {
            throw new Error('Produto precisa ter um nome')
        }
        if(!valor) {
            throw new Error('Produto precisa ter valor')
        }
        if(!estoque) {
            throw new Error('Produto precisa ter estoque')
        }
    }
}