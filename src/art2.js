// Illustrazioni extra per gli ingredienti da cucina (stesso stile adesivo di art.js).
var O='class="o"', VN='class="v"';
function star(cx,cy,ro,ri,n){var p="";for(var i=0;i<n*2;i++){var r=i%2?ri:ro,a=(-90+i*180/n)*Math.PI/180;p+=(i?"L":"M")+(cx+r*Math.cos(a)).toFixed(1)+" "+(cy+r*Math.sin(a)).toFixed(1)}return p+"Z"}
function noodle(d,c){return '<path d="'+d+'" fill="none" stroke="var(--on-color)" stroke-width="11" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="5" stroke-linecap="round"/>'}
var ART2={
 egg:function(c){return '<g transform="rotate(-16 36 72)"><ellipse '+O+' cx="36" cy="72" rx="25" ry="32" fill="'+c.b+'"/></g><ellipse '+O+' cx="72" cy="66" rx="31" ry="39" fill="'+c.a+'"/><path '+VN+' d="M54 52Q56 40 64 34" stroke="#fff" opacity=".7"/>'},
 cheese:function(c){return '<path '+O+' d="M12 62L72 28L110 62Z" fill="'+c.b+'"/><path '+O+' d="M12 62H110V96H12Z" fill="'+c.a+'"/><g '+O+' fill="'+c.b+'"><circle cx="34" cy="80" r="6"/><circle cx="64" cy="78" r="8"/><circle cx="92" cy="82" r="5"/></g>'},
 ball:function(c){return '<circle '+O+' cx="60" cy="68" r="38" fill="'+c.a+'"/><circle '+O+' cx="60" cy="28" r="11" fill="'+c.a+'"/><path '+VN+' d="M36 60Q38 48 48 42" stroke="'+c.b+'"/><path '+VN+' d="M34 86Q50 98 72 96" stroke="'+c.b+'" opacity=".7"/>'},
 block:function(c){return '<path '+O+' d="M16 62H92V98H16Z" fill="'+c.a+'"/><path '+O+' d="M16 62L36 40H112L92 62Z" fill="'+c.b+'"/><path '+O+' d="M92 62L112 40V76L92 98Z" fill="'+c.s+'"/><path '+VN+' d="M26 74H64" stroke="'+c.b+'" opacity=".8"/>'},
 meat:function(c){return '<path '+O+' d="M14 52Q60 34 106 52L100 94Q60 108 20 94Z" fill="'+c.a+'"/><path '+O+' d="M19 68Q60 54 101 68L99 77Q60 63 21 77Z" fill="'+c.w+'"/><path '+O+' d="M17 84Q60 70 103 84L100 92Q60 78 20 92Z" fill="'+c.w+'" opacity=".0"/>'},
 fish:function(c){return '<path '+O+' d="M12 60Q40 32 84 48L108 34V86L84 72Q40 88 12 60Z" fill="'+c.a+'"/><path '+VN+' d="M30 66Q58 72 80 62" stroke="'+c.w+'"/><circle '+O+' cx="30" cy="56" r="3.5" fill="var(--on-color)"/>'},
 pasta:function(c){return noodle("M18 70Q18 44 60 44Q102 44 102 70Q102 96 60 96Q18 96 18 70Z",c.a)+noodle("M32 70Q32 56 60 56Q88 56 88 70Q88 84 60 84Q32 84 32 70Z",c.a)+noodle("M44 70Q44 66 60 66Q76 66 76 70Q76 74 60 74Q44 74 44 70Z",c.a)+noodle("M14 40Q40 16 62 30Q84 44 108 26",c.a)},
 sack:function(c){return '<path '+O+' d="M30 32Q60 22 90 32L100 100Q60 114 20 100Z" fill="'+c.a+'"/><path '+O+' d="M26 34Q38 14 60 24Q82 14 94 34Z" fill="'+c.b+'"/><ellipse '+O+' cx="60" cy="70" rx="20" ry="16" fill="'+c.w+'"/><path '+VN+' d="M50 70H70M52 64H68M52 76H68" stroke="'+c.b+'"/>'},
 bottle:function(c){return '<path '+O+' d="M52 22H68V46Q80 52 80 66V102Q80 114 60 114Q40 114 40 102V66Q40 52 52 46Z" fill="'+c.a+'"/><path '+O+' d="M50 10H70V22H50Z" fill="'+c.b+'"/><path '+O+' d="M44 70H76V98H44Z" fill="'+c.w+'"/><path '+VN+' d="M50 62Q50 54 56 50" stroke="#fff" opacity=".7"/><circle '+O+' cx="60" cy="84" r="6" fill="'+c.a+'"/>'},
 bread:function(c){return '<path '+O+' d="M12 72Q8 40 40 36Q60 22 82 36Q114 40 108 72Q106 98 60 100Q14 98 12 72Z" fill="'+c.a+'"/><path '+VN+' d="M36 52L48 78M58 48L70 76M80 52L90 74" stroke="'+c.b+'"/>'},
 can:function(c){return '<path '+O+' d="M30 34V100Q30 110 60 110Q90 110 90 100V34Z" fill="'+c.a+'"/><ellipse '+O+' cx="60" cy="34" rx="30" ry="9" fill="'+c.b+'"/><path '+O+' d="M30 56H90V88H30Z" fill="'+c.w+'"/><circle '+O+' cx="60" cy="72" r="10" fill="'+c.g+'"/>'}
};

function sprigLeaves(c,n){var s='<path '+VN+' d="M60 112Q56 60 62 12" stroke="'+c.g+'"/>';
 for(var i=0;i<n;i++){var y=100-i*(80/n);var side=i%2?1:-1;
  s+='<ellipse '+O+' cx="'+(60+side*13)+'" cy="'+y+'" rx="12" ry="5" fill="'+(i%2?c.g2:c.g)+'" transform="rotate('+(side*-30)+' '+(60+side*13)+' '+y+')"/>';}
 return s+'<ellipse '+O+' cx="62" cy="12" rx="5" ry="10" fill="'+c.g2+'"/>'}
var LEAF='<path '+O+' d="M60 34Q76 18 90 26Q78 42 60 34Z" fill="#3E9A3A"/>';
Object.assign(ART2,{
 round:function(c){var st="";if(c.st){st='<path '+VN+' d="M60 32Q36 68 60 104M60 32Q84 68 60 104M60 32Q24 68 40 98M60 32Q96 68 80 98" stroke="'+c.st+'"/>'}
  return '<circle '+O+' cx="60" cy="68" r="38" fill="'+c.a+'"/>'+st+'<path '+VN+' d="M36 60Q38 48 48 42" stroke="#fff" opacity=".6"/>'+(c.nostem?"":'<path '+O+' d="M60 32Q58 20 52 14" fill="none"/><path '+O+' d="M60 34Q76 18 90 26Q78 42 60 34Z" fill="'+(c.g||"#3E9A3A")+'"/>')},
 pear:function(c){return '<path '+O+' d="M60 24C74 24 78 38 80 52C98 66 98 102 60 106C22 102 22 66 40 52C42 38 46 24 60 24Z" fill="'+c.a+'"/><path '+VN+' d="M44 70Q42 86 52 96" stroke="#fff" opacity=".55"/><path '+O+' d="M60 24Q58 12 54 6" fill="none"/><path '+O+' d="M62 24Q80 8 94 16Q82 32 62 24Z" fill="'+(c.g||"#3E9A3A")+'"/>'},
 lemon:function(c){return '<path '+O+' d="M8 64L16 60Q30 30 60 30Q90 30 104 60L112 64L104 68Q90 98 60 98Q30 98 16 68Z" fill="'+c.a+'"/><path '+VN+' d="M34 56Q40 46 52 42" stroke="#fff" opacity=".6"/>'+(c.leaf?'<path '+O+' d="M62 30Q74 12 92 16Q82 34 62 30Z" fill="'+c.leaf+'"/>':'')},
 grapes:function(c){var pts=[[36,50],[60,48],[84,50],[48,68],[72,68],[36,70],[84,70],[60,86],[48,88],[72,88]],s='<path '+O+' d="M60 40Q58 20 66 10" fill="none"/><path '+O+' d="M64 16Q80 4 96 12Q86 28 64 16Z" fill="'+(c.g||"#3E9A3A")+'"/>';
  pts.forEach(function(p){s+='<circle '+O+' cx="'+p[0]+'" cy="'+(p[1]+8)+'" r="12" fill="'+c.a+'"/>'});return s},
 strawb:function(c){var s='<path '+O+' d="M60 108C30 94 20 62 26 46Q44 36 60 42Q76 36 94 46C100 62 90 94 60 108Z" fill="'+c.a+'"/><g fill="'+(c.s||"#FFE066")+'">';
  [[44,60],[60,56],[76,60],[40,76],[56,74],[72,76],[86,74],[50,92],[66,92]].forEach(function(p){s+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="2.4" ry="3.4"/>'});
  return s+'</g><path '+O+' d="'+star(60,42,26,10,6)+'" fill="'+(c.g||"#3E9A3A")+'"/>'},
 cherry:function(c){return '<path '+O+' d="M40 76Q42 40 66 16M82 70Q78 40 66 16" fill="none"/><circle '+O+' cx="40" cy="88" r="20" fill="'+c.a+'"/><circle '+O+' cx="82" cy="82" r="20" fill="'+c.a+'"/><path '+O+' d="M66 18Q84 4 100 14Q88 30 66 18Z" fill="'+(c.g||"#3E9A3A")+'"/><path '+VN+' d="M30 82Q32 74 38 72M72 76Q74 68 80 66" stroke="#fff" opacity=".6"/>'},
 banana:function(c){return '<path '+O+' d="M16 50Q26 100 80 100Q106 98 110 76Q98 88 78 86Q40 84 30 36Z" fill="'+c.a+'"/><path '+O+' d="M16 50L26 28L34 34L30 38Z" fill="'+(c.b||"#8A6A2B")+'"/><path '+VN+' d="M34 62Q46 88 80 90" stroke="'+(c.b||"#D9B84A")+'" opacity=".6"/>'},
 mushroom:function(c){return '<path '+O+' d="M44 62H76L74 100Q60 110 46 100Z" fill="'+c.b+'"/><path '+O+' d="M10 66Q12 18 60 18Q108 18 110 66Q60 76 10 66Z" fill="'+c.a+'"/><g '+O+' fill="'+(c.w||"#FFF3E3")+'"><circle cx="38" cy="44" r="5"/><circle cx="64" cy="36" r="5"/><circle cx="84" cy="52" r="4"/></g>'},
 shrimp:function(c){return '<path '+O+' d="M24 40Q70 14 98 46Q112 76 80 96Q60 108 38 92Q62 88 72 74Q76 58 56 52Q38 48 24 40Z" fill="'+c.a+'"/><path '+VN+' d="M60 40Q68 48 66 60M76 44Q86 52 84 66M88 54Q96 62 92 74" stroke="'+c.b+'"/><path '+O+' d="M24 40L10 34M24 40L8 48" fill="none"/><path '+O+' d="M38 92L28 106L50 102Z" fill="'+c.b+'"/><circle '+O+' cx="34" cy="42" r="2.6" fill="var(--on-color)"/>'},
 squid:function(c){var s='';[22,40,60,80,98].forEach(function(x,i){s+=noodle("M"+x+" 68Q"+(x+(i%2?10:-10))+" 90 "+(x+(i-2)*4)+" 112",c.b)});
  return s+'<path '+O+' d="M60 6C86 20 90 52 78 74H42C30 52 34 20 60 6Z" fill="'+c.a+'"/><path '+O+' d="M42 34L22 44Q34 52 44 52ZM78 34L98 44Q86 52 76 52Z" fill="'+c.b+'"/><circle '+O+' cx="50" cy="64" r="3" fill="var(--on-color)"/><circle '+O+' cx="70" cy="64" r="3" fill="var(--on-color)"/>'},
 shell:function(c){return '<path '+O+' d="M60 104C22 104 8 64 20 42Q40 14 60 14Q80 14 100 42C112 64 98 104 60 104Z" fill="'+c.a+'"/><path '+VN+' d="M60 104L30 36M60 104L45 24M60 104L60 16M60 104L75 24M60 104L90 36" stroke="'+c.b+'"/><path '+O+' d="M46 104H74L70 114H50Z" fill="'+c.b+'"/>'},
 drumstick:function(c){return '<path '+O+' d="M44 78L22 100L14 96L8 104L18 112L26 106L32 104L56 88Z" fill="'+(c.b||"#FFF3E3")+'"/><path '+O+' d="M28 36Q62 4 94 32Q108 66 78 84Q58 94 44 76Q18 60 28 36Z" fill="'+c.a+'"/><path '+VN+' d="M44 38Q60 26 78 36" stroke="#fff" opacity=".5"/>'},
 jar:function(c){return '<path '+O+' d="M30 38H90V98Q90 110 60 110Q30 110 30 98Z" fill="'+c.a+'"/><rect '+O+' x="26" y="20" width="68" height="18" rx="6" fill="'+c.b+'"/><rect '+O+' x="40" y="58" width="40" height="30" rx="5" fill="'+(c.w||"#FFF3E3")+'"/><path '+VN+' d="M48 68H72M48 76H66" stroke="'+c.b+'" opacity=".7"/>'},
 spears:function(c){var s='';[[34,-8],[60,0],[86,8]].forEach(function(p,i){var x=p[0],t=p[1];
   s+='<g transform="rotate('+t+' '+x+' 110)"><path '+O+' d="M'+(x-7)+' 112V40Q'+x+' 14 '+(x+7)+' 40V112Z" fill="'+c.a+'"/><path '+O+' d="M'+(x-7)+' 42Q'+x+' 10 '+(x+7)+' 42Q'+x+' 50 '+(x-7)+' 42Z" fill="'+(c.g||c.a)+'"/></g>'});return s},
 corn:function(c){var s='<path '+O+' d="M60 6C84 20 86 76 60 108C34 76 36 20 60 6Z" fill="'+c.a+'"/><path '+VN+' d="M48 30H72M44 46H76M44 62H76M48 78H72M52 92H68M60 10V104" stroke="#fff" opacity=".45"/>';
  return s+'<path '+O+' d="M60 112Q14 96 20 44Q40 74 60 76Z" fill="'+c.g+'"/><path '+O+' d="M60 112Q106 96 100 44Q80 74 60 76Z" fill="'+c.g+'"/>'},
 nut:function(c){return '<path '+O+' d="M60 22C94 26 102 62 88 90C78 108 42 108 32 90C18 62 26 26 60 22Z" fill="'+c.a+'"/><path '+O+' d="M30 40Q60 18 90 40Q88 56 60 52Q32 56 30 40Z" fill="'+c.b+'"/><path '+VN+' d="M48 72Q52 90 62 98" stroke="'+c.b+'" opacity=".6"/>'},
 pile:function(c){var s='',pts=[[60,38],[40,52],[78,52],[26,68],[56,66],[92,68],[40,84],[72,84],[22,92],[56,98],[90,94]];
   pts.forEach(function(p,i){s+='<ellipse '+O+' cx="'+p[0]+'" cy="'+p[1]+'" rx="14" ry="10" fill="'+(i%3?c.a:(c.b||c.a))+'" transform="rotate('+((i*37)%50-25)+' '+p[0]+' '+p[1]+')"/>'});return s},
 sprig:function(c){return sprigLeaves(c,6)}
});

export { ART2 };
