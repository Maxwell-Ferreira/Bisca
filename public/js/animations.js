function toasty(){
    console.log("oia eu");
    $(".toasty").addClass("toasty-anime");
    reproduzirAudio('toasty');
    setTimeout(() => {
        $('.toasty').removeClass("toasty-anime")
    }, 1000);
};