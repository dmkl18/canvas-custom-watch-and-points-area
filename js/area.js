var DLCCanvas = DLCCanvas || {};

(function() {

    "use strict";

    var moveCurrentPointHandlers = [],
        endMovingCurrentPointHandlers = [],
        areaCount = 0;

    //значения по умолчанию
    var gridLineWidth = 1,
        gridLineColor = "white",
        pointColor = "red",
        areaLineColor = "black",
        areaLineWidth = 3,
        areaColor = "rgba(20,112,188,0.5)";

    var cvsArea = {

        //settings - {blockId: , canvasId: ,gridInterval: pointSize:, pointColor: , }
        /*
        * Settings:
        *   обязательные
        *   canvasId - id самого элемента canvas
        *   gridInterval - интервал между линиями сетки в px
        *
        *   необязательные
        *   pointSize - размер точки (по умолчанию gridInterval/2)
        *   pointColor - цвет точки (по умолчанию красный)
        *   gridLineWidth - ширина линий сетки (по умолчанию 1)
        *   gridLineColor - цвет линий ("white")
            areaLineColor - цвет линий области ("black")
            areaLineWidth = толщина линий области (3),
            areaColor - цвет области (rgba(20,112,188,0.5))
        * */
        constructor: function(settings)
        {

            this.cvs = document.getElementById(settings.canvasId);
            this.context = this.cvs.getContext('2d');
            this.width = this.cvs.getAttribute('width');
            this.height = this.cvs.getAttribute('height');
            this.clearBackground();

            this.pointSize = settings.pointSize ? settings.pointSize : settings.gridInterval/2;
            this.pointColor = settings.pointColor ? settings.pointColor : pointColor;
            this.gridLineWidth = settings.gridLineWidth ? settings.gridLineWidth : gridLineWidth;
            this.gridLineColor = settings.gridLineColor ? settings.gridLineColor : gridLineColor;
            this.areaLineColor = settings.areaLineColor ? settings.areaLineColor : areaLineColor;
            this.areaLineWidth = settings.areaLineWidth ? settings.areaLineWidth : areaLineWidth;
            this.areaColor = settings.areaColor ? settings.areaColor : areaColor;

            this.lines = [];
            this.points = [];
            //сохраняем координаты верхнего левого угла canvas элемента
            //в данном случае не важно - относительно начала документа или относительно ближайшего предка
            //с позиционированием, отличным от static
            this.top = this.cvs.offsetTop;
            this.left = this.cvs.offsetLeft;

            //рисуем сетку
            this.gridInterval = settings.gridInterval;
            this.createGrid();

            //задаем вид области, ограниченной точками
            this.areaView = DLCCanvas.area({
                lineColor: this.areaLineColor,
                lineWidth: this.areaLineWidth,
                areaColor: this.areaColor
            });

            //задаем обработчики событий
            var that = this;
            moveCurrentPointHandlers[areaCount] = function(event) {
                that.moveCurPoint(event);
            };
            endMovingCurrentPointHandlers[areaCount] = function(event) {
                that.delMoveCurPoint(event);
            };
            this.areaNumber = areaCount++;
            this.cvs.addEventListener('mousedown', function(event){ that.checkCurPoint(event); }, false);
            this.cvs.addEventListener('click', function(event){ that.createPoint(event); }, false);

            return this;
        },

        //фон необходимо очищать каждый раз
        clearBackground: function()
        {
            this.context.clearRect(0,0,this.width,this.height);
        },

        createGrid: function()
        {
            this.context.lineWidth = this.gridLineWidth;
            this.context.strokeStyle = this.gridLineColor;
            var wcLines = Math.floor(this.width/this.gridInterval),
                hcLines = Math.floor(this.height/this.gridInterval);
            this.context.beginPath();
            for(var i = 1; i < wcLines; i++)
            {
                this.context.moveTo(this.gridInterval * i, 0);
                this.context.lineTo(this.gridInterval * i, this.height);
            }
            for(i = 1; i < hcLines; i++)
            {
                this.context.moveTo(0, this.gridInterval * i);
                this.context.lineTo(this.width, this.gridInterval * i);
            }
            this.context.stroke();
        },

        createPoint: function(event)
        {
            //если в этой точки нет точки, то создаем ее
            //мы выполняем округление значений точки, чтобы точки располагались на пересечении линий сетки
            if(!this.exist)
            {
                var coords = {};
                coords.x = event.pageX - this.left;
                coords.y = event.pageY - this.top;
                coords.x = Math.round(coords.x / this.gridInterval) * this.gridInterval;
                coords.y = Math.round(coords.y / this.gridInterval) * this.gridInterval;
                this.points.push(DLCCanvas.circularElement(this.pointColor, this.pointSize/2, coords));
                this.drawElements();
            }
        },

        drawElements: function()
        {
            this.clearBackground();
            this.createGrid();
            this.drawPoints();
            if(this.points.length > 1)
            {
                this.drawArea(); //если точек больше одной, то рисуем линию и область
            }
        },

        drawPoints: function()
        {
            var ct = this.points.length;
            if(ct)
            {
                for(var i = 0; i < ct; i++)
                {
                    this.points[i].createCircle(this.context);
                }
            }
        },

        drawArea: function()
        {
            this.areaView.showArea(this.context, this.points, true);
        },

        checkCurPoint: function(event)
        {
            /*
             определяем координаты мышки и округляем их с учетом того, что центр любой точки всегда на пересечении линий сетки
             проверяем, есть ли в указанной точке уже точка и если да, присваиваем this.movingPoint эту точку (т.е. делаем ее перемещаемой)
             Также устанавливаем обработчики событий для перемещаемой точки
             */
            var x = Math.round((event.pageX - this.left) / this.gridInterval) * this.gridInterval,
                y = Math.round((event.pageY - this.top) / this.gridInterval) * this.gridInterval;
            this.exist = false;
            for(var i = 0, dl = this.points.length; i < dl; i++)
            {
                if(this.points[i].x == x && this.points[i].y == y)
                {
                    this.exist = true;
                    this.movingPoint = this.points[i];
                    this.cvs.addEventListener('mousemove', moveCurrentPointHandlers[this.areaNumber], false);
                    this.cvs.addEventListener('mouseup', endMovingCurrentPointHandlers[this.areaNumber], false);
                    break;
                }
            }
        },

        //перемещаем существующие точки
        moveCurPoint: function(event)
        {
            if(this.movingPoint)
            {
                this.movingPoint.x = Math.round((event.pageX - this.left) / this.gridInterval) * this.gridInterval;
                this.movingPoint.y = Math.round((event.pageY - this.top) / this.gridInterval) * this.gridInterval;
                this.drawElements();
            }
        },

        /*
        * По событию mouseup делаем текущую точку статической (т.е. не перемещаемой)
        * Для этого удаляем обработчики событий
        * */
        delMoveCurPoint: function(event)
        {
            if(this.movingPoint)
            {
                this.movingPoint = null;
                this.cvs.removeEventListener('mousemove', moveCurrentPointHandlers[this.areaNumber], false);
                this.cvs.removeEventListener('mouseup', endMovingCurrentPointHandlers[this.areaNumber], false);
            }
        },

    };

    DLCCanvas.dlcArea = function(settings) {
        return Object.create(cvsArea).constructor(settings);
    };

}());

document.addEventListener('DOMContentLoaded', DOMLoaded, false);

function DOMLoaded()
{
	"use strict";

	var myArea = DLCCanvas.dlcArea({
		canvasId: 'canvas-area',
		gridInterval: 20,
	});

}