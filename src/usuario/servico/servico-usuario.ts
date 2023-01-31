import { IDatabase } from "pg-promise"
import { Usuario } from "../dominio/usuario"

export class ServicoUsuario {
    client: IDatabase<any>

    constructor(client: IDatabase<any>) {
        this.client = client
    }
    async listar(): Promise<Usuario[]> {
        const usuariosNoBD = await this.client.query(`select * from coin_usuario`)

        const usuarios: Usuario[] = []

        usuariosNoBD.forEach(usuario=> {
            usuarios.push(new Usuario(usuario.id, usuario.nome, usuario.email, usuario.senha))
        })
        return usuarios
    }
    
    //colocar td q precisa para a função funcionar
    async get(idUsuario:number): Promise<Usuario> {                                   
        const usuariosNoBD = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[idUsuario])

        if(usuariosNoBD.length === 0) {
            throw new Error('Usuário não encontrado')
        }

        const usuario = usuariosNoBD[0]

        return new Usuario(usuario.id, usuario.nome, usuario.email, usuario.senha)

    }

    // void pq a função n vai retornar nada, pq create n retorna
    async create(nome:string, email:string, senha:string): Promise<void> { 
        const usuario = new Usuario(undefined, nome, email, senha)

        await this.client.query(`insert into coin_usuario (nome, 
            email, senha) values ($1::text, $2::text, $3::text)`,
            [usuario.nome, usuario.email, usuario.senha]
        ) 
    }

    async update(idUsuario: number, nome:string, email:string, senha:string): Promise<void>{
        const usuarios = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[idUsuario])

        if(usuarios.length === 0) {
            throw new Error('Usuário não encontrado')
        }
        
        const usuario = new Usuario(idUsuario, nome, email, senha)

        await this.client.query(`update coin_usuario
            set nome = $2::text,
            email = $3::text,
            senha = $4::text 
            where id = $1::int`,
            [usuario.id, usuario.nome,usuario.email, usuario.senha]
        )
    }

    async delete(idUsuario:number): Promise<void>{
        const usuarios = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[idUsuario])

        if(usuarios.length === 0) {
            throw new Error('Usuário não encontrado')
        }

        await this.client.query(`delete from coin_usuario 
        where id = $1::int`,[idUsuario])
    }
}

