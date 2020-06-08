let App = {
    vector: null,
    score: 0,
    movimientos: 0,
    tiempoJuego: 0, 
    timer: null,  
    init: function() {
        let self = this;
        this.timer = new Timer();
        Efectos.activarBlanco();
        this.desplegarTiempo(this.tiempoJuego);

        $('.btn-reinicio').on('click', function(){
            if ($(this).text() == 'Reiniciar')
                location.reload();
            $(this).text("Reiniciar");
            self.comenzarPartida();
        });
    },
    comenzarPartida: function() {
        this.score = 0;
        this.movimientos = 0;
        this.tiempoJuego = 120;
        this.desplegarTiempo(this.tiempoJuego);
        this.desplegarMovimiento(this.movimientos);
        this.desplegarScore(this.score);
        this.llenarTablero();
        this.inicialTiempo();
    },
    terminarPartida: function() {
        this.timer.stop();
        this.deshabilitarEvento();
        Efectos.ocultarTablero();
    },
    inicialTiempo: function() {
        this.timer.clear();
        this.timer.every('1 seconds', () => {
            if (this.tiempoJuego == 1) {
                this.terminarPartida();
            }
            
            this.desplegarTiempo(--this.tiempoJuego);
        });
        this.timer.start();
    },
    sumarMovimiento: function() {
        this.movimientos += 1;
        this.desplegarMovimiento(this.movimientos);
    },
    sumarScore: function(cantidad) {
        this.score += cantidad;
        this.desplegarScore(this.score);
    },
    llenarTablero: function() {
        let columnas = $('[class^="col-"]'),
            self = this,
            filas = 7;

        columnas.each(function(llave, valor) {
            let hijos = $(valor).children().length;
            let contador = filas - hijos;

            for (let x = 0; x < contador; x++) {
                let html = `<img src="image/${Helper.randomGenerate(1, 5)}.png" width="75%" />`;

                if (x === 0 && hijos < 1)
                    $(valor).append(html);
                else
                    $(valor).find('img:eq(0)').before(html);
            }
        });

        this.agregarEvento();
        this.marcarEliminados();
    },
    desplegarTiempo: function(tiempo) {
        $('#timer').text(Helper.ticktToString(tiempo));
    },
    desplegarScore: function(score) {
        $('#score-text').text(score);
    },
    desplegarMovimiento: function(movimientos) {
        $('#movimientos-text').text(movimientos);
    },
    agregarEvento: function() {
        $('img').draggable({
            containment: '.panel-tablero',
            droppable: 'img',
            revert: true,
            revertDuration: 500,
            grid: [100, 100],
            zIndex: 10,
            drag: this.constrainCandyMovement
        }).droppable({
            drop: this.swapCandy
        });
        this.habilitarEvento();

    },
    habilitarEvento: function() {
        $('img').draggable('enable')
            .droppable('enable');
    },
    deshabilitarEvento: function() {
        $('img').draggable('disable')
            .droppable('disable');
    },
    constrainCandyMovement: function(event, candyDrag) {
        candyDrag.position.top = Math.min(100, candyDrag.position.top);
    	candyDrag.position.bottom = Math.min(100, candyDrag.position.bottom);
    	candyDrag.position.left = Math.min(100, candyDrag.position.left);
        candyDrag.position.right = Math.min(100, candyDrag.position.right);
    },
    swapCandy: function(event, candyDrag) {
        candyDrag = $(candyDrag.draggable);
    	let dragSrc = candyDrag.attr('src');
    	let candyDrop = $(this);
    	let dropSrc = candyDrop.attr('src');
    	candyDrag.attr('src', dropSrc);
        candyDrop.attr('src', dragSrc);
        App.sumarMovimiento();

        setTimeout(function () {
    		if ($('.delete-img').length === 0) {
    		    App.llenarTablero();
    		}
        }, 500);
    },
    marcarEliminados: function() {
        this.validarColumnas();
        this.validarFilas();
        this.sumarScore($('.delete-img').length);
        Efectos.eliminarElementos();
    },
    validarColumnas: function() {
        let columnas = $('[class^="col-"]');

        columnas.each(function(llave, valor) {
            let contador = 0,
                comparacion = '';
            $(valor).find('img')
                .toArray()
                .some((valorActual, posicion, arreglo) => {
                    let img = $(valorActual).prop('src');
                    if(comparacion != img) {
                        contador = 0;
                        comparacion = img;
                    }
                    if (++contador >= 3) {
                        for (let x = 0; x < contador; x++) {
                            $(arreglo[posicion - x]).addClass('delete-img');
                        }
                    }
                });
        });
    },
    validarFilas: function() {
        let columnas = $('[class^="col-"]');
        for (let fila = 0; fila < 7; fila++) {
            let contador = 0,
                comparacion = '';
            columnas.each((llave, valor) => {
                let img = $(valor).find('img').eq(fila);
                if (comparacion != img.prop('src')) {
                    contador = 0;
                    comparacion = img.prop('src');
                }
                if (++contador >= 3) {
                    for (let x = 0; x < contador; x++) {
                        columnas.eq(llave - x).find('img').eq(fila).addClass('delete-img');
                    }
                }
            });
        }
    }
};

let Helper = {
    randomGenerate: function(minimo, maximo) {
        minimo = Math.ceil(minimo);
    	maximo = Math.floor(maximo);
    	return Math.floor(Math.random() * (maximo - minimo)) + minimo;
    },
    ticktToString: function(ticksInSecs) {
        let ticks = ticksInSecs;
        let mm = Math.floor((ticks % 3600) / 60);
        let ss = ticks % 60;

        return this.pad(mm, 2) + ":" + this.pad(ss, 2);
    },
    pad: function(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
};

let Efectos = {
    activarBase: function() {
        let self = this;
        $(".main-titulo").animate({ color: "#DCFF0E" }, "slow", function() { self.activarBlanco() });
    },
    activarBlanco: function() {
        let self = this;
        $(".main-titulo").animate({ color: "#FFFFFF" }, "slow", function() { self.activarBase() });
    },
    ocultarTablero: function() {
        $('.panel-tablero, .time').animate({
            width: "0%"
        }, 'slow', function () {
            $(this).remove();
        });
        $('.panel-score').animate({
            width: "100%"
        }, 'slow');
    },
    eliminarElementos: function() {
        $('.delete-img').effect('pulsate', 600)
            .animate( { opacity: '0' }, { duration: 400 } )
    		.animate( { opacity: '0' }, { 
                duration: 400,
    			complete: function () {
                    $('.delete-img').remove();
                    App.llenarTablero();
    			},
    			queue: true
    		});
    }
};


App.init();
