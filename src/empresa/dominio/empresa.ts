export class Empresa {
    id?: number  //opcinal
    nome: string
    responsavel: string

    constructor(id: number|undefined, nome: string,responsavel: string) {    //id vai ser ou um numero ou undefined
        this.id = id
        this.nome = nome
        this.responsavel = responsavel

        if(!nome) {
            throw new Error('Empresa precisa ter um nome')
        }
        if(!responsavel){
            throw new Error('Empresa precisa ter nome do responsável')
        }
    }
}