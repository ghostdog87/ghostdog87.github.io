$(() => {

    $(".registerbtn").on("click", function (event) {
        event.preventDefault();
    });

    eventHandler.showView("home");

    if (sessionStorage.getItem("authtoken") !== null) {
        listAds();
    }

    // List all events
    $("#home").on("click", () => eventHandler.showView("home"));
    $("#loginBtn").on("click", () => eventHandler.showView("login"));
    $("#loginBtn2").on("click", () => eventHandler.showView("login"));
    $("#registerBtn").on("click", () => eventHandler.showView("register"));
    $("#registerBtn2").on("click", () => eventHandler.showView("register"));
    $("#allLists").on("click", () => {
        eventHandler.showView("carLists");
        listAds();
    });
    $("#createLists").on("click", () => eventHandler.showView("createLists"));
    $("#myLists").on("click", () => {
        eventHandler.showView("myLists");
        myPosts();
    });

    let registerBtn = $("#register").find(".registerbtn");
    let loginBtn = $("#login").find(".registerbtn");
    let createBtn = $("#create-listing").find(".registerbtn");
    let editBtn = $("#edit-listing").find(".registerbtn");

    $(registerBtn).on("click", register);
    $(loginBtn).on("click", login);
    $(createBtn).on("click", createPost);
    $(editBtn).on("click", editPosts);

    $("#logout").on("click", logout);


    async function login() {
        let form = $("#login");
        let username = form.find("input[name='username']").val();
        let password = form.find("input[name='password']").val();

        try {
            kinveyRequest.saveSessionStorage(await kinveyRequest.postData('user', 'login', {
                username,
                password
            }, 'basic'));
            eventHandler.showView("carLists");
            listAds();
            eventHandler.showInfo("Login successful.");
            form.find("input[name='username']").val("");
            form.find("input[name='password']").val("");

        }
        catch (err) {
            eventHandler.handleError(JSON.parse(err.responseText).description);
        }
    }

    async function register() {


        let form = $("#register");
        let username = form.find("input[name='username']").val();
        let password = form.find("input[name='password']").val();
        let password2 = form.find("input[name='repeatPass']").val();

        if (username.length < 3) {
            eventHandler.handleError("Username must be at least 3 characters long.");
        }
        else if (password.length < 6) {
            eventHandler.handleError("Password must be at least 6 characters long.");
        }
        else if (!/^[a-zA-Z]+$/.test(username)) {
            eventHandler.handleError("Username can contain only english letters.");
        }
        else if (!/^[a-zA-Z0-9]+$/.test(password)) {
            eventHandler.handleError("Password can contain only english letters and digits.");
        }
        else if (password !== password2) {
            eventHandler.handleError("Passwords does not match.");
        }
        else {
            try {
                kinveyRequest.saveSessionStorage(await kinveyRequest.postData('user', '', {
                    username,
                    password
                }, 'basic'));
                eventHandler.showView("carLists");
                listAds();
                eventHandler.showInfo("User registration successful.");

                form.find("input[name='username']").val("");
                form.find("input[name='password']").val("");
                form.find("input[name='repeatPass']").val("");
            }
            catch (err) {
                eventHandler.handleError(JSON.parse(err.responseText).description);
            }
        }

    }

    async function logout() {
        try {
            await kinveyRequest.postData('user', '_logout', '', 'kinvey');
            sessionStorage.clear();
            eventHandler.showView("home");
            eventHandler.showInfo("Logout successful.");
        }
        catch (err) {
            eventHandler.handleError(JSON.parse(err.responseText).description);
        }
    }

    async function listAds() {
        try {
            let data = await kinveyRequest.getData('appdata', 'cars?query={}&sort={"_kmd.ect": -1}', 'kinvey');
            let container = $("#car-listings #listings");
            container.empty();

            $.get("templates/carList.hbs", function (resp) {
                let compiled = Handlebars.compile(resp);
                if (data.length > 0) {
                    for (let item of data) {
                        let isAuthor = false;
                        if (item._acl.creator === sessionStorage.getItem("id")) {
                            isAuthor = true;
                        }

                        let rendered = compiled({
                            title: item.title,
                            imageUrl: item.imageUrl,
                            brand: item.brand,
                            seller: item.seller,
                            fuel: item.fuel,
                            year: item.year,
                            price: item.price,
                            _id: item._id,
                            isAuthor: isAuthor,
                        });
                        container.append(rendered);

                        let deleteBtn = $('.deleteID');
                        let editBtn = $('.editID');
                        let detailsBtn = $('.detailsID');

                        for(let i = 0;i < detailsBtn.length;i++){
                            if ($(deleteBtn[i]).attr("class") !== "button-carDetails deleteID test") {
                                $(deleteBtn[i]).addClass("button-carDetails deleteID test");
                                $(deleteBtn[i]).on("click", deletePost);
                            }
                            if ($(editBtn[i]).attr("class") !== "button-carDetails editID test") {
                                $(editBtn[i]).addClass("button-carDetails editID test");
                                $(editBtn[i]).on("click", function () {
                                    editPostView(item);
                                });
                            }
                            if ($(detailsBtn[i]).attr("class") !== "button-carDetails detailsID test") {
                                $(detailsBtn[i]).addClass("button-carDetails detailsID test");
                                $(detailsBtn[i]).on("click", function () {
                                    detailsView(item);
                                });
                            }
                        }

                    }

                }
                else {
                    container.append("<p class='no-cars'>No listings in database.</p>");
                }


            });

        }
        catch (err) {
            eventHandler.handleError(JSON.parse(err.responseText).description);
        }
    }

    async function createPost() {
        let form = $("#create-listing");

        let title = form.find("input[name=title]").val();
        let description = form.find("input[name=description]").val();
        let brand = form.find("input[name=brand]").val();
        let model = form.find("input[name=model]").val();
        let year = form.find("input[name=year]").val();
        let imageUrl = form.find("input[name=imageUrl]").val();
        let fuel = form.find("input[name=fuelType]").val();
        let price = Number(form.find("input[name=price]").val());

        let seller = sessionStorage.getItem("username");

        if (title.length > 33 || title.length === 0) {
            eventHandler.handleError("Title must be between 1 and 33 characters long.");
        }
        else if (description.length < 30 || description.length > 450) {
            eventHandler.handleError("Description must be between 30 and 450 characters long.");
        }
        else if (brand.length === 0 || brand.length > 11) {
            eventHandler.handleError("Brand must be between 1 and 11 characters long.");
        }
        else if (fuel.length === 0 || fuel.length > 11) {
            eventHandler.handleError("Fuel must be between 1 and 11 characters long.");
        }
        else if (model.length < 4 || model.length > 11) {
            eventHandler.handleError("Model must be between 4 and 11 characters long.");
        }
        else if (year.length !== 4) {
            eventHandler.handleError("Please enter a correct year.");
        }
        else if (!price || price > 1000000) {
            eventHandler.handleError("Price must be between 0 and 1000000 $.");
        }
        else if (!/^(http)/.test(imageUrl)) {
            eventHandler.handleError("Enter correct url for the picture, starting with 'http'.");
        }
        else {
            try {
                await kinveyRequest.postData('appdata', 'cars', {
                    brand,
                    description,
                    fuel,
                    imageUrl,
                    model,
                    price,
                    seller,
                    title,
                    year
                }, 'kinvey');
                eventHandler.showView("carLists");
                listAds();
                eventHandler.showInfo("listing created.");
            }
            catch (err) {
                eventHandler.handleError(JSON.parse(err.responseText).description);
            }
        }
    }

    async function deletePost() {
        try {
            let id = $(this).attr("id");
            await kinveyRequest.deleteData("appdata", 'cars/' + id, "kinvey");
            eventHandler.showView("carLists");
            listAds();
            eventHandler.showInfo("Listing deleted.");
        }
        catch (err) {
            eventHandler.handleError(JSON.parse(err.responseText).description);
        }

    }

    async function myPosts() {
        try {
            let username = sessionStorage.getItem("username");
            let data = await kinveyRequest.getData('appdata', `cars?query={"seller":"${username}"}&sort={"_kmd.ect": -1}`, 'kinvey');
            let container = $(".my-listings .car-listings");
            container.empty();

            $.get("templates/myCarList.hbs", function (resp) {
                let compiled = Handlebars.compile(resp);
                if (data.length > 0) {
                    for (let item of data) {

                        let rendered = compiled({
                            title: item.title,
                            imageUrl: item.imageUrl,
                            brand: item.brand,
                            model: item.model,
                            year: item.year,
                            price: item.price,
                            _id: item._id,
                        });
                        container.append(rendered);

                        let deleteBtn = $('.deleteID');
                        let editBtn = $('.editID');
                        let detailsBtn = $('.detailsID');

                        for(let i = 0;i < detailsBtn.length;i++){
                            if ($(deleteBtn[i]).attr("class") !== "my-button-list deleteID test") {
                                $(deleteBtn[i]).addClass("my-button-list deleteID test");
                                $(deleteBtn[i]).on("click", deletePost);
                            }
                            if ($(editBtn[i]).attr("class") !== "my-button-list editID test") {
                                $(editBtn[i]).addClass("my-button-list editID test");
                                $(editBtn[i]).on("click", function () {
                                    editPostView(item);
                                });
                            }
                            if ($(detailsBtn[i]).attr("class") !== "my-button-list detailsID test") {
                                $(detailsBtn[i]).addClass("my-button-list detailsID test");
                                $(detailsBtn[i]).on("click", function () {
                                    detailsView(item);
                                });
                            }
                        }
                    }

                }
                else {
                    container.append("<p class='no-cars'>No listings in database.</p>");
                }

            });

        }
        catch (err) {
            eventHandler.handleError(JSON.parse(err.responseText).description);
        }
    }

    function editPostView(item) {
        eventHandler.showView("editLists");
        let form = $("#edit-listing");

        form.find("input[name=carId]").val(item._id);
        form.find("input[name=title]").val(item.title);
        form.find("input[name=description]").val(item.description);
        form.find("input[name=brand]").val(item.brand);
        form.find("input[name=model]").val(item.model);
        form.find("input[name=year]").val(item.year);
        form.find("input[name=imageUrl]").val(item.imageUrl);
        form.find("input[name=fuelType]").val(item.fuel);
        form.find("input[name=price]").val(item.price);
    }

    function detailsView(item) {
        eventHandler.showView("details");
        let container = $(".listing-details");
        container.empty();

        $.get("templates/details.hbs", function (resp) {
            let compiled = Handlebars.compile(resp);
            let isAuthor = false;
            if (item._acl.creator === sessionStorage.getItem("id")) {
                isAuthor = true;
            }

            let rendered = compiled({
                title: item.title,
                imageUrl: item.imageUrl,
                brand: item.brand,
                model: item.model,
                year: item.year,
                fuel: item.fuel,
                price: item.price,
                _id: item._id,
                isAuthor: isAuthor,
                description: item.description
            });
            container.append(rendered);

            let deleteBtn = $('.deleteID');
            let editBtn = $('.editID');

            for(let i = 0;i < deleteBtn.length;i++){
                if ($(deleteBtn[i]).attr("class") !== "button-list deleteID test") {
                    $(deleteBtn[i]).addClass("button-list deleteID test");
                    $(deleteBtn[i]).on("click", deletePost);
                }
                if ($(editBtn[i]).attr("class") !== "button-list editID test") {
                    $(editBtn[i]).addClass("button-list editID test");
                    $(editBtn[i]).on("click", function () {
                        editPostView(item);
                    });
                }

            }

        });
    }

    async function editPosts() {
        let form = $("#edit-listing");

        let id = form.find("input[name=carId]").val();
        let title = form.find("input[name=title]").val();
        let description = form.find("input[name=description]").val();
        let brand = form.find("input[name=brand]").val();
        let model = form.find("input[name=model]").val();
        let year = form.find("input[name=year]").val();
        let imageUrl = form.find("input[name=imageUrl]").val();
        let fuel = form.find("input[name=fuelType]").val();
        let price = Number(form.find("input[name=price]").val());

        let seller = sessionStorage.getItem("username");

        if (title.length > 33 || title.length === 0) {
            eventHandler.handleError("Title must be between 1 and 33 characters long.");
        }
        else if (description.length < 30 || description.length > 450) {
            eventHandler.handleError("Description must be between 30 and 450 characters long.");
        }
        else if (brand.length === 0 || brand.length > 11) {
            eventHandler.handleError("Brand must be between 1 and 11 characters long.");
        }
        else if (fuel.length === 0 || fuel.length > 11) {
            eventHandler.handleError("Fuel must be between 1 and 11 characters long.");
        }
        else if (model.length < 4 || model.length > 11) {
            eventHandler.handleError("Model must be between 4 and 11 characters long.");
        }
        else if (year.length !== 4) {
            eventHandler.handleError("Please enter a correct year.");
        }
        else if (!price || price > 1000000) {
            eventHandler.handleError("Price must be between 0 and 1000000 $.");
        }
        else if (!/^(http)/.test(imageUrl)) {
            eventHandler.handleError("Enter correct url for the picture, starting with 'http'.");
        }
        else {
            try {
                await kinveyRequest.putData('appdata', 'cars/' + id, {
                    brand,
                    description,
                    fuel,
                    imageUrl,
                    model,
                    price,
                    seller,
                    title,
                    year
                }, 'kinvey');
                eventHandler.showView("carLists");
                listAds();
                eventHandler.showInfo(`Listing ${title} updated.`);
            }
            catch (err) {
                eventHandler.handleError(JSON.parse(err.responseText).description);
            }
        }
    }


});
