const Jogo = require('./Jogo.js');

class Helper{
    resposta = {emit: "", data: "", resposta: false};

    verificarCriar(dados, jogos, socketId){
        this.verificarDadosRecebidos(dados);
        if(this.resposta.result){
            if(this.verificarDadosCriar(dados)){
                var salaExiste = this.salaExiste(dados.idSala, jogos);
                if(!salaExiste.result){
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
                var salaExiste = this.salaExiste(dados.idSala, jogos);
                if(salaExiste.result){
                    if(!this.salaCheia(jogos[salaExiste.index])){
                        var jogo = jogos[salaExiste.index];
                        jogo.setJogador({id: socketId, nome: dados.nomeJogador});
                        this.emit.carregarSala(jogo, salaExiste.index);
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

    verificarIniciar(jogos, socketId){
        for(var [key, value] of Object.entries(jogos)){
            for(var i=0; i<value.jogadores.length; i++){
                if(value.jogadores[i].id == socketId){
                    if(value.jogadores.length.toString() == value.numJogadores){
                        var jogo = value;
                        jogo.setStatus();
                        jogo.definirTimes();
                        jogo.tirarTrunfo();
                        jogo.darCartas();
                        jogo.setTurno(value.jogadores[i].id);

                        var turnoJogador = jogo.jogadores.filter(function(value){
                            return value.id == jogo.turno;
                        });

                        var time1 = jogo.jogadores.filter(function(value){
                            return value.time == 1;
                        });
                        var time2 = jogo.jogadores.filter(function(value){
                            return value.time == 2;
                        });

                        var times = {time1: time1, time2: time2};

                        this.emit.iniciarPartida(jogo, key, times, turnoJogador);
                        break;
                    }else{
                        this.emit.mensagem("Ainda faltam jogadores para a partida poder iniiciar!");
                        break;
                    }
                }
            }
        }
        return this.resposta;
    }

    verificarJogar(jogada, jogos, socketId){
        if(typeof jogada === "number" && jogada <3){
            for(var [key, jogo] of Object.entries(jogos)){
                for(var i=0; i<jogo.jogadores.length; i++){
                    if(jogo.jogadores[i].id == socketId){
                        if(socketId == jogo.turno){
                            jogo.isSete(socketId, jogada);
                            if(jogo.verificarAs(socketId, jogada)){
                                jogo.jogadores[i].jogada = jogo.jogadores[i].mao[jogada];
                                jogo.jogadores[i].mao.splice(jogada, 1);
                                jogo.numJogadas++;

                                if(typeof jogo.jogadores[i+1] !== "undefined"){
                                    jogo.turno = jogo.jogadores[i+1].id;
                                }else{
                                    jogo.turno = jogo.jogadores[0].id;
                                }

                                this.emit.jogarCarta(jogo, key);
                            }else{
                                this.emit.mensagem("O ás de trunfo não pode sair antes da 7!");    
                            }
                        }else{
                            this.emit.mensagem("Ainda não é sua vez de jogar!");
                        }
                    }
                }
            }
        }else{
            this.emit.mensagem("Não tente nos enganar, envie dados corretos! >:(");
        }

        return this.resposta;
    }

    pronto(jogos, socketId){
        for(var i=0; i<jogos.length; i++){
            for(var j=0; j<jogos[i].jogadores.length; j++){
                if(jogos[i].jogadores[j].id == socketId){
                    if(jogos[i].jogadores[j].jogada.length > 0){
                        jogos[i].jogadores[j].status = true;
                        if(jogos[i].verificarStatusJogadores()){
                            var jogo = this.calcularRodada(jogos[i].jogadores, jogos[i]);
                            jogo.redefineStatusJogadores();
                            this.emit.calcularRodada(jogo, i);
                        }else{
                            this.emit.cartaJogada("Pronto, estamos aguardando os outros jogadores confirmarem também!");
                        }
                    }else{
                        this.emit.mensagem("Você ainda não jogou uma carta!");
                    }
                }
            }
        }
        return this.resposta;
    }

    calcularRodada(jogadores, jogo){
        if(jogadores.length == 2){
            if(jogadores[0].jogada[1] == jogadores[1].jogada[1]){
                if(jogadores[0].jogada[3] > jogadores[1].jogada[3]){
                    jogo.jogadores[0].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                    jogo.turno = jogadores[0].id;
                }else{
                    jogo.jogadores[1].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                    jogo.turno = jogadores[1].id;
                }
            }else{
                if(jogadores[0].jogada[1] == jogo.trunfo){
                    jogo.jogadores[0].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                    jogo.turno = jogadores[0].id;
                }else if(jogadores[1].jogada[1] == jogo.trunfo){
                    jogo.jogadores[1].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                    jogo.turno = jogadores[1].id;
                }else{
                    if(jogadores[0].id == jogo.turno){
                        jogo.jogadores[0].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                        jogo.turno = jogadores[0].id;
                    }else{
                        jogo.jogadores[1].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]);
                        jogo.turno = jogadores[1].id;
                    }
                }
            }
            return jogo;

        }else if(jogadores.length == 4){
            if(jogadores[0].jogada[1] == jogadores[1].jogada[1] == jogadores[2].jogada[1] == jogadores[3].jogada[1]){
                if(jogadores[0].jogada[3] > jogadores[1].jogada[3] && jogadores[0].jogada[3] > jogadores[2].jogada[3] && jogadores[0].jogada[3] > jogadores[3].jogada[3]){
                    jogo.jogadores[0].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                    jogo.turno = jogadores[0].id;
                }else if(jogadores[1].jogada[3] > jogadores[0].jogada[3] && jogadores[1].jogada[3] > jogadores[2].jogada[3] && jogadores[1].jogada[3] > jogadores[3].jogada[3]){
                    jogo.jogadores[1].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                    jogo.turno = jogadores[1].id;
                }
                else if(jogadores[2].jogada[3] > jogadores[0].jogada[3] && jogadores[2].jogada[3] > jogadores[1].jogada[3] && jogadores[2].jogada[3] > jogadores[3].jogada[3]){
                    jogo.jogadores[2].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                    jogo.turno = jogadores[2].id;
                }
                else if(jogadores[3].jogada[3] > jogadores[0].jogada[3] && jogadores[3].jogada[3] > jogadores[1].jogada[3] && jogadores[3].jogada[3] > jogadores[2].jogada[3]){
                    jogo.jogadores[3].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                    jogo.turno = jogadores[3].id;
                }
            }else if(jogadores[0].jogada[1] == jogo.trunfo || jogadores[1].jogada[1] == jogo.trunfo || jogadores[2].jogada[1] == jogo.trunfo || jogadores[3].jogada[1] == jogo.trunfo){
                var vencedor;
                if(jogadores[0].jogada[1] == jogo.trunfo){
                    vencedor = 0;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[0].id != jogadores[i].id){
                            if(jogadores[i].jogada[1] == jogo.trunfo){
                                if(jogadores[vencedor].jogada[3] < jogadores[i].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[1].jogada[1] == jogo.trunfo){
                    vencedor = 1;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[1].id != jogadores[i].id){
                            if(jogadores[i].jogada[1] == jogo.trunfo){
                                if(jogadores[vencedor].jogada[3] < jogadores[i].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[2].jogada[1] == jogo.trunfo){
                    vencedor = 2;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[2].id != jogadores[i].id){
                            if(jogadores[i].jogada[1] == jogo.trunfo){
                                if(jogadores[vencedor].jogada[3] < jogadores[i].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                if(jogadores[3].jogada[1] == jogo.trunfo){
                    vencedor = 3;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[3].id != jogadores[i].id){
                            if(jogadores[i].jogada[1] == jogo.trunfo){
                                if(jogadores[vencedor].jogada[3] < jogadores[i].jogada[3]){
                                    vencedor = i;
                                }
                            }
                        }
                    }
                }

                jogo.jogadores[vencedor].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                jogo.turno = jogadores[vencedor].id;

            }else{
                var vencedor;
                if(jogadores[0].id == jogo.turno){
                    vencedor = 0;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[i].jogada[1] == jogadores[vencedor].jogada[1]){
                            if(jogadores[i].jogada[3] > jogadores[vencedor].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }else if(jogadores[1].id == jogo.turno){
                    vencedor = 1;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[i].jogada[1] == jogadores[vencedor].jogada[1]){
                            if(jogadores[i].jogada[3] > jogadores[vencedor].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }
                else if(jogadores[2].id == jogo.turno){
                    vencedor = 2;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[i].jogada[1] == jogadores[vencedor].jogada[1]){
                            if(jogadores[i].jogada[3] > jogadores[vencedor].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }else if(jogadores[3].id == jogo.turno){
                    vencedor = 3;
                    for(var i=0; i<jogadores.length; i++){
                        if(jogadores[i].jogada[1] == jogadores[vencedor].jogada[1]){
                            if(jogadores[i].jogada[3] > jogadores[vencedor].jogada[3]){
                                vencedor = i;
                            }
                        }
                    }
                }
                jogo.jogadores[vencedor].pontos += parseInt(jogadores[0].jogada[2]) + parseInt(jogadores[1].jogada[2]) + parseInt(jogadores[2].jogada[2]) + parseInt(jogadores[3].jogada[2]);
                jogo.turno = jogadores[vencedor].id;
            }

            return jogo;
        }
    }

    getVencedorPartida(jogo){
        var time1 = {pontos: 0, jogadores: []};
        var time2 = {pontos: 0, jogadores: []};
        for(var i=0; i<jogo.jogadores.length; i++){
            if(jogo.jogadores[i].time == 1){
                time1.jogadores.push(jogo.jogadores[i].nome); 
                time1.pontos += jogo.jogadores[i].pontos;
            }else if(jogo.jogadores[i].time == 2){
                time2.jogadores.push(jogo.jogadores[i].nome);
                time2.pontos += jogo.jogadores[i].pontos;
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
        var index = jogos.findIndex(jogo => jogo.id == idSala);
        if(index >= 0){
            return {index: index, result: true};
        }else{
            this.emit.mensagem("A sala informada não existe!");
            return {result: false};
        }
    }

    salaCheia(jogo){
       if(Object.keys(jogo.jogadores).length < jogo.numJogadores){
           return false;
       }else{
           return true;
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

        carregarSala: (jogo, indexSala) => {
            this.resposta.emit = "carregarSala";
            if(typeof indexSala !== "undefined"){
                this.resposta.resposta = {jogo: jogo, index: indexSala};
            }else{
                this.resposta.resposta = jogo;
            }
            this.resposta.result = true;
        },

        iniciarPartida: (jogo, indexSala, times, turnoJogador) => {
            this.resposta.emit = "iniciarPartida";
            this.resposta.resposta = {jogo: jogo, index: indexSala, times: times, turnoJogador: turnoJogador};
            this.resposta.result = true;
        },

        jogarCarta: (jogo, indexSala) => {
            this.resposta.emit = "jogarCarta";
            this.resposta.resposta = {jogo: jogo, index: indexSala};
            this.resposta.result = true;
        },

        cartaJogada: (msg) => {
            this.resposta.emit = "cartaJogada";
            this.resposta.resposta = msg;
            this.resposta.result = false;
        },

        calcularRodada: (jogo, indexSala) => {
            this.resposta.emit = "calcularRodada";
            this.resposta.resposta = {jogo: jogo, index: indexSala};
            this.resposta.result = true;
        }

    }

    desconectar(socketId, jogos){
        if(jogos.length > 0){
            for(var [key, value] of Object.entries(jogos)){
                for(var i=0; i<value.jogadores.length; i++){
                    if(value.jogadores[i].id == socketId){
                        var jogo = value;
                        var jogador = value.jogadores[i];
                        jogo.jogadores.splice(i, 1);
                        var dados = {jogo: jogo, index: key, jogador: jogador};
                        return dados;
                    }
                }
            }
        }
        
        return false;

        /* let index = jogos.findIndex(jogo => jogo.jogadores[socketId].id == socketId);
        if(typeof jogos[index] !== "undefined"){
            var jogo = jogos[index];
            delete jogo.jogadores[socketId];

            return {jogo: jogo, index: index};
        }else{
            return false;
        } */
    }
    
}

module.exports = Helper;