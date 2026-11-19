// Illustrazioni extra per gli ingredienti da cucina (stesso stile adesivo di art.js).
var O='class="o"', VN='class="v"';
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
export { ART2 };
