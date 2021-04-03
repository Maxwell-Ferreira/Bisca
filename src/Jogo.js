const Jogador = require("./Jogador.js");
class Jogo{
    constructor(id, numJogadores) {
        this.id = id;
        this.status = false;
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
        this.numJogadores = numJogadores;
        this.trunfo = '';
        this.turno = '';
        this.numJogadas = 0;
        this.statusAs = false;
        this.jogadores = [];
        this.chat = {
            mensagens:[]
        };
    }

    getState(){
        return {
            id: this.id,
            status: this.status,
            numJogadores: this.numJogadores,
            trunfo: this.trunfo,
            turno: this.turno,
            numJogadas: this.numJogadas,
            statusAs: this.statusAs,
        }
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

    setJogador(dados){
        var jogador = new Jogador(dados.id, dados.nome);
        this.jogadores.push(jogador);
    }

    setStatus(){
        this.status = true;
    }

    setTurno(id){
        this.turno = id;
    }

    setTrunfo(trunfo){
        this.trunfo = trunfo;
    }

    definirTimes(){
        var time = 1;
        for(var i=0; i<this.numJogadores; i++){
            this.jogadores[i].time = time;
            if(time == 1){
                time = 2;
            }else{
                time = 1;
            }
        }
    }

    darCartas(){
        var num = 0;
        for(var i=0; i<this.numJogadores; i++){
            for(var j=0; j<3; j++){
                num = Math.floor(Math.random() * (this.baralho.length));
                this.jogadores[i].mao.push(this.baralho[num]);
                this.baralho.splice(num, 1);
            }
        }
    }

    tirarTrunfo(){
        let naipes = ['copas', 'paus', 'ouros', 'espadas'];
        let num = Math.floor(Math.random() * 4);

        this.trunfo = naipes[num];
    }

    verificarStatusJogadores(){
        for(var i=0; i<this.jogadores.length; i++){
            if(!this.jogadores[i].status){
                return false;
            }
        }
        return true;
    }

    redefineStatusJogadores(){
        for(var i=0; i<this.jogadores.length; i++){
            this.jogadores[i].status = false;
        }
    }

    comprarCartas(){
        var num;
        for(var i=0; i<this.numJogadores; i++){
            var num = Math.floor(Math.random() * (this.baralho.length));
            this.jogadores[i].mao.push(this.baralho[num]);
            this.jogadores[i].jogada = [];
            this.baralho.splice(num, 1);
        }
    }

    verificarAs(jogadorId, indice){
        for(var i=0; i<this.jogadores.length; i++){
            if(jogadorId == this.jogadores[i].id){
                if(this.jogadores[i].mao[indice][1] == this.trunfo & this.jogadores[i].mao[indice][0] == "as"){
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
    }

    isSete(jogadorId, indice){
        for(var i=0; i<this.jogadores.length; i++){
            if(jogadorId == this.jogadores[i].id){
                if(this.jogadores[i].mao[indice][1] == this.trunfo & this.jogadores[i].mao[indice][0] == "7"){
                    this.statusAs = true;
                }
                break;
            }
        } 
    }
}

module.exports = Jogo;