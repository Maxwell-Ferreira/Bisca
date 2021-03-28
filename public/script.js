//var socket = io("https://biscabraba.herokuapp.com");
var socket = io("http://localhost:3000");

var id = "";
var idSala = "";
var nomeJogador = "";

socket.on('connect', () =>{
    id = socket.id;

    console.log(socket);
});

socket.on('carregarSala', function(){
    limparTela();
    gerarTelaPartida();
})

socket.on('mostrarTrunfo', function(trunfo){
    alert(`O trunfo da partida é: ${trunfo}`);
    mostrarTrunfo(trunfo);
});

socket.on('darcartas', function(jogador, adversario){
    darCartas(jogador, adversario);
});

socket.on('cartaJogada', function(jogada){
    renderJogarCarta(jogada);
});

socket.on('removerCartaMao', function(indice){
    removerCartaJogada(indice);
});

socket.on('removerCartaAdversario', function(){
    removerCartaAdversario();
});

socket.on('limparMesa', function(){
    limparMesa();
});

socket.on('msg', function(msg){
    alert(msg);
});

socket.on('desconexao', function(msg){
    alert(msg);
    document.location.reload(true);
})

socket.on('finalizarPartida', function(msg){
    alert(msg);
    document.location.reload(true);
})

function criarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idCriarSala").value;
    nomeJogador = document.getElementById("nomeCriador").value;
    socket.emit('criarSala', {idSala: idSala, nomeJogador: nomeJogador});
}

function entrarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idEntrarSala").value;
    nomeJogador = document.getElementById("nomeConectar").value;
    socket.emit('entrarSala', {idSala: idSala, nomeJogador: nomeJogador});
}

function limparTela(){
    $('#tela').html('');
}

function iniciarPartida(event){
    event.preventDefault();
    socket.emit("iniciarPartida", idSala);
}

function mostrarTrunfo(trunfo){
    $('#trunfo').html(`Trunfo: ${trunfo}`);
}

function darCartas(jogador, adversario){
    $('#iniciar').css("display", "none");
    $('#placar').html(`<h2>Placar </h2><p>${jogador.nome}: ${jogador.pontos}</p><p>${adversario.nome}: ${adversario.pontos}</p>`);
    $('#mao').html('');
    $('#maoOponente').html('');
    reproduzirAudio();

    for(let i=0; i<jogador.mao.length; i++){
        $("#mao").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogador.mao[i][0]}${jogador.mao[i][1]}.png" alt="" class="carta" id="${i}" onClick="jogarCarta(${i})">`);
        $("#maoOponente").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/verso.png" class="carta" id="op${i}"></img>`);
    }
    $("#calcrodada").html('<button class="calcularRodada" onClick="calcularRodada()">CalcularRodada</button>');
}

function jogarCarta(indice){
    let jogada = {idSala: idSala, indice: `${indice}`};
    socket.emit("jogarCarta", jogada);
}

function removerCartaJogada(indice){
    $("#"+indice).css("display", "none");
    reproduzirAudio();
}

function removerCartaAdversario(){
    $("#op"+1).css("display", "none");
    reproduzirAudio();
}

function renderJogarCarta(jogada){
    $("#jogada").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogada[0]}${jogada[1]}.png" class="carta">`);
}

function calcularRodada(){
    socket.emit('calcularRodada', idSala);
}

function limparMesa(){
    $("#jogada").html("");
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

function reproduzirAudio(){
    let audio = document.querySelector('#audio');
    audio.play();
}

function gerarTelaPartida(){
    $('#tela').css("background-image", "url('imagens/background.jpg')");
    $('#tela').html('\
        <main class="partida">\
            <section class="menu">\
                <h1>Bisca Braba</h1>\
                <div id="informacoes">\
                    <p id="trunfo"></p>\
                    <div id="placar"></div>\
                </div>\
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
                        <img src=""/>\
                    </div>\
                </div>\
            </section>\
            <audio id="audio" src="audios/carta.weba"></audio>\
        </main>\
    ');
}