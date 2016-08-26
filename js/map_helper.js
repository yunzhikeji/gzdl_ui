/**
* @fileOverview google地图封装类<br/>
* v1.0<br/>
* 1:修正部分bug;<br/>
* v0.9<br/>
* 1:修改离线地图支持支持边界拼接;<br/>
* v0.8<br/>
* 1:支持离线地图瓦片文件扩展名设置;<br/>
* v0.7<br/>
* 1:优化代码,重写部分函数;<br/>
*	2:增加标记和线段闪烁功能;<br/>
*	3:修复已知bug.<br/>
* v0.6<br/>
* 1:增加绘制文本标签功能;<br/>
* 2:优化部分代码.<br/>
* v0.5<br/>
* 1:为Marker对象扩展id标识,用户唯一区分标记对象;<br/>
* 2:增加removeMarker方法,用户移除指定id的标记对象;<br/>
* 3:修复bug和优化代码.<br/>
* v0.4
* 增加google map外部扩展,实现距离计算等.<br/>
* v0.3
* 增加离线地图支持<br/>
* v0.2
* 优化修改接口考虑后期的兼容baidu等地图.<br/>
* v0.1
* 实现google map的常用封装,放大,缩小,叠加层,导航,事件封装.
* @author zeng69809  http://esbale.taobao.com 
* @version 1.0
* @datetime 2015年04月15日
*/

var NORMAL_MAP = 1; //地图
var HYBRID_MAP = 2; //卫星混合
var OFFLINE_MAP = 3; //离线地图
var TERRAIN_MAP = 4; //地形图

//添加自定义文字标签叠加层
var _Label = function(arg) {
    // 初始化
    this.setValues(arg);
    this.labelClass = arg.labelClass || "markerLabel";
    this.labelOffset = arg.labelOffset || new google.maps.Size(0, 0);
		this.id = arg.id || 0;
    // 标签样式
    var span = this.span_ = document.createElement('span');
    span.style.cssText = 'position: relative; left: -50%; top: -4px; ' + 'white-space: nowrap;' + 'padding: 1px;  font-size:12px;color:blue;font-family: 黑体;';
    var div = this._div = document.createElement('div');
    div.className = this.labelClass;
    div.appendChild(span);
    div.style.cssText = 'position: absolute; display: none';	
}
_Label.prototype = new google.maps.OverlayView;
_Label.prototype.getId = function(){
	return this.id;
}
//实现onAdd
_Label.prototype.onAdd = function() {
    var pane = this.getPanes().overlayLayer;
    pane.appendChild(this._div);
    // 确保标签是重绘如果文本或改变体位。
    var me = this;
    this.listeners_ = [google.maps.event.addListener(this, 'position_changed',
    function() {
        me.draw();
    }), google.maps.event.addListener(this, 'text_changed',
    function() {
        me.draw();
    })];
};
//实现 onRemove
_Label.prototype.onRemove = function() {
    this._div.parentNode.removeChild(this._div);

    // 标签是从映射中删除,停止更新其位置/文本。
    for (var i = 0,
    I = this.listeners_.length; i < I; ++i) {
        google.maps.event.removeListener(this.listeners_[i]);
    }
};
//实现 draw
_Label.prototype.draw = function() {
    var projection = this.getProjection();
    var position = projection.fromLatLngToDivPixel(this.get('position'));
    var div = this._div;
    div.style.left = (position.x) + 'px';
    div.style.top = (position.y) + 'px';
    div.style.display = 'block';
    this.span_.innerHTML = this.get('text').toString();
};
//输出默认lable样式
document.write('<style type="text/css">div .markerLabel {	display: block;	padding-top: 9px;	text-align: center;	width: 32px;letter-spacing: 0px;	font-size: 10px;font-family: Arial;}</style>');

/**
* @constructor mapHelper
* @description google地图封装类,基于google map api v3 开发.
* @see 参考手册<a href="https://developers.google.com/maps/documentation/javascript/basics?hl=zh-cn">Google Maps JavaScript API V3</a >.
*/
var mapHelper = function() {
// 构造函数
	google.maps.LatLng.prototype.distanceFrom = function(latlng) {
			var lat = [this.lat(), latlng.lat()]
			var lng = [this.lng(), latlng.lng()] //var R = 6371; // km (change this constant to get miles)
			var R = 6378137; // In meters
			var dLat = (lat[1] - lat[0]) * Math.PI / 180;
			var dLng = (lng[1] - lng[0]) * Math.PI / 180;
			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;
			return Math.round(d);
		}
		google.maps.Marker.prototype.id = 0;	
		google.maps.Marker.prototype.getId = function(){
			return this.id;
		}
		google.maps.Marker.prototype.distanceFrom = function(marker) {
			return this.getPosition().distanceFrom(marker.getPosition());
		}	
	
		google.maps.Marker.prototype._timerId = 0;	
		google.maps.Marker.prototype._flickerState = true;	
		google.maps.Marker.prototype._iconTmpPath = "";	
		google.maps.Marker.prototype.setIconTmpPath = function(icon) {
			this._iconTmpPath = icon;
		}			
		google.maps.Marker.prototype.setFlicker = function(flicker,flickerIcon,interval){
				var g = this;
				flickerIcon = flickerIcon || "";
				if(flicker)	{
						g.setIcon(flickerIcon);	
				}else {
						g.setIcon(g._iconTmpPath);	
				}
		}
		google.maps.Polyline.prototype.id = 0;	
		google.maps.Polyline.prototype.getId = function(){
			return this.id;
		}
		google.maps.Polyline.prototype.getLength = function() {
			var d = 0;
			var path = this.getPath();
			var latlng;
			for (var i = 0; i < path.getLength() - 1; i++) {
			    latlng = [path.getAt(i), path.getAt(i + 1)];
			    d += latlng[0].distanceFrom(latlng[1]);
			}
			return d;
		}			
		google.maps.Polyline.prototype._timerId = 0;	
		google.maps.Polyline.prototype._flickerState = true;	
		google.maps.Polyline.prototype._colorTmp = "#0000FF";	
		google.maps.Polyline.prototype.setFlicker = function(flicker,flickerColor,interval){
				var g = this;		
				flickerColor = flickerColor || "#FF0000";
				if(flicker)	{
						window.clearTimeout(g._timerId);
						var intervalTime = interval || 1000;
						g._timerId = window.setInterval(function(){	
								if(g._flickerState)	{
									g.setOptions({
										strokeColor: flickerColor
									});
								}
								else {
									g.setOptions({
										strokeColor: g._colorTmp
									});									
								}
								g._flickerState = !g._flickerState;
									
						},intervalTime);
				}else {
					window.clearTimeout(g._timerId);
				}
		}
		google.maps.Circle.prototype.id = 0;	
		google.maps.Circle.prototype.getId = function(){
			return this.id;
		}
}
//JS数组扩展
Array.prototype.remove = function(id) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].id == id) {
				this[i].setMap(null);
				this.splice(i, 1);				
				return;
      }
   }
}
Array.prototype.getItem = function(id) {
		for (var i = 0; i < this.length; i++) {
			if (this[i].id == id) {
					return this[i];
       }
   }
}
Array.prototype.clearItem = function(obj) {
		var isNullObj = false; 
		if(typeof obj === undefined || obj == null)
			isNullObj = true;			
		for (var i = 0; i < this.length; i++) {
	 		if(isNullObj) {
				this[i].setMap(null);
				this[i] = null;						
			}else if(obj === this[i]) {
				this[i].setMap(null);
				this.splice(i,1);
				return;
			}		
	 }	
		if(isNullObj) 
			this.length = 0;	
}

mapHelper.prototype = {
	/**
	* @description {Map} map基本对象.
	*/
	map: null,   
	/**
	* @description {Geocoder} 用于在地址和 LatLng 之间进行转换的服务对象.
	*/
	geocoder: null,
	/**
	* @description {Num} 地图缩放最小级别.
	* @constant
	*/
	minLevel: 0,
	/**
	* @description {Num} 地图缩放最大级别.
	* @constant
	*/
	maxLevel: 21,
	/**
	* @description 初始化地图对象.
	* @param {mapDiv} mapCanvas HTML中的容器用于创建新的地图，该容器通常是一个 DIV 元素.	
	* @param {MapOptions} myOptions  地图选项. 	
	* @return {Map} google map基本对象.
	* @example //参考例子
	var mapCanvas = document.getElementById("map_canvas");
	//地图选项
	var myOptions = {
	//初始缩放级别
	zoom: 12,
	//显示中心位置      
	center: new Array(117.209888, 31.852471),  
	//取消默认的控件
	disableDefaultUI: false,   
	//缩放移动控件   
	navigationControl: true,   
	navigationControlOptions: {position: google.maps.ControlPosition.RIGHT_TOP},
	//地图类型控件           
	mapTypeControl: false, 
	//比例尺控件  
	scaleControl: true,   
	//启用/停用在双击时缩放并居中
	disableDoubleClickZoom:true, 
	//地图类型
	//NORMAL_MAP 标注地图
	//HYBRID_MAP 卫星混合
	//OFFLINE_MAP 离线地图
	//TERRAIN_MAP 地形图
	mapTypeId: OFFLINE_MAP,
    //离线地图路径
    mapPath: "maptile/googlemaps/roadmap/",
    //离线地图瓦片文件扩展名
    mapFileExt:"png"
};
maphelper = new mapHelper();
mapobj = maphelper.initMap(mapCanvas,myOptions);
	*/
	initMap: function(mapCanvas, myOptions) {
		if(this.isUndefined(mapCanvas))
			mapCanvas = document.getElementById("map_canvas");	
		if(this.isUndefined(myOptions)) {
			  //地图选项
			myOptions = {
				//初始缩放级别
				zoom: 8,
				//显示中心位置      
				center: new Array(117.209888, 31.852471),
				//取消默认的控件
				disableDefaultUI: false,  
				//添加比例尺控件
				scaleControl: false,	  
				//添加地图类型控件
   			    mapTypeControl: true, 		
				// 添加平移缩放控件					
  			    navigationControl: false,
				mapType: NORMAL_MAP
			};				
		}			
		//转换经纬度坐标为google map 坐标
		myOptions.center = new google.maps.LatLng(myOptions.center[1], myOptions.center[0]); 
		this.map = new google.maps.Map(mapCanvas);	
		//转换地图类型
		myOptions.mapTypeId = this.__convertMapType(myOptions.mapTypeId, myOptions.mapPath, myOptions.mapFileExt);			
		this.map.setOptions(myOptions);		
	  this.geocoder = new google.maps.Geocoder();		
		return this.map;
	}, 
	__convertMapType: function(type, mapPath, mapFileExt) {		
		var maptilePath = mapPath || "maptile/googlemaps/roadmap/";		
        var mapFileExt = mapFileExt || "png";
		switch(type){
			case NORMAL_MAP:
				return google.maps.MapTypeId.ROADMAP;
			break;
			case HYBRID_MAP:
				return google.maps.MapTypeId.HYBRID;
			break;	
			case TERRAIN_MAP:
				return google.maps.MapTypeId.TERRAIN;
			break;	
			case OFFLINE_MAP:
			var gmapsMapTypeId = "google_offline";
                var ofmap = this.__createMapType("离线地图", maptilePath, mapFileExt);
				this.map.mapTypes.set(gmapsMapTypeId, ofmap);
       
                
					this.map.mapTypeControlOptions = {
				  mapTypeIds: [gmapsMapTypeId]
				};	
				return gmapsMapTypeId;			
			break;
		}
		return google.maps.MapTypeId.ROADMAP; 
	},
	/**
	* @description 判断参数对象是否不存在.
	* @param {Object} obj 待判断参数对象.
	* @return {Boolean} True为不存在,False为存在.
	*/
	isUndefined: function (obj) {
		if(typeof obj === undefined)
			return true;
		if(obj == null)
			return true;
		return false;
	},	
	/**
	* @description 判断参数是否为函数.
	* @param {Object} func 函数对象.
	* @return {Boolean} True为是,False不是.
	*/	
	isFunction: function (func) { 	
  	if(!this.isUndefined(func)) {
			if(func.constructor == Function) 
				return true;
		}
		return false;
	}, 
	/**
	* @description 经纬度数组转换为GoogleMap LatLng对象数组.
	* @argument {Array} ary 经纬度数组 .
	* @return {Array} GoogleMap LatLng对象数组.
	*/		
	__lngLatToLatLng: function(ary) {
		
	  var path = Array();
    for (i = 0; i < ary.length; i++) {
        path[i] = new google.maps.LatLng(parseFloat(ary[i][1]), parseFloat(ary[i][0]));
    }		
		return path;
	},	
	/**
	* @description 地图缩放设置.
	* @param {Num} step 缩放步长,step大于0地图放大,step小于0地图缩小.
	* @private
	*/				
	__zoomMap: function(step) {
    var g = this;
    if (g.map) {
        var zoomLevel = g.map.getZoom();
        zoomLevel += step;
        g.map.setZoom(parseInt(zoomLevel));
        if (zoomLevel == g.minLevel) {
            alert("地图区域已缩至最小");
        } else if (zoomLevel == g.maxLevel) {
            alert("地图区域已放至最大");
        }
    }
	},
	/**
	* @description 线段对象数组.
	* @private
	*/					
	__lines: new Array(),
	/**
	* @description 几何图形对象数组.
	* @private
	*/					
	__polys: new Array(),
	/**
	* @description 地图路线显示对象数组.
	* @private
	*/						
	__dirDisplays: new Array(),
	/**
	* @description MapsEvent事件数组.
	* @private
	*/	
	__mapsEvents: new Array(),
	/**
	* @description 标记Marker对象数组.
	* @private
	*/	
	__markers: new Array(),	
	/**
	* @description 文字标注Label对象数组.
	* @private
	*/	
	__labels: new Array(),	
	__markerPoint: function(latlng, title, icon, id) {
    var g = this;
    var n = g.__markers.length;
		if (g.isUndefined(id)) id = 0;
		if (g.isUndefined(title)) title = "";
	  if (g.isUndefined(icon)) icon = "";		
		if( id > 0)
		{
			for (var i = 0; i < g.__markers.length; i++) {
				if (g.__markers[i].id.toString() == id.toString()) {
					g.__markers[i].setOptions({
			      position: latlng,
			      title: title,
			      icon: icon,
						_iconTmpPath:icon		
			    });
					return;
				}			
			}				
		}
    var marker = new google.maps.Marker({
      map: g.map,
      position: latlng,
      title: title,
      icon: icon,
	  _iconTmpPath:icon,	
	  draggable:true	
    });
		marker.id = id;
    g.__markers.push(marker);
    return marker;
	},
	/**
	* @description 创建离线地图类型.
	* @param {String} name 地图类型名称.
	* @param {String} mapTilePath 地图路径.
    * @param {String} mapFileExt 离线地图文件扩展名默认png.
	* @private
	*/	
	__createMapType: function (name,mapTilePath,mapFileExt) {
		var getTileUrl = function (coord, zoom){
		 var numTiles = (1 << zoom);
         var x = coord.x;
         var y = coord.y;
         if(coord.x < 0)
          {
            x = numTiles-(Math.abs(coord.x)%(numTiles));
            if(numTiles == x)   
                x = 0;  
    
          }else
          {
            x = (Math.abs(coord.x)%(numTiles));
          }
		  return mapTilePath + zoom + "/" + x + "/" + y + "." + mapFileExt;
		};         
        var bIsPng = mapFileExt == "png"?true:false;
		var imageMapTypeOptions = {
		  "name":name,
		  "alt": "显示本地地图数据",
		  "tileSize": new google.maps.Size(256, 256),
		  "maxZoom": 16, //地图显示最大级别
		  "minZoom": 1, //地图显示最小级别
		  "getTileUrl": getTileUrl,
		  "isPng": bIsPng,
		  "opacity": 1.0
		};
		return new google.maps.ImageMapType(imageMapTypeOptions);
  },
	/**
	* @description 将指定侦听器函数添加到指定对象实例的指定事件名称.
	* @param {Object} instance 需要绑定事件的对象实例.
	* @param {String} eventname 事件名称,'click','dblclick','mouseup','mousedown','mouseover','mouseout'.
	* @param {Function} callback 函数对象,包含参数event:反馈事件信息, map:map对象, instance:对象实例.
	* @return {Object} 传回该侦听器的标识符,绑定失败返回null.
	*/	
	bindInstanceEvent: function(instance, eventname, callback) {		
		var g = this;
		if(!g.isUndefined(instance) && !g.isUndefined(eventname) && !g.isUndefined(callback))
		{	
			var mapsEvent = new google.maps.event.addListener(instance, eventname,
			function(event) {        	
				callback(event, g.map, instance);
			});	
			g.__mapsEvents.push(mapsEvent);
			return mapsEvent;
		}
		return null;
	},
	/**
	* @description 删除实例其所有事件侦听器或指定侦听器.
	* @param {Object} instance 指定要删除的实例.	
	* @param {String} eventName 指定删除的某个事件的侦听器(可选).	
	*/
	clearInstanceEvent: function(instance, eventName) {
		if(this.isUndefined(eventName))
			google.maps.event.clearInstanceListeners(instance);
		else
			google.maps.event.clearListeners(instance, eventName);
	},
	/**
	* @description 删除指定事件侦听器.
	* @param {MapsEventListener} event 指定要删除的事件侦听器对象.
	*/	
	removeEvent: function(event) {
		google.maps.event.removeListener(event);
	},
	/**
	* @description 清除所有事件侦听器.
	*/	
	clearEvents: function() {		
		for (var i = 0; i < this.__mapsEvents.length; i++) {
			google.maps.event.removeListener(this.__mapsEvents[i]);
			this.__mapsEvents[i] = null;		
		}	
	  this.__mapsEvents = [];
	},				
	/**
	* @description 指定地图当前缩放级别.
	* @param {Num} level 设置地图当前的缩放级别.
	* @return {Boolean} True成功,False失败.
	*/				
	setZoom: function(level) {
    level = parseInt(level);
    if (level < this.minLevel || level > this.maxLevel) {
        alert("指定地图缩放级别不正确");
        return false;
    }
    this.map.setZoom(level);
    return true;
	},
	/**
	* @description 获取地图当前缩放级别.
	* @return {Num} 当前缩放级别.
	*/		
	getZoom: function() {
		return this.map.getZoom();
	},
	/**
	* @description 设置当前地图放大一级.
	*/		
	zoomIn: function() {
	  this.__zoomMap(1);
	},
	/**
	* @description 设置当前地图缩小一级.
	*/	
	zoomOut: function() {
	  this.__zoomMap(-1);
	},
	/**
	* @description 使地图显示移至到指定经纬度.
	* @param {Num} lng 经度.
	* @param {Num} lat 维度.
	* @param {Num} level 移动后地图缩放级别(可选).			
	*/						
	movePoint: function(lng, lat, level) {
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    var latlng = new google.maps.LatLng(lat, lng);
    this.map.setCenter(latlng);
    if (!this.isUndefined(level) && level != "") 
			this.setZoom(level);
	},
	/**
	* @description 根据地址查找地图中位置.
	* @param {String} address 地址信息.
	*/						
	findPoint: function(address) {
        var g = this;
        g.geocoder.geocode({
          'address': address,
	      'region': 'CN'
        },
        function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
              var latlng = results[0].geometry.location;
              g.map.setCenter(latlng);
              g.__markerPoint(latlng, address);

          } else {
              alert("地理位置不正确,错误信息:" + status);
          }
        });
	},
	/**
	* @description 在地图上标记点.
	* @argument {Object} arg {lng:经度, lat:维度, latlng:LatLng对象, title:标题, icon: 图标路径, id:标识}.
	* @return {Marker} 标记点对象.
	*/	
	markerPoint: function(arg) {
		var g = this;
    var lat = arg.lat;
    var lng = arg.lng;
    var title = arg.title;
    var icon = arg.icon;
		var latlng = arg.latlng || new google.maps.LatLng(lat, lng);
		var id = arg.id || 0;	
	  var marker = g.__markerPoint(latlng, title, icon, id);
	  return marker;
	},
	/**
	* @description 获取标记对象数组.
	* @return {Object} 标记点对象数组.
	*/		
	getMarkers: function() {
		return this.__markers;
	},
	/**
	* @description 清除指定标记或所有标记.
	* @param {Object} marker markerPoint返回的标记点对象(可选),参数不填清除所有标记.
	*/	
	clearMarker: function(marker) {
		this.__markers.clearItem(marker);		
	},
	/**
	* @description 移除指定id的标记点.
	* @param {Num} id 调用markerPoint方法时传递的id值.
	*/	
	removeMarker: function(id) {
		this.__markers.remove(id);
	},	
	/**
	* @description 获取标记对象.
	* @param {Num} id 调用markerPoint方法时传递的id值.	
	* @return {Object} 标记点对象.
	*/		
	getMarker: function(id) {
		return this.__markers.getItem(id);
	},	
	/**
	* @description 在地图上添加文本标签.
	* @argument {Object} arg {lng:经度, lat:维度, latlng:LatLng对象, text:文本, labelClass:标签样式名(默认markerLabel),labelOffset:标签偏移, id:标识}.
	* @return {Marker} 标记点对象.
	*/			
	DrawLabel: function(arg){
		var g = this;
		var lat = arg.lat;
		var lng = arg.lng;
		var text = arg.text || "";
		var latlng = arg.latlng || new google.maps.LatLng(lat, lng);
		var labelClass = arg.labelClass || "markerLabel";
    var labelOffset = arg.labelOffset || new google.maps.Size(0,0);
		var id = arg.id || 0;
		if( id > 0)
		{		
			for (var i = 0; i < this.__labels.length; i++) {  
					if (g.__labels[i].id.toString() == id.toString()) {
						g.__labels[i].setValues({
					   position: latlng,
					   text: text
				    });
						return;
				}
			}	
		}
		var label = new _Label({
     map: g.map,
	   position: latlng,
	   text: text,
	   labelClass : labelClass,
		 labelOffset: labelOffset,
		 id: id
    });		
		g.__labels.push(label);
		return label;
	},	
	/**
	* @description 获取文本标签对象数组.
	* @return {Object} 标签对象数组.
	*/		
	getLabels: function() {
		return this.__labels;
	},		
	/**
	* @description 清除所有文本标签.
	*/	
	clearLabel: function() {
		this.__labels.clearItem();
	},
	/**
	* @description 移除指定id的文本标签.
	* @param {Num} id 调用DrawLabel方法时传递的id值.
	*/	
	removeLabel: function(id) {
		this.__labels.remove(id);	
	},
	/**
	* @description 在地图上画线.
	* @argument {Object} arg {dots:经纬度数组, color:线色, opacity:线透明度, weight: 线宽, id:标识}.
	* @return {Polyline} 几何线段对象.
	*/	
	polyline: function(arg) {
    var g = this;
    var ds = arg.dots; //线段点数组
    var c = arg.color || "#FF0000"; //线色
    var o = arg.opacity || 1.0; //线透明度
    var w = arg.weight || 2; //线宽
    var path = g.__lngLatToLatLng(ds);
    var id = arg.id || 0;	
		if( id > 0)
		{
			for (var i = 0; i < g.__lines.length; i++) {
				if (g.__lines[i].id.toString() == id.toString()) {
					g.__lines[i].setPath(path);
					g.__lines[i].setOptions({
				   strokeColor: c,
				   strokeOpacity: parseFloat(o),
					 strokeWeight: parseInt(w),
					 _colorTmp: c
			    });
					return;
				}			
			}				
		}
    //定义线的样式
    var line = new google.maps.Polyline({
        path: path,
        strokeColor: c,
        strokeOpacity: parseFloat(o),
        strokeWeight: parseInt(w),
				_colorTmp: c
    });
    //把线添加到地图
    line.setMap(g.map);
	line.id = id;
    g.__lines.push(line);			
    return line;
	},
	/**
	* @description 清除指定线段对象或所有线段对象.
	* @param {Object} line 需要清除线段对象(可选).
	*/					
	clearLine: function(line) {
		this.__lines.clearItem(line);		
	},	
	/**
	* @description 移除指定id的线段.
	* @param {Num} id 调用polyline方法时传递的id值.
	*/	
	removeLine: function(id) {
		this.__lines.remove(id);	
	},	
	/**
	* @description 获取线段对象.
	* @param {Num} id 调用polyline方法时传递的id值.	
	* @return {Object} 线段对象.
	*/		
	getLine: function(id) {
		return this.__lines.getItem(id);
	},	
	/**
	* @description 在地图上绘制多边形.
	* @argument {Object} arg {dots:经纬度数组, color:线色, opacity:线透明度, weight:线宽, fillcolor:填充色, fillopacity:填充透明度}.
	* @return {Polygon} 几何线段对象.
	*/
	polygon: function(arg) {
    var g = this;
    var ds = arg.dots; //线段数组
    var sc = arg.color || "#FF0000"; //线色
    var so = arg.opacity || 1.0; //线透明度
    var sw = arg.weight || 1; //线宽
		var fc = arg.fillcolor || "#FF0000";//填充色
		var fo = arg.fillopacity || 0.35;//填充透明度			
    var path = g.__lngLatToLatLng(ds);
    //多边形样式
    var polygon = new google.maps.Polygon({
		paths: path,
		strokeColor: sc,
		strokeOpacity: parseFloat(so),
		strokeWeight: parseInt(sw),
		fillColor: fc,
		fillOpacity: parseFloat(fo)					
    });
    //把线添加到地图
    polygon.setMap(g.map);
    g.__polys.push(polygon);			
    return polygon;		
	},
	/**
	* @description 在地图上绘制圆形.
	* @argument {Object} arg {id:标识符, lng:圆心经度, lat:圆心纬度, radius:半径(米), color:线色, opacity:线透明度, weight:线宽, fillcolor:填充色, fillopacity:填充透明度, zIndex:相对与其他图形的位置}.
	* @return {Circle} Circle对象.
	*/
	circle: function(arg) {
    var g = this;
	var lat = arg.lat; //圆心维度
	var lng = arg.lng; //圆心经度
    var radius = arg.radius || 100;	//半径
	var sc = arg.color || "#FF0000"; //线色
    var so = arg.opacity || 1.0; //线透明度
    var sw = arg.weight || 1; //线宽
	var zIndex = arg.zIndex || 0;
	var id = arg.id || 0;	
		var fc = arg.fillcolor || "#FF0000";//填充色
		var fo = arg.fillopacity || 0.35;//填充透明度				
		var circleOptions = {
		  strokeColor: sc,
		  strokeOpacity: parseFloat(so),
		  strokeWeight: parseInt(sw),
		  fillColor: fc,
		  fillOpacity: parseFloat(fo),
		  center: new google.maps.LatLng(lat, lng),
		  radius: parseInt(radius),
		  zIndex: zIndex
		};
		circle = new google.maps.Circle(circleOptions);		
		circle.setMap(g.map);
		circle.id = id;
	   g.__polys.push(circle);			
		return circle;	
	},
	/**
	* @description 获取几何图形对象数组.
	* @return {Object} 几何对象数组.
	*/		
	getPolys: function() {
		return this.__polys;
	},
	/**
	* @description 清除指定几何对象或所有几何图形对象.
	* @param {Object} poly 需要清除几何对象(可选),包括多边形对象,矩形对象,圆形对象.
	*/					
	clearPoly: function(poly) {
		this.__polys.clearItem(poly);	
	},
	/**
	* @description 地图线路导航.
	* @argument {Object} arg {mode:路线引导模式, from:起点(地名、坐标), to:终点(地名、坐标), highways:是否使用高速公路, tolls:是否使用收费公路, dirPanel:导航信息反馈容器ID名,locations:导航中途位置或坐标数组,draggable:路线拖动}.
	* @return {Marker} 线段对象.
	*/					
	navigation: function(arg) {
		var g = this;
    var mode = arg.mode || "DRIVING"; //路线引导模式
    var origin = arg.from; //起点
    var destination = arg.to; //终点
    var highways = arg.highways; //是否使用高速公路
    var tolls = arg.tolls; //是否使用收费公路
		var dirPanel = arg.dirPanel;//导航信息
		var locations = arg.locations;
		var draggable = arg.draggable || false;
		var waypoints = new Array();			
    var avoidHighways = true,
    avoidTolls = true;
    if (!g.isUndefined(highways)) avoidHighways = !highways;
    if (!g.isUndefined(tolls)) avoidTolls = !tolls;			
		if(typeof(locations) == "object")
		{
			var n = locations.length;
			for (i = 0; i < n; i++) {
						waypoints[i] = {location:locations[i]};
			}			
		}						
		var rendererOptions = {
		  draggable: draggable
		};
    var dirDisplay = new google.maps.DirectionsRenderer(rendererOptions); //地图路线显示对象
    var dirService = new google.maps.DirectionsService(); //地图路线服务对象
	  dirDisplay.setMap(null);
		if (!g.isUndefined(dirPanel)) 
			  dirDisplay.setPanel(document.getElementById(dirPanel));						
	    dirDisplay.setMap(g.map);
    var request = {				
        origin: origin,   		         
        destination: destination,                
        travelMode: mode,
        optimizeWaypoints: true,
        avoidHighways: avoidHighways,
        avoidTolls: avoidTolls,
				//公制单位
				unitSystem: google.maps.UnitSystem.METRIC,
				waypoints:waypoints
    };
	  dirService.route(request,
	    function(response, status) {
	        if (status == google.maps.DirectionsStatus.OK) {							
	            dirDisplay.setDirections(response);
	        }
	  });
		g.__dirDisplays.push(dirDisplay);
		return dirDisplay;
	},
	/**
	* @description 获取导航路线对象数组.
	* @return {Object} 导航路线对象数组.
	*/		
	getNavs: function() {
		return this.__dirDisplays;
	},	
	/**
	* @description 清除所有导航线路.
	*/			
	clearNav: function() {
	  this.__dirDisplays.clearItem();		
	}
}

