var DLCCanvas = DLCCanvas || {};

(function(){

    "use strict";

    //изображения для часов
	var imgWatch1 = new Image();
	imgWatch1.src = 'images/dlcwatch.png';
	var imgWatch2 = new Image();
	imgWatch2.src = 'images/twelve.png';

	var dClock = {
	
		constructor: function(element, arrowsSettings)
		{
			this.canvas = element;
			this.context = element.getContext('2d');
			this.width = this.canvas.getAttribute('width');
			this.height = this.canvas.getAttribute('height');
			this.baseSize = this.width < this.height ? this.width : this.height;
            this.arrowsColor = arrowsSettings.arrowsColor;
            this.secondHandColor = arrowsSettings.secondHandColor;
            this.clearBackground();
			return this;
		},
		
		clearBackground: function()
		{
			this.context.clearRect(0,0,this.width,this.height);
		},

        //если необходимо, то фон всего canvas
		createBackground: function(color)
		{
			DLCCanvas.rectangle(color, {x: 0, y: 0}, {width: this.width, height: this.height}, this.context);
		},
		
		createDialColor: function(color, radius)
		{
            DLCCanvas.circularElement(color, radius, {x: this.width/2, y: this.height/2}).createCircle(this.context);
		},
		
		createRim: function(width, color, radius)
		{
			DLCCanvas.circularElement(color, radius, {x: this.width/2, y: this.height/2}).createRing(this.context, width);
		},

        //устанавливаем координаты в центр, предварительно запомнив прежнее состояние
        //поворачиваем координаты так, чтобы x смотрел на 12 часов
		rotateToTwelve: function()
		{
			this.context.save();
			this.context.translate(this.width/2, this.height/2);
			this.context.rotate(-Math.PI/2);
		},

        //так как всего 12 час => 12 стрелочек, расположенных через 2*PI/12
		createMark: function(width, color, begin, end, rotatePart)
		{
			this.context.lineWidth = width;
			this.context.strokeStyle = color;
			this.context.save();
			for(var i=0; i<rotatePart; i++)
			{
				this.context.beginPath();
				this.context.moveTo(begin, 0);
				this.context.lineTo(end, 0);
				this.context.stroke();
				this.context.rotate(Math.PI/(rotatePart/2));
			}
			this.context.restore();
		},
		
		setCurrentTime: function()
		{
			var time = new Date();
			this.hours = time.getHours();
			this.sec = time.getSeconds();
			this.min = time.getMinutes();
			if(this.hours >= 12) this.hours-=12;
		},
		
		drawHourHand: function()
		{
			this.context.save();
			this.context.rotate(Math.PI/6 * this.hours + Math.PI/360 * this.min + Math.PI/21600 * this.sec);
			this.createBackArrow(0.0625 * this.baseSize, this.arrowsColor, 'round', 0.025 * this.baseSize);
			this.createPartHourArrow(true);
			this.createPartHourArrow(false);
			this.context.beginPath();
			this.context.moveTo(0.21875 * this.baseSize, 0);
			this.context.lineTo(this.width/4, 0);
			this.context.stroke();
			this.context.restore();
		},
		
		drawMinuteHand: function()
		{
			this.context.save();
			this.context.rotate(Math.PI/30 * this.min + Math.PI/1800 * this.sec);
			this.createBackArrow(0.0625 * this.baseSize, this.arrowsColor, 'round', 0.01875 * this.baseSize);
			this.context.beginPath();
			this.context.moveTo(0, 0);
			this.context.lineTo((this.width/2 - 0.15625 * this.baseSize),0);
			this.context.stroke();
			this.context.restore();
		},
		
		drawSecondHand: function()
		{
			this.context.save();
			this.context.rotate(Math.PI/30 * this.sec);
			this.context.beginPath();
			this.context.lineWidth = 0.0125 * this.baseSize;
			this.context.strokeStyle = this.secondHandColor;
			this.context.moveTo(-0.15625 * this.baseSize, 0);
			this.context.lineTo((this.width/2 - 0.15625 * this.baseSize),0);
			this.context.fillStyle = this.secondHandColor;
			this.context.arc((this.width/2 - 0.15625 * this.baseSize), 0, 0.025 * this.baseSize, 0, 2 * Math.PI);
			this.context.arc(0, 0, 0.03125 * this.baseSize, 0, 2 * Math.PI);
			this.context.stroke();
			this.context.fill();
			this.context.restore();
		},

		createBackArrow: function(backPart, color, type, width)
		{
			this.context.beginPath();
			this.context.strokeStyle = color;
			this.context.lineCap = type;
			this.context.lineWidth = width;
			this.context.moveTo(-backPart, 0);
			this.context.arc(-(backPart + width), 0, width, 0, 2 * Math.PI);
			this.context.lineTo(0,0);
			this.context.stroke();
		},
		
		createPartHourArrow: function(side)
		{
			side = side ? 0.0625 * this.baseSize : -0.0625 * this.baseSize;
			this.context.beginPath();
			this.context.moveTo(0, 0);
			this.context.lineTo(0.0625 * this.baseSize, 0);
			this.context.bezierCurveTo(0.0625 * this.baseSize, side, 0.15625 * this.baseSize, 0, 0.21875 * this.baseSize, 0);
			this.context.stroke();
		},
		
		restore: function()
		{
			this.context.restore();
		},
		
		createGlass: function(radius)
		{		
			var gradientObject = DLCCanvas.gradientRadial(
                {
                    x: this.width/2,
                    y: this.height/2,
                    r: this.width/5
                },
                {
                    x: this.width/2,
                    y: this.height/2,
                    r: (this.height/2)*0.9
                },
                this.context).addColor("rgba(0,0,0,0.1)", '0').addColor("rgba(0,0,0,0.4)", '1');

            DLCCanvas.circularElement(gradientObject.gradient, radius, {x: this.width/2, y: this.height/2}).createCircle(this.context);
		},
		
		setImage: function(img, place, size)
		{
			if(size) {
                this.context.drawImage(img, place.x, place.y, size.x, size.y);
            }
			else {
                this.context.drawImage(img, place.x, place.y);
            }
		}
	
	};

    //base settings
    var dialColor = "white",
        innerRingColor = "brown",
        outerRingColor = "black",
        centralRingColor = "#cdb38b",
        markColor = "black",
        arrowsColor = "black",
        secondHandColor = "red";

    /*
    *   id - ид canvas-элемента
    *   dialColor = "white" - цвет циферблата со значением по умолчанию,
    *   innerRingColor = "brown" - цвет наружных ободов со значением по умолчанию,
    *   outerRingColor = "black",
    *   centralRingColor = "#cdb38b",
    *   markColor = "black" - цвет делителей со значением по умолчанию;
    *   arrowsColor = "black" - цвет стрелок
    *   secondHandColor = "red" - цвет секундной стрелки
    *   inscription = true - нужна ли нижняя надпись
    * */
    DLCCanvas.dlcClock = function(settings) {

        var currentSettings = {};
        currentSettings.dialColor = settings.dialColor ? settings.dialColor : dialColor;
        currentSettings.innerRingColor = settings.innerRingColor ? settings.innerRingColor : innerRingColor;
        currentSettings.outerRingColor = settings.outerRingColor ? settings.outerRingColor : outerRingColor;
        currentSettings.centralRingColor = settings.centralRingColor ? settings.centralRingColor : centralRingColor;
        currentSettings.markColor = settings.markColor ? settings.markColor : markColor;
        currentSettings.arrowsColor = settings.arrowsColor ? settings.arrowsColor : arrowsColor;
        currentSettings.secondHandColor = settings.secondHandColor ? settings.secondHandColor : secondHandColor;
        currentSettings.inscription = settings.inscription ? settings.inscription : true;
        currentSettings.cvsElement = document.getElementById(settings.id);

        function addClock()
        {
            var clock = Object.create(dClock).constructor(currentSettings.cvsElement, {
                    arrowsColor: currentSettings.arrowsColor,
                    secondHandColor: currentSettings.secondHandColor
                }),
                baseSize = clock.baseSize;

            clock.createDialColor(currentSettings.dialColor, 0.4375 * baseSize);
            clock.setImage(imgWatch1,
                {
                    x: 0.34375 * baseSize,
                    y: 0.625 * baseSize
                },
                {
                    x: 0.3125 * baseSize,
                    y: 0.09375 * baseSize
                });
            if(currentSettings.inscription) {
                clock.setImage(imgWatch2,
                    {
                        x: 0.3625 * baseSize,
                        y: 0.15625 * baseSize
                    }, null);
            }
            clock.createRim(0.0625 * baseSize, currentSettings.innerRingColor, 0.4375 * baseSize);
            clock.createRim(0.03125 * baseSize, currentSettings.centralRingColor, 0.453125 * baseSize);
            clock.createRim(0.0125 * baseSize, currentSettings.outerRingColor, 0.46875 * baseSize);
            clock.rotateToTwelve();
            clock.createMark(0.03125 * baseSize, currentSettings.markColor, 0.34375 * baseSize, 0.40625 * baseSize, 12);
            clock.createMark(0.0125 * baseSize, currentSettings.markColor, 0.375 * baseSize, 0.40625 * baseSize, 60);
            clock.setCurrentTime();
            clock.drawHourHand();
            clock.drawMinuteHand();
            clock.drawSecondHand();
            clock.restore();
            clock.createGlass(0.4375 * baseSize);
            setTimeout(addClock, 1000);
        }

        addClock();
    }

}());

document.addEventListener('DOMContentLoaded', DOMLoaded, false);

function DOMLoaded() {

    var clock = DLCCanvas.dlcClock({
        id: "watch1",
        innerRingColor: "black",
        outerRingColor: "orange",
        secondHandColor: "orange",
    });

}