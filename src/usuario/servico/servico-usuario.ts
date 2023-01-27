import { IDatabase } from "pg-promise"
import { Usuario } from "../dominio/usuario"

export class ServicoUsuario {
    client: IDatabase<any>

    constructor(client: IDatabase<any>) {
        this.client = client
    }
    async listar(): Promise<Usuario[]> {
        const linhas = await this.client.query(`select * from coin_usuario`)

        const usuarios: Usuario[] = []

        linhas.forEach(linha=> {
            usuarios.push(new Usuario(linha.id, linha.nome, linha.email, linha.senha))
        })

        return usuarios
    }

    async get(id:number): Promise<Usuario> {                                   //colocar td q precisa para a função funcionar
        const linhas = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[id])
        if(linhas.length === 0) {
            throw new Error('usuário não existe')
        }

        const linha = linhas[0]
        const usuario = new Usuario(linha.id, linha.nome, linha.email, linha.senha)

       
        
        return usuario  
        
    }

    async create(nome:string, email:string, senha:string): Promise<void> {  // void pq a função n vai retornar nada, pq create n retorna
        const usuario = new Usuario(undefined, nome, email, senha)

        await this.client.query(`insert into coin_usuario (nome, 
        email, senha) values ($1::text, $2::text, $3::text)`,[usuario.nome, usuario.email, 
        usuario.senha])
        
    }

    async update(id: number, nome:string, email:string, senha:string): Promise<void>{
        const localizaId = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[id])
        if(localizaId.length === 0) {
            throw new Error('id de usuário não existe')
        }
        
        const usuario = new Usuario(id, nome, email, senha)

        await this.client.query(`update coin_usuario
            set nome = $2::text,
            email = $3::text,
            senha = $4::text 
            where id = $1::int`,[usuario.id, usuario.nome,usuario.email,
            usuario.senha]
        )

    }

    async delete(id:number): Promise<void>{
        const localizaId = await this.client.query(`select * from coin_usuario
        where id = $1::int`,[id])
        if(localizaId.length === 0) {
            throw new Error('id de usuário não existe')
        }

        await this.client.query(`delete from coin_usuario where id = $1::int`,[id])

        
    }



}

