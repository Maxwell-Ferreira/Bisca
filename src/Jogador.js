class Jogador{
    constructor(id, nome){
        this.id = id;
        this.nome = nome;
        this.mao = [];
        this.jogada = [];
        this.status = false;
        this.pontos = 0;
        this.time = 0;
    }
}
module.exports = Jogador;