var maphelper = null;// 封装操作对象
var infowindow = null;// 信息窗口
var getMarkerWindow = null;// 信息窗口
var mapobj = null;// 地图对象
var markerZoom = 12;// 标记红绿灯地图所在级别
var lng = "119.81380462646484";// 经度
var lat = "31.381046028549978";// 维度
var mapClickEventListener = null;
var markers = [];
var initMarkers = [];
var markermsg = [];
var markerId = Date.parse(new Date());// 时间做唯一标示
var markersJson = '';
var user = null;
var options = "";
var deleteable = false;

google.maps.event.addDomListener(window, "load", initialize);

function initialize() {
	var mapCanvas = document.getElementById("map_canvas");
	var myOptions = {
		zoom : markerZoom,
		center : new Array(lng, lat),
		disableDefaultUI : false,
		navigationControl : true,
		navigationControlOptions : {
			position : google.maps.ControlPosition.RIGHT_TOP
		},
		mapTypeControl : false, // 比例尺控件
		scaleControl : true, // 启用/停用在双击时缩放并居中
		disableDoubleClickZoom : true,
		// 地图类型
		// NORMAL_MAP 标注地图
		// HYBRID_MAP 卫星混合
		// OFFLINE_MAP 离线地图
		// TERRAIN_MAP 地形图
		mapTypeId : OFFLINE_MAP,
		mapPath : "maptile/googlemaps/roadmap/",
		mapFileExt : "png"
	};
	maphelper = new mapHelper();

	mapobj = maphelper.initMap(mapCanvas, myOptions);

	maphelper.bindInstanceEvent(mapobj, 'zoom_changed', function(event) {
		$("#ZOOM").val(maphelper.getZoom());
	});

	maphelper.bindInstanceEvent(mapobj, 'mousemove', function(event) {
		$("#CLAT").val(event.latLng.lat());
		$("#CLNG").val(event.latLng.lng());
	});

	// MarkersInit();

	// google.maps.event.addListener(mapobj, "rightclick", reset);

}

function reset() {

	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}

function ClearPoly() {
	self.location.reload(); // 刷新本页
}

function rgb2hex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
		return (parseInt(x).toString(16)).slice(-2);
	}
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function deleteSite() {
	// 删除按钮
	$("#delsite").css("color", "#999").css("background", "-webkit-gradient(linear, left top, left bottom, from(#fff), to(#ededed))").css("background", "-moz-linear-gradient(top,  #fff,  #ededed)").css("filter", "  progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#ededed')");
	
	maphelper.clearInstanceEvent(mapobj, 'click');// 取消新增
	if (mapClickEventListener) {
		google.maps.event.removeListener(mapClickEventListener);
		mapClickEventListener = null;
	}
$("#addsite").css("color", "#606060").css("background", "-webkit-gradient(linear, left top, left bottom, from(#ededed), to(#fff)").css("background", "-moz-linear-gradient(top,  #ededed,  #fff)").css("filter", " progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#ffffff')");
	alert("点击地图上的工地进行删除");
	deleteable = true;// 可以删除
}

function addSite() {

	$("#addsite").css("color", "#999").css("background", "-webkit-gradient(linear, left top, left bottom, from(#fff), to(#ededed))").css("background", "-moz-linear-gradient(top,  #fff,  #ededed)").css("filter", "  progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#ededed')");
	$("#delsite").css("color", "#606060").css("background", "-webkit-gradient(linear, left top, left bottom, from(#ededed), to(#fff)").css("background", "-moz-linear-gradient(top,  #ededed,  #fff)").css("filter", " progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#ffffff')");
	deleteable = false;// 取消删除
	alert("单击地图添加工地..");

	if (!mapClickEventListener) {
		mapClickEventListener = google.maps.event.addListener(mapobj, 'click',
				function(event) {
					addMarker(event.latLng, true);
				});
	}
}

function addMarker(latlng, doQuery) {
	var marker = maphelper.markerPoint({
		id : markerId++,
		lat : latlng.lat(),
		lng : latlng.lng(),
		title : '工地',
		icon : "images/site2.png"
	});
	marker.initOver = false;
	marker.name = '';
	marker.address = '';
	marker.dbclickable = false;
	initSignal(marker);
	initMarkers.push(marker);
}

// 初始化信号机
function initSignal(marker) {
	// 标记动画
	if (marker.getAnimation() != null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}

	var contentString = setMarkerContent(marker);

	if (infowindow)
		infowindow.close();
	infowindow = new google.maps.InfoWindow({ // 根据HTML初始化infowindow
		content : contentString
	});

	infowindow.open(mapobj, marker);

	var MapsEvent = new google.maps.event.addListener(infowindow, 'closeclick',
			function(event) {
				marker.setAnimation(null);
			});

	setMarkerEvents(marker);

}

function removeClickListener() {
	if (mapClickEventListener) {
		google.maps.event.removeListener(mapClickEventListener);
		mapClickEventListener = null;
	}
}

// 设置信号机标示的事件
function setMarkerEvents(marker) {

	maphelper.bindInstanceEvent(marker, 'dblclick',
			function(event, map, marker) {
				if (!deleteable) {
					window.open("sigAction!toTraffic?mkid=" + marker.id,
							"rightFrame");
				}
			});

	maphelper.bindInstanceEvent(marker, 'click', function(event, map, marker) {
		if (deleteable) {
			deleteMarker(marker.id);
		}
	});

	maphelper.bindInstanceEvent(marker, 'mouseover', function(event, map,
			marker) {

		if (marker.initOver) {
			getMarkerWindow = new google.maps.InfoWindow({
				content : getMarkerContent(marker)
			});
			getMarkerWindow.open(map, marker);
		} else {
			var contentString = setMarkerContent(marker);

			if (infowindow)
				infowindow.close();
			infowindow = new google.maps.InfoWindow({ // 根据HTML初始化infowindow
				content : contentString
			});

			infowindow.open(map, marker);

			google.maps.event.addListener(infowindow, 'closeclick', function(
					event) {
				marker.setAnimation(null);
			});
		}

	});

	maphelper.bindInstanceEvent(marker, 'mouseout',
			function(event, map, marker) {
				if (getMarkerWindow)
					getMarkerWindow.close();
			});

	maphelper.bindInstanceEvent(marker, 'dragend',
			function(event, map, marker) {
				marker.setPosition(event.latLng);
			});

}

// 初始化地图所有标志
function MarkersInit() {
	$.ajax({
		url : 'load',// 这里是你的action或者servlert的路径地址
		type : 'post', // 数据发送方式
		dataType : 'json',
		async : false,
		error : function(msg) { // 失败
		},
		success : function(msg) { // 成功
			console.log(msg);
			if (msg != null) {
				if (typeof (msg.length) == 'undefined')// 判断msg为错误提示还是正确数据
				{
					// 错误提示
					alert(msg.message);
				} else {
					// 正常数值
					markermsg = msg;

					for (var i = 0; i < markermsg.length; i++) {
						// 过滤没有经纬度的信号机显示
						if (markermsg[i].lat != null && markermsg[i].lat != ''
								&& markermsg[i].lng != null
								&& markermsg[i].lng != '') {
							var marker = maphelper.markerPoint({
								id : markermsg[i].id,
								lat : markermsg[i].lat,
								lng : markermsg[i].lng,
								title : '工地',
								icon : "images/site.png"

							});
							marker.dbclickable = true;
							marker.initOver = true;
							marker.name = markermsg[i].name;
							marker.address = markermsg[i].address;
							setMarkerEvents(marker);
							initMarkers.push(marker);
						}
					}
				}

			}

		}
	});
}

// 获得信号机基本信息
function getMarkerContent(marker) {
	return '<div  id="content"><h2 id="" style="margin:0 auto; border-bottom:1px solid rgba(0,0,0,0.1);color: #0077b9;">当前工地</h2><div id="bodyContent">'
			+ '<br><div style="margin-top:0.8px">工地编号：<input id="getnumber" value="'
			+ marker.number
			+ '" name="signal_number" type="text"  width="25px"/></div>'
			+ '<br><div style="margin-top:0.8px">工地地址：<input  id="address" value="'
			+ marker.name
			+ '" name="signal_address" type="text"    width="25px"/></div>'
			+ '<br><div style="margin-top:0.8px">工地名称：<input id="name" value="'
			+ marker.address
			+ '" name="signal_name" type="text"   width="25px"/></div>'
	'</div>';
}

// 绑定信号机并设置基本信息
function setMarkerContent(marker) {

	return '<div  id="content"><h2 style="margin:0 auto; border-bottom:1px solid rgba(0,0,0,0.1);color: #0077b9;">添加工地</h2><div id="bodyContent">'
			+ '<div style="margin-top:5px; float:left; width:360px;"><span style="float:left;width:80px;font-size:14px;">工地地址：</span><input id="address" class="setAddress" value="" name="_address" type="text"   style="display:inline;float:left;padding-bottom:1px;border:1px solid #cfdfe4"  width="100px"/></div>'
			+ '<br><div style="margin-top:5px; float:left; width:360px;"><span style="float:left;width:80px;font-size:14px;">工地名称：</span><input id="name" class="setName" value="" name="_name" type="text"   style="float:left;padding-bottom:1px;border:1px solid #cfdfe4;line-height:14px"  width="25px" /></div>'
			+ '<br><div class="maptip"  ><btn style="margin-top:5px; float:left; width:100px;border:1px solid #0077b9;background: #0077b9;text-align:center;border-radius:5px;"><a href="javascript:saveMarker('
			+ marker.id
			+ ')" target="rightFrame" onclick="return checkMarker();" style="color: #fff; text-decoration:none;font-size:14px;">保&nbsp;&nbsp;&nbsp;存</a></btn></div></div>'
	'</div>';
}

// 添加单个信号机标记
function saveMarker(id) {
	for (var i = 0; i < initMarkers.length; i++) {
		if (initMarkers[i].id == id) {
			var address = $('#address').val();
			var name = $('#name').val();
			var lat = initMarkers[i].getPosition().jb;
			var lng = initMarkers[i].getPosition().kb;

			$.ajax({
				url : 'addOrUpdate',// 这里是你的action或者servlert的路径地址
				type : 'post', // 数据发送方式
				data : {
					"mkid" : id,
					"address" : address,
					"lat" : lat,
					"lng" : lng
				},
				error : function(msg) { // 失败
					alert('工地增加失败');
				},
				success : function(msg) { // 成功
					if (infowindow)
						infowindow.close();
					alert('工地添加成功');
				}
			});
			initMarkers[i].dbclickable = true;
			initMarkers[i].initOver = true;
			initMarkers[i].setAnimation(null);
			initMarkers[i].name = name;
			initMarkers[i].address = address;
		}
	}
}

// 删除单个信号机标记
function deleteMarker(id) {
		if (confirm("您确定要删除该工地么?")) {
			for (var i = 0; i < initMarkers.length; i++) {

				if (initMarkers[i].id == id) {
					$.ajax({
						url : 'deleteMarker',// 这里是你的action或者servlert的路径地址
						type : 'post', // 数据发送方式
						data : {
							"mkid" : id
						},
						error : function(msg) { // 失败
							alert('工地删除失败');
						},
						success : function(msg) { // 成功
							alert('工地删除成功');
						}

					});
					initMarkers[i].setMap(null);
					initMarkers.splice(i, 1);
				}
			}
		}

}

function changeArea() {
	location.href = "map.jsp?areaid=" + parseInt($("#areaid").val());
}

function checkMarker() {
	var nameError = false;
	var address = $(".setAddress").val();
	var name = $(".setName").val();
	if (address == null || address == "") {
		alert("工地地址不能为空");
		return false;
	}
	$.ajax({
		url : 'checkMarkerName',// 这里是你的action或者servlert的路径地址
		type : 'post', // 数据发送方式
		async : false,
		data : {
			"name" : name
		},
		dataType : 'json',
		error : function(msg) { // 失败
			console.log('post失败');
		},
		success : function(msg) { // 成功
			if (msg != null) {
				nameError = true;
			}
		}
	});
	if (name == null || name == "") {
		alert("信号机名称不能为空");
		return false;
	}
	if (nameError) {
		alert("信号机名称已存在，请重新输入");
		return false;
	}
}
