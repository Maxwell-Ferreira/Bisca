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

var jogos = {};

io.on('connection', function(socket){
    console.log(`Socket conectado -> id:${socket.id}`);
    var helper = new Helper();
    
    socket.on('criarSala', (dados) => {
        var verificacao = helper.verificarCriar(dados, jogos, socket.id);
        if(verificacao.result){
            socket.join(dados.idSala);
            socket.sala = dados.idSala;
            jogos[socket.sala] = verificacao.resposta;
            socket.emit(verificacao.emit, verificacao.resposta.jogadores);
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }
    });

    socket.on('entrarSala', (dados) => {
        var verificacao = helper.verificarEntrar(dados, jogos, socket.id);
        if(verificacao.result){
            socket.join(dados.idSala);
            socket.sala = dados.idSala;
            jogos[socket.sala] = verificacao.resposta;
            socket.emit(verificacao.emit, jogos[socket.sala].jogadores);
            
            var player = jogos[socket.sala].jogadores[socket.id];
            socket.broadcast.to(dados.idSala).emit("novoJogador", {player});
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }

    });

    socket.on('iniciarPartida', () => {
        var verificacao = helper.verificarIniciar(jogos[socket.sala], socket.id);
        if(verificacao.result){
            jogos[socket.sala] = verificacao.resposta.jogo;

            for(var j in jogos[socket.sala].jogadores){
                var dados = {
                    jogador: jogos[socket.sala].jogadores[j],
                    jogoEstado: jogos[socket.sala].getState(),
                    times: verificacao.resposta.times,
                    turnoJogador: verificacao.resposta.turnoJogador.nome
                };
                io.to(jogos[socket.sala].jogadores[j].id).emit(verificacao.emit, dados);
            }
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
        }
    });

    socket.on('jogarCarta', (jogada) =>{
        verificacao = helper.verificarJogar(jogada, jogos[socket.sala], socket.id);
        if(verificacao.result){
            var jogo = verificacao.resposta;
            jogos[socket.sala] = jogo;

            socket.emit('removerCartaMao', jogada);

            socket.broadcast.to(jogo.id).emit("removerCartaAdversario");
            io.to(jogo.id).emit(verificacao.emit, jogo.jogadores[socket.id].jogada);
            io.to(jogo.id).emit("jogadorTurno", jogo.jogadores[jogo.turno].nome);

            var pronto = helper.pronto(jogos[socket.sala]);
            if(pronto.result){
                jogos[socket.sala] = pronto.resposta;
                if(jogos[socket.sala].baralho.length > 0){
                    jogos[socket.sala].comprarCartas();
                }

                var acabaramCartas = true;
                for(var j in jogos[socket.sala].jogadores){
                    if(jogos[socket.sala].jogadores[j].mao.length > 0){
                        acabaramCartas = false;
                        break;
                    }
                }

                for(var j in jogos[socket.sala].jogadores){
                    io.to(jogos[socket.sala].jogadores[j].id).emit(pronto.emit, jogos[socket.sala].jogadores[j]);
                }
    
                if(acabaramCartas){
                    var vencedor = helper.getVencedorPartida(jogos[socket.sala]);
                    io.to(socket.sala).emit("vencedor", vencedor);
                }
    
                io.to(jogo.id).emit("jogadorTurno", jogos[socket.sala].jogadores[jogos[socket.sala].turno].nome);
            }
        }else{
            socket.emit(verificacao.emit, verificacao.resposta);
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
        if(typeof socket.sala !== "undefined"){
            if(typeof jogos[socket.sala] !== "undefined"){
                if(jogos[socket.sala].status || Object.keys(jogos[socket.sala].jogadores).length == 1){
                    io.to(socket.sala).emit("desconexao", `${jogos[socket.sala].jogadores[socket.id].nome} se desconectou! A partida foi encerrada :(`);
                    delete jogos[socket.sala];
                }else{
                    io.to(jogos[socket.sala].id).emit("removerJogador", jogos[socket.sala].jogadores[socket.id].nome);
                    delete jogos[socket.sala].jogadores[socket.id];
                }
            }
        }

        console.log(`Socket desconectado -> id: ${socket.id}`);
    })
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta 3000");
});