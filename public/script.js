var socket = io("http://localhost:3000", resgatarGET());

var id = "";
var idSala = ";"

socket.on('connect', () =>{
    id = socket.id;

    console.log(socket);
});

socket.on('darcartas', function(player){
    darCartas(player);
});

socket.on('cartaJogada', function(jogada, indice){
    renderJogarCarta(jogada, indice);
});

socket.on('limparMesa', function(){
    limparMesa();
});

socket.on('atualizarPlacar', function(placar){
    atualizarPlacar(placar);
});

socket.on('msg', function(msg){
    alert(msg);
});

function darCartas(player){
    $("#mao").html("");
    $("#maoOponente").html("");
    $('#iniciar').css("display", "none");

    for(let i=0; i<player.mao.length; i++){
        $("#mao").append(`<img src="imagens/cartas/${player.mao[i][0]}${player.mao[i][1]}.png" alt="" class="carta" id="${player.ordem}${i}" onClick="jogarCarta(${i})">`);
        $("#maoOponente").append(`<img src="imagens/cartas/verso.png" class="carta" id=""></img>`);
    }
    $("#calcrodada").html('<button class="calcularRodada" onClick="calcularRodada()">CalcularRodada</button>');
}

function jogarCarta(indice){
    let jogada = {idPlayer: id, indice: indice};
    socket.emit("jogarCarta", jogada);
}

function renderJogarCarta(jogada, indice){
    $("#"+indice).css("display", "none");
    $("#jogada").append(`<img src="imagens/cartas/${jogada[0]}${jogada[1]}.png" class="carta">`);
}

function calcularRodada(){
    socket.emit('calcularRodada');
}

function limparMesa(){
    $("#jogada").html("");
}

function atualizarPlacar(placar){
    $("#placar").html(`Placar:<br/> Jogador 1:${placar.player1}</br>Jogador 2: ${placar.player2}`);
}

function resgatarGET(){
    var query = location.search.slice(1);
    var partes = query.split('&');
    var data = {};
    partes.forEach(function (parte) {
        var chaveValor = parte.split('=');
        var chave = chaveValor[0];
        var valor = chaveValor[1];
        data[chave] = valor;
    });
    return data;
}

function criarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idCriarSala").value;
    socket.emit('criarSala', idSala);
    limparTela();
    gerarTelaPartida();
}

function entrarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idEntrarSala").value;
    socket.emit('entrarSala', idSala);
    limparTela();
    gerarTelaPartida();
}

function limparTela(){
    $('#tela').html('');
}

function iniciarPartida(event){
    event.preventDefault();
    socket.emit("iniciarPartida", idSala);
}

function gerarTelaPartida(){
    $('#tela').html('\
        <main class="partida">\
            <section class="menu">\
                <h1>Bisca</h1>\
                <div class="placar" id="placar"></div>\
                <button id="iniciar" class="iniciarpartida" onClick="iniciarPartida(event)">Iniciar Partida</button>\
                <div id="calcrodada"></div>\
            </section>\
            <section class="game">\
                <div class="oponente">\
                    <div class="mao" id="maoOponente">\
                    </div>\
                </div>\
                <div class="jogadas">\
                    <div id="jogada"></div>\
                </div>\
                <div class="player">\
                    <div class="mao" id="mao">\
                    </div>\
                </div>\
            </section>\
        </main>\
    ');
}