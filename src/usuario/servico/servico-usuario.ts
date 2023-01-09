import { IDatabase } from "pg-promise"
import { Usuario } from "../dominio/usuario"

export class ServicoUsuario {
    client: IDatabase<any>

    constructor(client: IDatabase<any>) {
        this.client = client
    }
    async listar(): Promise<Usuario[]> {
        const linhas = await this.client.query(`select * from usuarios`)

        const usuarios: Usuario[] = []

        linhas.forEach(linha=> {
            usuarios.push(new Usuario(linha.id, linha.nome, linha.email, linha.senha))
        })

        return usuarios
    }
}