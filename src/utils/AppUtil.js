const COLORS = ['FFB3B3', '99B9B1', 'EB6161', 'F5A623', 'BD10E0', 'BE9898', '6675DB', '976941', '3ABB44', '373dd6', '6C8E6E', '886C8E'];

function giveTagColor(tags, isReverse){
    var colors = COLORS;
    var len_color = colors.length;
    if(isReverse){
        colors = colors.concat();
        colors.reverse();
    }
    for(var i=0, len=tags.length; i<len; i++){
        var item = tags[i];
        item.color = colors[(i < len_color)?i:(i % len_color)];
    }
}

//将16为颜色，转为rgb色值
function hexToRgb(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);    
    return result ? {        
        r: parseInt(result[1], 16),               
        g: parseInt(result[2], 16),        
        b: parseInt(result[3], 16)    
    } : null;
}

//返回唯一id
function getUniqueId(){
    return Date.now().toString(15); 
}

export default {
    COLORS,
    giveTagColor,
    hexToRgb,
    getUniqueId,
}
