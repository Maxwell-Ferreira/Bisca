function toasty(){
    $(".toasty").addClass("toasty-anime");
    reproduzirAudio('toasty');
    setTimeout(() => {
        $('.toasty').removeClass("toasty-anime")
    }, 1000);
};

function mostrarCarta(jogada){
    $("#jogada").append(`<img id="${jogada[0]}${jogada[1]}" class="cartaJogada girarCarta" src="https://raw.githubusercontent.com/Maxwell-Ferreira/Bisca/master/public/imagens/cartas/${jogada[0]}${jogada[1]}.png">`);
    var num = Math.floor(Math.random() * 20);
    if(num === 10){
        toasty();
    }
}

function calcularRodada(jogador){
    setTimeout(() => {
        $("#jogada").addClass("removeCartaJogada");
    }, 2200);
    setTimeout(() => {
        darCartas(jogador);
        limparMesa();
        $("#jogada").removeClass("removeCartaJogada");
    }, 2500);
}