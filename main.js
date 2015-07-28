var w,h,c,ctx,c2,ctx2,justReset,clipboard,clipboardCtx,photoArray,toggleCanvas,
	index=0,scaleFactor=0.5,border=50;

setup();

function setup(){
	setupCanvas();
	setupEvents();
	setPhotoArray();
}

function setPhotoArray(){
	var name = window.location.hash.substr(1);
	if (window[name]){
		photoArray = window[name];
	} else if(defaultSet){
		photoArray = defaultSet;
	} else {
		photoArray = [];
	}
	if(photoArray[0]){
		loadImageIntoCanvas(photoArray[0]);
	}
}

window.onhashchange = setPhotoArray;
window.onresize = redraw;

var to;
function redraw(){

	clearTimeout(to);
	to = setTimeout(function(){
		c.width = w = getWidth();
		c.height = h = getHeight();
		clipboard.width = w;
		clipboard.height = h;
		justReset = true;
		loadImageIntoCanvas(photoArray[index]);
	},500)

}

function setupCanvas(){
	c = document.createElement('canvas');
	c.width = w = getWidth();
	c.height = h = getHeight();
	c.id="one";
	ctx = c.getContext('2d');
	c.className='';
	c.alt = "photos";
	c.title = "CLICK FOR NEXT"
	document.getElementsByTagName('body')[0].appendChild(c);

	toggleCanvas = false;

	clipboard = document.createElement('canvas');
	clipboard.width = w;
	clipboard.height = h;
	clipboardCtx = clipboard.getContext('2d');
	clipboardCtx.scale(scaleFactor,scaleFactor);
	// document.getElementsByTagName('body')[0].appendChild(clipboard);
}

function setupEvents(){
	document.getElementsByTagName('body')[0].addEventListener('click',function(){
		loadNextImage();
	})
}

function calculateScaleFactor(image){
	var sfw = 1;
	var sfh = 1;
	var nw = image.naturalWidth;
	var nh = image.naturalHeight;
	if(nw>w-(border*2)){
		sfw = (w-(border*2)) / nw;
	}
	if(nh>h-(border*2)){
		sfh = (h-(border*2)) / nh;
	}
	return Math.min(sfw,sfh);
}

function setScaleFactor(val){
	if(val == scaleFactor){
		return;
	}
	if(justReset){
		clipboardCtx.scale(val,val);
	} else {
		clipboardCtx.scale(val/scaleFactor,val/scaleFactor);
	}
	justReset = false;
	scaleFactor = val;
}


function loadImageIntoCanvas(url){
	loading(true);
	var img = document.createElement('img');
	img.onload = function(){
		loading(false);
		var targetCtx = ctx;
		var targetCanvas = c;
		drawImageInPlace(img,targetCtx);
	}
    img.src = url;
    img.crossOrigin = "anonymous";
}

function drawImageInPlace(img,targetCtx){
	clearCanvas(clipboardCtx);
	setScaleFactor(calculateScaleFactor(img));
	var off = calculateOffsets(img);
	clipboardCtx.drawImage(img, 0, 0);
	var col = getAverageColor(clipboardCtx,img);
	clearCanvas(targetCtx);
	clearCanvas(targetCtx,'rgba('+col.r+','+col.g+','+col.b+',0.3)');
	drawBorder(targetCtx,12,off,img,'#FFF');
	animateDraw(clipboardCtx,targetCtx,off,img,col);
	drawInner(targetCtx,off,img);
}

var current;
function animateDraw(clipboard,target,offset,image,colour){
	cancelAnimationFrame(current);
	var threshold = 100;
	function iterate(){
		colour = {"r":255*(threshold/100),"g":255*(threshold/100),"b":255*(threshold/100)}
		var generated = copyThreshhold(clipboard,image,threshold,colour);
		target.putImageData(generated, offset.x, offset.y);
		
		threshold-=1;
		if(threshold>=0){
			current = requestAnimationFrame(iterate);
		}
	}
	current = requestAnimationFrame(iterate);
}

function calculateOffsets(image){
	width = image.naturalWidth*scaleFactor;
	height = image.naturalHeight*scaleFactor;
	var offX = Math.round((w-width)/2);
	var offY = Math.round((h-height)/2);
	return {'x':offX,'y':offY};
}

function clearCanvas(ct,col){
	if(!col){
		ct.clearRect(0, 0, w/scaleFactor, h/scaleFactor);
	} else {
		ct.fillStyle = col;
		ct.fillRect (0, 0, w/scaleFactor, h/scaleFactor);
	}


}

function drawBorder(c,size,offset,image,col){
	var shadow = 2;
	if(!col){
		col = "#FFF";
	}
	width = image.naturalWidth*scaleFactor;
	height = image.naturalHeight*scaleFactor;
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
	width = image.naturalWidth*scaleFactor;
	height = image.naturalHeight*scaleFactor;
	c.fillStyle = 'rgba(0,0,0,0.3)';
	c.fillRect(offset.x-1,offset.y-1,1,height+2);
	c.fillRect(offset.x-1,offset.y-1,width+2,1);
	c.fillRect(offset.x+width,offset.y,1,height);
	c.fillRect(offset.x,offset.y+height,width+1,1);
}

function getAverageColor(c,img){
	var size = 10;
	var imageColours = c.getImageData(Math.floor(((img.naturalWidth*scaleFactor)/2)-(size/2)),
								Math.floor(((img.naturalHeight*scaleFactor)/2)-(size/2)),
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

function copyThreshhold(c,img,threshold,colour){
	var size = 10;
	var imageColours = c.getImageData(0,0,img.naturalWidth*scaleFactor,img.naturalHeight*scaleFactor);

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
	if(index>=photoArray.length){
		index = 0;
	}
	loadImageIntoCanvas(photoArray[index]);
}

function loading(l){
	if(!document.querySelector('#loading')){
		return;
	}
	if(l){
		document.querySelector('#loading').className = 'loader';
	} else {
		document.querySelector('#loading').className = 'hide';
	}
}

