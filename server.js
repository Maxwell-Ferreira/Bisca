const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const Jogo = require('./src/Jogo.js');
const { Console } = require('console');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.use('/home', (req, res) =>{
    res.render('index.html');
    console.log(Jogo);
});

var jogos = {};
var jogo = {};

app.get('/sala', urlencodedParser, (req, res) =>{
    let idSala = req.query.idSala;
    if(!jogos[idSala]){
        jogo = new Jogo(idSala);
        jogos[idSala] = jogo;
        res.render('sala.html');
    }else if(!jogos[idSala].jogador1.id | !jogos[idSala].jogador2.id){
        res.render('sala.html');
    }else{
        res.render('index.html');
    }
});

io.on('connection', function(socket){
    console.log(`Socket conectado -> id:${socket.id}`);
    
    socket.on('criarSala', (dados) => {
        if(typeof dados !== "undefined"){
            if(typeof dados.idSala !== "undefined" && typeof dados.nomeJogador !== "undefined"){
                if(dados.idSala.length <= 20 && dados.nomeJogador.length <= 20){
                    if(!jogos[dados.idSala]){
                        let jogo = new Jogo(dados.idSala);
                        jogo.jogador1.id = socket.id;
                        jogo.jogador1.nome = dados.nomeJogador;
                        jogos[dados.idSala] = jogo;
                        socket.emit("carregarSala");
                    }else{
                        socket.emit("msg", "Sala já existe!");
                    }
                }else{
                    socket.emit("msg", "Favor, não insira Ids ou nomes muito grandes! Isso pode travar o jogo para todos >:(");
                }
            }else{
                socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
        }
    });

    socket.on('entrarSala', (dados) => {
        if(typeof dados !== "undefined"){
            if(typeof dados.idSala !== "undefined" && typeof dados.nomeJogador !== "undefined"){
                if(dados.idSala.length <= 20 && dados.nomeJogador.length <= 20){
                    if(jogos[dados.idSala]){
                        if(jogos[dados.idSala].jogador2.id){
                            socket.emit("msg", "Sala cheia!");
                        }else{
                            jogos[dados.idSala].jogador2.id = socket.id;
                            jogos[dados.idSala].jogador2.nome = dados.nomeJogador;
                            socket.emit("carregarSala");
                        }
                    }else{
                        socket.emit("msg", "Sala informada não existe!");
                    }
                }else{
                    socket.emit("msg", "Favor, não insira Ids ou nomes muito grandes! Isso pode travar o jogo para todos >:(");
                }
            }else{
                socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
        }
    });

    socket.on('iniciarPartida', (idSala) => {
        if(typeof idSala === "string" && idSala.length <= 20){
            if(jogos[idSala].jogador1.id != false & jogos[idSala].jogador2.id != false){
                jogos[idSala].tirarTrunfo();
                jogos[idSala].darCartas();
                jogos[idSala].turno = jogos[idSala].jogador1.id;

                io.to(jogos[idSala].jogador1.id).emit("mostrarTrunfo", jogos[idSala].trunfo);
                io.to(jogos[idSala].jogador2.id).emit("mostrarTrunfo", jogos[idSala].trunfo);

                io.to(jogos[idSala].jogador1.id).emit("darcartas", jogos[idSala].jogador1, {nome: jogos[idSala].jogador2.nome, pontos: jogos[idSala].jogador2.pontos});
                io.to(jogos[idSala].jogador2.id).emit("darcartas", jogos[idSala].jogador2, {nome: jogos[idSala].jogador1.nome, pontos: jogos[idSala].jogador1.pontos});
            }else{
                socket.emit('msg', 'Falta a entrada do adversário para iniciar a partida!');
            }
        }else{
            socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
        }
    });

    socket.on('jogarCarta', (jogada) =>{
        if(typeof jogada !== "undefined"){
            if(typeof jogada.idSala !== "undefined" && typeof jogada.indice !== "undefined"){
                if(jogada.idSala.length <= 20 && jogada.indice.length <= 20){
                    if(jogos[jogada.idSala].turno == socket.id){
                        jogos[jogada.idSala].isSete(socket.id, jogada.indice);
                        if(jogos[jogada.idSala].verificarAs(socket.id, jogada.indice)){
                            if(jogos[jogada.idSala].jogador1.id == socket.id){
                                jogos[jogada.idSala].turno = jogos[jogada.idSala].jogador2.id;
                                jogos[jogada.idSala].jogador1.jogada = jogos[jogada.idSala].jogador1.mao[jogada.indice];
                                jogos[jogada.idSala].jogador1.mao.splice(jogada.indice, 1);

                                jogos[jogada.idSala].numJogadas++;
                                
                                socket.emit('removerCartaMao', jogada.indice);
                                io.to(jogos[jogada.idSala].jogador2.id).emit("removerCartaAdversario");

                                io.to(jogos[jogada.idSala].jogador1.id).emit('cartaJogada', jogos[jogada.idSala].jogador1.jogada);
                                io.to(jogos[jogada.idSala].jogador2.id).emit('cartaJogada', jogos[jogada.idSala].jogador1.jogada);
                
                            }else if(jogos[jogada.idSala].jogador2.id == socket.id){
                                jogos[jogada.idSala].turno = jogos[jogada.idSala].jogador1.id;
                                jogos[jogada.idSala].jogador2.jogada = jogos[jogada.idSala].jogador2.mao[jogada.indice];
                                jogos[jogada.idSala].jogador2.mao.splice(jogada.indice, 1);

                                jogos[jogada.idSala].numJogadas++;
                                
                                socket.emit('removerCartaMao', jogada.indice);
                                io.to(jogos[jogada.idSala].jogador1.id).emit("removerCartaAdversario");

                                io.to(jogos[jogada.idSala].jogador1.id).emit('cartaJogada', jogos[jogada.idSala].jogador2.jogada);
                                io.to(jogos[jogada.idSala].jogador2.id).emit('cartaJogada', jogos[jogada.idSala].jogador2.jogada);
                                
                            }
                        }else{
                            socket.emit("msg", "O As de trunfo só pode sair depois da Sete de trunfo!");
                        }
                    }else{
                        socket.emit("msg", "A vez é do outro jogador!");
                    }
                }else{
                    socket.emit("msg", "Favor, não insira Ids ou nomes muito grandes! Isso pode travar o jogo para todos >:(");
                }
            }else{
                socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
            }
        }else{
            socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
        }
    });

    socket.on('calcularRodada', (idSala) => {
        if(typeof idSala === "string" && idSala.length < 20
        && jogos[idSala].jogador1.jogada.length && jogos[idSala].jogador2.jogada.length){

            if(jogos[idSala].jogador1.jogada[1] == jogos[idSala].jogador2.jogada[1]){
                if(jogos[idSala].jogador1.jogada[3] > jogos[idSala].jogador2.jogada[3]){
                    jogos[idSala].rodadaJogador1();
                }else{
                    jogos[idSala].rodadaJogador2();
                }
            }else{
                if(jogos[idSala].jogador1.jogada[1] == jogos[idSala].trunfo){
                    jogos[idSala].rodadaJogador1();
                }else if(jogos[idSala].jogador2.jogada[1] == jogos[idSala].trunfo){
                    jogos[idSala].rodadaJogador2();
                }else{
                    if(jogos[idSala].jogador1.id == jogos[idSala].turno){
                        jogos[idSala].rodadaJogador1();
                    }else{
                        jogos[idSala].rodadaJogador2();
                    }
                }
            }

            jogos[idSala].comprarCartas();
            io.to(jogos[idSala].jogador1.id).emit("darcartas", jogos[idSala].jogador1, {nome: jogos[idSala].jogador2.nome, pontos: jogos[idSala].jogador2.pontos});
            io.to(jogos[idSala].jogador2.id).emit("darcartas", jogos[idSala].jogador2, {nome: jogos[idSala].jogador1.nome, pontos: jogos[idSala].jogador1.pontos});
            
            io.to(jogos[idSala].jogador1.id).emit('limparMesa');
            io.to(jogos[idSala].jogador2.id).emit('limparMesa');

            if(jogos[idSala].numJogadas == 40){
                io.to(jogos[idSala].jogador1.id).emit("finalizarPartida", `Partida Finalizada! Parabéns, ${jogos[idSala].getVencedor}! Você venceu!`);
                io.to(jogos[idSala].jogador2.id).emit("finalizarPartida", `Partida Finalizada! Parabéns, ${jogos[idSala].getVencedor}! Você venceu!`);
            }
        }else{
            socket.emit("msg", "Não tente nos enganar, envie dados corretos! >:(");
        }
    });

    socket.on('disconnect', () =>{
        for(var jogo in jogos){
            if(jogos[jogo].jogador1.id == socket.id){
                io.to(jogos[jogo].jogador2.id).emit("desconexao", `${jogos[jogo].jogador1.nome} se desconectou! A partida foi encerrada :(`);
                delete(jogos[jogo]);
                break;
            }else if(jogos[jogo].jogador2.id == socket.id){
                io.to(jogos[jogo].jogador1.id).emit("desconexao", `${jogos[jogo].jogador2.nome} se desconectou! A partida foi encerrada :(`);
                delete(jogos[jogo]);
                break;
            }
        }
        console.log(`Socket desconectado -> id: ${socket.id}`);
    })
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando na porta 3000");
});