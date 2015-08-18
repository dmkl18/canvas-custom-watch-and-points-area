var DLCCanvas = DLCCanvas || {};

(function() {

    "use strict";

    var circularElement = {

        constructor: function(color, radius, center)
        {
            this.color = color;
            this.radius = radius;
            this.x = center.x;
            this.y = center.y;
            return this;
        },

        //width - ширина линии, в случае отображения кольца
        createRing: function(context, width)
        {
            context.beginPath();
            context.lineWidth = width;
            context.strokeStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.stroke();
            return this;
        },

        createCircle: function(context)
        {
            context.beginPath();
            context.fillStyle = this.color;
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            context.fill();
            return this;
        },

    };

    var area = {

        constructor: function(settings)
        {
            this.lineColor = settings.lineColor;
            this.lineWidth = settings.lineWidth;
            this.areaColor = settings.areaColor ? settings.areaColor : undefined;
            return this;
        },

        /* третий параметр указывает, нужно ли закрашивать область */
        showArea: function(context, points, areaDraw)
        {
            var ct = points.length;
            context.beginPath();
            context.strokeStyle = this.lineColor;
            context.lineWidth = this.lineWidth;
            if(ct > 2 && areaDraw && this.areaColor) {
                areaDraw = true;
                context.fillStyle = this.areaColor;
            }
            else {
                areaDraw = false; //если хотя бы один из параметров не подходит - строго указываем, что areaDraw = false
            }
            context.moveTo(points[0].x, points[0].y);
            for(var i=1; i<ct; i++) {
                context.lineTo(points[i].x, points[i].y);
            }
            context.closePath();
            if(areaDraw) context.fill();
            context.stroke();
            return this;
        },

    };

    var gradientRadial = {

        constructor: function(forG, toG, context)
        {
            this.gradient = context.createRadialGradient(forG.x, forG.y, forG.r, toG.x, toG.y, toG.r);
            return this;
        },

        addColor: function(color, part)
        {
            this.gradient.addColorStop(part, color);
            return this;
        },

    };

    var rectangle = {

        constructor: function(context, color, topLeft, dimensions)
        {
            context.fillStyle = color;
            context.fillRect(topLeft.x, topLeft.y, dimensions.width, dimensions.height);
            return this;
        },

    };

    DLCCanvas.circularElement = function(color, radius, center) {
        return Object.create(circularElement).constructor(color, radius, center);
    };

    DLCCanvas.area = function(settings) {
        return Object.create(area).constructor(settings);
    };

    DLCCanvas.gradientRadial = function(forG, toG, context) {
        return Object.create(gradientRadial).constructor(forG, toG, context);
    };

    DLCCanvas.rectangle = function(color, topLeft, dimensions, context) {
        return Object.create(rectangle).constructor(context, color, topLeft, dimensions);
    }

}());