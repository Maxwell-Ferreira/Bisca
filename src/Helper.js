const Jogo = require('./Jogo.js');

class Helper{
    resposta = {emit: "", data: "", resposta: false};

    verificarCriar(dados, jogos, socketId){
        this.verificarDadosRecebidos(dados);
        if(this.resposta.result){
            if(this.verificarDadosCriar(dados)){
                if(!this.salaExiste(dados.idSala, jogos)){
                    var jogo = new Jogo(dados.idSala, dados.numJogadores);
                    jogo.setJogador({id: socketId, nome: dados.nomeJogador});
                    this.emit.carregarSala(jogo);
                }else{
                    this.emit.mensagem("A sala informada já existe! >:(");
                }
            }else{
                this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
        }
        return this.resposta;
    }

    verificarDadosCriar(dados){
        if(typeof dados.idSala !== "undefined" && typeof dados.nomeJogador !== "undefined" && typeof dados.numJogadores !== "undefined"){
            if(this.verificarString(dados.idSala) && this.verificarString(dados.nomeJogador) && this.verificarNumJogadores(dados.numJogadores)){
                if(dados.numJogadores == "2" || dados.numJogadores == "4"){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    verificarEntrar(dados, jogos, socketId){
        this.verificarDadosRecebidos(dados);
        if(this.resposta.result){
            if(this.verificarDadosEntrar(dados)){
                if(this.salaExiste(dados.idSala, jogos)){
                    var jogo = jogos[dados.idSala];
                    if(!this.salaCheia(jogo)){
                        jogo.setJogador({id: socketId, nome: dados.nomeJogador});
                        this.emit.carregarSala(jogo);
                    }else{
                        this.emit.mensagem("A sala informada já está cheia!");
                    }
                }else{
                    this.emit.mensagem("A sala informada não existe!");
                }
            }else{
                this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
        }

        return this.resposta;
    }

    verificarDadosEntrar(dados){
        if(typeof dados.idSala !== "undefined" && typeof dados.nomeJogador !== "undefined"){
            if(this.verificarString(dados.idSala) && this.verificarString(dados.nomeJogador)){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    verificarIniciar(jogo, socketId){
        var jogador = jogo.jogadores[socketId];
        if(typeof jogador !== "undefined"){
            if(Object.keys(jogo.jogadores).length.toString() === jogo.numJogadores){
                jogo.setStatus();
                jogo.definirTimes();
                jogo.tirarTrunfo();
                jogo.darCartas();
                jogo.setTurno(jogador.id);

                var turnoJogador = jogador;
                var time1 = [];
                var time2 = [];

                for(let j in jogo.jogadores){
                    if(jogo.jogadores[j].time == 1){
                        time1.push(jogo.jogadores[j]);
                    }else{
                        time2.push(jogo.jogadores[j]);
                    }
                }

                var times = {time1, time2};

                this.emit.iniciarPartida(jogo, times, turnoJogador);
            }else{
                this.emit.mensagem("Ainda faltam jogadores para a partida poder iniiciar!");
            }
        }
        return this.resposta;
    }

    verificarJogar(jogada, jogo, socketId){
        if(typeof jogo !== "undefined"){
            if(typeof jogada === "number" && jogada <3){
                if(socketId === jogo.turno){
                    jogo.verificarSete(socketId, jogada);
                    if(jogo.verificarAs(socketId, jogada)){
                        jogo.jogadores[socketId].jogada = jogo.jogadores[socketId].mao[jogada];
                        jogo.jogadores[socketId].mao.splice(jogada, 1);
                        jogo.numJogadas++;
                        jogo.jogadores[socketId].status = true;

                        var arrayJ = Object.keys(jogo.jogadores);

                        for(var i=0; i<arrayJ.length; i++){
                            if(jogo.jogadores[socketId].id == arrayJ[i]){
                                if(typeof arrayJ[i+1] !== "undefined"){
                                    jogo.turno = `${arrayJ[i+1]}`;
                                }else{
                                    jogo.turno = `${arrayJ[0]}`;
                                }
                                break;
                            }
                        }

                        this.emit.jogarCarta(jogo);
                    }else{
                        this.emit.mensagem("O ás de trunfo não pode sair antes da 7!");    
                    }
                }else{
                    this.emit.mensagem("Ainda não é sua vez de jogar!");
                }
            }else{
                this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            this.emit.mensagem("Não tente nos enganar! Sabemos que ainda não se conecou à uma sala!");
        }
    
        return this.resposta;
    }

    pronto(jogo){
        if(jogo.verificarStatusJogadores()){
            var resultado = this.calcularRodada(jogo);
            resultado.redefineStatusJogadores();
            this.emit.calcularRodada(resultado);
        }else{
            this.emit.cartaJogada("Pronto, estamos aguardando os outros jogadores jogarem também!");
        }

        return this.resposta;
    }

    calcularRodada(jogo){
        var jogadores = jogo.jogadores;
        var j = Object.keys(jogadores);

        if(j.length == 2){
            if(jogadores[j[0]].jogada[1] == jogadores[j[1]].jogada[1]){
                if(jogadores[j[0]].jogada[3] > jogadores[j[1]].jogada[3]){
                    jogo.jogadores[j[0]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                    jogo.turno = jogadores[j[0]].id;
                }else{
                    jogo.jogadores[j[1]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                    jogo.turno = jogadores[j[1]].id;
                }
            }else{
                if(jogadores[j[0]].jogada[1] == jogo.trunfo){
                    jogo.jogadores[j[0]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                    jogo.turno = jogadores[j[0]].id;
                }else if(jogadores[j[1]].jogada[1] == jogo.trunfo){
                    jogo.jogadores[j[1]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                    jogo.turno = jogadores[j[1]].id;
                }else{
                    if(jogadores[j[0]].id == jogo.turno){
                        jogo.jogadores[j[0]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                        jogo.turno = jogadores[j[0]].id;
                    }else{
                        jogo.jogadores[j[1]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]);
                        jogo.turno = jogadores[j[1]].id;
                    }
                }
            }
            return jogo;

        }else if(j.length == 4){
            if(jogadores[j[0]].jogada[1] == jogadores[j[1]].jogada[1] == jogadores[j[2]].jogada[1] == jogadores[j[3]].jogada[1]){
                if(jogadores[j[0]].jogada[3] > jogadores[j[1]].jogada[3] && jogadores[j[0]].jogada[3] > jogadores[j[2]].jogada[3] && jogadores[j[0]].jogada[3] > jogadores[j[3]].jogada[3]){
                    jogo.jogadores[j[0]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                    jogo.turno = jogadores[j[0]].id;
                }
                else if(jogadores[j[1]].jogada[3] > jogadores[j[0]].jogada[3] && jogadores[j[1]].jogada[3] > jogadores[j[2]].jogada[3] && jogadores[j[1]].jogada[3] > jogadores[j[3]].jogada[3]){
                    jogo.jogadores[j[1]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                    jogo.turno = jogadores[j[1]].id;
                }
                else if(jogadores[j[2]].jogada[3] > jogadores[j[0]].jogada[3] && jogadores[j[2]].jogada[3] > jogadores[j[1]].jogada[3] && jogadores[j[2]].jogada[3] > jogadores[j[3]].jogada[3]){
                    jogo.jogadores[j[2]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                    jogo.turno = jogadores[j[2]].id;
                }
                else if(jogadores[j[3]].jogada[3] > jogadores[j[0]].jogada[3] && jogadores[j[3]].jogada[3] > jogadores[j[1]].jogada[3] && jogadores[j[3]].jogada[3] > jogadores[j[2]].jogada[3]){
                    jogo.jogadores[j[3]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                    jogo.turno = jogadores[j[3]].id;
                }
            }
            else if(jogadores[j[0]].jogada[1] == jogo.trunfo || jogadores[j[1]].jogada[1] == jogo.trunfo || jogadores[j[2]].jogada[1] == jogo.trunfo || jogadores[j[3]].jogada[1] == jogo.trunfo){
                var vencedor;

                if(jogadores[j[0]].jogada[1] == jogo.trunfo){
                    vencedor = 0;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[0]].id != jogadores[j[i]].id){
                            if(jogadores[j[i]].jogada[1] == jogo.trunfo){
                                if(jogadores[j[vencedor]].jogada[3] < jogadores[j[i]].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[j[1]].jogada[1] == jogo.trunfo){
                    vencedor = 1;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[1]].id != jogadores[j[i]].id){
                            if(jogadores[j[i]].jogada[1] == jogo.trunfo){
                                if(jogadores[j[vencedor]].jogada[3] < jogadores[j[i]].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[j[2]].jogada[1] == jogo.trunfo){
                    vencedor = 2;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[2]].id != jogadores[j[i]].id){
                            if(jogadores[j[i]].jogada[1] == jogo.trunfo){
                                if(jogadores[j[vencedor]].jogada[3] < jogadores[j[i]].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[j[3]].jogada[1] == jogo.trunfo){
                    vencedor = 3;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[3]].id != jogadores[j[i]].id){
                            if(jogadores[j[i]].jogada[1] == jogo.trunfo){
                                if(jogadores[j[vencedor]].jogada[3] < jogadores[j[i]].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                jogo.jogadores[j[vencedor]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                jogo.turno = jogadores[j[vencedor]].id;

            }else{
                var vencedor;
                if(jogadores[j[0]].id == jogo.turno){
                    vencedor = 0;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[i]].jogada[1] == jogadores[j[vencedor]].jogada[1]){
                            if(jogadores[j[i]].jogada[3] > jogadores[j[vencedor]].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }else if(jogadores[j[1]].id == jogo.turno){
                    vencedor = 1;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[i]].jogada[1] == jogadores[j[vencedor]].jogada[1]){
                            if(jogadores[j[i]].jogada[3] > jogadores[j[vencedor]].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }
                else if(jogadores[j[2]].id == jogo.turno){
                    vencedor = 2;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[i]].jogada[1] == jogadores[j[vencedor]].jogada[1]){
                            if(jogadores[j[i]].jogada[3] > jogadores[j[vencedor]].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }else if(jogadores[j[3]].id == jogo.turno){
                    vencedor = 3;
                    for(var i=0; i<j.length; i++){
                        if(jogadores[j[i]].jogada[1] == jogadores[j[vencedor]].jogada[1]){
                            if(jogadores[j[i]].jogada[3] > jogadores[j[vencedor]].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }
                jogo.jogadores[j[vencedor]].pontos += parseInt(jogadores[j[0]].jogada[2]) + parseInt(jogadores[j[1]].jogada[2]) + parseInt(jogadores[j[2]].jogada[2]) + parseInt(jogadores[j[3]].jogada[2]);
                jogo.turno = jogadores[j[vencedor]].id;
            }

            return jogo;
        }
    }

    getVencedorPartida(jogo){
        var time1 = {pontos: 0, jogadores: []};
        var time2 = {pontos: 0, jogadores: []};
        for(var j in jogo.jogadores){
            if(jogo.jogadores[j].time == 1){
                time1.jogadores.push(jogo.jogadores[j].nome); 
                time1.pontos += jogo.jogadores[j].pontos;
            }else if(jogo.jogadores[j].time == 2){
                time2.jogadores.push(jogo.jogadores[j].nome);
                time2.pontos += jogo.jogadores[j].pontos;
            }
        }
        
        if(time1.pontos > time2.pontos){
            return time1;
        }else{
            return time2;
        }
    }

    verificarDadosRecebidos(dados){
        if(typeof dados === "object"){
            if(!this.isEmpty(dados)){
                this.dadosCorretos();
            }else{
                this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
                return this.resposta;
            }
        }else{
            this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
            return this.resposta;
        }
    }

    salaExiste(idSala, jogos){
        var jogo = jogos[idSala];
        if(typeof jogo !== "undefined"){
            return true;
        }else{
            return false;
        }
    }

    salaCheia(jogo){
       if(Object.keys(jogo).length < jogo.numJogadores){
           return true;
       }else{
           return false;
       }
    }

    verificarString(string){
        if(typeof string === "string"){
            if(string.length <= 20 && string.length > 3){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
        
    }

    verificarNumJogadores(numJogadores){
        if(typeof numJogadores === "string"){
            if(numJogadores == "2" || numJogadores == "4"){
                return true;
            }
        }

        return false;
    }

    isEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }
    
        return true;
    }
    
    dadosCorretos(){
        this.resposta.result = true;
    }

    getJogadorSala(idJogador, jogos){
        for(var i=0; i<jogos.length; i++){
            for(var j=0; j<jogos[i].jogadores.length; j++){
                if(jogos[i].jogadores[j].id == idJogador){
                    return {idSala: jogos[i].id, jogador: jogos[i].jogadores[j].nome};
                }
            }
        }
    }

    emit = {
        mensagem: (msg) => {
            this.resposta.emit = "msg";
            this.resposta.resposta = msg;
            this.resposta.result = false;
        },

        carregarSala: (jogo) => {
            this.resposta.emit = "carregarSala";
            this.resposta.resposta = jogo;
            this.resposta.result = true;
        },

        iniciarPartida: (jogo, times, turnoJogador) => {
            this.resposta.emit = "iniciarPartida";
            this.resposta.resposta = {jogo, times, turnoJogador};
            this.resposta.result = true;
        },

        jogarCarta: (jogo) => {
            this.resposta.emit = "jogarCarta";
            this.resposta.resposta = jogo;
            this.resposta.result = true;
        },

        cartaJogada: (msg) => {
            this.resposta.emit = "cartaJogada";
            this.resposta.resposta = msg;
            this.resposta.result = false;
        },

        calcularRodada: (jogo) => {
            this.resposta.emit = "calcularRodada";
            this.resposta.resposta = jogo;
            this.resposta.result = true;
        }

    }
}

module.exports = Helper;