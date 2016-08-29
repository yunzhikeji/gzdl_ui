// JavaScript Document

function showMask(){     
        $("#mask").css("height",$(document).height());     
        $("#mask").css("width",$(document).width());     
        $("#mask").show(); 
		$("#note").show();    
    }  
    //隐藏遮罩层  
    function hideMask(){     
        $("#note").hide();
        $("#mask").hide();     
    } 