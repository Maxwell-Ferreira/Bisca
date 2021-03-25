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

app.get('/sala', urlencodedParser, (req, res) =>{
    let idSala = req.query.idSala;
    if(!jogos[idSala]){
        jogos[idSala] = new Jogo(idSala);
        console.log(jogos);
        res.render('sala.html');
    }else if(!jogos[idSala].jogador1.id | !jogos[idSala].jogador2.id){
        res.render('sala.html');
        console.log("novo jogador!");
    }else{
        res.render('index.html');
    }
});

io.on('connection', function(socket){
    console.log(`Socket conectado -> id:${socket.id}`);

    //ATENÇÃO definir como vai setar o player!

    socket.on('iniciarPartida', () => {
        if(!game.status){
            game.darCartas();
            io.to(player1.id).emit("darcartas", player1);
            io.to(player2.id).emit("darcartas", player2);
        }
    });

    socket.on('jogarCarta', (jogada) =>{
        if(game.status && jogada.idPlayer == game.turnoPlayer){
            if(jogada.idPlayer == player1.id){
                game.turnoPlayer = player2.id;
                player1.jogada = player1.mao[jogada.indice];
                player1.mao.splice(jogada.indice, 1);
                let indiceConcat = `${player1.ordem}${jogada.indice}`;
                io.emit('cartaJogada', player1.jogada, indiceConcat);
            }else if(jogada.idPlayer == player2.id){
                game.turnoPlayer = player1.id;
                player2.jogada = player2.mao[jogada.indice];
                player2.mao.splice(jogada.indice, 1);
                let indiceConcat = `${player2.ordem}${jogada.indice}`;
                io.emit('cartaJogada', player2.jogada, indiceConcat);
            }
        }
    });

    socket.on('calcularRodada', () => {
        if(player1.jogada.length && player2.jogada.length){
            if(player1.jogada[1] == player2.jogada[1]){
                if(player1.jogada[3] > player2.jogada[3]){
                    player1.pontos += parseInt(player1.jogada[2]) + parseInt(player2.jogada[2]);
                    game.turnoPlayer = player1.id;
                }else{
                    player2.pontos += parseInt(player1.jogada[2]) + parseInt(player2.jogada[2]);
                    game.turnoPlayer = player2.id;
                }
            }else{
                if(player1.id == game.turnoPlayer){
                    player1.pontos += parseInt(player1.jogada[2]) + parseInt(player2.jogada[2]);
                    game.turnoPlayer = player1.id;
                }else{
                    player2.pontos += parseInt(player1.jogada[2]) + parseInt(player2.jogada[2]);
                    game.turnoPlayer = player2.id;
                }
            }
            player1.comprarCarta();
            player2.comprarCarta();
            io.to(player1.id).emit("darcartas", player1);
            io.to(player2.id).emit("darcartas", player2);
            io.emit('limparMesa');
            let placar = {player1: player1.pontos, player2: player2.pontos};
            io.emit('atualizarPlacar', placar);
        }
    });

    socket.on('disconnect', () =>{
        /* if(socket.id == player1.id){
            player1.id = null,
            player1.mao = [];
        }else if(socket.id == player2.id){
            player2.id = null,
            player2.mao = [];
        } */
        console.log(`Socket desconectado -> id: ${socket.id}`);
    })
});


server.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});