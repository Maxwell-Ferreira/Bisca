function toasty(){
    $(".toasty").addClass("toasty-anime");
    reproduzirAudio('toasty');
    setTimeout(() => {
        $('.toasty').removeClass("toasty-anime")
    }, 1000);
};