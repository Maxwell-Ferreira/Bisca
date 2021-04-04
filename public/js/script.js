//var socket = io("https://biscabraba.herokuapp.com");
var socket = io("http://localhost:3000");

var id = "";
var idSala = "";
var nomeJogador = "";
var formChat;

socket.on('connect', () =>{
    id = socket.id;
    console.log(id);
});

socket.on('carregarSala', function(jogadores){
    limparTela();
    gerarTelaPartida();
    addJogadorLista(jogadores);
})

socket.on('novoJogador', (players) => {
    reproduzirAudio("nice");
    setTimeout(() => {
        alert(`${players[0].nome} se conectou!! :D`);
    }, 250);
    addJogadorLista(players);
});

socket.on('iniciarPartida', function(dados){
    alert(`O trunfo da partida é: ${dados.jogoEstado.trunfo}`);
    mostrarTrunfo(dados.jogoEstado.trunfo);
    darCartas(dados.jogador);
});

socket.on('jogarCarta', function(jogada){
    renderJogarCarta(jogada);
});

socket.on('cartaJogada', (msg) => {
    reproduzirAudio("cartoon_slip");
    setTimeout(() => {
        alert(msg);
    }, 200);
});

socket.on('removerCartaMao', function(indice){
    removerCartaJogada(indice);
});

socket.on('removerCartaAdversario', function(){
    removerCartaAdversario();
});

socket.on('calcularRodada', function(jogador){
    darCartas(jogador);
    limparMesa();
});

socket.on('msg', function(msg){
    reproduzirAudio("nope");
    setTimeout(() => {
        alert(msg);
    }, 200);
});

socket.on('removerJogador', (nome) =>{
    reproduzirAudio("oh_no");
    setTimeout(() => {
        alert(`${nome} se desconectou! :(`);
    }, 200);
    removerJogador(nome);
});

socket.on('desconexao', function(msg){
    reproduzirAudio("oh_no");
    setTimeout(() => {
        alert(msg);
    }, 200);
    setTimeout(() => {
        document.location.reload(true);
    }, 1500);
})

socket.on('finalizarPartida', function(msg){
    alert(msg);
    document.location.reload(true);
})

socket.on('mensagem', mensagem => {
    mostrarMensagem(mensagem);
});

socket.on('vencedor', vencedor => {
    exibirVencedor(vencedor);
});

function criarSala(event){
    event.preventDefault();
    var idSala = document.getElementById("idCriarSala").value;
    var nomeJogador = document.getElementById("nomeCriador").value;
    var select = document.getElementById("numJogadores");
    var numJogadores = select.options[select.selectedIndex].value;
    socket.emit('criarSala', {idSala: idSala, nomeJogador: nomeJogador, numJogadores: numJogadores});
}

function entrarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idEntrarSala").value;
    nomeJogador = document.getElementById("nomeConectar").value;
    socket.emit('entrarSala', {idSala: idSala, nomeJogador: nomeJogador});
}

function addJogadorLista(jogadores){
    for(var i=0; i<jogadores.length; i++){
        $('#listaJogadores').append(`<p id="${jogadores[i].nome}">${jogadores[i].nome}</p>`);
    }
}

function removerJogador(nome){
    document.getElementById(nome).remove();
}

function limparTela(){
    $('#tela').html('');
}

function iniciarPartida(event){
    event.preventDefault();
    socket.emit("iniciarPartida");
}

function mostrarTrunfo(trunfo){
    $('#trunfo').html(`Trunfo: ${trunfo}`);
}

function darCartas(jogador){
    $('#iniciar').css("display", "none");
    $('#placar').html(`<h2>Minha pontuação</h2><p>${jogador.nome}: ${jogador.pontos} pontos</p>`);

    $('#mao').html('');
    $('#maoOponente').html('');
    reproduzirAudio();

    for(let i=0; i<jogador.mao.length; i++){
        $("#mao").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogador.mao[i][0]}${jogador.mao[i][1]}.png" alt="" class="carta" id="${i}" onClick="jogarCarta(${i})">`);
        $("#maoOponente").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/verso.png" class="carta" id="op${i}"></img>`);
    }
    $("#pronto").html('<button class="calcularRodada" onClick="pronto()">Pronto</button>');
}

function jogarCarta(indice){
    let jogada = indice;
    socket.emit("jogarCarta", jogada);
}

function removerCartaJogada(indice){
    $("#"+indice).css("display", "none");
    reproduzirAudio("carta");
}

function removerCartaAdversario(){
    $("#op"+1).css("display", "none");
    reproduzirAudio("carta");
}

function renderJogarCarta(jogada){
    $("#jogada").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogada[0]}${jogada[1]}.png" class="carta">`);
    var num = Math.floor(Math.random() * 20);
    if(num === 10){
        toasty();
    }
}

function pronto(){
    socket.emit('pronto');
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

function reproduzirAudio(src){
    let audio = document.querySelector('#audio');
    $('#audio').attr("src", `audios/${src}.weba`);
    audio.play();
}

function enviarMensagem(e){
    e.preventDefault();
    var getMensagem = document.getElementById("enviarMsg");
    var mensagem = getMensagem.value;
    getMensagem.value = "";
    socket.emit('mensagem', mensagem);
}

function mostrarMensagem(mensagem){
    $('#mensagens').append(`
        <div class="mensagem">
            <strong>${mensagem.jogador}</strong>: ${mensagem.texto}
        </div>`);
    var divMensagens = document.getElementById("mensagens");
    divMensagens.scrollTop = divMensagens.scrollHeight;
}

function exibirVencedor(vencedor){
    reproduzirAudio('foguete');
    console.log(vencedor);

    var texto = 'Partida terminada! Os vencedores são: ';
    for(var i=0; i<vencedor.jogadores.length; i++){
        texto = texto + " " + vencedor.jogadores[i] + " ";
        if(vencedor.jogadores.length > 0){
            if(i < vencedor.jogadores.length -1){
                texto += " e ";
            }
        }
    }
    texto = texto + " com " + vencedor.pontos + " pontos!";

    $('.game').css('align-items', 'center');
    $('.game').css('justify-content', 'center');
    $('.game').html(`
        <div id="vencedor">${texto}</div>
    `);
}

function gerarTelaPartida(){
    $('#tela').css("background-color", "rgb(33, 80, 47)");
    $('#tela').html('\
        <main class="partida">\
            <section class="menu">\
                <h1>Bisca Braba</h1>\
                <div id="informacoes">\
                    <p id="trunfo"></p>\
                    <div id="placar"></div>\
                </div>\
                <button id="iniciar" class="iniciarpartida" onClick="iniciarPartida(event)">Iniciar Partida</button>\
                <div id="pronto"></div>\
                <div id="listaJogadores"><p style="border-bottom: 1px solid #fff; margin-bottom: 1rem;">Jogadores Conectados</p></div>\
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
            <section class="chat">\
                <h2>Chat</h2>\
                <div id="mensagens" class="mensagens"></div>\
                <form id="form-mensagem" class="form-mensagem" onSubmit="enviarMensagem(event)">\
                    <input type="text" id="enviarMsg" autocomplete="off" placeholder="Enviar mensagem..." maxlength="255">\
                    <button type="submit">></button>\
                </form>\
            </section>\
            <audio id="audio" src="audios/carta.weba"></audio>\
        </main>\
    ');
}