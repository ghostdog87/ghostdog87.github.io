const kinveyRequest = (function () {
    const APP_KEY = "kid_B1pCg36S7";
    const APP_SECRET = "14389c9cb0f24130a89050987b8011b1";
    const BASE_URL = "https://baas.kinvey.com/";

    function checkAuthorization(auth) {
        if (auth === "basic") {
            return "Basic " + btoa(APP_KEY + ":" + APP_SECRET);
        }
        if (auth === "kinvey") {
            return "Kinvey " + sessionStorage.getItem("authtoken");
        }
    }

    function request(method, module, url, auth) {
        return {
            url: BASE_URL + module + "/" + APP_KEY + "/" + url,
            method: method,
            headers: {
                "Authorization": checkAuthorization(auth)
            }
        };
    }

    function getData(module, url, auth) {
        return $.ajax(request("GET", module, url, auth));
    }

    function postData(module, url, data, auth) {
        let req = request("POST", module, url, auth);
        req.data = data;
        return $.ajax(req);
    }

    function putData(module, url, data, auth) {
        let req = request("PUT", module, url, auth);
        req.data = data;
        return $.ajax(req);
    }

    function deleteData(module, url, auth) {
        return $.ajax(request("DELETE", module, url, auth));
    }

    function saveSessionStorage(data) {
        sessionStorage.setItem("username", data.username);
        sessionStorage.setItem("id", data._id);
        sessionStorage.setItem("authtoken", data._kmd.authtoken);
    }

    return {getData,postData,putData,deleteData,saveSessionStorage}

})();