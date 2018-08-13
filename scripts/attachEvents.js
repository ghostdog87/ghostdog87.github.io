const eventHandler = (function () {

    function changeView() {
        $("#main").hide();
        $("#login").hide();
        $("#register").hide();
        $("#car-listings").hide();
        $("#create-listing").hide();
        $("#edit-listing").hide();
        $(".my-listings").hide();
        $(".listing-details").hide();
        if (sessionStorage.getItem("authtoken") !== null) {
            $("#allLists").show();
            $("#myLists").show();
            $("#createLists").show();
            $("#profile").show();
        }
        else {
            $("#allLists").hide();
            $("#myLists").hide();
            $("#createLists").hide();
            $("#profile").hide();
        }
    }

    function showView(view) {
        changeView();
        greetings();
        switch (view) {
            case "home":
                if (sessionStorage.getItem("authtoken") !== null) {
                    $("#car-listings").show();
                }
                else{
                    $("#main").show();
                }
                break;
            case "login":
                $("#login").show();
                break;
            case "register":
                $("#register").show();
                break;
            case "carLists":
                $("#car-listings").show();
                break;
            case "createLists":
                $("#create-listing").show();
                break;
            case "editLists":
                $("#edit-listing").show();
                break;
            case "myLists":
                $(".my-listings").show();
                break;
            case "details":
                $(".listing-details").show();
                break;
        }
    }

    function handleError(err) {

        let errorBox = $("#errorBox");
        errorBox.find("span").text(err);
        errorBox.show();
    }

    function showInfo(info) {
        let infoBox = $("#infoBox");
        infoBox.find("span").text(info);
        infoBox.show();
        infoBox.fadeOut(3000);
    }

    function greetings() {
        if(sessionStorage.getItem("authtoken") !== null){
            const greet = $("#profile");
            greet.show();
            greet.find("#welcome").text(`Welcome ${sessionStorage.getItem("username")}`);
        }
        else{
            const greet = $("#profile");
            greet.hide();
            greet.find("#welcome").text("");
        }
    }


    return {changeView,showView,handleError,showInfo}
})();