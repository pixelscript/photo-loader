var w,h,c,ctx,c2,ctx2,clipboard,clipboardCtx,photoArray ,index=0,toggleCanvas;
setup();
function setup(){
	setupCanvas();
	setupEvents();
	photoArray = ['boxes.jpg','ce.jpg','cloud.jpg','flowers-big.jpg','fizz-beach.jpg','field.jpeg','fizz-bed.jpeg','fizz-car.jpeg'];
	loadImageIntoCanvas(photoArray[0]);
}

function setupCanvas(){
	c = document.createElement('canvas');
	c.width = w = getWidth()*2;
	c.height = h = getHeight()*2;
	c.id="one";
	ctx = c.getContext('2d');
	c.className='';
	document.getElementsByTagName('body')[0].appendChild(c);

	toggleCanvas = false;

	clipboard = document.createElement('canvas');
	clipboard.width = w;
	clipboard.height = h;
	clipboardCtx = clipboard.getContext('2d');
}

function setupEvents(){
	document.getElementsByTagName('body')[0].addEventListener('click',function(){
		loadNextImage();
	})
}


function loadImageIntoCanvas(url){
	var img = document.createElement('img');
	img.onload = function(){
		var targetCtx = ctx;
		var targetCanvas = c;
		drawImageInPlace(img,targetCtx);
	}
    img.src = url;
    img.crossOrigin = "anonymous";
}

function drawImageInPlace(img,targetCtx){
	clearCanvas(clipboardCtx);
	var off = calculateOffsets(img);
	clipboardCtx.drawImage(img, off.x, off.y);
	var col = getAverageColor(clipboardCtx);
	clearCanvas(targetCtx,'#FFF');
	clearCanvas(targetCtx,'rgba('+col.r+','+col.g+','+col.b+',0.3)');
	drawBorder(targetCtx,22,off,img,'#FFF');
	animateDraw(clipboardCtx,targetCtx,off,img,col);
	drawInner(targetCtx,off,img);
}
var current;
function animateDraw(clipboard,target,offset,image,colour){
	cancelAnimationFrame(current);
	var threshold = 100;
	function iterate(){
		colour = {"r":255*(threshold/100),"g":255*(threshold/100),"b":255*(threshold/100)}
		var generated = copyThreshhold(clipboard,offset,image,threshold,colour);
		target.putImageData(generated, offset.x, offset.y);
		
		threshold-=1;
		if(threshold>=0){
			current = requestAnimationFrame(iterate);
		}
	}
	current = requestAnimationFrame(iterate);
}

function calculateOffsets(image){
	width = image.naturalWidth;
	height = image.naturalHeight;
	var offX = Math.round((w-width)/2);
	var offY = Math.round((h-height)/2);
	return {'x':offX,'y':offY};
}

function clearCanvas(c,col){
	if(!col){
		col = "#FFF";
	}
	c.fillStyle = col;
	c.fillRect (0, 0, w, h);
}

function drawBorder(c,size,offset,image,col){
	var shadow = 2;
	if(!col){
		col = "#FFF";
	}
	width = Math.min(w,image.naturalWidth);
	height = Math.min(h,image.naturalHeight);
	c.fillStyle = col;
	c.fillRect(offset.x-size, offset.y-size, width+(size*2), height+(size*2));
	c.fillStyle = 'rgba(0,0,0,0.3)';
	c.fillRect(offset.x+width+size,offset.y-size+shadow,shadow,height+size*2);
	c.fillRect(offset.x-size+shadow,offset.y+height+size,width+size*2-shadow,shadow);
	c.fillStyle = 'rgba(0,0,0,0.1)';
	c.fillRect(offset.x-size-1,offset.y-size-1,1,height+2+size*2);
	c.fillRect(offset.x-size-1,offset.y-size-1,width+2+size*2,1);
	c.fillRect(offset.x+width+size,offset.y-size,1,height+size*2);
	c.fillRect(offset.x-size,offset.y+height+size,width+1+size*2,1);
}

function drawInner(c,offset,image){
	width = Math.min(w,image.naturalWidth);
	height = Math.min(h,image.naturalHeight);
	c.fillStyle = 'rgba(0,0,0,0.3)';
	c.fillRect(offset.x-1,offset.y-1,1,height+2);
	c.fillRect(offset.x-1,offset.y-1,width+2,1);
	c.fillRect(offset.x+width,offset.y,1,height);
	c.fillRect(offset.x,offset.y+height,width+1,1);
}

function getAverageColor(c){
	var size = 10;
	var imageColours = c.getImageData(Math.floor((w/2)-(size/2)),
								Math.floor((h/2)-(size/2)),
								size,size);
	var totalR = 0,
		totalG = 0,
		totalB = 0;

	for(var i=0; i<imageColours.data.length; i+=4){
		totalR+=imageColours.data[i];
		totalG+=imageColours.data[i+1];
		totalB+=imageColours.data[i+2];
	}
	var avR = Math.round(totalR/(Math.pow(size,2))),
		avG = Math.round(totalG/(Math.pow(size,2))),
		avB = Math.round(totalB/(Math.pow(size,2)));

	return {r:avR,g:avG,b:avB};
}

function copyThreshhold(c,offset,img,threshold,colour){
	var size = 10;
	var imageColours = c.getImageData(offset.x,offset.y,img.naturalWidth,img.naturalHeight);

	for(var i=0; i<imageColours.data.length; i+=4){
		var total = imageColours.data[i]+imageColours.data[i+1]+imageColours.data[i+2];
		if(total/765 < threshold/100) {
			imageColours.data[i] = colour.r;
			imageColours.data[i+1] = colour.g;
			imageColours.data[i+2] = colour.b;
		}
		
	}

	return imageColours;
}

function copyInverted(c,offset,img){
	var size = 10;
	var imageColours = c.getImageData(offset.x,offset.y,img.naturalWidth,img.naturalHeight);

	for(var i=0; i<imageColours.data.length; i+=4){
		imageColours.data[i] = 255-imageColours.data[i];
		imageColours.data[i+1] = 255-imageColours.data[i+1];
		imageColours.data[i+2] = 255-imageColours.data[i+2];
	}

	return imageColours;
}

function inverseColour(col){
	return {r:255-col.r,g:255-col.g,b:255-col.b};
}

function loadNextImage(){
	index++;
	if(index>photoArray.length){
		index = 0;
	}
	loadImageIntoCanvas(photoArray[index]);
}

