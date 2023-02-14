import { Usuario } from "./usuario";

describe('Usuario', ()=>{
    describe('constructor',()=>{
        it('deve construir com sucesso caso todos os parametros sejam validos', ()=> {
            const usuario = new Usuario(123, 'ana', 'ana@gmail.com', '12345678')
            expect(usuario).toEqual({
                id: 123,
                nome: 'ana',
                email: 'ana@gmail.com',
                senha: '12345678'
            })
        })

        it('deve disparar um erro caso o usuario não receba um nome', ()=>{
            expect.assertions(1)
            try{
                const usuario = new Usuario(1234444, undefined, 'ana@gmail.com', '12345678')
            }catch(error){
                expect(error).toEqual(new Error('Usuário precisa ter um nome'))
            }
        })
    
        it('deve disparar um erro caso o nome do usuario não receba uma string', ()=>{
            expect.assertions(1)
            try{
                const usuario = new Usuario(124444, 123 as any, 'ana@gmail.com', '12345678')
            }catch(error){
                expect(error).toEqual(new Error('O nome do usuario precisa ser uma string'))
            }
        })
    
        it('deve disparar um erro caso a senha seja menor que 8 caracteres', ()=>{
            expect.assertions(1)
            try{
                const usuario = new Usuario(1255555, 'ana', 'ana@gmail.com', '12345')
            }catch(error){
                expect(error).toEqual(new Error('Senha do usuário precisa ter no mínimo 8 caracteres'))
            }
        })
    })
})