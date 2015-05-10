/*jslint browser: true, node: true*/
/*jshint plusplus: false, strict: false, jquery: true*/
/*jslint devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/
/*Variabili globali*/

//tracking=1 se sto seguendo qualcuno.
tracking = 0;
//geoloc_toggle=1 se la geolocalizzazione è attiva.
geoloc_toggle = 0;
//compass_toggle=1 se la bussola è attiva.
compass_toggle = 0;
my_direction = 0;
bussola_direction = 361;
freccia = 361;
distance = 0;

//Latitudine, Longitudine e Email dell'utente che si sta seguendo attualmente.
t_lat = 0;
t_longit = 0;
t_email = "";

//Gli array degli utenti vicini presenti sul server.
curr_nome = [];
curr_cognome= [];
curr_interessi = [];
curr_personalita = [];
curr_email = [];
curr_lat = [];
curr_longit = [];



function toRad(x) {
    return x * Math.PI / 180;
}

function toDeg(x) {
    return x * (180 / Math.PI);
}

//Funzione per calcolare la distanza tra due punti geografici (date le latitudini e le longitudini).
function distanza(lat1, lat2, lon1, lon2) {
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);
    var teta1 = toRad(lat1),
        teta2 = toRad(lat2),
        delta_gamma = toRad(lon2 - lon1),
        R = 6371000; // gives d in metres
    var d = Math.acos(Math.sin(teta1) * Math.sin(teta2) + Math.cos(teta1) * Math.cos(teta2) * Math.cos(delta_gamma)) * R;
    distance = d;
    //console.log('funzione distanza avviata: lat1_rad: ' + teta1 + '; lat2_rad: ' + teta2 + '; lon1: ' + lon1 + '; lon2: ' + lon2 + '; distanza = ' + d);
    //console.log('funzione distanza terminata. distance = '+distance);
    return distance;
}


//Funzione per calcolare la direzione da un punto geografico a un altro (date le latitudini e le longitudini).
function direzione(lat_start, lat_end, lon_start, lon_end) {
    console.log('funzione direzione avviata');
    lat_end = parseFloat(lat_end);
    lon_end = parseFloat(lon_end);
    lat_start = toRad(lat_start);
    lon_start = toRad(lon_start);
    lat_end = toRad(lat_end);
    lon_end = toRad(lon_end);

    var dLong = lon_end - lon_start;

    var dPhi = Math.log(Math.tan(lat_end / 2.0 + Math.PI / 4.0) / Math.tan(lat_start / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0) {
            dLong = -(2.0 * Math.PI - dLong);
        } else {
            dLong = (2.0 * Math.PI + dLong);
        }
    }

    var bearing = (toDeg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
    console.log('funzione direzione terminata. bearing = '+bearing);
    return bearing;
    
    /*Versione Precedente:
    var direction = "";    
    if (bearing >= 240 && bearing <= 300) {
        direction = "Ovest";
    } else if (bearing >= 60 && bearing <= 120) {
        direction = "Est";
    } else if (bearing >= 150 && bearing <= 210) {
        direction = "Sud";
    } else if ((bearing >= 330 && bearing <= 360) || (bearing >= 0 && bearing <= 30)) {
        direction = "Nord";
    } else if (bearing > 210 && bearing < 240) {
        direction = "Sud-Ovest";
    } else if (bearing > 120 && bearing < 150) {
        direction = "Sud-Est";
    } else if (bearing > 300 && bearing < 330) {
        direction = "Nord-Ovest";
    } else if (bearing > 30 && bearing < 60) {
        direction = "Nord-Est";
    }
    console.log('funzione direzione terminata. direction = '+direction);
    return direction;
    */
}

function traduci_distanza(d){
    var tdist = "";
    if(d>999){
        tdist = Math.round(d)/1000 + " Km";
    }
    else{
        tdist = Math.round(d) + " metri";
    }
    return tdist;
}

function traduci_direzione(d){
    var tdir = "";

    if(d>=0)
    {
        if (d >= 240 && d <= 300) {
                tdir = "Ovest";
        } else if (d >= 60 && d <= 120) {
            tdir = "Est";
        } else if (d >= 150 && d <= 210) {
            tdir = "Sud";
        } else if ((d >= 330 && d <= 360) || (d >= 0 && d <= 30)) {
            tdir = "Nord";
        } else if (d > 210 && d < 240) {
            tdir = "Sud-Ovest";
        } else if (d > 120 && d < 150) {
            tdir = "Sud-Est";
        } else if (d > 300 && d < 330) {
            tdir = "Nord-Ovest";
        } else if (d > 30 && d < 60) {
            tdir = "Nord-Est";
        }         
    }

    else {
        d = -d;
        if (d >= 240 && d <= 300) {
                tdir = "a destra";
        } else if (d >= 60 && d <= 120) {
            tdir = "a sinistra";
        } else if (d >= 150 && d <= 210) {
            tdir = "dietro";
        } else if ((d >= 330 && d <= 360) || (d >= 0 && d <= 30)) {
            tdir = "dritto";
        } else if (d > 210 && d < 240) {
            tdir = "dietro a destra";
        } else if (d > 120 && d < 150) {
            tdir = "dietro a sinistra";
        } else if (d > 300 && d < 330) {
            tdir = "dritto a destra";
        } else if (d > 30 && d < 60) {
            tdir = "dritto a sinistra";
        }     
    }
    return tdir;
}






//Creo una funzione per visualizzare la lista degli utenti vicini,
//ovvero una lista in cui posso cliccare i vari individui per saperne la distanza e la posizione.
function trackList() {

    console.log("funzione trackList avviata");

    var trackelement = $("#trackelement");
    trackelement.html("");
    var i = 0;

    for( i = 0; i < curr_lat.length; i++ ) {
        console.log("Sono all'interno del for nella funzione tracklist: i = "+i);
        var distanza_da_tradurre = distanza( curr_lat[i],info.dati.lat,curr_longit[i],info.dati.longit );
        var distanza_tradotta = traduci_distanza(distanza_da_tradurre);

        var trackit_append = '<div class="pulsante_trackit" data-role="button"><a id="'+i+'" class="link_trackit" href="#homePage">Segui!</a></div>';
        var curr_email_append = '<textarea class="elemento_lista" readonly data-transition="slide">Email: '+curr_email[i]+'</textarea>';
        //var curr_longit_append = '<textarea class="elemento_lista" readonly data-transition="slide" type="text">Lat: '+curr_longit[i]+'</textarea>';
        //var curr_lat_append = '<textarea class="elemento_lista" readonly data-transition="slide" type="text">Longit: '+curr_lat[i]+'</textarea>';
        var curr_distanza = '<textarea class="elemento_lista" readonly data-transition="slide" type="text">Distanza: '+distanza_tradotta+'</textarea>';
        var curr_nome_append =  '<textarea class="elemento_lista" readonly data-transition="slide" type="text">Nome: '+curr_nome[i]+'</textarea>';
        var curr_cognome_append =   '<textarea class="elemento_lista" readonly data-transition="slide" type="text">Cognome: '+curr_cognome[i]+'</textarea>';
        var curr_interessi_append = '<textarea name="nascosto_'+i+'" id="interessi_'+i+'" class="elemento_lista" rows="4" readonly data-transition="slide" type="text">Interessi: '+curr_interessi[i]+'&#13;&#10;Clicca per + INFO..</textarea>';
        var curr_personalita_append =  '<textarea id="nascosto_'+i+'" class="elemento_lista" style="display:none" rows="6" readonly data-transition="slide" type="text">E` un tipo: '+curr_personalita[i]+'</textarea>';

        trackelement.html(trackelement.html() + curr_email_append);
        trackelement.html(trackelement.html() + curr_nome_append);
        trackelement.html(trackelement.html() + curr_cognome_append);
        trackelement.html(trackelement.html() + curr_interessi_append);
        trackelement.html(trackelement.html() + curr_personalita_append);
        //trackelement.html(trackelement.html() + curr_lat_append + "<br/>");
        //trackelement.html(trackelement.html() + curr_longit_append + "<br/>");
        trackelement.html(trackelement.html() + curr_distanza + "<br/>");
        trackelement.html(trackelement.html() + trackit_append);        
        trackelement.html(trackelement.html() + "<hr/>");

        console.log("curr_lat["+i+"]="+curr_lat[i]);
        console.log("curr_longit["+i+"]="+curr_longit[i]);
        console.log("curr_nome["+i+"]="+curr_nome[i]);
        console.log("curr_email["+i+"]="+curr_email[i]);
        console.log("id = "+i);
    }

    for(i=0; i < curr_lat.length; i++) {

        console.log("Sono dentro il 2° for loop di trackList. id="+i);
        var interessi_id = "interessi_"+i;
        var nascosto_id = "nascosto_"+i;

        //Lancio la funzione trackIt se l'utente clicca sul pulsante trackit di un elemento.
        document.getElementById(i).addEventListener("click", trackIt, false);

        //Mostro o nascondo la sezione "personalità" di ciascun elemento, alla pressione della sezione interessi.
        document.getElementById(interessi_id).addEventListener
                            (
                                "click",
                                function() {
                                    var stile_display = document.getElementById(this.name).style.display;
                                    if(stile_display=="none"){
                                        document.getElementById(this.name).style.display="block";
                                    }
                                    else{
                                        document.getElementById(this.name).style.display="none";
                                    }
                                },
                                false
                            );
        console.log("EventListeners superati.");

    }

    console.log("funzione trackList terminata. i="+i);
}


//Creo la funzione che mi permette di seguire la persona cliccata nella tracklist.
function trackIt() {

    console.log("Funzione trackIt lanciata.");
    var indice = this.id;
    var msg = document.getElementById('msg');
    var msg2 = document.getElementById('msg2');
    var pulsante = document.getElementById('btnToggleCompass');

    t_lat = curr_lat[indice];
    t_longit = curr_longit[indice];
    t_email = curr_email[indice];
    tracking = 1;
    compass_toggle = 0;

    freccia = direzione(info.dati.lat, t_lat, info.dati.longit, t_longit);
    distance = distanza(info.dati.lat, t_lat, info.dati.longit, t_longit);
    bussola_direction = freccia - my_direction;

    
    msg.style.visibility = "visible";
    msg2.style.visibility = "visible";
    msg2.innerHTML = "per " + traduci_distanza(distance);
    pulsante.style.backgroundColor = "#A7F";
    pulsante.innerHTML = "TRACKING";
    navigator.compass.clearWatch(app.compassID);
    app.compassID = navigator.compass.watchHeading(
                app.onCompassSuccess,
                app.onCompassError,
                {
                    frequency: 100
                }
            );

    console.log("Funzione trackIt terminata: bussola_direction=" + bussola_direction + "; distance=" + distance);
}





//Creo una funzione per scaricare i dati dal server remoto.
function loadInfo() {

    var l_lat = info.dati.lat;
    var l_longit = info.dati.longit;
    var trackelement = $("#trackelement");

    trackelement.html("");
    trackelement.html('<p style="color:white">Caricamento dati dal server in corso...</p>');
    curr_lat.length = 0;
    curr_longit.length = 0;
    curr_email.length = 0;
    curr_nome.length = 0;
    curr_cognome.length = 0;
    curr_interessi.length = 0;
    curr_personalita.length = 0;

    console.log("Array curr_lat: "+curr_lat);
    console.log("Array curr_longit: "+curr_longit);
    console.log("Array curr_nome: "+curr_nome);
    console.log("Array curr_email: "+curr_email);

    $.ajax({

        type: 'GET',
        url: 'http://revandesigns.altervista.org/siti/peoplefinder/peoplefinderphp.php?&lat=' + l_lat + '&longit=' + l_longit + '&jsoncallback=?',
        dataType: 'JSONp',
        timeout: 10000,

        success: function(data) {
            //In caso di successo, inserisco i dati del server negli array locali.
            $.each(
                data, function (i, item) {
                    var s_nome = item.nome;
                    var s_cognome = item.cognome;
                    var s_email = item.email;
                    var s_interessi = item.interessi;
                    var s_personalita = item.personalita;
                    var s_lat = item.lat;
                    var s_longit = item.longit;

                    curr_lat.push(s_lat);
                    curr_longit.push(s_longit);
                    curr_email.push(s_email);
                    curr_nome.push(s_nome);
                    curr_cognome.push(s_cognome);
                    curr_interessi.push(s_interessi);
                    curr_personalita.push(s_personalita);
                }
            );

            console.log("Caricamento dal server eseguito con SUCCESSO!");
            console.log("Array curr_lat: "+curr_lat);
            console.log("Array curr_longit: "+curr_longit);
            console.log("Array curr_nome: "+curr_nome);
            console.log("Array curr_email: "+curr_email);

            //Lancio quindi trackList() che crea la lista degli utenti vicini.
            trackList();
        },

        //In caso di errore scrivo sulla pagina un messaggio di errore.
        error: function(data) {
            console.log("ERRORE nel caricare i dati all'interno della chiamata ajax.");
            trackelement.html("");
            trackelement.html('<p style="color:white">Errore nel caricare i dati dal server. Controllare la connessione a Internet</p>');
        }

    });

}






//Creo una funzione per inviare le informazioni al server remoto.
function sendInfo() {

    //Creo la lista da inviare al server. Si tratta di un Array di Oggetti javascript key-value.
    var lista_info_send = [
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            },
        {
            name: "",
            value: ""
                            }
                        ];
    var i = 0;
    //Carico la lista con tutti i valori conservati in app.storage (in cui ci sono tutti i valori di info.dati).
    for (i = 0; i < app.storage.length; i++) {
        console.log('i = ' + i);

        var current_key = (app.storage.key(i)); //Da fare: controllare perchè key(i) prende valori sbagliati.
        var current_info = (app.storage.getItem(current_key));
        console.log('current_key =' + current_key);
        console.log('current_info =' + current_info);

        lista_info_send[i].name = current_key;
        lista_info_send[i].value = current_info;
        console.log('nome nella lista = lista_info_send[' + i + '].name = ' + lista_info_send[i].name);
        console.log('dato nella lista = lista_info_send[' + i + '].value = ' + lista_info_send[i].value);
    }

    console.log(lista_info_send);

    //Rendo la lista da inviare adatta alla query ajax.
    var data_to_send = $.param(lista_info_send);
    JSON.stringify(data_to_send);
    console.log(data_to_send);

    //Invio la lista al server con ajax.
    $.ajax({

        type: 'POST',
        url: 'http://revandesigns.altervista.org/siti/peoplefinder/peoplefinderpost.php',
        data: data_to_send,

        success: function (data) {
            console.log('informazioni inviate correttamente!');
            navigator.notification.alert("Informazioni inviate!",
                function () {},
                "PeopleFinder",
                "OK");
        },

        error: function () {
            console.log('Si è verificato un errore di invio a livello di query ajax. Controllare il backend.');
            navigator.notification.alert("Si è verificato un errore di invio.",
                function () {},
                "PeopleFinder",
                "OK");
        }

    });

}



//funzione che aggiorna la posizione della persona che si sta seguendo.
function aggiornaTarget() {
    
    var email = t_email;

    $.ajax({

        type: 'GET',
        url: 'http://revandesigns.altervista.org/siti/peoplefinder/peoplefindertargetupdate.php?&email=' + email + '&jsoncallback=?',
        dataType: 'JSONp',
        timeout: 10000,

        //In caso di successo, aggiorno la posizione del target con i dati del server.
        success: function(data) {
            $.each(
                data, function (i, item) {
                    var s_lat = item.lat;
                    var s_longit = item.longit;

                    t_lat = s_lat;
                    t_longit = s_longit;
                }
            );

            console.log("Aggiornamento target eseguito con SUCCESSO!");
            console.log("t_lat = "+t_lat);
            console.log("t_longit = "+t_longit);
        },

        //In caso di errore scrivo sulla pagina un messaggio di errore.
        error: function(data) {
            console.log("ERRORE nel caricare i dati all'interno della chiamata ajax.");
        }

    });

}


//funzione che aggiorna i dati dell'utente sul database.
function aggiornaDB() {

    var dati_to_send = [    
        {
            name: "",
            value: ""
                        },

        {
            name: "",
            value: ""
                        },

        {
            name: "",
            value: ""
                        }
                    ];

    dati_to_send[0].name = "email";
    dati_to_send[0].value = info.dati.email;
    dati_to_send[0].name = "lat";
    dati_to_send[0].value = info.dati.lat;
    dati_to_send[1].name = "longit";
    dati_to_send[1].value = info.dati.longit;
    //Rendo i dati da inviare adatti alla query ajax.
    var data_to_send = $.param(dati_to_send);
    JSON.stringify(data_to_send);


    //Invio la lista al server con ajax.
    $.ajax({

        type: 'POST',
        url: 'http://revandesigns.altervista.org/siti/peoplefinder/peoplefinderupdate.php',
        data: data_to_send,

        success: function (data) {
            console.log('Database aggiornato con le nuove latitudine e longitudine!');
        },

        error: function () {
            console.log('Si è verificato un errore di aggiornaDB a livello di query ajax. Controllare il backend.');
        }
    });

}