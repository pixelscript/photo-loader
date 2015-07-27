setup();

var w,h,c,ctx,c2,ctx2,clipboard,clipboardCtx,photoArray = [],index=0,toggleCanvas;

function setup(){
	startLoad();
	setupCanvas();
	setupEvents();
}

function startLoad(){
	// load photos from flickr
	var script = document.createElement('script');
	script.src = 'https://api.flickr.com/services/rest/?&jsoncallback=getPhotoData&method=flickr.photos.search&api_key=909ef763e4aac518da1d54e1b84b1364&user_id=125773262%40N05&format=json&tags=chosen&extras=date_taken';
	document.getElementsByTagName('body')[0].appendChild(script);
}

function setupCanvas(){
	c = document.createElement('canvas');
	c.width = w = getWidth();
	c.height = h = getHeight();
	c.id="one";
	ctx = c.getContext('2d');
	c.className='';
	document.getElementsByTagName('body')[0].appendChild(c);

	// c2 = document.createElement('canvas');
	// c2.width = w = getWidth();
	// c2.height = h = getHeight();
	// c2.id="two";
	// ctx2 = c2.getContext('2d');
	// document.getElementsByTagName('body')[0].appendChild(c2);
	// c2.className='';

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


function getPhotoData(data)
{
	var array = data.photos.photo;
    for (var i=0; i<array.length;i++){
    	var photo = array[i];
    	photoArray.push({
    		"title": photo.title,
    		"thumb": getThumb(photo),
    		"main": getMain(photo)
    	})
    }

    finishedDataLoading();
}

function getThumb(photo){
	return 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_q.jpg';
}

function getMain(photo){
	return "http://farm"+photo.farm+".staticflickr.com/"+photo.server+"/"+photo.id+"_"+photo.secret+"_b.jpg"
}

function finishedDataLoading(){
	loadImageIntoCanvas(photoArray[0].main);
}

function loadImageIntoCanvas(url){
	var img = document.createElement('img');
	img.crossOrigin = "Anonymous";
	img.onload = function(){
		var targetCtx = ctx;
		var targetCanvas = c;
		// var currentCtx = ctx2;
		// var currentCanvas = c2;
		// if(toggleCanvas){
		// 	targetCtx = ctx2;
		// 	targetCanvas = c2;
		// 	currentCtx = ctx;
		// 	currentCanvas = c;
		// }
		drawImageInPlace(img,targetCtx);
		// targetCanvas.className = 'right';
		// setTimeout(function(){
		// 	currentCanvas.className = 'animate left';
		// 	targetCanvas.className = 'animate';
		// },10);
		// toggleCanvas = !toggleCanvas;
	}
    img.src = url;
}

function drawImageInPlace(img,targetCtx){
	clearCanvas(clipboardCtx);
	var off = calculateOffsets(img);
	clipboardCtx.drawImage(img, off.x, off.y);
	var col = getAverageColor(clipboardCtx);
	clearCanvas(targetCtx,'#FFF');
	clearCanvas(targetCtx,'rgba('+col.r+','+col.g+','+col.b+',0.3)');
	drawBorder(targetCtx,22,off,img,'#FFF');
	targetCtx.drawImage(img, off.x, off.y);
	drawInner(targetCtx,off,img);
}

function calculateOffsets(image){
	var offX = Math.round((w-image.naturalWidth)/2);
	var offY = Math.round((h-image.naturalHeight)/2);
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
	c.fillStyle = col;
	c.fillRect(offset.x-size, offset.y-size, image.naturalWidth+(size*2), image.naturalHeight+(size*2));
	c.fillStyle = 'rgba(0,0,0,0.3)';
	c.fillRect(offset.x+image.naturalWidth+size,offset.y-size+shadow,shadow,image.naturalHeight+size*2);
	c.fillRect(offset.x-size+shadow,offset.y+image.naturalHeight+size,image.naturalWidth+size*2-shadow,shadow);
	c.fillStyle = 'rgba(0,0,0,0.1)';
	c.fillRect(offset.x-size-1,offset.y-size-1,1,image.naturalHeight+2+size*2);
	c.fillRect(offset.x-size-1,offset.y-size-1,image.naturalWidth+2+size*2,1);
	c.fillRect(offset.x+image.naturalWidth+size,offset.y-size,1,image.naturalHeight+size*2);
	c.fillRect(offset.x-size,offset.y+image.naturalHeight+size,image.naturalWidth+1+size*2,1);
}

function drawInner(c,offset,image){
	c.fillStyle = 'rgba(0,0,0,0.3)';
	c.fillRect(offset.x-1,offset.y-1,1,image.naturalHeight+2);
	c.fillRect(offset.x-1,offset.y-1,image.naturalWidth+2,1);
	c.fillRect(offset.x+image.naturalWidth,offset.y,1,image.naturalHeight);
	c.fillRect(offset.x,offset.y+image.naturalHeight,image.naturalWidth+1,1);
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

function inverseColour(col){
	return {r:255-col.r,g:255-col.g,b:255-col.b};
}

function loadNextImage(){
	index++;
	if(index>=photoArray.length){
		index = 0;
	}
	loadImageIntoCanvas(photoArray[index].main);
}

