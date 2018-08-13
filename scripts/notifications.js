$(() => {
    $("#infoBox, #errorBox").on('click', function () {
        $(this).fadeOut()
    });

    $(document).on({
        ajaxStart: function () {
            $("#loadingBox").show()
        },
        ajaxStop: function () {
            $("#loadingBox").fadeOut()
        }
    });

});