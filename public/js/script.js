var socket = io("https://biscabraba.herokuapp.com");

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
    for(var id in players){
        notificacao(`${players[id].nome} se conectou!! :D`);
    }
    addJogadorLista(players);
});

socket.on('iniciarPartida', function(dados){
    notificacao(`O trunfo da partida é: ${dados.jogoEstado.trunfo}`);
    mostrarTrunfo(dados.jogoEstado.trunfo);
    darCartas(dados.jogador);
    mostrarTimes(dados.times);
    jogadorTurno(dados.turnoJogador);
});

socket.on('jogarCarta', function(jogada){
    renderJogarCarta(jogada);
});

socket.on('cartaJogada', (msg) => {
    notificacao(msg);
});

socket.on('removerCartaMao', function(indice){
    removerCartaJogada(indice);
});

socket.on('removerCartaAdversario', function(){
    removerCartaAdversario();
});

socket.on('jogadorTurno', nome => {
    jogadorTurno(nome);
});

socket.on('calcularRodada', function(jogador){
    setTimeout(() => {
        darCartas(jogador);
        limparMesa();
    }, 3000);
});

socket.on('msg', function(msg){
    reproduzirAudio("nope");
    notificacao(msg)
});

socket.on('removerJogador', (nome) =>{
    reproduzirAudio("oh_no");
    notificacao(`${nome} se desconectou! :(`)
    removerJogador(nome);
});

socket.on('desconexao', function(msg){
    reproduzirAudio("oh_no");
    notificacao(msg);
    setTimeout(() => {
        document.location.reload(true);
    }, 4000);
})

socket.on('finalizarPartida', function(msg){
    notificacao(msg);
    setTimeout(() => {
        document.location.reload(true);
    }, 4000);
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

    if(verificarString([idSala, nomeJogador, numJogadores])){
        var criar = verificarDadosCriar({idSala, nomeJogador, numJogadores});
        if(criar.result){
            socket.emit('criarSala', {idSala: idSala, nomeJogador: nomeJogador, numJogadores: numJogadores});
        }else{
            alerta(criar.erros);
        }
    }
}

function entrarSala(event){
    event.preventDefault();
    idSala = document.getElementById("idEntrarSala").value;
    nomeJogador = document.getElementById("nomeConectar").value;

    if(verificarString([idSala, nomeJogador])){
        var entrar = verificarDadosEntrar({idSala, nomeJogador})
        if(entrar.result){
            socket.emit('entrarSala', {idSala: idSala, nomeJogador: nomeJogador});
        }else{
            alerta(entrar.erros);
        }
    }
}

function addJogadorLista(jogadores){
    for(id in jogadores){
        $('#listaJogadores').append(`<p id="${jogadores[id].nome}">${jogadores[id].nome}</p>`);
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
    reproduzirAudio("carta");

    for(let i=0; i<jogador.mao.length; i++){
        $("#mao").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogador.mao[i][0]}${jogador.mao[i][1]}.png" alt="" class="carta" id="${i}" onClick="jogarCarta(${i})">`);
        $("#maoOponente").append(`<img src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/verso.png" class="carta" id="op${i}"></img>`);
    }
}

function mostrarTimes(times){
    $('#listaJogadores').html(``);

    $('#listaJogadores').append(`<p>Time 1:</p>`);
    for(let i=0; i<times.time1.length; i++){
        $('#listaJogadores').append(`<p id="${times.time1[i].nome}">${times.time1[i].nome}</p>`);
    }

    $('#listaJogadores').append(`<br/><p>Time 2:</p>`);
    for(let i=0; i<times.time2.length; i++){
        $('#listaJogadores').append(`<p id="${times.time2[i].nome}">${times.time2[i].nome}</p>`);
    }
}

function jogadorTurno(jogadorTurno){
    console.log(jogadorTurno);
    $('#listaJogadores').children().css("color",' #fff');
    $(`#${jogadorTurno}`).css("color", "rgb(53, 62, 175)");
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

function enviarMensagem(e){
    e.preventDefault();
    var getMensagem = document.getElementById("enviarMsg");
    var mensagem = getMensagem.value;
    if(mensagem.length > 0){
        getMensagem.value = "";
        socket.emit('mensagem', mensagem);
    }
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

function mostrarChat(){
    if($(".chat").hasClass("chat-show")){
        $('.chat').removeClass("chat-show");
        $('.botao-chat').removeClass("move-botao-chat");
        $('.botao-chat').html('Chat');
    }else{
        $('.chat').addClass("chat-show");
        $('.botao-chat').addClass("move-botao-chat");
        $('.botao-chat').html('Ocultar');
    }
}

function mostrarMenu(){
    if($(".menu").hasClass("menu-show")){
        $('.menu').removeClass("menu-show");
        $('.botao-menu').removeClass("move-botao-menu");
        $('.botao-menu').html('Menu');
    }else{
        $('.menu').addClass("menu-show");
        $('.botao-menu').addClass("move-botao-menu");
        $('.botao-menu').html('Ocultar');
        $('.partida').css("width", "auto");
    }
}

function gerarTelaPartida(){
    $('#tela').css("background-color", "rgb(33, 80, 47)");
    $('#tela').html('\
        <button class="botao-menu" id="botao-menu" onClick="mostrarMenu()">Menu</button>\
        <div class="menu">\
            <h1>Bisca Braba</h1>\
            <div id="informacoes">\
                <p id="trunfo"></p>\
                <div id="placar"></div>\
            </div>\
            <button id="iniciar" class="iniciarpartida" onClick="iniciarPartida(event)">Iniciar Partida</button>\
            <div id="listaJogadores"><p style="border-bottom: 1px solid #fff; margin-bottom: 1rem;">Jogadores Conectados</p></div>\
        </div>\
        <button id="botao-chat" class="botao-chat" onClick="mostrarChat()">Chat</button>\
        <div class="chat">\
            <h2>Chat</h2>\
            <div id="mensagens" class="mensagens"></div>\
            <form id="form-mensagem" class="form-mensagem" onSubmit="enviarMensagem(event)">\
                <input type="text" id="enviarMsg" autocomplete="off" placeholder="Enviar mensagem..." maxlength="255">\
                <button type="submit">></button>\
            </form>\
        </div>\
        <main class="partida">\
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
            <audio id="audio" src="audios/carta.weba"></audio>\
        </main>\
    ');
}