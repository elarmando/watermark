function init()
{
    var img = document.getElementById("myImg");
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img,0,0, img.width, img.height);

    var imgData = ctx.getImageData(0,0, img.width, img.height);
    var data = imgData.data;
    var w = imgData.width;
    var h = imgData.height;
    var threshold = 5;

    for(var i = 0; i < w; i++)
    {
        for(var j = 0; j < h; j++)
        {
            var index = (j*w + i) * 4;

            var r = data[index];
            var g = data[index + 1];
            var b = data[index + 2];
            var a = data[index + 3];

            if(isPixelWaterMark(r,g,b,a))
            {
                var val = ((r + g + b) / 3) | 0;
                r = val;
                g = val;
                b = val;
            }

            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
        }
    }

    ctx.putImageData(imgData, 0, 0);

    console.log(imgData);
}

function isPixelWaterMark(r, g, b , a)
{
    var t = 5; 
    var mean = (r + g + b) / 3;

    var difr = Math.abs(mean - r);
    var difg = Math.abs(mean - g);
    var difb = Math.abs(mean - b);

    if(difg + difr + difb >= t)
        return true;

    return false;
}

window.onload = init;