/*jslint browser: true, node: true*/
/*jshint plusplus: false, strict: false, jquery: true*/
/*jslint devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/

//Creo l'oggetto che gestisce le informazioni dell'applicazione.
var info = {

    dati: {
        nome: "Nome",
        cognome: "Cognome",
        email: "Email",
        interessi: "Interessi",
        personalita: "Personalita",
        lat: "0",
        longit: "0"
    },


    read: function () {
        $("#txtNome").html(app.storage.getItem('nome'));
        $("#txtCognome").html(app.storage.getItem('cognome'));
        $("#txtEmail").html(app.storage.getItem('email'));
        $("#txtInteressi").html(app.storage.getItem('interessi'));
        $("#txtPersonalita").html(app.storage.getItem('personalita'));
        //$("#txtLat").html(info.dati.lat);
        //$("#txtLongit").html(info.dati.longit);
    },


    load: function () {
        loadInfo();
    },


    save: function () {

        var vecchia_email = info.dati.email;
        console.log("vecchia email: " + vecchia_email);

        info.dati.nome = $("#txtNome").val();
        info.dati.cognome = $("#txtCognome").val();
        info.dati.email = $("#txtEmail").val();
        info.dati.interessi = $("#txtInteressi").val();
        info.dati.personalita = $("#txtPersonalita").val();


        if (info.dati.nome != "" && info.dati.cognome != "" && info.dati.email != "" && info.dati.interessi != "" && info.dati.personalita != "")
        {
            //Salvo le informazioni inserite dall'utente.
            app.storage.setItem('nome', info.dati.nome.trim());
            app.storage.setItem('cognome', info.dati.cognome.trim());
            app.storage.setItem('email', info.dati.email.trim());
            app.storage.setItem('interessi', info.dati.interessi.trim());
            app.storage.setItem('personalita', info.dati.personalita.trim());
            app.storage.setItem('lat', info.dati.lat);
            app.storage.setItem('longit', info.dati.longit);

            //Notifico l'utente che il salvataggio è stato effettuato.
            // Se l'utente ha cambiato email, gli dico che continuando creerà un nuovo account.
            if (vecchia_email != info.dati.email) {
                navigator.notification.alert("Benvenuto " + info.dati.email + "! Se invii le informazioni al server creerai un nuovo account!",
                    info.send,
                    "PeopleFinder",
                    "OK");
                console.log("Salvataggio locale eseguito con successo! Email modificata.");
            } else {
                navigator.notification.alert("Salvataggio effettuato! Se invii le informazioni al server, aggiornerai i dati del profilo!",
                    info.send,
                    "PeopleFinder",
                    "OK");
                console.log("Salvataggio locale eseguito con successo! Email uguale a prima.");
            }

        } else {

            //Notifico l'utente che si è verificato un errore nel salvataggio dei dati.
            navigator.notification.alert("Si è verificato un errore. Hai inserito tutti i campi? Prova di nuovo.",
                function () {},
                "PeopleFinder",
                "OK");
            console.log("Errore di salvataggio in locale");

        }

    },



    send: function () {
        if (app.isOnline()) {

            //Chiedo conferma all'utente per l'invio delle info al server.
            navigator.notification.confirm("Inviare le informazioni al server?",
                info.confirmedSend,
                "Conferma invio", ['Si', 'No']
            );
        } else {
            //Avverto che l'utente non è online.
            navigator.notification.alert("Connessione Internet non disponibile. Controllare di essere connessi alla Rete.",
                function () {},
                "PeopleFinder");
        }
    },

    confirmedSend: function (buttonIndex) {
        //Invio le informazioni al server.
        if (buttonIndex == 1) {
            sendInfo();
        }
    }


};





//Creo l'oggetto che gestisce l'applicazione.
var app = {

    //creo un'archivio nella memoria del telefono per conservare i dati.
    storage: window.localStorage,
    //creo una variabile in cui registrare la posizione dell'utente,
    // e una in cui registrare la sua direzione (bussola).
    watchID: "",
    compassID: "",

    //Controllo il tipo di connessione dell'utente
    isOnline: function () {
        var networkType = navigator.connection.type;
        return ((networkType != Connection.NONE) && (networkType != Connection.UNKNOWN));
    },


    //Costruttore dell'applicazione
    initialize: function () {
        this.bindEvents();
    },


    // Bind Event Listeners
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        $("#btnToggleGeoLoc").on("tap", this.geoLocToggle);
        $("#btnToggleCompass").on("tap", this.compassToggle);

        $("#btnInserimento").on("tap", info.read);
        $("#btnTrackList").on("tap", info.load);

        $("#btnSalva").on("tap", info.save);
        
        $("#btnExit").on("tap", app.exit);
    },


    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
        console.log(navigator.compass);

        app.watchID = navigator.geolocation.watchPosition(
            app.onPositionSuccess,
            app.onPositionError,
            {   
                maximumAge: 5000,
                timeout: 5000,
                enableHighAccuracy: false
            }
        );

        app.compassID = navigator.compass.watchHeading(
            app.onCompassSuccess,
            app.onCompassError,
            {
                frequency: 100
            }
        );
    },


    //Funzione che fa partire o interrompe la geoLocalizzazione,
    // in base alla pressione del pulsante 'btnToggleGeoLoc'.
    geoLocToggle: function () {
        if (geoloc_toggle === 0) {
            var element = document.getElementById('geolocation');
            var pulsante = document.getElementById('btnToggleGeoLoc');
            geoloc_toggle = 1;
            navigator.geolocation.clearWatch(app.watchID);
            tracking = 0;
            element.innerHTML = "Geolocation disattivata";
            pulsante.style.backgroundColor = "#D52";
        } else {
            var element = document.getElementById('geolocation');
            var pulsante = document.getElementById('btnToggleGeoLoc');
            geoloc_toggle = 0;
            app.watchID = navigator.geolocation.watchPosition(
                app.onPositionSuccess,
                app.onPositionError, 
                {
                    maximumAge: 5000,
                    timeout: 5000,
                    enableHighAccuracy: false
                }
            );
            element.innerHTML = "Ricerca posizione...";
            pulsante.style.backgroundColor = "#1D3";
        }
    },  
    //Inserisco le informazioni geografiche nell'array info.dati, e mostro la posizione attuale.  
    onPositionSuccess: function (position) {
        var element = document.getElementById('geolocation');
        var email = app.storage.getItem('email');
        var delta_pos = distanza(info.dati.lat,app.storage.getItem('lat'), info.dati.longit,app.storage.getItem('longit'));

        element.innerHTML = 'Posizione attuale:<br/>Latitudine: ' + position.coords.latitude + '<br/>' +
            'Longitudine: ' + position.coords.longitude;
        info.dati.lat = position.coords.latitude;
        info.dati.longit = position.coords.longitude;        
        
        if( 
            app.isOnline() 
            && email && email!="" && email!="Email"
            && delta_pos > 1 
          ) 
        {
            //alert("Sto aggiornando il database, perchè sei connesso e ti sei spostato.");
            console.log("Sto aggiornando il database. Ti sei spostato e sei loggato.");
            if(tracking===1) 
            {
                var msg2 = document.getElementById('msg2');

                console.log("Sto anche aggiornando la posizione dell'obiettivo.");
                aggiornaTarget();
                distance = distanza(info.dati.lat, t_lat, info.dati.longit, t_longit);

                if(distance>=2) {
                    msg2.innerHTML = "per " + traduci_distanza(distance);
                }
                else {
                    var msg = document.getElementById('msg');
                    msg.innerHTML = "Sei arrivato!";
                    msg2.innerHTML = "";
                    navigator.notification.alert("Sei arrivato!",function(){},"PeopleFinder");
                }
            }
            app.storage.setItem('lat', info.dati.lat);
            app.storage.setItem('longit', info.dati.longit);
            aggiornaDB();
        }
        //console.log("latitudine: " + position.coords.latitude + "\n" + "longitudine: " + position.coords.longitude);
    },
    //Mostro un messaggio di errore se non riesco ad accedere al GPS.
    onPositionError: function (error) {
        var element = document.getElementById('geolocation');
        var pulsante = document.getElementById('btnToggleGeoLoc');
        element.innerHTML = "Errore nel rilevamento della posizione. Attivare il GPS.";
        geoloc_toggle = 1;
        pulsante.style.backgroundColor = "#D52";
        console.log('codice errore geolocation: ' + error.code + '\n' + 'messaggio: ' + error.message + '\n');
    },


    //Funzione che fa partire o interrompe la bussola,
    // in base alla pressione del pulsante 'btnToggleCompass'.
    compassToggle: function () {
        if (compass_toggle === 0) {
            compass_toggle = 1;
            navigator.compass.clearWatch(app.compassID);
            tracking = 0;
            var element = document.getElementById('bussola_info');
            var msg = document.getElementById('msg');
            var msg2 = document.getElementById('msg2');
            var pulsante = document.getElementById('btnToggleCompass');
            element.innerHTML = "Bussola disattivata<hr/>";
            msg.style.visibility = "hidden";
            msg2.style.visibility = "hidden";
            pulsante.style.backgroundColor = "#D52";
            pulsante.innerHTML = "Bussola";
            freccia = 361;
        } else {
            compass_toggle = 0;
            app.compassID = navigator.compass.watchHeading(
                app.onCompassSuccess,
                app.onCompassError,
                {
                    frequency: 100
                }
            );
            var element = document.getElementById('bussola_info');
            var pulsante = document.getElementById('btnToggleCompass');
            element.innerHTML = "Controllo bussola...";
            pulsante.style.backgroundColor = "#1D3";
            pulsante.innerHTML = "Bussola";
        }
    },
    //Gestisco il compasso, se Cordova è riuscito ad accedervi.
    onCompassSuccess: function (heading) {
        my_direction = heading.magneticHeading;
        bussola_direction = freccia - my_direction;
        $("#img_bussola").css({
              '-moz-transform':'rotate('+bussola_direction+'deg)',
              '-webkit-transform':'rotate('+bussola_direction+'deg)',
              '-o-transform':'rotate('+bussola_direction+'deg)',
              '-ms-transform':'rotate('+bussola_direction+'deg)',
              'transform': 'rotate('+bussola_direction+'deg)'
         });
        var element = document.getElementById('bussola_info');
        var msg = document.getElementById('msg');
        element.innerHTML = 'Direzione attuale: ' + traduci_direzione(my_direction) + '<hr/>';
        msg.innerHTML = 'Vai ' + traduci_direzione(bussola_direction);
        
    },
    //Mostro un messaggio di errore altrimenti.
    onCompassError: function (compassError) {
        var element = document.getElementById('bussola_info');
        var pulsante = document.getElementById('btnToggleCompass');
        compass_toggle = 1;
        element.innerHTML = 'Errore nel rilevare la bussola<hr/>';
        pulsante.style.backgroundColor = "#D52";
        console.log('Errore bussola = '+compassError.code);
    },



    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
    },

    //Funzione di uscita dall'applicazione.
    exit: function () {
        navigator.notification.confirm(
            "Vuoi davvero uscire?",
            function (buttonIndex) {
                if (buttonIndex == 1) {
                    navigator.app.exitApp();
                }
            },
            "PeopleFinder", ['Si', 'No']);
    }

};




//Aspetto che il framework jQuery sia pronto,
// inizializzo le variabili di base,
// e lancio l'applicazione.
$(document).ready(
    function () {
        /*app.storage.setItem('nome', info.dati.nome);
        app.storage.setItem('cognome', info.dati.cognome);
        app.storage.setItem('email', info.dati.email);
        app.storage.setItem('interessi', info.dati.interessi);
        app.storage.setItem('personalita', info.dati.personalita);
        app.storage.setItem('lat', info.dati.lat);
        app.storage.setItem('longit', info.dati.longit);*/
        geoloc_toggle = 0;
        compass_toggle = 0;
        app.initialize();
    }
);
