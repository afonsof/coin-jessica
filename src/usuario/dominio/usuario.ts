export class Usuario {
    id?: number  //opcinal
    nome: string
    email: string
    senha: string

    //id vai ser ou um numero ou undefined
    constructor(idUsuario: number|undefined, nome: string, email: string, senha: string) {    
        this.id = idUsuario
        this.nome = nome
        this.email = email
        this.senha = senha

        if(!nome) {
            throw new Error('Usuário precisa ter um nome')
        }
        if(typeof nome !== "string"){
            throw new Error('O nome do usuario precisa ser uma string')
        }
        if(senha.length < 8) {
            throw new Error('Senha do usuário precisa ter no mínimo 8 caracteres')
        }
    }
}