/*
    This code is to resolve a challenge proposed on this video:
    https://www.youtube.com/watch?v=ElfC_KGOkSU

    The challenge is to remove the watermarks from some famous cartoons of the world chess championship in 1972 (fischer vs spassky).
    You can download the images from here:

    https://fotosbobbyfischer.blogspot.com/2013/05/las-caricaturas-de-halldor-petursson.html?fbclid=IwAR0V1VQ3xzOq3opgfxxYKWjbJFLunrmgS11b-anKaRRukVN1-6C-ExYtmBY

    Manuel Lopez Michelone (La morsa) made a first implementation that you can find here:

    http://la-morsa.blogspot.com/2013/05/quitando-la-marca-de-agua.html

    This implementation follows these steps:

    1) Find the pixels that are not gray (isPixelWaterMark2 function)
    2) for each pixel channel applied the reverse transformation
        r = Math.round((r1 - (c2 * 41)) / c1);
        g = Math.round((g1 - (c2 * 15)) / c1);
        b = Math.round((b1 - (c2 * 19)) / c1);

        where r1, g1, b1 are the original red, green and blue values in the image that are not gray.
        c1 = 0.7, and c2 = 1 - c1 (c1 is the percentage of the original image without watermark)

        r,g, b are the new values

        the constant values 41, 15, 19 are assumptions that the color of the wartermark is rgb(41,15,19)

    3) Finally, the new pixel value is the average of rgb (grayVal = (r + g + b) / 3)
*/

function init() {
   startRemoveWaterMark("myImg", "myCanvas");
   startRemoveWaterMark("myImg1", "myCanvas1");
   startRemoveWaterMark("myImg2", "myCanvas2");
}

function startRemoveWaterMark(idImg, idCanvas)
{
     var img = document.getElementById(idImg);
    var canvas = document.getElementById(idCanvas);
    var ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    var imgData = ctx.getImageData(0, 0, img.width, img.height);
    removeWaterMark(imgData);
    ctx.putImageData(imgData, 0, 0);
}

function removeWaterMark(imgData)
{
   
    var data = imgData.data;
    var w = imgData.width;
    var h = imgData.height;
  
    for (var i = 0; i < w; i++) //w
    {
        for (var j = 0; j < h; j++) //h
        {
            var index = (j * w + i) * 4;

            var r = data[index];
            var g = data[index + 1];
            var b = data[index + 2];
            var a = data[index + 3];
            
            var r1 = r;
            var g1 = g;
            var b1 = b;
            
            if (isPixelWaterMark2(r, g, b)) {

                var c1 = 0.7;
                var c2 = 1 - c1;
                
                if (c1 == 0) 
                    c1 = 0.0000000001;

                r = Math.round((r1 - (c2 * 41)) / c1);
                g = Math.round((g1 - (c2 * 15)) / c1);
                b = Math.round((b1 - (c2 * 19)) / c1);
                
                var val = (r + g + b) / 3 | 0;
                val = validateRange(val);
                
                r = val;
                g = val;
                b = val;
                
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = a;

            }
        }
    }
}

function smoothPixel(data, i, j, w, h)
{
    var pixelVal = {r:0, g:0, b:0, a:0};
    
    if( i == 0 || i == w-1 || j == 0 || j == h - 1)
    {
        var index = (j * w + i) * 4;
        pixelVal.r = data[index];
        pixelVal.g = data[index + 1];
        pixelVal.b = data[index + 2];
        pixelVal.a = data[index + 3];
        return pixelVal;
    }
        
    for(var c =  i - 1; c <= i + 1; c++)
    {
        for(var r = j - 1; r <= j + 1; r++ )
        {
            var index = (r * w + c) * 4;

            pixelVal.r += data[index];
            pixelVal.g += data[index + 1];
            pixelVal.b += data[index + 2];
        }
    }
    
    pixelVal.r = validateRange(pixelVal.r / 9);
    pixelVal.g = validateRange(pixelVal.g / 9);
    pixelVal.b = validateRange(pixelVal.b / 9);
    pixelVal.a = 255;

    return pixelVal;
}

function validateRange(v)
{
    if(v > 255)
        return 255;
    if(v < 0)
        return 0;

    return Math.round(v);
}

function isPixelWaterMark2(r, g, b, a) {

    var t = 30;
    var mean = (r + g + b) / 3;

    var difr = Math.abs(mean - r);
    var difg = Math.abs(mean - g);
    var difb = Math.abs(mean - b);

    if (difg + difr + difb >= t)
        return true;

    return false;

}

function isPixelWaterMark(r, g, b, a) {
    var array = new Array();
    
    array[0] = Math.sqrt(Math.pow(255 - r, 2) + Math.pow(0 - g, 2) + Math.pow(0 - b, 2)); //Rojo
    array[1] = Math.sqrt(Math.pow(0 - r, 2) + Math.pow(255 - g, 2) + Math.pow(0 - b, 2)); //verde
    array[2] = Math.sqrt(Math.pow(0 - r, 2) + Math.pow(0 - g, 2) + Math.pow(255 - b, 2)); //Negro

    var av = Math.min.apply(null, array);

    if(av == array[0])
        return true;
    return false;
}

function onLoadFile(e)
{
    var  files = e.target.files;
    
    for(var i = 0; i < files.length; i++)
    {
        insertFile(files[i]);
    }
}

function insertFile(file)
{
    var reader = new FileReader();
    reader.onloadend = function()
    {
        insertImg(file.name, reader.result);
    }
    
    reader.readAsDataURL(file);
   
}

function insertImg(name, imgUrl)
{
    var nameImg = "img_"+ name;
    var nameCanvas = "canvas_" + name;
    var img = document.getElementById(name);

    if(img == null)
    {
        img = new Image();
        var canvas = document.createElement("canvas");
        
        img.id = nameImg;
        canvas.id = nameCanvas;
        
        var container = document.getElementById("imgsContainer");
        container.append(img);
        container.append(canvas);
        
        img.onload = function()
        {
            startRemoveWaterMark(nameImg, nameCanvas);
        }
        img.src = imgUrl;
    }

    
}
window.onload = init;