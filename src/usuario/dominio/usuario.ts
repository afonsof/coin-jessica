export class Usuario {
    id?: number  //opcinal
    nome: string
    email: string
    senha: string

    constructor(id: number|undefined, nome: string, email: string, senha: string) {    //id vai ser ou um numero ou undefined
        this.id = id
        this.nome = nome
        this.email = email
        this.senha = senha

        if(!nome) {
            throw new Error('Usuário precisa ter um nome')
        }
        if(senha.length < 8) {
            throw new Error('Senha do usuário precisa ter no mínimo 8 caracteres')
        }
    }
}