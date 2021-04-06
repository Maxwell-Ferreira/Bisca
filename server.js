const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const Jogo = require('./src/Jogo.js');
const Helper = require('./src/Helper.js');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var jogos = [];

io.on('connection', function(socket){
    console.log(`Socket conectado -> id:${socket.id}`);
    var helper = new Helper();
    
    socket.on('criarSala', (dados) => {
        var verificacao = helper.verificarCriar(dados, jogos, socket.id);
        if(verificacao.result){
            socket.join(dados.idSala);
            jogos.push(verificacao.resposta);
            socket.emit(verificacao.emit, verificacao.resposta.jogadores);
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }
    });

    socket.on('entrarSala', (dados) => {
        var verificacao = helper.verificarEntrar(dados, jogos, socket.id);
        if(verificacao.result){
            socket.join(dados.idSala);
            jogos[verificacao.resposta.index] = verificacao.resposta.jogo;
            socket.emit(verificacao.emit, verificacao.resposta.jogo.jogadores);
            var players = [];
            players[0] = verificacao.resposta.jogo.jogadores.find(jogador => jogador.id == socket.id);
            socket.broadcast.to(dados.idSala).emit("novoJogador", players);
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }

    });

    socket.on('iniciarPartida', () => {
        var verificacao = helper.verificarIniciar(jogos, socket.id);
        if(verificacao.result){
            var jogo = verificacao.resposta.jogo;
            jogos[verificacao.resposta.index] = jogo;
            for(var i=0; i<jogo.jogadores.length; i++){
                var dados = {
                    jogador: jogo.jogadores[i],
                    jogoEstado: jogo.getState(),
                    times: verificacao.resposta.times,
                    turnoJogador: verificacao.resposta.turnoJogador[0].nome
                };
                io.to(jogo.jogadores[i].id).emit(verificacao.emit, dados);
            }
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }
    });

    socket.on('jogarCarta', (jogada) =>{
        verificacao = helper.verificarJogar(jogada, jogos, socket.id);
        if(verificacao.result){
            var jogo = verificacao.resposta.jogo;
            jogos[verificacao.resposta.index] = jogo;
            socket.emit('removerCartaMao', jogada);
            for(var i=0; i<jogo.jogadores.length; i++){
                if(jogo.jogadores[i].id == socket.id){
                    var dados = {
                        jogador: jogo.jogadores[i],
                        jogoEstado: jogo.getState()
                    };
                    if(jogo.jogadores[i].id != socket.id){
                        io.to(jogo.jogadores[i].id).emit("removerCartaAdversario");
                    }
                    for(var j=0; j<jogo.jogadores.length; j++){
                        io.to(jogo.jogadores[j].id).emit(verificacao.emit, jogo.jogadores[i].jogada);
                    }
                }
            }
            var turnoJogador = jogo.jogadores.filter(function(value){
                return value.id == jogo.turno;
            });

            io.to(jogo.id).emit("jogadorTurno", turnoJogador[0].nome);
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }
    });

    socket.on('pronto', () => {
        var verificar = helper.pronto(jogos, socket.id);
        if(verificar.result){
            jogos[verificar.resposta.index] = verificar.resposta.jogo;
            if(jogos[verificar.resposta.index].baralho.length > 0){
                jogos[verificar.resposta.index].comprarCartas();
            }

            var acabaramCartas = true;
            for(var i=0; i<jogos[verificar.resposta.index].jogadores.length; i++){
                if(jogos[verificar.resposta.index].jogadores[i].mao.length > 0){
                    acabaramCartas = false;
                    break;
                }
            }

            for(var i=0; i<jogos[verificar.resposta.index].jogadores.length; i++){
                io.to(jogos[verificar.resposta.index].jogadores[i].id).emit(verificar.emit, jogos[verificar.resposta.index].jogadores[i]);
            }

            if(acabaramCartas){
                var vencedor = helper.getVencedorPartida(jogos[verificar.resposta.index]);
                io.to(jogos[verificar.resposta.index].id).emit("vencedor", vencedor);
            }
            var jogo = verificar.resposta.jogo;
            var turnoJogador = jogo.jogadores.filter(function(value){
                return value.id == jogo.turno;
            });

            io.to(jogo.id).emit("jogadorTurno", turnoJogador[0].nome);
        }else{
            socket.emit(verificar.emit, verificar.resposta);
        }
    });

    socket.on('mensagem', mensagem => {
        if(typeof mensagem === "string"){
            if(mensagem.length <= 255 && mensagem.length > 0){
                var dados = helper.getJogadorSala(socket.id, jogos);
                io.to(dados.idSala).emit("mensagem", {jogador: dados.jogador, texto: mensagem});
            }
        }
    });

    socket.on('disconnect', () =>{
        var dados = helper.desconectar(socket.id, jogos);
        if(dados){
            jogos[dados.index] = dados.jogo;
            if(jogos[dados.index].status || jogos[dados.index].jogadores.length == 0){
                for(let i=0; i<jogos[dados.index].jogadores.length; i++){
                    io.to(jogos[dados.index].jogadores[i].id).emit("desconexao", `${dados.jogador.nome} se desconectou! A partida foi encerrada :(`);    
                }
                jogos.splice(dados.index, 1);
            }else{
                for(let i=0; i<jogos[dados.index].jogadores.length; i++){
                    io.to(jogos[dados.index].jogadores[i].id).emit("removerJogador", `${dados.jogador.nome}`);    
                }
            }
        }
        console.log(`Socket desconectado -> id: ${socket.id}`);
    })
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta 3000");
});