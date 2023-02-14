import { Empresa } from "./empresa";

describe('Empresa', ()=>{
    describe('constructor', ()=>{
        it('deve construir com sucesso caso todos os parametros sejam validos', ()=>{
            const empresa = new Empresa(123, 'casa de maquinas ltda', 'ana')
            expect(empresa).toEqual({
                id: 123,
                nome: 'casa de maquinas ltda',
                responsavel: 'ana'
            })
        })

        it('deve disparar um erro, caso não seja passado um nome da empresa', ()=>{
            expect.assertions(1)
            try{
                const empresa = new Empresa(1111, undefined, 'ana')
            } catch(error){
                expect(error).toEqual(new Error('Empresa precisa ter um nome'))
            }
        })

        it('deve disparar um erro, caso não seja passado um responsavel', ()=>{
            expect.assertions(1)
            try{
                const empresa = new Empresa(5001, 'casa da musica ltda', undefined)
            }catch(error){
                expect(error).toEqual(new Error('Empresa precisa ter nome do responsável'))
            }
        })

        it('deve disparar um erro caso o responsavel não seja uma string', ()=>{
            expect.assertions(1)
            try{
                const empresa = new Empresa(1245, 'casa da musica ltda', 123 as any,)
            }catch(error){
                expect(error).toEqual(new Error('O responsável precisa ser uma string'))
            }
        })
    })
})