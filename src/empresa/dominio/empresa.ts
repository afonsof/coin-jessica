export class Empresa {
    id?: number  //opcinal
    nome: string
    responsavel: string

    constructor(idEmpresa: number|undefined, nome: string,responsavel: string) {    //id vai ser ou um numero ou undefined
        this.id = idEmpresa
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