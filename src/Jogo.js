class Jogo{
    num = 0;

    constructor(id) {
        this.id = id;
        this.baralho = [
            ["2", "copas", "0", 1],
            ["3", "copas", "0", 2],
            ["4", "copas", "0", 3],
            ["5", "copas", "0", 3],
            ["6", "copas", "0", 5],
            ["7", "copas", "10", 9],
            ["dama", "copas", "2", 6],
            ["valete", "copas", "3", 7],
            ["rei", "copas", "4", 8],
            ["as", "copas", "11", 10],
            ["2", "ouros", "0", 1],
            ["3", "ouros", "0", 2],
            ["4", "ouros", "0", 3],
            ["5", "ouros", "0", 4],
            ["6", "ouros", "0", 5],
            ["7", "ouros", "10", 9],
            ["dama", "ouros", "2", 6],
            ["valete", "ouros", "3", 7],
            ["rei", "ouros", "4", 8],
            ["as", "ouros", "11", 10],
            ["2", "espadas", "0", 1],
            ["3", "espadas", "0", 2],
            ["4", "espadas", "0", 3],
            ["5", "espadas", "0", 4],
            ["6", "espadas", "0", 5],
            ["7", "espadas", "10", 9],
            ["dama", "espadas", "2", 6],
            ["valete", "espadas", "3", 7],
            ["rei", "espadas", "4", 8],
            ["as", "espadas", "11", 10],
            ["2", "paus", "0", 1],
            ["3", "paus", "0", 2],
            ["4", "paus", "0", 3],
            ["5", "paus", "0", 4],
            ["6", "paus", "0", 5],
            ["7", "paus", "10", 9],
            ["dama", "paus", "2", 6],
            ["valete", "paus", "3", 7],
            ["rei", "paus", "4", 8],
            ["as", "paus", "11", 10]
        ];
        this.trunfo = '';
        this.turno = '';
        this.numJogadas = 0;
        this.statusAs = false;
        this.jogador1 = {
            id: false,
            nome: "",
            mao: [],
            jogada: [],
            pontos: 0
        };
        this.jogador2 = {
            id: false,
            nome: "",
            mao: [],
            jogada: [],
            pontos: 0
        };
    }

    getId(){
        return this.id;
    }

    getBaralho(){
        return this.baralho;
    }

    getTrunfu(){
        return this.trunfo;
    }

    getJogador1(){
        return this.jogador1;
    }

    getJogador2(){
        return this.jogador2;
    }

    setJogador1(jogador){
        this.jogador1 = jogador;
    }

    setJogador2(jogador){
        this.jogador2 = jogador;
    }

    setTrunfo(trunfo){
        this.trunfo = trunfo;
    }

    darCartas(){
        for(let i = 0; i<3; i++){
            this.num = Math.floor(Math.random() * (this.baralho.length));
            this.jogador1.mao.push(this.baralho[this.num]);
            this.baralho.splice(this.num, 1);
        }
        for(let i = 0; i<3; i++){
            this.num = Math.floor(Math.random() * (this.baralho.length));
            this.jogador2.mao.push(this.baralho[this.num]);
            this.baralho.splice(this.num, 1);
        }
    }

    tirarTrunfo(){
        let naipes = ['copas', 'paus', 'ouros', 'espadas'];
        let num = Math.floor(Math.random() * 4);

        this.trunfo = naipes[num];
    }

    comprarCartas(){
        this.num = Math.floor(Math.random() * (this.baralho.length));
        this.jogador1.mao.push(this.baralho[this.num]);
        this.baralho.splice(this.num, 1);
        this.jogador1.jogada = [];

        this.num = Math.floor(Math.random() * (this.baralho.length));
        this.jogador2.mao.push(this.baralho[this.num]);
        this.baralho.splice(this.num, 1);
        this.jogador2.jogada = [];
    }

    rodadaJogador1(){
        this.jogador1.pontos += parseInt(this.jogador1.jogada[2]) + parseInt(this.jogador2.jogada[2]);
        this.turno = this.jogador1.id;
    }

    rodadaJogador2(){
        this.jogador2.pontos += parseInt(this.jogador1.jogada[2]) + parseInt(this.jogador2.jogada[2]);
        this.turno = this.jogador2.id;
    }

    verificarAs(jogadorId, indice){
        if(jogadorId == this.jogador1.id){
            if(this.jogador1.mao[indice][1] == this.trunfo & this.jogador1.mao[indice][0] == "as"){
                if(this.statusAs){
                    return true;
                }else{
                    return false;
                }
            }else{
                return true;
            }
        }else if(jogadorId == this.jogador2.id){
            if(this.jogador2.mao[indice][1] == this.trunfo & this.jogador2.mao[indice][0] == "as"){
                if(this.statusAs){
                    return true;
                }else{
                    return false;
                }
            }else{
                return true;
            }
        }        
    }

    isSete(jogadorId, indice){
        if(jogadorId == this.jogador1.id){
            if(this.jogador1.mao[indice][1] == this.trunfo & this.jogador1.mao[indice][0] == "7"){
                this.statusAs = true;
            }
        }else if(jogadorId == this.jogador2.id){
            if(this.jogador2.mao[indice][1] == this.trunfo & this.jogador2.mao[indice][0] == "7"){
                this.statusAs = true;
            }
        }   
    }
}

module.exports = Jogo;