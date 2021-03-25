var socket = io("http://localhost:3000");

var id = "";

socket.on('connect', () =>{
    id = socket.id;

    console.log(id);
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

function darCartas(player){
    $("#mao").html("");
    $("#maoOponente").html("");

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

$("#iniciar").click(function (event){
    event.preventDefault();
    
    socket.emit("iniciarPartida");
});

