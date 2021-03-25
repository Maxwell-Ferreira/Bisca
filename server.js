const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


const game = {
    status: false,
    turnoPlayer: "",
    baralho: [
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
    ],
    darCartas: () => {
        game.status = true;
        for(let i = 0; i<3; i++){
            let num = Math.floor(Math.random() * (game.baralho.length));
            player1.mao.push(game.baralho[num]);
            game.baralho.splice(num, 1);
        }
        for(let i = 0; i<3; i++){
            let num = Math.floor(Math.random() * (game.baralho.length));
            player2.mao.push(game.baralho[num]);
            game.baralho.splice(num, 1);
        }
    },
};

const player1 = {
    id: null,
    ordem: 1,
    mao: [],
    jogada: [],
    pontos: 0,
    comprarCarta: () => {
        let num1 = Math.floor(Math.random() * (game.baralho.length));
        player1.mao.push(game.baralho[num1]);
        game.baralho.splice(num1, 1);
        player1.jogada = [];
    }
}

const player2 = {
    id: null,
    ordem: 2,
    mao: [],
    jogada: [],
    pontos: 0,
    comprarCarta: () => {
        let num2 = Math.floor(Math.random() * (game.baralho.length));
        player2.mao.push(game.baralho[num2]);
        game.baralho.splice(num2, 1);
        player2.jogada = [];
    }
}

app.use('/home', (req, res) =>{
    res.render('index.html');
});

app.post('/sala', urlencodedParser, (req, res) =>{
    console.log(req.body);
    //let salaId = req.get('');
    res.render('sala.html');
});

io.on('connection', function(socket){
    console.log(`Socket conectado -> id:${socket.id}`);

    if(!player1.id){
        player1.id = socket.id;
        game.turnoPlayer = socket.id;
    }else if (!player2.id){
        player2.id = socket.id;
    }

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
        if(socket.id == player1.id){
            player1.id = null,
            player1.mao = [];
        }else if(socket.id == player2.id){
            player2.id = null,
            player2.mao = [];
        }
        console.log(`Socket desconectado -> id: ${socket.id}`);
    })
});


server.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});