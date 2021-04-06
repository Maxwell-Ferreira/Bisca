function verificarString(strings){

    for(let i=0; i<strings.length; i++){
        if(typeof strings[i] !== 'string'){
            return false;
        }
    }
    return true;
}

function verificarDadosCriar(dados){
    var erros = [];
    var result = true;

    if(dados.idSala.length <= 3){
        result = false;
        erros.push("Insira um id com mais de 3 caracteres!");
    }

    if(dados.nomeJogador.length <= 3){
        result = false;
        erros.push("Insira um nome com mais de 3 caracteres!");
    }

    if(dados.numJogadores != "2" && dados.numJogadores != "4"){
        result = false;
        erros.push("Favor, a partida deve ser apenas de 2 ou 4 jogadores!");
    }

    return {result, erros};
}

function verificarDadosEntrar(dados){
    var erros = [];
    var result = true;

    if(dados.idSala.length <= 3){
        result = false;
        erros.push("Insira um id com mais de 3 caracteres!");
    }

    if(dados.nomeJogador.length <= 3){
        result = false;
        erros.push("Insira um nome com mais de 3 caracteres!");
    }

    return {result, erros};
}

function notificacao(texto){
    $(".notificacao").html(texto);
    $(".notificacao").addClass("notificacao-show");
    setTimeout(() => {
        $(".notificacao").removeClass("notificacao-show");
    }, 3000);
}

function alerta(erros){
    reproduzirAudio("nope");
    $(".alertMsg").append(`<h2 style="text-align: center">ATENÇÃO<h2>`);
    erros.forEach(erro => {
        $(".alertMsg").append(`${erro}</br></br>`);
    });
    $(".alertMsg").append(`</br><button onClick="fecharAlerta()">OK</button>`);
    $(".alertBox").addClass('alertBox-show');
}

function fecharAlerta(){
    $(".alertMsg").html("");
    $(".alertBox").removeClass('alertBox-show');
}

function reproduzirAudio(src){
    let audio = document.querySelector('#audio');
    $('#audio').attr("src", `audios/${src}.weba`);
    audio.play();
}